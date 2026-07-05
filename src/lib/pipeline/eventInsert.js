import db from '../server/db.js';
import { UNTITLED_EVENT, DATE_TBA, TIME_TBA, LOCATION_TBA } from './placeholders.js';

/**
 * Calculates the correct year for an event based on the post's timestamp.
 * @param {string} postTimestamp - The ISO string from Apify (e.g., "2026-12-10T13:37:24.000Z")
 * @param {string} eventDateString - The string from Gemini (e.g., "January 15" or "Jan 15th")
 * @returns {string} - A fully qualified date string (e.g., "2027-01-15")
 */
export function normalizeEventDate(postTimestamp, eventDateString) {
    // 1. Parse the Apify Post Date
    const postDate = new Date(postTimestamp);
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

// The function now takes the dynamic AI data, the original post ID, and scraper metadata as parameters
export async function insertEventToDatabase(eventData, postId, { ownerUsername, ownerFullName, coauthorProducers, displayUrl, caption, postUrl, postTimestamp }) {

    console.log(`📥 Processing new event: ${eventData.eventName}...`);

    try {
        // Use the Instagram post ID as the event ID for deduplication
        const newEventId = postId;

        // Build a unified array of all host usernames
        // The owner always comes first, then any co-authors
        const allHosts = [
            { username: ownerUsername, displayName: ownerFullName || ownerUsername },
            ...(coauthorProducers || []).map(co => ({
                username: co.username,
                displayName: co.fullName || co.username // grab full name if available
            }))
        ];

        // 2. Insert the core Event into the EVENT table (no org_id anymore)
        await db.execute({
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
        });

        // 3. Loop through all hosts and link them via the junction table
        for (const host of allHosts) {
            // a. Safely insert the organization (ignores if it already exists)
            await db.execute({
                sql: `
                    INSERT OR IGNORE INTO ORGANIZATION (org_id, org_name) 
                    VALUES (?, ?)
                `,
                args: [host.username, host.displayName]
            });

            // b. Link this host to the event in the HOSTS junction table
            await db.execute({
                sql: `
                    INSERT INTO HOSTS (event_id, org_id) 
                    VALUES (?, ?)
                `,
                args: [newEventId, host.username]
            });
        }

        // 4. Safely link Categories (Strict Multi-Select) — existing N:N logic
        if (eventData.tags && Array.isArray(eventData.tags)) {
            for (const tag of eventData.tags) {
                
                // First, check if the tag Gemini picked actually exists in our DB
                const result = await db.execute({
                    sql: `
                        SELECT category_id FROM CATEGORY WHERE category_name = ?
                    `,
                    args: [tag]
                });
                const existingCategory = result.rows[0];

                if (existingCategory) {
                    // If it's a valid curated tag, link it to the event!
                    await db.execute({
                        sql: `
                            INSERT INTO CATEGORIZED_AS (event_id, category_id) 
                            VALUES (?, ?)
                        `,
                        args: [newEventId, existingCategory.category_id]
                    });
                } else {
                    // If Gemini hallucinated a tag, we just ignore it and log it
                    console.warn(`⚠️ Ignored invalid tag from Gemini: "${tag}"`);
                }
            }
        }

        console.log("✅ Pipeline Success: Event securely inserted into Turso!");
        
        // Return success so your API route knows it worked
        return { success: true, eventId: newEventId };

    } catch (error) {
        console.error("❌ Pipeline Failed. Database error:", error.message);
        throw error; // Throw the error so your Next.js route can catch it and send a 500 status
    }
}