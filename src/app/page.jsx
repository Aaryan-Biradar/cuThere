'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import EventCard from '@/components/EventCard';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { parseEventDate } from '@/lib/eventDateUtils';

const DEFAULT_TAG_PILLS = ['All'];
// Tags pinned to the front of the list (right after the "This Week" section);
// every other tag is ordered alphabetically.
const PINNED_TAGS = ['Free Food'];
const sideMargin = 'lg:px-37';

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

function slugifySection(title) {
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

function Hero() {
  return (
    <section className="relative h-[33dvh] min-h-[200px] w-full overflow-hidden sm:min-h-[95dvh] sm:h-[100dvh] sm:overflow-visible">
      {/* 1. Base Image — cover fills frame; sm+: tall hero band (95dvh) */}
      <img
        src="/heroimage.png"
        alt="Carleton University campus"
        className="absolute inset-0 z-0 h-full w-full object-cover object-[center_35%] sm:object-center"
      />

      {/* Mobile: copy toward bottom; sm+: black box nudged slightly up vs prior translate */}
      <div className="relative z-10 mx-auto flex h-full min-h-0 max-w-7xl flex-col px-4 pt-[calc(env(safe-area-inset-top)+4rem)] pb-4 sm:px-6 sm:pb-14 sm:pt-28 md:px-10 md:pb-16 md:pt-36">
        <div className="flex min-h-0 flex-1 flex-col items-start justify-end text-left">
          <div className="w-full max-w-xl -translate-y-4 rounded-2xl bg-black/50 px-6 py-7 shadow-lg backdrop-blur-[1px] sm:max-w-2xl sm:translate-y-5 sm:px-10 sm:py-10 md:translate-y-6 md:px-12 md:py-12">
            <h1 className="text-2xl font-bold leading-tight tracking-[-0.01em] text-white sm:text-5xl sm:leading-[1.1] md:text-6xl lg:text-5xl">
              Discover the Best{' '}
              <br className="hidden sm:block" />
              of Carleton.
            </h1>

            <p className="mt-3 max-w-lg line-clamp-3 text-sm font-medium leading-snug text-white/95 sm:mt-6 sm:line-clamp-none sm:text-lg md:text-xl">
              From the tunnels to the quad, stay in the loop <br className="sm:hidden" /> with everything happening across campus.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchAndPills({ pills, activePill, onPillClick, searchQuery, onSearchQuery, onSearchSubmit, showPills = true }) {
  const pillsScrollRef = useRef(null);

  useEffect(() => {
    if (!showPills) return;
    const el = pillsScrollRef.current;
    if (!el) return;

    function onWheel(e) {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      const delta = e.deltaY;
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);

      el.scrollLeft = Math.min(maxScroll, Math.max(0, el.scrollLeft + delta));
      e.preventDefault();
    }

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [showPills]);

  return (
    <section id="events-anchor" className={`relative z-20 mx-auto max-w-7xl -mt-6 px-4 pb-8 sm:mt-0 sm:px-6 sm:pt-16 ${sideMargin}`}>
      {/* Search bar target backend SQL */}
      <form onSubmit={onSearchSubmit} className="relative group">
        <svg
          className="absolute left-5 top-1/2 h-[20px] w-[20px] -translate-y-1/2 text-gray-400 group-focus-within:text-[#D71920] transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M16.5 16.5L21 21" />
        </svg>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchQuery(e.target.value)}
          placeholder="Search Carleton events, clubs, or topics (press Enter)..."
          className="w-full rounded-full border border-gray-200 bg-white py-4 pl-12 pr-6 font-sans text-base font-medium text-slate-800 shadow-sm placeholder:text-gray-400 focus:border-[#D71920] focus:outline-none focus:ring-4 focus:ring-[#D71920]/5 transition-all"
        />
      </form>

      {/* Filter pills — hidden while searching so results are one clear list */}
      {showPills && (
        <div
          ref={pillsScrollRef}
          className="scrollbar-hide touch-scroll-x mt-6 flex gap-3 overflow-x-auto pb-2"
        >
          {pills.map((pill) => (
            <button
              key={pill}
              onClick={() => onPillClick(pill)}
              className={`inline-flex shrink-0 items-center rounded-full border px-6 py-2 font-sans text-sm font-bold transition-all ${
                activePill === pill
                  ? 'border-[#D71920] bg-[#D71920] text-white shadow-md'
                  : 'border-gray-200 bg-white text-slate-600 hover:border-gray-400'
              }`}
            >
              {pill}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function SearchResultsSection({ query, events }) {
  return (
    <section id="events" className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-12">
      <div className="mb-6">
        <p className="font-sans text-sm font-medium text-slate-500">Showing results for</p>
        <h2 className="mt-1 font-sans text-2xl font-bold text-[#111827] sm:text-3xl">&ldquo;{query}&rdquo;</h2>
        <p className="mt-1 font-sans text-sm text-slate-500">
          {events.length} {events.length === 1 ? 'event' : 'events'}
        </p>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-[#6B7280]">No events match your search. Try different keywords.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event, index) => (
            <EventCard key={`search-${event.id || index}`} event={event} layout="grid" />
          ))}
        </div>
      )}
    </section>
  );
}

function EventSection({ title, sectionId, events }) {
  const carouselId = `${sectionId}-carousel`;
  function scrollCarousel(direction) {
    const element = document.getElementById(carouselId);
    if (!element || element.children.length === 0) return;
    const first = element.children[0];
    const style = getComputedStyle(element);
    const gapRaw = style.gap || style.columnGap || '0';
    const gap = Number.parseFloat(gapRaw) || 0;
    const step = first.offsetWidth + gap;
    const amount = 4 * step;
    element.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  return (
    <section id={sectionId} className={`scroll-mt-24 px-4 py-5 sm:px-6 ${sideMargin}`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h2 className="font-sans text-2xl font-bold text-[#111827] sm:text-3xl">{title}</h2>
          <span className="font-sans text-sm font-medium text-slate-500">• {events.length} events</span>
        </div>
        <div className="hidden shrink-0 items-center gap-2 self-start sm:flex sm:self-auto">
          <button
            type="button"
            onClick={() => scrollCarousel(-1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#9CA3AF]"
            aria-label={`Scroll ${title} events left`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollCarousel(1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#9CA3AF]"
            aria-label={`Scroll ${title} events right`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-[#6B7280]">No events in this section right now.</p>
      ) : (
        <div id={carouselId} className="scrollbar-hide touch-scroll-x flex gap-3 overflow-x-auto pb-2">
          {events.map((event, index) => (
            <EventCard key={`${title}-${event.id || index}`} event={event} layout="carousel" />
          ))}
        </div>
      )}
    </section>
  );
}

function HomePage() {
  const [events, setEvents] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [activePill, setActivePill] = useState('All');
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  async function handleSearchSubmit(e) {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    setActiveSearchQuery(query);
    
    if (!query) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await fetch(`/api/events/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch(err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        if (Array.isArray(data)) {
          const normalized = data.map((event) => ({
            ...event,
            category: event.category || event.source_platform || 'Academic',
            tags: event.tags || [event.category || event.source_platform || 'Academic'],
          }));
          setEvents(normalized);
        } else {
          setEvents([]);
        }
      } catch (error) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeTags = useMemo(() => {
    const tags = new Set();
    events.forEach((event) => {
      (event.tags || []).forEach((tag) => tags.add(tag));
      if (event.category) tags.add(event.category);
    });
    const rank = (tag) => {
      const index = PINNED_TAGS.indexOf(tag);
      return index === -1 ? PINNED_TAGS.length : index;
    };
    return Array.from(tags).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  }, [events]);

  const sections = useMemo(() => {
    const today = startOfDay(new Date());
    const weekEnd = addDays(today, 7);
  
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
  
    // 4. Create tag sections using the filtered future list
    const tagSections = activeTags.map((tag) => ({
      title: tag,
      sectionId: slugifySection(tag),
      events: futureEvents.filter(
        (event) => event.category === tag || (event.tags || []).includes(tag)
      ),
    }));
  
    return [
      { title: 'This Week', sectionId: slugifySection('This Week'), events: weekEvents },
      ...tagSections,
    ];
  }, [events, activeTags]);

  // Hide sections (categories or "This Week") that have no upcoming events,
  // so empty "0 events" placeholders don't clutter the home page.
  const visibleSections = useMemo(
    () => sections.filter((section) => section.events.length > 0),
    [sections]
  );

  // Keep the filter pills in sync with the sections that are actually shown,
  // so a pill never scrolls to a section that isn't there.
  const pillLabels = useMemo(() => {
    const ordered = [];
    const seen = new Set();
    [...DEFAULT_TAG_PILLS, ...visibleSections.map((section) => section.title)].forEach((tag) => {
      if (!seen.has(tag)) {
        ordered.push(tag);
        seen.add(tag);
      }
    });
    return ordered;
  }, [visibleSections]);

  function handlePillClick(pill) {
    setActivePill(pill);
    const targetId = pill === 'All' ? 'events-anchor' : slugifySection(pill);
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const isSearchActive = activeSearchQuery.trim().length > 0;

  return (
    <main className="min-h-screen bg-[#FCFAF7] text-[#111827] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <SiteHeader scrolled={scrolled} />
      <Hero />
      <SearchAndPills
        pills={pillLabels}
        activePill={activePill}
        onPillClick={handlePillClick}
        searchQuery={searchQuery}
        onSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        showPills={!isSearchActive}
      />

      {loading ? (
        <section className="mx-auto max-w-7xl px-4 py-10 text-[#6B7280] sm:px-6 lg:px-12">Loading events...</section>
      ) : isSearching ? (
        <section className="mx-auto max-w-7xl px-4 py-10 text-[#6B7280] sm:px-6 lg:px-12 flex justify-center items-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-r-transparent border-[#D71920]"></div>
            <span className="ml-3 font-medium text-slate-600">Searching database...</span>
        </section>
      ) : isSearchActive ? (
        <SearchResultsSection query={activeSearchQuery} events={searchResults} />
      ) : (
        <section id="events" className="mx-auto max-w-7xl pb-10">
          {visibleSections.length === 0 ? (
            <p className={`px-4 py-10 text-sm text-[#6B7280] sm:px-6 ${sideMargin}`}>
              No upcoming events right now. Check back soon!
            </p>
          ) : (
            visibleSections.map((section) => (
              <EventSection
                key={section.sectionId}
                title={section.title}
                sectionId={section.sectionId}
                events={section.events}
              />
            ))
          )}
        </section>
      )}

      <SiteFooter />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <HomePage />
    </Suspense>
  );
}
