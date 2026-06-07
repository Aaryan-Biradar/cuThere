import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import db from './db.js';

// Initialize the AI with your API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Gemini model name — overridable via env so we don't have to edit code to bump it.
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Load the Carleton building-code map once at module level (ESM-safe fs read)
const buildingMap = JSON.parse(
    readFileSync(new URL('../../config/buildings.json', import.meta.url), 'utf8')
);

// Build the prompt lines for the building map dynamically from the JSON config
const buildingMapLines = Object.entries(buildingMap)
    .map(([code, name]) => `        ${code}: ${name}`)
    .join('\n');

// Memoized async helper — reads category names from the DB once, then caches them
let _cachedMasterTags = null;
async function getMasterTags() {
    if (_cachedMasterTags !== null) return _cachedMasterTags;
    const result = await db.execute('SELECT category_name FROM CATEGORY');
    const tags = result.rows.map((row) => row.category_name);
    if (tags.length === 0) {
        console.warn('[ai.js] getMasterTags: CATEGORY table returned no rows — tags list will be empty');
    }
    _cachedMasterTags = tags;
    return _cachedMasterTags;
}

// Quick filter: asks Gemini if a post is actually an event or not
// Now accepts a raw ArrayBuffer instead of fetching from a URL
export async function isEvent(imageBuffer, caption) {
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    const response = await ai.models.generateContent({
        model: MODEL,
        contents: [
            `Instructions: Look at this image and caption. Is this promoting a specific event (with a date, time, and location)? at least 2/3 of these must be present. Respond with ONLY "yes" or "no", nothing else.`,
            `Caption: ${caption}`,
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
        ]
    });

    const answer = response.text.trim().toLowerCase();
    return answer === 'yes';
}

