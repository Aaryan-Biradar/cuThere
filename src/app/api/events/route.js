import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import db from '@/lib/db';

// Keep the route dynamic (runs per request, no build-time static generation / build-time DB call);
// the DB read below is what's cached, via unstable_cache + the 'events' tag.
export const dynamic = 'force-dynamic';

// Shared server cache: the DB is queried only on a cache miss. The result is held until the
// 'events' tag is revalidated (the nightly scraper pings /api/revalidate); the 24h `revalidate`
// is just a safety net.
const getEvents = unstable_cache(
  async () => {
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

    // Map the stringified tag and host arrays to JS arrays properly
    return result.rows.map(evt => {
      let tagsArray = [];
      if (evt.tags) {
        try { tagsArray = JSON.parse(evt.tags).filter(Boolean); } catch (e) { /* ignore parse errors */ }
      }
      let hostsArray = [];
      if (evt.hosts) {
        try { hostsArray = JSON.parse(evt.hosts).filter(Boolean); } catch (e) { /* ignore parse errors */ }
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
  },
  ['events-all'],
  { tags: ['events'], revalidate: 86400 }
);

// GET /api/events
export async function GET() {
  try {
    const mappedEvents = await getEvents();
    return NextResponse.json(mappedEvents);
  } catch (error) {
    console.error('Error fetching events from DB:', error);
    return NextResponse.json([], { status: 500 });
  }
}
