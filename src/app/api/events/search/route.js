import { NextResponse } from 'next/server';
import db from '@/lib/db';

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

    // Grouping by event_id ensures we only return unique events 
    // even if multiple tags/hosts match the query strings snippet.
    const result = await db.execute({
      sql: `
        SELECT 
          e.event_id AS id, 
          e.event_title AS title, 
          e.event_description AS description, 
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
        WHERE LOWER(e.event_title) LIKE ?
           OR LOWER(e.event_description) LIKE ?
           OR LOWER(e.event_location) LIKE ?
           OR LOWER(c.category_name) LIKE ?
           OR LOWER(o.org_name) LIKE ?
           OR LOWER(o.org_id) LIKE ?
        GROUP BY e.event_id
        ORDER BY e.event_date ASC
      `,
      args: [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery]
    });
    const events = result.rows;

    const mappedEvents = events.map(evt => {
      let tagsArray = [];
      if (evt.tags) {
         try {
           const parsed = JSON.parse(evt.tags);
           tagsArray = parsed.filter(Boolean); // Filter out [null]
         } catch(e) {}
      }
      let hostsArray = [];
      if (evt.hosts) {
         try {
           const parsed = JSON.parse(evt.hosts);
           hostsArray = parsed.filter(Boolean); // Filter out [null]
         } catch(e) {}
      }
      const normalizedDate = evt.event_date || '';
      return {
        ...evt,
        date: normalizedDate,
        tags: tagsArray,
        hosts: hostsArray,
        category: tagsArray.length > 0 ? tagsArray[0] : 'Uncategorized'
      };
    });

    return NextResponse.json(mappedEvents);
  } catch (error) {
    console.error('Error executing SQL search capability:', error);
    return NextResponse.json([], { status: 500 });
  }
}
