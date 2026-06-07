/**
 * Tiny in-memory client cache for fetched events.
 *
 * Module state persists across client-side navigations (the SPA session), so revisiting the
 * home page or an event page renders instantly instead of refetching. It resets on a full page
 * reload, where fresh data is fetched (and the API response is itself server-cached).
 *
 * Intentionally dependency-free; swap in SWR later if you want built-in dedup/revalidation.
 */

let allEvents = null;         // normalized events array, or null if never fetched this session
const eventsById = new Map(); // id -> event detail object

// Browser-only: never hold state during SSR, so a long-lived server process can't leak
// one request's data into another request's render.
const isServer = typeof window === 'undefined';

export function getCachedEvents() {
    return isServer ? null : allEvents;
}

export function setCachedEvents(events) {
    if (!isServer) allEvents = events;
}

export function getCachedEvent(id) {
    return isServer ? null : (eventsById.get(id) ?? null);
}

export function setCachedEvent(id, event) {
    if (!isServer) eventsById.set(id, event);
}
