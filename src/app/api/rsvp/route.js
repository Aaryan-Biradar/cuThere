import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// POST /api/rsvp  —  create an RSVP
export async function POST(request) {
    try {
        const { event_id, user_name } = await request.json();

        if (!event_id || !user_name) {
            return NextResponse.json(
                { error: 'event_id and user_name are required' },
                { status: 400 },
            );
        }

        const db = getDb();

        const event = db.prepare('SELECT id FROM events WHERE id = ?').get(event_id);
        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        db.prepare(
            'INSERT OR IGNORE INTO rsvps (event_id, user_name) VALUES (?, ?)'
        ).run(event_id, user_name);

        const { count } = db.prepare(
            'SELECT COUNT(*) as count FROM rsvps WHERE event_id = ?'
        ).get(event_id);

        return NextResponse.json({ message: 'RSVP created', rsvp_count: count }, { status: 201 });
    } catch (error) {
        console.error('RSVP error:', error);
        return NextResponse.json({ error: 'Failed to create RSVP' }, { status: 500 });
    }
}

// DELETE /api/rsvp  —  remove an RSVP
export async function DELETE(request) {
    try {
        const { event_id, user_name } = await request.json();

        if (!event_id || !user_name) {
            return NextResponse.json(
                { error: 'event_id and user_name are required' },
                { status: 400 },
            );
        }

        const db = getDb();

        db.prepare(
            'DELETE FROM rsvps WHERE event_id = ? AND user_name = ?'
        ).run(event_id, user_name);

        const { count } = db.prepare(
            'SELECT COUNT(*) as count FROM rsvps WHERE event_id = ?'
        ).get(event_id);

        return NextResponse.json({ message: 'RSVP removed', rsvp_count: count });
    } catch (error) {
        console.error('RSVP delete error:', error);
        return NextResponse.json({ error: 'Failed to remove RSVP' }, { status: 500 });
    }
}
