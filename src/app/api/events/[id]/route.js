import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET /api/events/:id  —  single event + RSVP count + related events
export async function GET(request, { params }) {
    const { id } = await params;
    const db = getDb();

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Related events: same location or same date
    const related = db.prepare(`
    SELECT * FROM events
    WHERE id != @id
      AND (location = @location OR date = @date)
    LIMIT 5
  `).all({ id, location: event.location, date: event.date });

    // RSVP count
    const { count } = db.prepare(
        'SELECT COUNT(*) as count FROM rsvps WHERE event_id = ?'
    ).get(id);

    return NextResponse.json({ ...event, rsvp_count: count, related });
}
