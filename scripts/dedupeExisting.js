import db from '../src/lib/server/db.js';
import { findDuplicateAndMerge } from '../src/lib/pipeline/ai.js';
import { applyMerge } from '../src/lib/pipeline/eventMerge.js';
import {
    titleSimilarity,
    locationSimilarity,
    isPlaceholder,
    SAME_ACCOUNT_CONFIRM_MIN,
    CROSS_ACCOUNT_CONFIRM_MIN,
} from '../src/lib/pipeline/dedup.js';
import { wait, withRetry } from '../src/lib/pipeline/retry.js';
import { ISO_DATE, DATE_TBA } from '../src/lib/pipeline/placeholders.js';
import { parseJsonArray } from '../src/lib/server/events.js';

/**
 * ONE-TIME backfill: find & merge duplicate events ALREADY in the DB.
 *
 *   node scripts/dedupeExisting.js            → DRY RUN (prints a report, mutates nothing)
 *   node scripts/dedupeExisting.js --execute  → applies merges via applyMerge
 *   flags: --verbose (per-pair scores), --limit N (process only first N clusters)
 *
 * Safe to re-run: absorbed rows are deleted + recorded in IGNORED_POST,
 * each applyMerge is atomic, and a second --execute is a no-op.
 */

const args = process.argv.slice(2);
const DRY_RUN = !(args.includes('--execute') || process.env.DEDUPE_EXECUTE === '1');
const VERBOSE = args.includes('--verbose');
const limitIdx = args.indexOf('--limit');
const LIMIT = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity;
// Protect specific event_ids from clustering/merging (e.g. look-alikes that are actually different events).
const excludeIdx = args.indexOf('--exclude');
const EXCLUDE = new Set(excludeIdx !== -1 ? (args[excludeIdx + 1] || '').split(',').map((s) => s.trim()).filter(Boolean) : []);

// Prefilter floors for forming candidate clusters (Gemini still confirms each pair).
const SAME_EDGE_TITLE_MIN = 0.55;
const CROSS_EDGE_TITLE_MIN = 0.80;
const CROSS_EDGE_LOC_MIN = 0.80;

// Retry only transient overloads — NOT 429: a quota cap won't recover by retrying.
const isRetryableOverload = (e) => /503|UNAVAILABLE/.test(e?.message || '');

// --- recency helpers (legacy rows have post_timestamp = NULL → treated as oldest) ---

// IG media ids are time-sortable; larger ≈ newer. Compare as equal-length strings (ids exceed Number range).
function igIdNewer(a, b) {
    const A = String(a), B = String(b);
    if (A.length !== B.length) return A.length > B.length;
    return A > B;
}

// older first
function compareOldestFirst(a, b) {
    const ta = a.post_timestamp, tb = b.post_timestamp;
    if (ta && tb) return ta < tb ? -1 : ta > tb ? 1 : 0;
    if (ta && !tb) return 1;   // a has ts, b is legacy/older → b first
    if (!ta && tb) return -1;
    return igIdNewer(a.event_id, b.event_id) ? 1 : -1; // both legacy → smaller id older
}

function newerTs(a, b) {
    if (!a) return b;
    if (!b) return a;
    return a > b ? a : b;
}

// --- load + cluster ---

async function loadEvents() {
    const rows = (await db.execute(`
        SELECT e.event_id, e.event_title, e.event_description, e.event_date, e.event_time,
               e.event_location, e.displayUrl, e.postUrl, e.post_timestamp,
               json_group_array(DISTINCT eh.org_id) AS host_ids,
               json_group_array(DISTINCT c.category_name) AS tags,
               (SELECT COUNT(*) FROM RSVPs r WHERE r.event_id = e.event_id) AS rsvp_count
        FROM EVENT e
        LEFT JOIN HOSTS eh ON e.event_id = eh.event_id
        LEFT JOIN CATEGORIZED_AS ca ON e.event_id = ca.event_id
        LEFT JOIN CATEGORY c ON ca.category_id = c.category_id
        GROUP BY e.event_id
    `)).rows;

    return rows.map((r) => ({
        event_id: r.event_id,
        event_title: r.event_title,
        event_description: r.event_description,
        event_date: r.event_date,
        event_time: r.event_time,
        event_location: r.event_location,
        displayUrl: r.displayUrl,
        postUrl: r.postUrl,
        post_timestamp: r.post_timestamp,
        hosts: parseJsonArray(r.host_ids),
        tags: parseJsonArray(r.tags),
        rsvp_count: Number(r.rsvp_count) || 0,
    }));
}

