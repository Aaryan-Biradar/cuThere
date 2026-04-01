import { NextResponse } from 'next/server';
import db from '@/lib/db';

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

    // Get updated RSVP count
    let rsvp_count = 1;
    try {
      const countResult = await db.execute({
        sql: `SELECT count(*) as count FROM RSVPs WHERE event_id = ?`,
        args: [event_id]
      });
      const countRow = countResult.rows[0];
      rsvp_count = countRow ? countRow.count : 1;
    } catch(e) {}

    return NextResponse.json({ message: 'RSVP created', rsvp_count, is_demo: false }, { status: 201 });
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

    // Get updated RSVP count
    let rsvp_count = 0;
    try {
      const countResult = await db.execute({
        sql: `SELECT count(*) as count FROM RSVPs WHERE event_id = ?`,
        args: [event_id]
      });
      const countRow = countResult.rows[0];
      rsvp_count = countRow ? countRow.count : 0;
    } catch(e) {}

    return NextResponse.json({ message: 'RSVP removed', rsvp_count, is_demo: false }, { status: 200 });
  } catch (error) {
    console.error('RSVP delete error:', error);
    return NextResponse.json({ error: 'Failed to remove RSVP' }, { status: 500 });
  }
}
