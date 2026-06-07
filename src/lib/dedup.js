import db from './db.js';
import { isPlaceholder } from './placeholders.js';

/**
 * Duplicate-event candidate prefilter + dependency-free string similarity.
 *
 * The pipeline calls findCandidates() to cheaply narrow the field BEFORE spending
 * a Gemini call: same-account events near the same date (primary signal), plus a
 * strict cross-account path for co-hosted events. Gemini then confirms (see
 * findDuplicateAndMerge in ai.js); these thresholds only gate whether it's worth asking.
 */

// Gemini confidence required to actually treat a match as a duplicate.
export const SAME_ACCOUNT_CONFIRM_MIN = 0.75;
export const CROSS_ACCOUNT_CONFIRM_MIN = 0.90;

// Prefilter floors: how similar a candidate must be to be worth a Gemini call at all.
const SAME_ACCOUNT_PREFILTER_MIN = 0.35; // same account is itself a strong signal → loose
const CROSS_ACCOUNT_TITLE_MIN = 0.60;    // strict: different orgs, similar name → needs more
const CROSS_ACCOUNT_LOCATION_MIN = 0.60;
const MAX_CANDIDATES_PER_PATH = 5;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const STOPWORDS = new Set(['the', 'a', 'an', 'and', 'of', 'at', 'in', 'on', 'for', 'to', 'event', 'carleton', 'cu', 'university']);

// Re-export so existing dedup consumers keep importing isPlaceholder from here.
export { isPlaceholder };

function normalizeStr(value) {
    if (value == null) return '';
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ') // strip punctuation/emoji
        .replace(/\s+/g, ' ')
        .trim();
}

function tokens(value) {
    return normalizeStr(value)
        .split(' ')
        .filter((t) => t && !STOPWORDS.has(t));
}

function tokenJaccard(a, b) {
    const sa = new Set(tokens(a));
    const sb = new Set(tokens(b));
    if (sa.size === 0 || sb.size === 0) return 0;
    let inter = 0;
    for (const t of sa) if (sb.has(t)) inter++;
    const union = sa.size + sb.size - inter;
    return union === 0 ? 0 : inter / union;
}

function levenshteinRatio(a, b) {
    const s = normalizeStr(a);
    const t = normalizeStr(b);
    if (!s || !t) return 0;
    if (s === t) return 1;
    const m = s.length;
    const n = t.length;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    let curr = new Array(n + 1);
    for (let i = 1; i <= m; i++) {
        curr[0] = i;
        for (let j = 1; j <= n; j++) {
            const cost = s[i - 1] === t[j - 1] ? 0 : 1;
            curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
        }
        [prev, curr] = [curr, prev];
    }
    return 1 - prev[n] / Math.max(m, n);
}

// Best of token-set overlap and edit-distance: robust to word order AND typos.
export function titleSimilarity(a, b) {
    return Math.max(tokenJaccard(a, b), levenshteinRatio(a, b));
}

// A placeholder location ("Location TBA"/"") is a wildcard — contributes 0, so a same-account
// hype post with no location can still match on title alone, while the cross-account gate
// (which requires locSim) is correctly NOT satisfied by two placeholders.
export function locationSimilarity(a, b) {
    if (isPlaceholder(a) || isPlaceholder(b)) return 0;
    return Math.max(tokenJaccard(a, b), levenshteinRatio(a, b));
}

// [date-1, date, date+1] in YYYY-MM-DD, or null if the date isn't a concrete ISO date.
function dateWindow(normalizedDate) {
    if (!ISO_DATE.test(normalizedDate || '')) return null;
    const base = new Date(`${normalizedDate}T00:00:00Z`);
    if (isNaN(base)) return null;
    const fmt = (d) => d.toISOString().slice(0, 10);
    const minus = new Date(base); minus.setUTCDate(base.getUTCDate() - 1);
    const plus = new Date(base); plus.setUTCDate(base.getUTCDate() + 1);
    return [fmt(minus), normalizedDate, fmt(plus)];
}