// Month-day key (MM-DD) for a date, handling both normalized "2026-04-29" and legacy "April 29".
// Returns null for placeholders/unparseable dates ("Date TBA", "May 16 - 18" ranges, etc.).
function monthDayKey(dateStr) {
    if (isPlaceholder(dateStr)) return null;
    const s = String(dateStr).trim();
    const iso = s.match(/^\d{4}-(\d{2})-(\d{2})$/);
    if (iso) return `${iso[1]}-${iso[2]}`;
    const d = new Date(`${s}, 2000`); // same trick normalizeEventDate uses to parse "April 29"
    if (!isNaN(d)) return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return null;
}

// Same-account: two concrete dates must be the same day; an unknown/TBA date on either side can't
// rule a match out, so let Gemini decide (handles the "Interhouse Sports Sign-up / Date TBA" posts).
function dateCompatible(a, b) {
    const ka = monthDayKey(a), kb = monthDayKey(b);
    if (ka && kb) return ka === kb;
    return true;
}

/**
 * Build duplicate clusters with a single global Union-Find over event_ids:
 *  - Pass 1 (same account): events sharing a host org, title-similar, date-compatible. The primary signal.
 *  - Pass 2 (cross account): events on the SAME concrete date with NO shared host, but a strong
 *    title AND location match (the conservative co-hosted-event path; guards against look-alikes).
 */
function formClusters(events) {
    const parent = new Map(events.map((e) => [e.event_id, e.event_id]));
    const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
    const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); };

    // Pass 1 — same account (group events by each host org).
    const byOrg = new Map();
    for (const e of events) for (const h of e.hosts) {
        if (!byOrg.has(h)) byOrg.set(h, []);
        byOrg.get(h).push(e);
    }
    for (const [org, group] of byOrg) {
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                const a = group[i], b = group[j];
                if (find(a.event_id) === find(b.event_id)) continue;
                const ts = titleSimilarity(a.event_title, b.event_title);
                const edge = ts >= SAME_EDGE_TITLE_MIN && dateCompatible(a.event_date, b.event_date);
                if (VERBOSE && ts >= SAME_EDGE_TITLE_MIN) {
                    console.log(`     · [same @${org}] ${a.event_id} ~ ${b.event_id} title=${ts.toFixed(2)} date=${dateCompatible(a.event_date, b.event_date) ? 'ok' : 'differ'} ${edge ? '→ EDGE' : ''}`);
                }
                if (edge) union(a.event_id, b.event_id);
            }
        }
    }

    // Pass 2 — cross account (group events by concrete month-day; skip unknown dates).
    const byDate = new Map();
    for (const e of events) {
        const k = monthDayKey(e.event_date);
        if (!k) continue;
        if (!byDate.has(k)) byDate.set(k, []);
        byDate.get(k).push(e);
    }
    for (const [, group] of byDate) {
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                const a = group[i], b = group[j];
                if (a.hosts.some((h) => b.hosts.includes(h))) continue; // same-account handled in Pass 1
                if (find(a.event_id) === find(b.event_id)) continue;
                const ts = titleSimilarity(a.event_title, b.event_title);
                const ls = locationSimilarity(a.event_location, b.event_location);
                const edge = ts >= CROSS_EDGE_TITLE_MIN && ls >= CROSS_EDGE_LOC_MIN;
                if (VERBOSE && ts >= CROSS_EDGE_TITLE_MIN) {
                    console.log(`     · [cross] ${a.event_id} ~ ${b.event_id} title=${ts.toFixed(2)} loc=${ls.toFixed(2)} ${edge ? '→ EDGE' : ''}`);
                }
                if (edge) union(a.event_id, b.event_id);
            }
        }
    }

    const groups = new Map();
    for (const e of events) {
        const root = find(e.event_id);
        if (!groups.has(root)) groups.set(root, []);
        groups.get(root).push(e);
    }
    return [...groups.values()].filter((g) => g.length >= 2);
}

// --- per-cluster confirmation (iterative pairwise against the accumulating survivor) ---

function asIncoming(e) {
    return {
        eventName: e.event_title, date: e.event_date, time: e.event_time,
        location: e.event_location, description: e.event_description,
        tags: e.tags, hosts: e.hosts, post_timestamp: e.post_timestamp,
    };
}


// The AI sometimes fabricates a year for un-normalized dates ("April 29" -> "2024-04-29").
// Choose the merged date deterministically from the cluster members instead: prefer the newest
// proper ISO (YYYY-MM-DD) date; else the newest non-placeholder date string as-is; else 'Date TBA'.
function bestDate(members) {
    const sorted = [...members].sort(compareOldestFirst); // oldest -> newest
    const iso = sorted.filter((m) => ISO_DATE.test(String(m.event_date || '').trim()));
    if (iso.length) return iso[iso.length - 1].event_date;
    const real = sorted.filter((m) => !isPlaceholder(m.event_date));
    if (real.length) return real[real.length - 1].event_date;
    return DATE_TBA;
}

