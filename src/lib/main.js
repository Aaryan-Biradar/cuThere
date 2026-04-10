import { put } from '@vercel/blob';
import { scrapeLatestPost } from './scraper.js';
import { isEvent, analyzeFlyer } from './ai.js';
import { insertEventToDatabase, normalizeEventDate } from './eventInsert.js';
import db from './db.js';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function executeWithRetry(operation, maxRetries = 3, delayMs = 4000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            const isOverloaded = error?.message?.includes('503') || error?.message?.includes('429') || error?.message?.includes('UNAVAILABLE');
            if (isOverloaded && attempt < maxRetries) {
                console.log(`   ⏳ Gemini API overloaded. Waiting ${~~(delayMs / 1000)}s before retry ${attempt}/${maxRetries}...`);
                await wait(delayMs);
                delayMs *= 1.5; // Exponential backoff
            } else {
                throw error;
            }
        }
    }
}

async function runPipeline() {
    console.log("=== 🚀 CuThere Pipeline Starting ===\n");

    // STEP 1: Scrape the latest posts from Instagram
    console.log("--- Step 1: Scraping Instagram ---");
    const posts = await scrapeLatestPost();
    console.log(`   Found ${posts.length} post(s) to process.\n`);

    for (const post of posts) {
        try {
            if (post.id == null || post.id === 'undefined') { // null, undefined, or literal string 'undefined'
                console.log(`   ⏭️  Invalid post ID. Skipping.`);
                continue;
            }
            const postId = post.id;
            console.log(`\n--- Processing Post ID: ${postId} ---`);
            console.log(`   Caption: "${post.caption?.substring(0, 50)}..."`);

            // STEP 2: Check if this post already exists in the DB
        const result = await db.execute({
            sql: `SELECT event_id FROM EVENT WHERE event_id = ?`,
            args: [postId]
        });
        const existingEvent = result.rows[0];

        if (existingEvent) {
            console.log(`   ⏭️  Already in events database. Skipping.`);
            continue;
        }

        const ignoredResult = await db.execute({
            sql: `SELECT post_id FROM IGNORED_POST WHERE post_id = ?`,
            args: [postId]
        });
        const existingIgnored = ignoredResult.rows[0];

        if (existingIgnored) {
            console.log(`   ⏭️  Previously marked as NON-EVENT. Skipping.`);
            continue;
        }

        // STEP 2.5: Fetch the image ONCE — we'll reuse this buffer for AI + Blob upload
        console.log("   📸 Fetching event flyer image...");
        const imageResponse = await fetch(post.displayUrl);
        const imageBuffer = await imageResponse.arrayBuffer();

        // STEP 3: Filter — ask Gemini if this is actually an event
        console.log("   🔍 Checking if post is an event...");
        const eventCheck = await executeWithRetry(() => isEvent(imageBuffer, post.caption));

        if (!eventCheck) {
            console.log(`   ⏭️  Not an event. Saving ID to ignore list to save AI tokens on next run.`);
            await db.execute({
                sql: `INSERT INTO IGNORED_POST (post_id) VALUES (?)`,
                args: [postId]
            });
            continue;
        }
        console.log("   ✅ Confirmed as an event!");

        // STEP 4: Send the image + caption to Gemini for full analysis
        console.log("   🤖 Analyzing with Gemini AI...");
        const eventData = await executeWithRetry(() => analyzeFlyer(imageBuffer, post.caption));
        console.log("   Parsed event data:", eventData);

        // STEP 4.5: Normalize the event date into a sortable YYYY-MM-DD format
        if (eventData.date) {
            const normalizedDate = normalizeEventDate(post.timestamp, eventData.date);
            console.log(`   📅 Normalized date: "${eventData.date}" → "${normalizedDate}"`);
            eventData.date = normalizedDate;
        }

        // STEP 5: Upload the image buffer to Vercel Blob for permanent storage
        console.log("   ☁️  Uploading flyer to Vercel Blob...");
        const filename = `event-flyers/${Date.now()}-${postId}.jpg`;
        const blob = await put(filename, imageBuffer, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN
        });
        const permanentImageUrl = blob.url;
        console.log(`   🔗 Permanent URL: ${permanentImageUrl}`);

        // STEP 6: Insert the structured data into Turso (with the permanent Blob URL)
        console.log("   💾 Inserting into Database...");
        try {
            const insertResult = await insertEventToDatabase(eventData, postId, {
                ownerUsername: post.ownerUsername,
                ownerFullName: post.ownerFullName,
                coauthorProducers: post.coauthorProducers,
                displayUrl: permanentImageUrl, // ← Permanent Vercel Blob URL instead of expiring Apify URL
                caption: post.caption,
                postUrl: post.url
            });
            console.log(`   ✅ Inserted! Event ID: ${insertResult.eventId}`);
        } catch (error) {
            console.error("   ❌ Pipeline Failed:", error.message);
            console.log("   ⏭️  Continuing to next post...");
            continue; // Skip this post and continue with the next one
        }
        } catch (error) {
            console.error(`   ❌ Error in post processing loop:`, error.message);
        }
        
        // Small baseline delay between posts to prevent rapid-fire API requests
        await wait(2000);
    }

    console.log(`\n=== ✅ Pipeline Complete! ===`);
}

runPipeline().catch(console.error);
