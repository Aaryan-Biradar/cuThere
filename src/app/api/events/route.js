import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import db from '@/lib/db';
import { EVENT_SELECT_BASE, mapEventRow, EVENTS_REVALIDATE_SECONDS } from '@/lib/events';

// Keep the route dynamic (runs per request, no build-time static generation / build-time DB call);
// the DB read below is what's cached, via unstable_cache + the 'events' tag.
export const dynamic = 'force-dynamic';

// Shared server cache: the DB is queried only on a cache miss, then the result is reused until
// the `revalidate` window (EVENTS_REVALIDATE_SECONDS) elapses and the next request refreshes it.
const getEvents = unstable_cache(
  async () => {
    const result = await db.execute({
      sql: `
        ${EVENT_SELECT_BASE}
        GROUP BY e.event_id
      `,
      args: []
    });

    // Map the stringified tag and host arrays to JS arrays properly
    return result.rows.map(mapEventRow);
  },
  ['events-all'],
  { tags: ['events'], revalidate: EVENTS_REVALIDATE_SECONDS }
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
