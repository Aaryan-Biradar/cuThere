import { ApifyClient } from 'apify-client';
import 'dotenv/config';
import { readFileSync } from 'node:fs';

// 1. Collect every APIFY_API_TOKEN_<n> from the env, in numeric order, so adding/removing
// a key is just an env change (no code edit). Same rotation behavior as before.
const apifyKeys = Object.keys(process.env)
    .filter((k) => /^APIFY_API_TOKEN_\d+$/.test(k))
    .sort((a, b) => Number(a.match(/\d+$/)[0]) - Number(b.match(/\d+$/)[0]))
    .map((k) => process.env[k])
    .filter(Boolean);

// We'll initialize the client and handle the runNumber logic dynamically inside scrapeLatestPost
// so we can loop over the keys if one of them fails.

// Load Instagram account list from config (deduped)
const { accounts } = JSON.parse(
    readFileSync(new URL('../../../config/accounts.json', import.meta.url), 'utf8')
);

// Prepare Actor input
const input = {
    "dataDetailLevel": "basicData",
    "resultsLimit": 1,
    "skipPinnedPosts": true,
    "username": [...new Set(accounts)]
};

export async function scrapeLatestPost() {
    const actorId = process.env.APIFY_ACTOR_ID || "nH2AHrwxeTRJoN5hX";
    
    // Grab the GitHub run number, defaults to 0
    const runNumber = parseInt(process.env.RUN_NUMBER || "0", 10);
    const startIndex = runNumber % apifyKeys.length;

    for (let i = 0; i < apifyKeys.length; i++) {
        const currentIndex = (startIndex + i) % apifyKeys.length;
        const selectedToken = apifyKeys[currentIndex];
        
        console.log(`🔄 Attempt ${i + 1}/${apifyKeys.length}: Using Apify Key #${currentIndex + 1} for this run...`);
        
        const client = new ApifyClient({
            token: selectedToken
        });

        try {
            // Run the Actor and wait for it to finish
            const run = await client.actor(actorId).call(input);

            // Fetch Actor results from the run's dataset
            const { items } = await client.dataset(run.defaultDatasetId).listItems();

            console.log(`🕷️  Scraper found ${items.length} post(s)`);
            return items;

        } catch (error) {
            // If the key has exceeded its monthly limit
            if (error.statusCode === 403 && error.type === 'platform-feature-disabled') {
                console.warn(`⚠️ Apify Key #${currentIndex + 1} has exceeded its monthly limit. Rotating to next key...`);
                continue; // Move to the next key in the loop
            }
            
            // If it's some other error, throw it immediately
            console.error(`❌ Unexpected Apify Error with Key #${currentIndex + 1}:`, error.message);
            throw error;
        }
    }

    // If we've exhausted all keys
    throw new Error("❌ Fatal: All available Apify keys have exhausted their monthly limits or failed.");
}