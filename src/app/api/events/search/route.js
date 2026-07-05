import { NextResponse } from 'next/server';
import db from '@/lib/server/db';
import { EVENT_SELECT_BASE, mapEventRow } from '@/lib/server/events';

// Columns matched against the (lowercased) search query, in OR. Mirror of the old hand-written
// LOWER(col) LIKE ? list — same columns, same behavior (org_id included).
const SEARCH_COLUMNS = [
  'e.event_title',
  'e.event_description',
  'e.event_location',
  'c.category_name',
  'o.org_name',
  'o.org_id',
];

// GET /api/events/search?q=query
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    // Fallback: If no query, return empty list (frontend handles reverting to full list)
    if (!q || !q.trim()) {
      return NextResponse.json([]);
    }

    const searchQuery = `%${q.toLowerCase()}%`;
    const whereClause = SEARCH_COLUMNS.map(col => `LOWER(${col}) LIKE ?`).join('\n           OR ');

    // Grouping by event_id ensures we only return unique events
    // even if multiple tags/hosts match the query strings snippet.
    const result = await db.execute({
      sql: `
        ${EVENT_SELECT_BASE}
        WHERE ${whereClause}
        GROUP BY e.event_id
        ORDER BY e.event_date ASC
      `,
      args: SEARCH_COLUMNS.map(() => searchQuery)
    });

    const mappedEvents = result.rows.map(mapEventRow);

    return NextResponse.json(mappedEvents);
  } catch (error) {
    console.error('Error executing SQL search capability:', error);
    return NextResponse.json([], { status: 500 });
  }
}
