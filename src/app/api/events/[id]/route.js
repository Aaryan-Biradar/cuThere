import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

// The event itself + its "related" list are once-a-night data → cached under the shared
// 'events' tag (so one revalidation refreshes the list and every detail page). RSVP count is
// fetched live below, since it changes as users RSVP.
const getEventCore = unstable_cache(
  async (id) => {
    // 1. Fetch the specific event
    const eventResult = await db.execute({
      sql: `
        SELECT
          e.event_id AS id,
          e.event_title AS title,
          e.event_description AS description,
          e.event_date AS date,
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
        WHERE e.event_id = ?
        GROUP BY e.event_id
      `,
      args: [id]
    });
    const eventRaw = eventResult.rows[0];
    if (!eventRaw) return null;

    let tagsArray = [];
    if (eventRaw.tags) {
      try { tagsArray = JSON.parse(eventRaw.tags).filter(Boolean); } catch (e) {}
    }
    let hostsArray = [];
    if (eventRaw.hosts) {
      try { hostsArray = JSON.parse(eventRaw.hosts).filter(Boolean); } catch (e) {}
    }
    const normalizedDate = eventRaw.date || eventRaw.event_date || '';
    const event = {
      ...eventRaw,
      date: normalizedDate,
      event_date: normalizedDate,
      tags: tagsArray,
      hosts: hostsArray,
      category: tagsArray.length > 0 ? tagsArray[0] : 'Uncategorized'
    };

    // 2. Fetch related events (same date OR location), excluding the current event
    const relatedResult = await db.execute({
      sql: `
        SELECT
          e.event_id AS id,
          e.event_title AS title,
          e.event_description AS description,
          e.event_date AS date,
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
        WHERE e.event_id != ? AND (e.event_date = ? OR e.event_location = ?)
        GROUP BY e.event_id
        LIMIT 5
      `,
      args: [id, event.date, event.location]
    });

    const related = relatedResult.rows.map(evt => {
      let tArray = [];
      if (evt.tags) {
        try { tArray = JSON.parse(evt.tags).filter(Boolean); } catch (e) {}
      }
      let hArray = [];
      if (evt.hosts) {
        try { hArray = JSON.parse(evt.hosts).filter(Boolean); } catch (e) {}
      }
      return {
        ...evt,
        tags: tArray,
        hosts: hArray,
        category: tArray.length > 0 ? tArray[0] : 'Uncategorized'
      };
    });

    return { event, related };
  },
  ['event-core'],
  { tags: ['events'], revalidate: 86400 }
);

export async function GET(_request, { params }) {
  const { id } = await params;

  try {
    const core = await getEventCore(id); // cached (event + related)

    if (!core) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // 3. RSVP count — kept LIVE (changes as users RSVP, so it isn't cached with the event)
    let rsvp_count = 0;
    try {
      const rsvpResult = await db.execute({
        sql: `SELECT count(*) as count FROM RSVPs WHERE event_id = ?`,
        args: [id]
      });
      rsvp_count = rsvpResult.rows[0]?.count ?? 0;
    } catch (err) {
      // Table might not be fully migrated or querying issues
    }

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
