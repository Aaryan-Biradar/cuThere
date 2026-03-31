import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { DB_PATH } from '@/lib/db';

// POST /api/rsvp
export async function POST(request) {
  try {
    const { event_id, user_name } = await request.json();

    if (!event_id || !user_name) {
      return NextResponse.json({ error: 'event_id and user_name are required' }, { status: 400 });
    }

    const db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    // Step 1: Ensure the event exists
    const eventRaw = await db.get(`SELECT event_id FROM EVENT WHERE event_id = ?`, [event_id]);
    if (!eventRaw) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Step 2: Ensure the user exists in STUDENT table
    // If we're mocking login, we just create the student on the fly if they don't exist
    const defaultStudentEmail = `${user_name}@example.com`; // Mock email based on user_name
    await db.run(`
      INSERT OR IGNORE INTO STUDENT (student_id, student_name, student_email, password_hash)
      VALUES (?, ?, ?, ?)
    `, [user_name, user_name, defaultStudentEmail, 'mock_hash']);

    // Step 3: Insert RSVP
    await db.run(`
      INSERT INTO RSVPs (student_id, event_id, rsvp_status) 
      VALUES (?, ?, 'going')
      ON CONFLICT(student_id, event_id) DO UPDATE SET rsvp_status = 'going'
    `, [user_name, event_id]);

    // Get updated RSVP count
    let rsvp_count = 1;
    try {
      const countRow = await db.get(`SELECT count(*) as count FROM RSVPs WHERE event_id = ?`, [event_id]);
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

    const db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    // Remove the RSVP record
    await db.run(`DELETE FROM RSVPs WHERE student_id = ? AND event_id = ?`, [user_name, event_id]);

    // Get updated RSVP count
    let rsvp_count = 0;
    try {
      const countRow = await db.get(`SELECT count(*) as count FROM RSVPs WHERE event_id = ?`, [event_id]);
      rsvp_count = countRow ? countRow.count : 0;
    } catch(e) {}

    return NextResponse.json({ message: 'RSVP removed', rsvp_count, is_demo: false }, { status: 200 });
  } catch (error) {
    console.error('RSVP delete error:', error);
    return NextResponse.json({ error: 'Failed to remove RSVP' }, { status: 500 });
  }
}
