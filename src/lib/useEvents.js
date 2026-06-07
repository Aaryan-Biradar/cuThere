'use client';

import { useEffect, useMemo, useState } from 'react';
import { parseEventDate } from '@/lib/eventDateUtils';
import { getCachedEvents, setCachedEvents } from '@/lib/eventsCache';

const DEFAULT_TAG_PILLS = ['All'];
// Tags pinned to the front of the list (right after the "This Week" section);
// every other tag is ordered by how many upcoming events it has (most first).
const PINNED_TAGS = process.env.NEXT_PUBLIC_PINNED_TAGS
  ? process.env.NEXT_PUBLIC_PINNED_TAGS.split(',').map((t) => t.trim()).filter(Boolean)
  : ['Free Food'];

function eventDateField(event) {
  return event?.date ?? event?.event_date;
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

export function slugifySection(title) {
  return `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function uniqueByEventId(items) {
  const seen = new Set();
  return items.filter((event, index) => {
    const key =
      event?.id != null && event?.id !== ''
        ? `id:${String(event.id)}`
        : `fallback:${event?.title || ''}-${event?.date || ''}-${index}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Loads + normalizes the events list (with an in-memory cache), and derives the
 * home page's sections and filter-pill labels from it.
 *
 * Behavior preserved from the original inline implementation:
 *  - warm cache renders instantly (no loading flash); cold cache shows loading
 *  - a failed refetch keeps cached data instead of clearing it
 *  - `sections` is ordered: "This Week" first, then pinned tags, then tags by
 *    descending upcoming-event count (name as tiebreaker)
 *  - empty sections are dropped so no "0 events" placeholders render, and the
 *    pill labels stay in sync with the sections that actually show.
 *
 * @returns {{ events: any[], loading: boolean, sections: Array<{title: string, sectionId: string, events: any[]}>, pillLabels: string[] }}
 */
export function useEvents() {
  const [events, setEvents] = useState(() => getCachedEvents() ?? []);
  // Only show the loading state on a cold cache; a warm cache renders instantly.
  const [loading, setLoading] = useState(() => getCachedEvents() === null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        if (Array.isArray(data)) {
          const normalized = data.map((event) => ({
            ...event,
            category: event.category || event.source_platform || 'Uncategorized',
            tags: event.tags || [event.category || event.source_platform || 'Uncategorized'],
          }));
          setEvents(normalized);
          setCachedEvents(normalized);
        } else if (getCachedEvents() === null) {
          setEvents([]);
        }
      } catch (error) {
        // Keep showing cached data if we have it; only clear on a cold cache.
        if (getCachedEvents() === null) setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const activeTags = useMemo(() => {
    const tags = new Set();
    events.forEach((event) => {
      (event.tags || []).forEach((tag) => tags.add(tag));
      if (event.category) tags.add(event.category);
    });
    return Array.from(tags);
  }, [events]);

  // Hide sections (categories or "This Week") that have no upcoming events,
  // so empty "0 events" placeholders don't clutter the home page.
  const sections = useMemo(() => {
    const today = startOfDay(new Date());
    const weekEnd = addDays(today, Number(process.env.NEXT_PUBLIC_THIS_WEEK_DAYS) || 7);

    // 1. Deduplicate and Sort as you already do
    const sorted = uniqueByEventId([...events]).sort((a, b) => {
      const aDate = parseEventDate(eventDateField(a))?.getTime() || Number.POSITIVE_INFINITY;
      const bDate = parseEventDate(eventDateField(b))?.getTime() || Number.POSITIVE_INFINITY;
      return aDate - bDate;
    });

    const futureEvents = sorted.filter((event) => {
      const eventDate = parseEventDate(eventDateField(event));
      if (!eventDate) return false;
      return eventDate.getTime() >= today.getTime();
    });

    const weekEvents = futureEvents.filter((event) => {
      const eventDate = parseEventDate(eventDateField(event));
      return eventDate <= weekEnd;
    });

    // Build a section per tag, then order them: pinned tags (e.g. Free Food)
    // first, then whichever tag has the most upcoming events, name as tiebreaker.
    const rank = (tag) => {
      const index = PINNED_TAGS.indexOf(tag);
      return index === -1 ? PINNED_TAGS.length : index;
    };

    const tagSections = activeTags
      .map((tag) => ({
        title: tag,
        sectionId: slugifySection(tag),
        events: futureEvents.filter(
          (event) => event.category === tag || (event.tags || []).includes(tag)
        ),
      }))
      .sort(
        (a, b) =>
          rank(a.title) - rank(b.title) ||
          b.events.length - a.events.length ||
          a.title.localeCompare(b.title)
      );

    return [
      { title: 'This Week', sectionId: slugifySection('This Week'), events: weekEvents },
      ...tagSections,
    ].filter((section) => section.events.length > 0);
  }, [events, activeTags]);

  // Keep the filter pills in sync with the sections that are actually shown,
  // so a pill never scrolls to a section that isn't there.
  const pillLabels = useMemo(() => {
    const ordered = [];
    const seen = new Set();
    [...DEFAULT_TAG_PILLS, ...sections.map((section) => section.title)].forEach((tag) => {
      if (!seen.has(tag)) {
        ordered.push(tag);
        seen.add(tag);
      }
    });
    return ordered;
  }, [sections]);

  return { events, loading, sections, pillLabels };
}