// One row → a normalized candidate object (mirrors how the read APIs parse json_group_array).
function hydrate(row) {
    const parseArr = (s) => {
        try { return JSON.parse(s || '[]').filter(Boolean); } catch { return []; }
    };
    return {
        event_id: row.event_id,
        event_title: row.event_title,
        event_description: row.event_description,
        event_date: row.event_date,
        event_time: row.event_time,
        event_location: row.event_location,
        displayUrl: row.displayUrl,
        postUrl: row.postUrl,
        post_timestamp: row.post_timestamp,
        hosts: parseArr(row.host_ids),
        tags: parseArr(row.tags),
    };
}

const AGG_SELECT = `
    SELECT e.event_id, e.event_title, e.event_description, e.event_date, e.event_time,
           e.event_location, e.displayUrl, e.postUrl, e.post_timestamp,
           json_group_array(DISTINCT o.org_id) AS host_ids,
           json_group_array(DISTINCT c.category_name) AS tags
    FROM EVENT e
    LEFT JOIN HOSTS eh ON eh.event_id = e.event_id
    LEFT JOIN ORGANIZATION o ON o.org_id = eh.org_id
    LEFT JOIN CATEGORIZED_AS ca ON ca.event_id = e.event_id
    LEFT JOIN CATEGORY c ON c.category_id = ca.category_id
`;

/**
 * @param {object}   incoming        analyzed event ({ eventName, date (normalized), time, location, ... })
 * @param {string[]} hostUsernames   org_ids of the incoming post (owner + co-authors)
 * @param {string}   normalizedDate  YYYY-MM-DD if known, else a raw/unparseable string
 * @returns {Promise<{ sameAccount: object[], crossAccount: object[] }>} ranked, capped candidates
 */
export async function findCandidates({ incoming, hostUsernames, normalizedDate }) {
    const result = { sameAccount: [], crossAccount: [] };
    const hosts = (hostUsernames || []).filter(Boolean);
    if (hosts.length === 0) return result;

    const window = dateWindow(normalizedDate);
    const title = incoming?.eventName || '';
    const location = incoming?.location || '';

    // ---- Same-account path: events sharing >=1 host. Date-windowed when we have a real date,
    // otherwise title-only across the account's (few) events. ----
    let sameSql = `${AGG_SELECT}
        WHERE e.event_id IN (
            SELECT DISTINCT h.event_id FROM HOSTS h WHERE h.org_id IN (${hosts.map(() => '?').join(', ')})
        )`;
    const sameArgs = [...hosts];
    if (window) {
        sameSql += ` AND e.event_date IN (${window.map(() => '?').join(', ')})`;
        sameArgs.push(...window);
    }
    sameSql += ` GROUP BY e.event_id`;

    const sameRows = (await db.execute({ sql: sameSql, args: sameArgs })).rows.map(hydrate);
    const sameAccountIds = new Set(sameRows.map((r) => r.event_id));

    result.sameAccount = sameRows
        .map((c) => ({ ...c, score: titleSimilarity(title, c.event_title), path: 'same' }))
        .filter((c) => c.score >= SAME_ACCOUNT_PREFILTER_MIN)
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_CANDIDATES_PER_PATH);

    // ---- Cross-account path: only with a concrete date, and only on a strong title+location match
    // (this is the guard against look-alike-but-different events like the two "Shawarma Fest" posts). ----
    if (window) {
        const crossRows = (await db.execute({
            sql: `${AGG_SELECT} WHERE e.event_date = ? GROUP BY e.event_id`,
            args: [normalizedDate],
        })).rows.map(hydrate);

        result.crossAccount = crossRows
            .filter((c) => !sameAccountIds.has(c.event_id)) // anything sharing a host is "same account"
            .map((c) => {
                const ts = titleSimilarity(title, c.event_title);
                const ls = locationSimilarity(location, c.event_location);
                return { ...c, titleSim: ts, locSim: ls, score: (ts + ls) / 2, path: 'cross' };
            })
            .filter((c) => c.titleSim >= CROSS_ACCOUNT_TITLE_MIN && c.locSim >= CROSS_ACCOUNT_LOCATION_MIN)
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_CANDIDATES_PER_PATH);
    }

    return result;
}
