import sqlite3 from 'sqlite3';
import { open } from 'sqlite'; //SQLite wrapper for JS
import { scrapeLatestPost } from './scrapper.js';
import { isEvent, analyzeFlyer } from './ai.js';
import { insertEventToDatabase } from './eventInsert.js';

async function runPipeline() {
    console.log("=== 🚀 CuThere Pipeline Starting ===\n");

    // Open DB connection for duplicate checking
    const db = await open({
        filename: './cuthere.db',
        driver: sqlite3.Database
    });

    // STEP 1: Scrape the latest posts from Instagram
    console.log("--- Step 1: Scraping Instagram ---");
    const posts = await scrapeLatestPost();
    console.log(`   Found ${posts.length} post(s) to process.\n`);

    for (const post of posts) {
        const postId = post.id;
        console.log(`\n--- Processing Post ID: ${postId} ---`);
        console.log(`   Caption: "${post.caption?.substring(0, 50)}..."`);

        // STEP 2: Check if this post already exists in the DB
        const existing = await db.get(`
            SELECT event_id FROM EVENT WHERE event_id = ?
        `, [postId]);

        if (existing) {
            console.log(`   ⏭️  Already in database. Skipping.`);
            continue;
        }

        // STEP 3: Filter — ask Gemini if this is actually an event
        console.log("   🔍 Checking if post is an event...");
        const eventCheck = await isEvent(post.displayUrl, post.caption);

        if (!eventCheck) {
            console.log(`   ⏭️  Not an event. Skipping.`);
            continue;
        }
        console.log("   ✅ Confirmed as an event!");

        // STEP 4: Send the image + caption to Gemini for full analysis
        console.log("   🤖 Analyzing with Gemini AI...");
        const eventData = await analyzeFlyer(post.displayUrl, post.caption);
        console.log("   Parsed event data:", eventData);

        // STEP 4: Insert the structured data into SQLite
        console.log("   💾 Inserting into Database...");
        const result = await insertEventToDatabase(eventData, postId, {
            ownerUsername: post.ownerUsername,
            ownerFullName: post.ownerFullName,
            coauthorProducers: post.coauthorProducers,
            displayUrl: post.displayUrl,
            caption: post.caption
        });
        console.log(`   ✅ Inserted! Event ID: ${result.eventId}`);
    }

    console.log(`\n=== ✅ Pipeline Complete! ===`);
}

runPipeline().catch(console.error);
