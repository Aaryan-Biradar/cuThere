import db from '../server/db.js';
import { UNTITLED_EVENT, DATE_TBA, TIME_TBA, LOCATION_TBA } from './placeholders.js';
import { buildHosts, hostLinkStatements, resolveCategoryIds } from './hosts.js';

/**
 * Calculates the correct year for an event based on the post's timestamp.
 * @param {string} postTimestamp - The ISO string from Apify (e.g., "2026-12-10T13:37:24.000Z")
 * @param {string} eventDateString - The string from Gemini (e.g., "January 15" or "Jan 15th")
 * @returns {string} - A fully qualified date string (e.g., "2027-01-15")
 */
export function normalizeEventDate(postTimestamp, eventDateString) {
    // 1. Parse the Apify Post Date
    const postDate = new Date(postTimestamp);

    // Guard against a missing/garbled timestamp (would otherwise yield "NaN-MM-DD"):
    // fall back to the raw string, same as the unparseable-event-date branch below.
    if (!postTimestamp || isNaN(postDate)) {
        console.warn(`⚠️ Missing or invalid post timestamp: ${postTimestamp}`);
        return eventDateString;
    }

    const postYear = postDate.getFullYear();
    const postMonth = postDate.getMonth(); // 0-indexed (0 = Jan, 11 = Dec)

    // 2. Parse the Gemini Event Date
    // We append a dummy year just so JavaScript's Date engine can parse the month word
    const parsedEventDate = new Date(`${eventDateString}, 2000`);

    // Check if JS failed to parse the weird string Gemini gave us
    if (isNaN(parsedEventDate)) {
        console.warn(`⚠️ Could not parse event date string: ${eventDateString}`);
        return eventDateString; // Return the raw string as a fallback
    }

    const eventMonth = parsedEventDate.getMonth();
    const eventDay = parsedEventDate.getDate();

    // 3. Apply the Golden Rule
    let finalYear = postYear;
    if (eventMonth < postMonth) {
        // The event month is earlier in the calendar than the post month.
        // It must be for next year!
        finalYear = postYear + 1;
    }

    // 4. Format it nicely for the Database (YYYY-MM-DD)
    // We add 1 to the month because JS months are 0-indexed, and pad it with a zero if needed
    const formattedMonth = String(eventMonth + 1).padStart(2, '0');
    const formattedDay = String(eventDay).padStart(2, '0');

    return `${finalYear}-${formattedMonth}-${formattedDay}`;
}

// Inserts an event from AI-extracted data, the Instagram post ID, and scraper metadata.
export async function insertEventToDatabase(eventData, postId, { ownerUsername, ownerFullName, coauthorProducers, displayUrl, caption, postUrl, postTimestamp }) {

    console.log(`📥 Processing new event: ${eventData.eventName}...`);

    try {
        // Use the Instagram post ID as the event ID for deduplication
        const newEventId = postId;

        // Owner-first host list, co-authors after (shared shape with eventMerge.js).
        const allHosts = buildHosts(ownerUsername, ownerFullName, coauthorProducers);

        // Resolve curated category ids up front — reads can't go inside the write batch.
        // Invalid AI tags are logged and skipped.
        const { categoryIds, missing } = await resolveCategoryIds(db, eventData.tags);
        for (const tag of missing) {
            console.warn(`⚠️ Ignored invalid tag from Gemini: "${tag}"`);
        }

        // One atomic write batch: the EVENT row, host links, and category links all land
        // together or not at all. (Sequential executes could strand an EVENT row without
        // hosts/tags on a mid-insert failure — and since later runs skip existing event_ids,
        // such a row was never repaired.)
        const stmts = [
            {
                sql: `
                    INSERT INTO EVENT (event_id, event_title, event_description, event_date, event_time, event_location, displayUrl, postUrl, post_timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                args: [
                    newEventId,
                    eventData.eventName || UNTITLED_EVENT,
                    caption,
                    eventData.date || DATE_TBA,
                    eventData.time || TIME_TBA,
                    eventData.location || LOCATION_TBA,
                    displayUrl,
                    postUrl || null,
                    postTimestamp || null
                ]
            },
            ...hostLinkStatements(newEventId, allHosts),
            ...categoryIds.map((cid) => ({
                sql: `INSERT OR IGNORE INTO CATEGORIZED_AS (event_id, category_id) VALUES (?, ?)`,
                args: [newEventId, cid]
            })),
        ];
        await db.batch(stmts, 'write');

        console.log("✅ Pipeline Success: Event securely inserted into Turso!");

        return { success: true, eventId: newEventId };

    } catch (error) {
        console.error("❌ Pipeline Failed. Database error:", error.message);
        throw error; // Callers (pipeline / scripts) decide how to handle a failed insert
    }
}