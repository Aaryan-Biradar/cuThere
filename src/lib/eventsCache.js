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

export function getCachedEvents() {
    return allEvents;
}

export function setCachedEvents(events) {
    allEvents = events;
}

export function getCachedEvent(id) {
    return eventsById.get(id) ?? null;
}

export function setCachedEvent(id, event) {
    eventsById.set(id, event);
}