async function confirmCluster(cluster) {
    const sorted = [...cluster].sort(compareOldestFirst);
    const survivor = sorted[0];
    const others = sorted.slice(1); // oldest -> newest, so the newest real values win last

    let state = {
        eventName: survivor.event_title, date: survivor.event_date, time: survivor.event_time,
        location: survivor.event_location, description: survivor.event_description,
        tags: [...survivor.tags],
    };
    let hostUnion = new Set(survivor.hosts);
    let survivorTs = survivor.post_timestamp;
    const absorbed = [];
    const rejected = [];
    const errored = [];

    for (const member of others) {
        const overlap = member.hosts.some((h) => hostUnion.has(h));
        const path = overlap ? 'same' : 'cross';
        const threshold = overlap ? SAME_ACCOUNT_CONFIRM_MIN : CROSS_ACCOUNT_CONFIRM_MIN;

        const candidate = {
            event_id: survivor.event_id,
            event_title: state.eventName, event_date: state.date, event_time: state.time,
            event_location: state.location, event_description: state.description,
            tags: state.tags, hosts: [...hostUnion], post_timestamp: survivorTs, path,
        };

        let result = null;
        try {
            result = await withRetry(
                () => findDuplicateAndMerge({ incoming: asIncoming(member), candidates: [candidate] }),
                { maxRetries: 5, delayMs: 5000, isRetryable: isRetryableOverload },
            );
        } catch (e) {
            const msg = e?.message || String(e);
            // An expired/invalid key (or other auth/400) fails EVERY call — abort loudly.
            if (e?.status === 400 || /API key|API_KEY_INVALID|expired|PERMISSION_DENIED|invalid argument/i.test(msg)) {
                throw new Error(`Gemini call failed — likely an API key problem. Renew GEMINI_API_KEY and re-run. Original error: ${msg}`);
            }
            // Quota exhausted (429) won't recover by retrying — stop with a clear message.
            if (e?.status === 429 || /quota|RESOURCE_EXHAUSTED|billing/i.test(msg)) {
                throw new Error(`Gemini quota exhausted (429) — stopping. The daily/plan quota for this API key is used up; wait for it to reset or raise the limit, then re-run. Original error: ${msg}`);
            }
            errored.push({ member, reasoning: `Gemini error: ${msg}` });
        }
        await wait(700); // pace requests to reduce 503s during high demand
        if (!result) continue; // call failed — leave this member untouched (not a rejection)

        const ok = result.isDuplicate && result.matchedEventId === survivor.event_id && result.confidence >= threshold;
        if (ok) {
            state = result.merged || state;
            if (!Array.isArray(state.tags)) state.tags = [];
            member.hosts.forEach((h) => hostUnion.add(h));
            survivorTs = newerTs(member.post_timestamp, survivorTs);
            absorbed.push({ member, confidence: result.confidence, reasoning: result.reasoning, path });
        } else {
            rejected.push({ member, confidence: result.confidence ?? 0, reasoning: result.reasoning, path });
        }
    }

    // Deterministic merged date (avoids AI year-fabrication).
    if (absorbed.length) state.date = bestDate([survivor, ...absorbed.map((a) => a.member)]);

    return { survivor, absorbed, rejected, errored, state, hostUnion: [...hostUnion] };
}

// --- reporting + execution ---

function printPlan(n, plan) {
    const hasCross = plan.absorbed.some((a) => a.path === 'cross');
    const conf = plan.absorbed.length ? Math.min(...plan.absorbed.map((a) => a.confidence)) : 0;
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log(`CLUSTER #${n}  ·  ${hasCross ? '⚠️  CROSS-ACCOUNT' : 'same-account'}  ·  min confidence ${conf.toFixed(2)}`);
    console.log(`Host org(s): ${plan.hostUnion.join(', ') || '(none)'}`);
    console.log('----------------------------------------------------------------');
    console.log(`SURVIVOR (kept):  ${plan.survivor.event_id}  "${plan.survivor.event_title}"`);
    console.log(`    date=${plan.survivor.event_date}  time=${plan.survivor.event_time}  loc=${plan.survivor.event_location}  rsvps=${plan.survivor.rsvp_count}`);
    console.log(`ABSORBED (${plan.absorbed.length}):`);
    for (const a of plan.absorbed) {
        console.log(`  - ${a.member.event_id}  "${a.member.event_title}"  date=${a.member.event_date} time=${a.member.event_time} loc=${a.member.event_location}  rsvps=${a.member.rsvp_count}  [conf ${a.confidence.toFixed(2)}, ${a.path}]`);
    }
    console.log('RESULTING MERGED EVENT (written to survivor):');
    console.log(`    title    : ${plan.state.eventName}`);
    console.log(`    date     : ${plan.state.date}`);
    console.log(`    time     : ${plan.state.time}`);
    console.log(`    location : ${plan.state.location}`);
    console.log(`    tags     : [${(plan.state.tags || []).join(', ')}]`);
    console.log(`    hosts    : [${plan.hostUnion.join(', ')}]`);
    const repoint = plan.absorbed.reduce((s, a) => s + a.member.rsvp_count, 0);
    console.log(`RSVPs to repoint: ${repoint}   ·   posts to mark merged: ${plan.absorbed.map((a) => a.member.event_id).join(', ')}`);
    if (plan.rejected.length) {
        console.log(`NOT merged (similar but unconfirmed): ${plan.rejected.map((r) => `${r.member.event_id} [conf ${r.confidence.toFixed(2)}]`).join(', ')}`);
    }
    if (plan.errored && plan.errored.length) {
        console.log(`⚠️  NOT evaluated (Gemini error — may be dupes, re-run): ${plan.errored.map((e) => e.member.event_id).join(', ')}`);
    }
    console.log('════════════════════════════════════════════════════════════════');
}

