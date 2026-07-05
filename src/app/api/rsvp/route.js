import { NextResponse } from 'next/server';
import db from '@/lib/server/db';
import { countRsvps } from '@/lib/server/events';

// POST /api/rsvp
export async function POST(request) {
  try {
    const { event_id, user_name } = await request.json();

    if (!event_id || !user_name) {
      return NextResponse.json({ error: 'event_id and user_name are required' }, { status: 400 });
    }

    // Step 1: Ensure the event exists
    const eventResult = await db.execute({
      sql: `SELECT event_id FROM EVENT WHERE event_id = ?`,
      args: [event_id]
    });
    const eventRaw = eventResult.rows[0];
    if (!eventRaw) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Step 2: Ensure the user exists in STUDENT table
    // If we're mocking login, we just create the student on the fly if they don't exist
    const defaultStudentEmail = `${user_name}@example.com`; // Mock email based on user_name
    await db.execute({
      sql: `
        INSERT OR IGNORE INTO STUDENT (student_id, student_name, student_email, password_hash)
        VALUES (?, ?, ?, ?)
      `,
      args: [user_name, user_name, defaultStudentEmail, 'mock_hash']
    });

    // Step 3: Insert RSVP
    await db.execute({
      sql: `
        INSERT INTO RSVPs (student_id, event_id, rsvp_status)
        VALUES (?, ?, 'going')
        ON CONFLICT(student_id, event_id) DO UPDATE SET rsvp_status = 'going'
      `,
      args: [user_name, event_id]
    });

    // Get updated RSVP count (real count, or 0 on error — never a fake default)
    const rsvp_count = await countRsvps(event_id);

    return NextResponse.json({ message: 'RSVP created', rsvp_count }, { status: 201 });
  } catch (error) {
    console.error('RSVP error:', error);
    return NextResponse.json({ error: 'Failed to create RSVP' }, { status: 500 });
  }
}

// DELETE /api/rsvp
export async function DELETE(request) {
  try {
    const { event_id, user_name } = await request.json();

    if (!event_id || !user_name) {
      return NextResponse.json({ error: 'event_id and user_name are required' }, { status: 400 });
    }

    // Remove the RSVP record
    await db.execute({
      sql: `DELETE FROM RSVPs WHERE student_id = ? AND event_id = ?`,
      args: [user_name, event_id]
    });

    // Get updated RSVP count (real count, or 0 on error)
    const rsvp_count = await countRsvps(event_id);

    return NextResponse.json({ message: 'RSVP removed', rsvp_count }, { status: 200 });
  } catch (error) {
    console.error('RSVP delete error:', error);
    return NextResponse.json({ error: 'Failed to remove RSVP' }, { status: 500 });
  }
}
