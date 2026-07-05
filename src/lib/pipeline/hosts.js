/**
 * Shared host + category helpers for the two event write paths (eventInsert.js and
 * eventMerge.js), which previously each maintained their own copy of this logic.
 */

/**
 * Owner-first list of { username, displayName } hosts for a post (co-authors after).
 * Hosts with no username are dropped so a missing ownerUsername can never produce
 * a HOSTS row with a NULL org_id.
 */
export function buildHosts(ownerUsername, ownerFullName, coauthorProducers) {
    return [
        { username: ownerUsername, displayName: ownerFullName || ownerUsername },
        ...(coauthorProducers || []).map((co) => ({
            username: co.username,
            displayName: co.fullName || co.username,
        })),
    ].filter((h) => h.username);
}

/** Idempotent ORGANIZATION + HOSTS link statements for one event, usable in a db.batch. */
export function hostLinkStatements(eventId, hosts) {
    return hosts.flatMap((host) => [
        { sql: `INSERT OR IGNORE INTO ORGANIZATION (org_id, org_name) VALUES (?, ?)`, args: [host.username, host.displayName] },
        { sql: `INSERT OR IGNORE INTO HOSTS (event_id, org_id) VALUES (?, ?)`, args: [eventId, host.username] },
    ]);
}

/**
 * Resolve curated CATEGORY ids for a tag list. Returns the ids that exist plus the
 * tags that don't, so callers decide whether to warn (insert path) or stay silent
 * (merge path). Reads must happen BEFORE a libsql write batch, hence the separation.
 */
export async function resolveCategoryIds(db, tags) {
    const categoryIds = [];
    const missing = [];
    for (const tag of Array.isArray(tags) ? tags : []) {
        const r = await db.execute({
            sql: `SELECT category_id FROM CATEGORY WHERE category_name = ?`,
            args: [tag],
        });
        if (r.rows[0]) categoryIds.push(r.rows[0].category_id);
        else missing.push(tag);
    }
    return { categoryIds, missing };
}