// Now accepts a raw ArrayBuffer instead of fetching from a URL
export async function analyzeFlyer(imageBuffer, caption) {
    const masterTags = await getMasterTags();

    // 1. We tell the AI exactly what we want in the prompt
    const prompt = `
        Look at this event flyer and the provided caption. Extract the event details and return ONLY a valid JSON object.

        CRITICAL RULE FOR TAGS:
        For the "tags" array, you MUST ONLY select applicable tags from this exact list:
        ${JSON.stringify(masterTags)}

        Do not invent new tags. If none apply, return an empty array [].

        CRITICAL RULE FOR DATES:
        The "date" should just be the month and the day (e.g., "March 20" or "April 5"). Do not include the year or the day of the week (like "Tuesday, ").

        CRITICAL RULE FOR TIMES:
        The "time" should be in the format like "1:00PM" or "11:00AM - 2:00PM" if it's a range.

        CRITICAL RULE FOR LOCATIONS:
        The "location" should be the full name of the building. Use the following key to map Carleton building codes to their full names:
${buildingMapLines}

        For example, if you see "ME 3380", your location should be "Mackenzie Building 3380".

        Expected JSON format:
        {
            "eventName": "...",
            "description": "...",
            "date": "...",
            "time": "...",
            "location": "...",
            "tags": ["Tech & Software", "Free Food"]
        }
    `;

    // 2. Convert the pre-fetched buffer to base64 for Gemini
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    // 3. We send the prompt, the caption, and the image part to Gemini
    const response = await ai.models.generateContent({
        model: MODEL,
        contents: [
            `Instructions: ${prompt}`,
            `Event Caption: ${caption}`,
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
        ]
    });

    // 4. Boom! You have your structured data.
    console.log("🤖 Gemini raw response:", response.text);

    // Gemini often wraps JSON in markdown blocks, so we strip them before parsing
    const cleanText = response.text.replace(/```(json)?\n?/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanText);
}


// Keep prompt/token cost bounded by trimming long captions.
function truncate(value, max = 700) {
    if (value == null) return '';
    const str = String(value);
    return str.length > max ? `${str.slice(0, max)}…` : str;
}

/**
 * Decides whether an INCOMING analyzed event duplicates one of the prefiltered CANDIDATE
 * events, and if so returns the best merged version. Text-only (no images).
 *
 * @param {object}   incoming    { eventName, date, time, location, description, tags[], hosts[], post_timestamp }
 * @param {object[]} candidates  existing events with { event_id, event_title, event_date, event_time,
 *                               event_location, event_description, tags[], hosts[], post_timestamp, path:'same'|'cross' }
 * @returns {Promise<{ isDuplicate:boolean, matchedEventId:string|null, confidence:number,
 *                     merged:object|null, reasoning:string }>}
 */
export async function findDuplicateAndMerge({ incoming, candidates }) {
    const masterTags = await getMasterTags();
    const incomingPayload = {
        title: incoming?.eventName ?? incoming?.event_title ?? '',
        date: incoming?.date ?? incoming?.event_date ?? '',
        time: incoming?.time ?? incoming?.event_time ?? '',
        location: incoming?.location ?? incoming?.event_location ?? '',
        description: truncate(incoming?.description ?? incoming?.event_description ?? ''),
        tags: incoming?.tags ?? [],
        hosts: incoming?.hosts ?? [],
        post_timestamp: incoming?.post_timestamp ?? null,
    };

    const candidatePayload = (candidates || []).map((c, i) => ({
        ref: `c${i}`,
        title: c.event_title,
        date: c.event_date,
        time: c.event_time,
        location: c.event_location,
        description: truncate(c.event_description),
        tags: c.tags ?? [],
        hosts: c.hosts ?? [],
        post_timestamp: c.post_timestamp ?? null,
        matchType: c.path === 'cross' ? 'cross-account' : 'same-account',
    }));

    const prompt = `
        You are de-duplicating Carleton University event posts. Student orgs often post the SAME
        event multiple times (a flyer, a hype photo, an updated flyer), creating duplicate records.
        Decide whether the INCOMING post describes the SAME real-world event as one of the CANDIDATES.
        Weigh ALL the provided fields together — title, date, time, location, hosts (the posting
        account and co-hosts), tags, and especially the description/caption — not the title alone.

        RULES:
        - SAME-ACCOUNT candidates (matchType "same-account") = the same org reposting. A hype photo
          with a missing or "TBA" time/location is STILL the same event if the title and date align.
        - CROSS-ACCOUNT candidates (matchType "cross-account") = different orgs. Only mark a duplicate
          if title AND date AND location all strongly agree. Two different orgs running similarly-named
          events on the same day (e.g. two separate "Shawarma Fest" events) are DIFFERENT — do NOT merge.
        - Use the "description" (the post caption) as an important signal: overlapping event details,
          organizer, schedule, or wording across the descriptions is strong evidence of the SAME event,
          while clearly different descriptions are evidence they are DIFFERENT events.
        - The version with the latest post_timestamp is the most current; when two REAL values genuinely
          conflict (e.g. a changed date or location), prefer the most current one.

        If it IS a duplicate, also produce "merged": the best single version, choosing FOR EACH FIELD the
        most complete and most current REAL value across the incoming post and the matched candidate.
        NEVER choose an empty string or a placeholder ("TBA","Date TBA","Time TBA","Location TBA") over a
        real value. Keep "date" in YYYY-MM-DD format if a real date is available. "tags" must be the UNION
        of both versions' tags, restricted to exactly this list: ${JSON.stringify(masterTags)}.

        INCOMING:
        ${JSON.stringify(incomingPayload, null, 2)}

        CANDIDATES:
        ${JSON.stringify(candidatePayload, null, 2)}

        Respond with ONLY a JSON object in EXACTLY this shape (no markdown):
        {
          "isDuplicate": true,
          "matchedRef": "the ref of the matched candidate (e.g. \"c0\"), or null",
          "confidence": 0.0,
          "merged": {
            "eventName": "...",
            "date": "...",
            "time": "...",
            "location": "...",
            "description": "...",
            "tags": ["..."]
          },
          "reasoning": "one short sentence"
        }
        If it is NOT a duplicate, set "isDuplicate" false, "matchedRef" null, and "merged" null.
    `;

    const response = await ai.models.generateContent({
        model: MODEL,
        contents: [prompt],
    });

    const cleanText = response.text.replace(/```(json)?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    // Resolve the short ref back to the precise event_id locally — avoids JSON number-precision loss
    // on 19-digit Instagram ids that Gemini might echo unquoted.
    let matchedEventId = null;
    if (parsed.isDuplicate && parsed.matchedRef != null) {
        const idx = candidatePayload.findIndex((c) => c.ref === String(parsed.matchedRef).trim());
        if (idx !== -1) matchedEventId = candidates[idx].event_id;
    }

    return {
        isDuplicate: Boolean(parsed.isDuplicate) && matchedEventId !== null,
        matchedEventId,
        confidence: Number(parsed.confidence) || 0,
        merged: matchedEventId ? (parsed.merged ?? null) : null,
        reasoning: parsed.reasoning ?? '',
    };
}