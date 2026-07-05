import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import db from '@/lib/server/db';
import {
  EVENT_SELECT_BASE,
  mapEventRow,
  countRsvps,
  EVENTS_REVALIDATE_SECONDS,
} from '@/lib/server/events';

export const dynamic = 'force-dynamic';

// The event is once-a-night data → cached under the shared 'events' tag. RSVP count is fetched
// live below, since it changes as users RSVP.
const getEventCore = unstable_cache(
  async (id) => {
    const eventResult = await db.execute({
      sql: `
        ${EVENT_SELECT_BASE}
        WHERE e.event_id = ?
        GROUP BY e.event_id
      `,
      args: [id]
    });
    const eventRaw = eventResult.rows[0];
    if (!eventRaw) return null;

    return { event: mapEventRow(eventRaw) };
  },
  ['event-core'],
  { tags: ['events'], revalidate: EVENTS_REVALIDATE_SECONDS }
);

export async function GET(_request, { params }) {
  const { id } = await params;

  try {
    const core = await getEventCore(id); // cached

    if (!core) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // RSVP count — kept LIVE (changes as users RSVP, so it isn't cached with the event)
    const rsvp_count = await countRsvps(db, id);

    return NextResponse.json({
      ...core.event,
      rsvp_count,
    });
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
