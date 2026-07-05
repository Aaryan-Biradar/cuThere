import { NextResponse } from 'next/server';
import db from '@/lib/server/db';
import { EVENT_SELECT_BASE, mapEventRow } from '@/lib/server/events';

// Columns matched against the (lowercased) search query, in OR. These use the matching
// subquery's own aliases (e2/c2/o2), NOT the outer aggregate's — see the WHERE note below.
const SEARCH_COLUMNS = [
  'e2.event_title',
  'e2.event_description',
  'e2.event_location',
  'c2.category_name',
  'o2.org_name',
  'o2.org_id',
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

    // Escape LIKE metacharacters so "%"/"_" in the query match literally instead of acting
    // as wildcards (a bare "%" would otherwise return the whole table).
    const escaped = q.toLowerCase().replace(/[\\%_]/g, (m) => `\\${m}`);
    const searchQuery = `%${escaped}%`;
    const whereClause = SEARCH_COLUMNS.map(col => `LOWER(${col}) LIKE ? ESCAPE '\\'`).join('\n               OR ');

    // Matching happens in an IN-subquery, NOT in the outer WHERE: SQL applies WHERE before
    // aggregation, so filtering the outer join rows directly would drop the non-matching
    // rows from json_group_array — an event matched only via one tag would come back with
    // truncated tags/hosts (and a different category) than /api/events returns for it.
    const result = await db.execute({
      sql: `
        ${EVENT_SELECT_BASE}
        WHERE e.event_id IN (
          SELECT e2.event_id
          FROM EVENT e2
          LEFT JOIN CATEGORIZED_AS et2 ON e2.event_id = et2.event_id
          LEFT JOIN CATEGORY c2 ON et2.category_id = c2.category_id
          LEFT JOIN HOSTS eh2 ON e2.event_id = eh2.event_id
          LEFT JOIN ORGANIZATION o2 ON eh2.org_id = o2.org_id
          WHERE ${whereClause}
        )
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
