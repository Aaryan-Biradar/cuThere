import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// The function now takes the dynamic AI data, the original post ID, and scraper metadata as parameters
export async function insertEventToDatabase(eventData, postId, { ownerUsername, ownerFullName, coauthorProducers, displayUrl, caption }) {
    // 1. Open the existing database
    const db = await open({
        filename: './cuthere.db',
        driver: sqlite3.Database
    });

    console.log(`📥 Processing new event: ${eventData.eventName}...`);

    try {
        // Use the Instagram post ID as the event ID for deduplication
        const newEventId = postId;

        // Build a unified array of all host usernames
        // The owner always comes first, then any co-authors
        const allHosts = [
            { username: ownerUsername, displayName: ownerFullName },
            ...(coauthorProducers || []).map(co => ({
                username: co.username,
                displayName: co.username // fallback: use username as org_name
            }))
        ];

        // 2. Insert the core Event into the EVENT table (no org_id anymore)
        await db.run(`
            INSERT INTO EVENT (event_id, event_title, event_description, event_date, event_time, event_location, displayUrl) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            newEventId, 
            eventData.eventName, 
            caption, 
            eventData.date, 
            eventData.time, 
            eventData.location, 
            displayUrl
        ]);

        // 3. Loop through all hosts and link them via the junction table
        for (const host of allHosts) {
            // a. Safely insert the organization (ignores if it already exists)
            await db.run(`
                INSERT OR IGNORE INTO ORGANIZATION (org_id, org_name) 
                VALUES (?, ?)
            `, [host.username, host.displayName]);

            // b. Link this host to the event in the EVENT_HOSTS junction table
            await db.run(`
                INSERT INTO EVENT_HOSTS (event_id, org_id) 
                VALUES (?, ?)
            `, [newEventId, host.username]);
        }

        // 4. Safely link Categories (Strict Multi-Select) — existing N:N logic
        if (eventData.tags && Array.isArray(eventData.tags)) {
            for (const tag of eventData.tags) {
                
                // First, check if the tag Gemini picked actually exists in our DB
                const existingCategory = await db.get(`
                    SELECT category_id FROM CATEGORY WHERE category_name = ?
                `, [tag]);

                if (existingCategory) {
                    // If it's a valid curated tag, link it to the event!
                    await db.run(`
                        INSERT INTO EVENT_TAGS (event_id, category_id) 
                        VALUES (?, ?)
                    `, [newEventId, existingCategory.category_id]);
                } else {
                    // If Gemini hallucinated a tag, we just ignore it and log it
                    console.warn(`⚠️ Ignored invalid tag from Gemini: "${tag}"`);
                }
            }
        }

        console.log("✅ Pipeline Success: Event securely inserted into SQLite!");
        
        // Return success so your API route knows it worked
        return { success: true, eventId: newEventId };

    } catch (error) {
        console.error("❌ Pipeline Failed. Database error:", error.message);
        throw error; // Throw the error so your Next.js route can catch it and send a 500 status
    }
}