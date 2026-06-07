import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import db from '@/lib/db';
import {
  EVENT_SELECT_BASE,
  mapEventRow,
  countRsvps,
  EVENTS_REVALIDATE_SECONDS,
  RELATED_EVENTS_LIMIT,
} from '@/lib/events';

export const dynamic = 'force-dynamic';

// The event itself + its "related" list are once-a-night data → cached under the shared
// 'events' tag (so one revalidation refreshes the list and every detail page). RSVP count is
// fetched live below, since it changes as users RSVP.
const getEventCore = unstable_cache(
  async (id) => {
    // 1. Fetch the specific event
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

    const event = mapEventRow(eventRaw);

    // 2. Fetch related events (same date OR location), excluding the current event
    const relatedResult = await db.execute({
      sql: `
        ${EVENT_SELECT_BASE}
        WHERE e.event_id != ? AND (e.event_date = ? OR e.event_location = ?)
        GROUP BY e.event_id
        LIMIT ${RELATED_EVENTS_LIMIT}
      `,
      args: [id, event.date, event.location]
    });

    const related = relatedResult.rows.map(mapEventRow);

    return { event, related };
  },
  ['event-core'],
  { tags: ['events'], revalidate: EVENTS_REVALIDATE_SECONDS }
);

export async function GET(_request, { params }) {
  const { id } = await params;

  try {
    const core = await getEventCore(id); // cached (event + related)

    if (!core) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // 3. RSVP count — kept LIVE (changes as users RSVP, so it isn't cached with the event)
    const rsvp_count = await countRsvps(db, id);

    return NextResponse.json({
      ...core.event,
      rsvp_count,
      related: core.related,
      is_demo: false,
    });
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
