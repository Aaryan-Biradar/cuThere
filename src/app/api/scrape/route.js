import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';
import { getDb } from '@/lib/db';
import { parseEventFromPost } from '@/lib/parser';

// POST /api/scrape  —  scrape an IG account → parse → insert events
export async function POST(request) {
    try {
        const { username } = await request.json();

        if (!username) {
            return NextResponse.json(
                { error: 'Instagram username is required' },
                { status: 400 },
            );
        }

        const token = process.env.APIFY_TOKEN;
        if (!token) {
            return NextResponse.json(
                { error: 'APIFY_TOKEN not configured' },
                { status: 500 },
            );
        }

        // --- 1. Run the Apify Instagram scraper ---
        const client = new ApifyClient({ token });

        const run = await client
            .actor('apify/instagram-post-scraper')
            .call({ username: [username], resultsLimit: 20 });

        const { items } = await client
            .dataset(run.defaultDatasetId)
            .listItems();

        // --- 2. Parse & insert into SQLite ---
        const db = getDb();
        const insert = db.prepare(`
      INSERT OR IGNORE INTO events
        (title, description, date, time, location, image_url, source_url, source_platform)
      VALUES
        (@title, @description, @date, @time, @location, @image_url, @source_url, @source_platform)
    `);

        const inserted = [];
        const insertMany = db.transaction((posts) => {
            for (const post of posts) {
                const event = parseEventFromPost(post);
                const result = insert.run(event);
                if (result.changes > 0) {
                    inserted.push({ ...event, id: result.lastInsertRowid });
                }
            }
        });

        insertMany(items);

        return NextResponse.json({
            message: `Scraped ${items.length} posts, inserted ${inserted.length} new events`,
            events: inserted,
        });
    } catch (error) {
        console.error('Scrape error:', error);
        return NextResponse.json(
            { error: 'Failed to scrape Instagram', details: error.message },
            { status: 500 },
        );
    }
}