async function executePlan(plan) {
    for (const { member } of plan.absorbed) {
        await applyMerge({
            db,
            survivorEventId: plan.survivor.event_id,
            merged: plan.state,
            contributingPost: {
                postId: member.event_id,
                ownerUsername: member.hosts[0],
                coauthorProducers: member.hosts.slice(1).map((u) => ({ username: u })),
                displayUrl: member.displayUrl,
                postUrl: member.postUrl,
                postTimestamp: member.post_timestamp,
            },
            absorbedEventId: member.event_id,
        });
    }
}

async function run() {
    console.log(`=== 🧹 Existing-duplicate backfill (${DRY_RUN ? 'DRY RUN' : 'EXECUTE'}) ===\n`);

    let events = await loadEvents();
    if (EXCLUDE.size) {
        events = events.filter((e) => !EXCLUDE.has(e.event_id));
        console.log(`Excluding ${EXCLUDE.size} protected event(s) from clustering.`);
    }
    console.log(`Loaded ${events.length} events.`);

    const candidateClusters = formClusters(events);
    console.log(`Found ${candidateClusters.length} candidate cluster(s) to confirm with Gemini.\n`);

    // Cheap preview: print clusters and exit before any Gemini call.
    if (args.includes('--clusters-only')) {
        candidateClusters.forEach((c, i) => {
            console.log(`Cluster ${i + 1} (${c.length}):`);
            for (const e of c) console.log(`  ${e.event_id} | @${e.hosts.join(',')} | ${e.event_date} | ${e.event_time} | ${e.event_location} | ${e.event_title}`);
        });
        return;
    }

    const stats = { clusters: 0, merged: 0, deleted: 0, repointed: 0, errors: 0, unevaluated: 0 };
    let processed = 0;

    for (const cluster of candidateClusters) {
        if (processed >= LIMIT) break;
        processed++;

        const plan = await confirmCluster(cluster);
        stats.unevaluated += plan.errored ? plan.errored.length : 0;
        if (plan.absorbed.length === 0) {
            if (VERBOSE) console.log(`\n(cluster of ${cluster.length} reviewed — Gemini confirmed no merges)`);
            continue;
        }

        stats.clusters++;
        printPlan(stats.clusters, plan);

        if (!DRY_RUN) {
            try {
                await executePlan(plan);
                stats.merged += plan.absorbed.length;
                stats.deleted += plan.absorbed.length;
                stats.repointed += plan.absorbed.reduce((s, a) => s + a.member.rsvp_count, 0);
                console.log('   ✅ Applied.');
            } catch (e) {
                stats.errors++;
                console.error(`   ❌ Merge failed for cluster (survivor ${plan.survivor.event_id}): ${e.message}`);
            }
        }
    }

    console.log('\n----------------------------------------------------------------');
    console.log(`Summary: ${events.length} events scanned · ${candidateClusters.length} candidate clusters · ${stats.clusters} confirmed merge cluster(s)`);
    if (stats.unevaluated) console.log(`⚠️  ${stats.unevaluated} pair(s) could not be evaluated due to Gemini errors — re-run to retry them.`);
    if (DRY_RUN) {
        console.log(`Would delete ~${candidateClusters.length ? 'see clusters above' : 0} rows. ⚠️  DRY RUN — no changes were made. Re-run with --execute to apply.`);
    } else {
        console.log(`Rows deleted: ${stats.deleted} · RSVPs repointed: ${stats.repointed} · errors: ${stats.errors}`);
    }
}

run().catch((err) => {
    console.error('❌ Backfill failed:', err);
    process.exitCode = 1;
});
