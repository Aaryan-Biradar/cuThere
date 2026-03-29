import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { DB_PATH } from '@/lib/db';

// GET /api/events
export async function GET() {
  try {
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    // Use json_group_array to aggregate tag names
    const events = await db.all(`
      SELECT 
        e.event_id AS id, 
        e.event_title AS title, 
        e.event_description AS description, 
        e.event_date AS event_date,
        e.event_time AS time, 
        e.event_location AS location,
        e.displayUrl AS displayUrl,
        json_group_array(c.category_name) as tags
      FROM EVENT e
      LEFT JOIN EVENT_TAGS et ON e.event_id = et.event_id
      LEFT JOIN CATEGORY c ON et.category_id = c.category_id
      GROUP BY e.event_id
    `);

    // Map the stringified tag arrays to JS arrays properly
    const mappedEvents = events.map(evt => {
      let tagsArray = [];
      if (evt.tags) {
         try {
           const parsed = JSON.parse(evt.tags);
           tagsArray = parsed.filter(Boolean); // Filter out [null]
         } catch(e) { /* ignore parse errors */ }
      }
      const normalizedDate = evt.date || evt.event_date || '';
      return {
        ...evt,
        date: normalizedDate,
        event_date: normalizedDate,
        tags: tagsArray,
        category: tagsArray.length > 0 ? tagsArray[0] : 'Uncategorized'
      };
    });

    return NextResponse.json(mappedEvents);
  } catch (error) {
    console.error('Error fetching events from DB:', error);
    return NextResponse.json([], { status: 500 });
  }
}
