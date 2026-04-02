import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/events
export async function GET() {
  try {
    // Use json_group_array to aggregate tag names and hosts
    const result = await db.execute({
      sql: `
        SELECT 
          e.event_id AS id, 
          e.event_title AS title, 
          e.event_description AS description, 
          e.event_date AS event_date,
          e.event_time AS time, 
          e.event_location AS location,
          e.displayUrl AS displayUrl,
          e.postUrl AS postUrl,
          json_group_array(DISTINCT c.category_name) as tags,
          json_group_array(DISTINCT o.org_name) as hosts
        FROM EVENT e
        LEFT JOIN CATEGORIZED_AS et ON e.event_id = et.event_id
        LEFT JOIN CATEGORY c ON et.category_id = c.category_id
        LEFT JOIN HOSTS eh ON e.event_id = eh.event_id
        LEFT JOIN ORGANIZATION o ON eh.org_id = o.org_id
        GROUP BY e.event_id
      `,
      args: []
    });
    const events = result.rows;

    // Map the stringified tag and host arrays to JS arrays properly
    const mappedEvents = events.map(evt => {
      let tagsArray = [];
      if (evt.tags) {
         try {
           const parsed = JSON.parse(evt.tags);
           tagsArray = parsed.filter(Boolean); // Filter out [null]
         } catch(e) { /* ignore parse errors */ }
      }
      let hostsArray = [];
      if (evt.hosts) {
         try {
           const parsed = JSON.parse(evt.hosts);
           hostsArray = parsed.filter(Boolean); // Filter out [null]
         } catch(e) { /* ignore parse errors */ }
      }
      const normalizedDate = evt.date || evt.event_date || '';
      return {
        ...evt,
        date: normalizedDate,
        event_date: normalizedDate,
        tags: tagsArray,
        hosts: hostsArray,
        category: tagsArray.length > 0 ? tagsArray[0] : 'Uncategorized'
      };
    });

    return NextResponse.json(mappedEvents);
  } catch (error) {
    console.error('Error fetching events from DB:', error);
    return NextResponse.json([], { status: 500 });
  }
}
