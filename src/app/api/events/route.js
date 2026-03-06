import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET /api/events  —  list events with optional filters (?q=&date=&location=)
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const date = searchParams.get('date');
    const location = searchParams.get('location');

    const db = getDb();
    let query = 'SELECT * FROM events WHERE 1=1';
    const params = {};

    if (q) {
        query += ' AND (title LIKE @q OR description LIKE @q)';
        params.q = `%${q}%`;
    }
    if (date) {
        query += ' AND date = @date';
        params.date = date;
    }
    if (location) {
        query += ' AND location LIKE @location';
        params.location = `%${location}%`;
    }

    query += ' ORDER BY created_at DESC';

    const events = db.prepare(query).all(params);
    return NextResponse.json(events);
}

// POST /api/events  —  create a new event manually
export async function POST(request) {
    try {
        const body = await request.json();
        const { title, description, date, time, location, image_url, source_url } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const db = getDb();
        const result = db.prepare(`
      INSERT INTO events (title, description, date, time, location, image_url, source_url)
      VALUES (@title, @description, @date, @time, @location, @image_url, @source_url)
    `).run({
            title,
            description: description || null,
            date: date || null,
            time: time || null,
            location: location || null,
            image_url: image_url || null,
            source_url: source_url || null,
        });

        const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        console.error('Create event error:', error);
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
}
