import db from './db.js';

// The function now takes the dynamic AI data, the original post ID, and scraper metadata as parameters
export async function insertEventToDatabase(eventData, postId, { ownerUsername, ownerFullName, coauthorProducers, displayUrl, caption }) {

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
                INSERT INTO EVENT (event_id, event_title, event_description, event_date, event_time, event_location, displayUrl) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            args: [
                newEventId, 
                eventData.eventName || 'Untitled Event', 
                caption, 
                eventData.date || 'Date TBA', 
                eventData.time || 'Time TBA', 
                eventData.location || 'Location TBA', 
                displayUrl
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