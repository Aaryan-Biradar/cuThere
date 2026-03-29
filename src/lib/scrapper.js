import { ApifyClient } from 'apify-client';
import 'dotenv/config';

// Initialize the ApifyClient with API token    
const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

// Prepare Actor input
const input = {
    "dataDetailLevel": "basicData",
    "resultsLimit": 1,
    "skipPinnedPosts": true,
    "username": [
        "https://www.instagram.com/carletoncss",
        // "https://www.instagram.com/ieeecarleton",
        // "https://www.instagram.com/carletonscisoc",
        // "https://www.instagram.com/cuscesoc"
    ]
};

export async function scrapeLatestPost() {
    // IG Post Scrapper Actor ID
    const actorId = "nH2AHrwxeTRJoN5hX";

    // Run the Actor and wait for it to finish
    const run = await client.actor(actorId).call(input);

    // Fetch Actor results from the run's dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    items.forEach((item) => {
        console.dir(item);
    });

    console.log(`🕷️  Scraper found ${items.length} post(s)`);
    return items;
}