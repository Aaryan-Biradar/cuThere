/**
 * Shared SQL + row mapping for the events API routes.
 *
 * The big "fetch an event with its tags and hosts" SELECT and the row→object mapper used to be
 * copy-pasted across /api/events, /api/events/[id], and /api/events/search (with drift). They live
 * here once so every endpoint returns the SAME event shape.
 */

// Default category shown when an event has no tags.
export const DEFAULT_CATEGORY = 'Uncategorized';

// 10h — used as the `revalidate` safety net for the cached events reads.
export const EVENTS_REVALIDATE_SECONDS = 60 * 60 * 10;

// Cap on how many "related" events a detail page returns.
export const RELATED_EVENTS_LIMIT = 5;

// Core event SELECT: the 8 aliased columns plus the aggregated tags/hosts arrays, with the LEFT
// JOINs onto categories and organizations. Callers append their own WHERE / GROUP BY / ORDER /
// LIMIT. `event_date` is aliased once; mapEventRow derives both `date` and `event_date` from it.
export const EVENT_SELECT_BASE = `
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
`;

// Parse a json_group_array() string into a clean array, dropping the [null] / null entries
// SQLite emits when a LEFT JOIN finds no match. Never throws.
export function parseJsonArray(str) {
  try { return JSON.parse(str || '[]').filter(Boolean); } catch { return []; }
}

/**
 * Normalize a raw DB row from EVENT_SELECT_BASE into the canonical event shape every endpoint
 * returns. Parses tags/hosts, sets BOTH `date` and `event_date` to the same value, and derives
 * `category` from the first tag.
 *
 * @returns {{ id, title, description, date, event_date, time, location, displayUrl, postUrl, tags, hosts, category }}
 */
export function mapEventRow(row) {
  const tags = parseJsonArray(row.tags);
  const hosts = parseJsonArray(row.hosts);
  const normalizedDate = row.date || row.event_date || '';
  return {
    ...row,
    date: normalizedDate,
    event_date: normalizedDate,
    tags,
    hosts,
    category: tags[0] ?? DEFAULT_CATEGORY,
  };
}

// Live count of RSVPs for an event. Returns the real number, or 0 on any error (table missing,
// query failure, etc.) so callers never default to a fake count.
export async function countRsvps(db, eventId) {
  try {
    const result = await db.execute({
      sql: `SELECT count(*) as count FROM RSVPs WHERE event_id = ?`,
      args: [eventId],
    });
    return result.rows[0]?.count ?? 0;
  } catch {
    return 0;
  }
}
