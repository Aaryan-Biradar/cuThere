import defaultDb from '../server/db.js';
import { isReal, ISO_DATE } from './placeholders.js';
import { buildHosts, hostLinkStatements, resolveCategoryIds } from './hosts.js';

/**
 * Merge a confirmed-duplicate post into a surviving EVENT row.
 *
 * Used by BOTH the live pipeline (incoming post never inserted → absorbedEventId = null)
 * and the backfill script (an existing duplicate row → absorbedEventId set, so that row's
 * RSVPs/junctions are repointed and the row is deleted).
 *
 * The survivor's event_id is preserved (stable /events/[id] permalinks + RSVPs); only its
 * column *values* are refreshed with the most complete + most current info.
 */

// HARD GUARDRAIL: a real value is NEVER replaced by an empty/placeholder one,
// regardless of what Gemini proposed.
function pickValue(existing, proposed) {
    return isReal(proposed) ? proposed : existing;
}

// Date-specific guard: never replace a real value with a placeholder; never downgrade a precise
// ISO date (YYYY-MM-DD) to a vague string; if both are ISO with the SAME month-day, keep the
// existing (stable) year so an AI can't fabricate one; only take the proposed value for a genuine
// date change (different month-day, or both non-ISO).
function pickDate(existing, proposed) {
    if (!isReal(proposed)) return existing;
    if (!isReal(existing)) return proposed;
    const e = String(existing).trim();
    const p = String(proposed).trim();
    const eIso = ISO_DATE.test(e);
    const pIso = ISO_DATE.test(p);
    if (eIso && !pIso) return existing;
    if (eIso && pIso && e.slice(5) === p.slice(5)) return existing;
    return proposed;
}

// ISO-8601 strings sort lexicographically by time; null/missing is treated as oldest.
function isNewer(a, b) {
    if (!a) return false;
    if (!b) return true;
    return a > b;
}

/**
 * @param {object}  args
 * @param {object}  [args.db]               libsql client (defaults to the shared one)
 * @param {string}  args.survivorEventId    the row to keep
 * @param {object}  args.merged             Gemini's merged fields { eventName, date, time, location, description, tags[] }
 * @param {object}  args.contributingPost   { postId, ownerUsername, ownerFullName, coauthorProducers[], displayUrl, postUrl, postTimestamp }
 * @param {string|null} [args.absorbedEventId]  existing duplicate row to delete (backfill only)
 * @returns {Promise<{ success: boolean, survivorEventId: string }>}
 */
export async function applyMerge({ db = defaultDb, survivorEventId, merged, contributingPost = {}, absorbedEventId = null }) {
    // 1. Read the survivor's current values (the baseline the guardrail protects).
    const res = await db.execute({
        sql: `SELECT event_title, event_description, event_date, event_time, event_location,
                     displayUrl, postUrl, post_timestamp
              FROM EVENT WHERE event_id = ?`,
        args: [survivorEventId],
    });
    const current = res.rows[0];
    if (!current) throw new Error(`applyMerge: survivor event ${survivorEventId} not found`);

    const m = merged || {};
    const title = pickValue(current.event_title, m.eventName);
    const description = pickValue(current.event_description, m.description);
    const date = pickDate(current.event_date, m.date);
    const time = pickValue(current.event_time, m.time);
    const location = pickValue(current.event_location, m.location);

    // Image/links/timestamp: adopt the contributing post's only when it is the newer version
    // and actually has an image; post_timestamp always advances to the newest of the two.
    const contributingNewer = isNewer(contributingPost.postTimestamp, current.post_timestamp);
    const adoptImage = contributingNewer && isReal(contributingPost.displayUrl);
    const displayUrl = adoptImage ? contributingPost.displayUrl : current.displayUrl;
    const postUrl = adoptImage ? (contributingPost.postUrl ?? current.postUrl) : current.postUrl;
    const post_timestamp = contributingNewer
        ? contributingPost.postTimestamp
        : (current.post_timestamp ?? contributingPost.postTimestamp ?? null);

    const now = new Date().toISOString();

    // 2. Resolve category_ids for the merged (unioned) tag list — reads, done before the write
    // batch. Unknown tags are silently dropped here (the insert path is the one that warns).
    const { categoryIds } = await resolveCategoryIds(db, m.tags);

    // Owner + co-authors of the contributing post (shared shape with eventInsert.js).
    const allHosts = buildHosts(contributingPost.ownerUsername, contributingPost.ownerFullName, contributingPost.coauthorProducers);

    // 3. Build one atomic write batch.
    const stmts = [];

    stmts.push({
        sql: `UPDATE EVENT SET event_title = ?, event_description = ?, event_date = ?, event_time = ?,
                     event_location = ?, displayUrl = ?, postUrl = ?, post_timestamp = ?, updated_at = ?
              WHERE event_id = ?`,
        args: [title, description, date, time, location, displayUrl, postUrl, post_timestamp, now, survivorEventId],
    });

    stmts.push(...hostLinkStatements(survivorEventId, allHosts));

    for (const cid of categoryIds) {
        stmts.push({ sql: `INSERT OR IGNORE INTO CATEGORIZED_AS (event_id, category_id) VALUES (?, ?)`, args: [survivorEventId, cid] });
    }

    // Backfill case: an existing duplicate row is being absorbed → move its children, then delete it.
    if (absorbedEventId && absorbedEventId !== survivorEventId) {
        // Drop RSVPs that would collide on (student_id, survivor) before repointing the rest.
        stmts.push({
            sql: `DELETE FROM RSVPs WHERE event_id = ? AND student_id IN (SELECT student_id FROM RSVPs WHERE event_id = ?)`,
            args: [absorbedEventId, survivorEventId],
        });
        stmts.push({ sql: `UPDATE RSVPs SET event_id = ? WHERE event_id = ?`, args: [survivorEventId, absorbedEventId] });
        stmts.push({ sql: `DELETE FROM HOSTS WHERE event_id = ?`, args: [absorbedEventId] });
        stmts.push({ sql: `DELETE FROM CATEGORIZED_AS WHERE event_id = ?`, args: [absorbedEventId] });
        stmts.push({ sql: `DELETE FROM EVENT WHERE event_id = ?`, args: [absorbedEventId] });
    }

    // Record the absorbed/contributing post so the scraper's next re-fetch is skipped cheaply
    // (IGNORED_POST is already checked in runPipeline).
    if (contributingPost.postId) {
        stmts.push({ sql: `INSERT OR IGNORE INTO IGNORED_POST (post_id) VALUES (?)`, args: [contributingPost.postId] });
    }

    await db.batch(stmts, 'write');
    return { success: true, survivorEventId };
}
