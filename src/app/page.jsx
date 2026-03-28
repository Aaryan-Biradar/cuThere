'use client';

import { useEffect, useMemo, useState } from 'react';
import EventCard from '@/components/EventCard';

const TODAY_DATE = new Date().toISOString().slice(0, 10);

const TEST_EVENT = {
  id: 'test-event-001',
  title: 'CCSS Networking Night',
  description: 'Come to a night of networking and fun with alumni, recruiters, and student leaders.',
  date: TODAY_DATE,
  time: '6:00 PM',
  location: 'UC Atrium',
  image_url: '',
  tags: ['Social', 'Career'],
  category: 'Career',
  isMock: true,
};

const TODAY_EVENT_TWO = {
  id: 'test-event-002',
  title: 'Quad Coffee Chat',
  description: 'Drop by for coffee, meet new students, and discover clubs around campus.',
  date: TODAY_DATE,
  time: '2:00 PM',
  location: 'Carleton Quad',
  image_url: '',
  tags: ['Social', 'Wellness'],
  category: 'Social',
  isMock: true,
};

const LOCAL_FALLBACK_EVENTS = [
  TEST_EVENT,
  TODAY_EVENT_TWO,
  {
    id: 'local-2',
    title: 'Design Sprint Workshop',
    description: 'A hands-on product design workshop where teams prototype and pitch in one evening.',
    date: '2026-11-03',
    time: '5:30 PM',
    location: 'MacOdrum Library Innovation Lab',
    image_url: '',
    tags: ['Workshop', 'Academic'],
    category: 'Workshop',
    isMock: true,
  },
  {
    id: 'local-3',
    title: 'Athletics Open House',
    description: 'Try campus sports clubs, meet team captains, and sign up for intramural leagues.',
    date: '2026-09-18',
    time: '4:00 PM',
    location: 'Ravens Nest',
    image_url: '',
    tags: ['Sports', 'Social'],
    category: 'Sports',
    isMock: true,
  },
  {
    id: 'local-4',
    title: 'Data Science Mixer',
    description: 'Meet students and faculty working on AI, data science, and product analytics.',
    date: '2026-10-21',
    time: '7:00 PM',
    location: 'Nicol Building Lobby',
    image_url: '',
    tags: ['Academic', 'Career', 'Tech'],
    category: 'Tech',
    isMock: true,
  },
  {
    id: 'local-5',
    title: 'Campus Trivia Night',
    description: 'A fun social evening with team trivia, snacks, and prizes for top groups.',
    date: '2026-10-23',
    time: '8:00 PM',
    location: 'Residence Commons',
    image_url: '',
    tags: ['Social'],
    category: 'Social',
    isMock: true,
  },
];

const DEFAULT_TAG_PILLS = ['All', 'Today', 'This Week', 'Academic', 'Social', 'Sports', 'Career', 'Cultural', 'Wellness', 'Tech'];

function parseEventDate(dateString) {
  if (!dateString) return null;
  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
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

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatEventDateTime(eventDate, eventTime) {
  if (!eventDate && !eventTime) return 'Date and time TBA';
  const parsed = parseEventDate(eventDate);
  const dateLabel = parsed
    ? parsed.toLocaleDateString('en-CA', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : 'Date TBA';
  return `${dateLabel} • ${eventTime || 'Time TBA'}`;
}

function slugifySection(title) {
  return `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function Header({ scrolled }) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-all duration-300 ${
        scrolled ? 'border-b border-black/5 bg-white/70 backdrop-blur' : 'bg-transparent'
      }`}
    >
      <div className="flex min-h-14 items-center justify-between px-4 sm:min-h-16 sm:px-6 lg:px-12">
        <span
          className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium tracking-[0.18em] ${
            scrolled
              ? 'border-[#D1D5DB] bg-white/85 text-[#111827]'
              : 'border-white/35 bg-white/10 text-white'
          }`}
        >
          LOGO / NAME
        </span>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="/about"
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              scrolled
                ? 'border-[#D1D5DB] bg-white/85 text-[#111827] hover:border-[#9CA3AF]'
                : 'border-white/35 bg-white/10 text-white hover:border-white/60'
            }`}
          >
            About
          </a>
          <a
            href="/feedback"
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              scrolled
                ? 'border-[#D1D5DB] bg-white/85 text-[#111827] hover:border-[#9CA3AF]'
                : 'border-white/35 bg-white/10 text-white hover:border-white/60'
            }`}
          >
            Feedback
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative h-[33dvh] min-h-[200px] w-full overflow-hidden sm:min-h-[90dvh] sm:h-auto">
      {/* 1. Base Image — cover fills frame (no letterboxing); tweak object position if focal point shifts */}
      <img
        src="/image.png"
        alt="Carleton University campus"
        className="absolute inset-0 z-0 h-full w-full object-cover object-[center_35%] sm:object-center"
      />

      {/* 2. Horizontal Scrim — desktop only; mobile uses bottom gradient for text */}
      <div className="absolute inset-0 z-[1] hidden bg-gradient-to-r from-black/50 via-black/20 to-transparent sm:block" />

      {/* 3. Bottom Fade — stronger on mobile so title reads; cream fade on desktop */}
      <div className="absolute inset-x-0 bottom-0 z-[5] h-28 bg-gradient-to-t from-black/70 via-black/35 to-transparent sm:h-64 sm:from-[#FCFAF7] sm:via-[#FCFAF7]/80 sm:to-transparent" />

      {/* Mobile: vertically center copy in the hero band below the fixed header; desktop: unchanged layout */}
      <div className="relative z-10 mx-auto flex h-full min-h-0 max-w-7xl flex-col px-4 pt-[calc(env(safe-area-inset-top)+4rem)] pb-4 sm:block sm:px-6 sm:pb-36 sm:pt-32 md:px-10 md:pb-48 md:pt-44">
        <div className="flex min-h-0 flex-1 flex-col items-start justify-center text-left sm:block">
          <h1
            className="max-w-3xl text-2xl font-bold leading-tight text-white sm:text-5xl sm:leading-[1.1] md:text-6xl lg:text-7xl"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
          >
            Discover the Best
            <br className="hidden sm:block" /> of Carleton.
          </h1>

          <p
            className="mt-2 max-w-xl line-clamp-2 text-sm font-medium leading-snug text-white/95 sm:mt-6 sm:line-clamp-none sm:text-lg md:text-xl"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
          >
            From the tunnels to the quad, stay in the loop with every club event, party, and career fair happening across campus.
          </p>
        </div>
      </div>
    </section>
  );
}

function SearchAndPills({ pills, activePill, onPillClick, searchQuery, onSearchQuery }) {
  return (
    <section id="events-anchor" className="relative z-20 mx-auto max-w-7xl -mt-6 px-4 pb-8 sm:mt-0 sm:px-6 sm:pt-16 lg:px-12">
      {/* Search bar */}
      <div className="relative group">
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
          placeholder="Search Carleton events, clubs, or topics..."
          className="w-full rounded-full border border-gray-200 bg-white py-4 pl-12 pr-6 font-sans text-base font-medium text-slate-800 shadow-sm placeholder:text-gray-400 focus:border-[#D71920] focus:outline-none focus:ring-4 focus:ring-[#D71920]/5 transition-all"
        />
      </div>

      {/* Filter pills */}
      <div className="scrollbar-hide touch-pan-x mt-6 flex gap-3 overflow-x-auto pb-2">
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
    </section>
  );
}

function EventSection({ title, sectionId, events }) {
  const carouselId = `${sectionId}-carousel`;
  function scrollCarousel(direction) {
    const element = document.getElementById(carouselId);
    if (!element) return;
    const amount = Math.min(320, Math.max(200, element.clientWidth * 0.85));
    element.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  return (
    <section id={sectionId} className="scroll-mt-24 px-4 py-5 sm:px-6 lg:px-12">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h2 className="font-sans text-2xl font-bold text-[#111827] sm:text-3xl">{title}</h2>
          <span className="font-sans text-sm font-medium text-slate-500">• {events.length} events</span>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
          <div className="hidden items-center gap-2 sm:flex">
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
          <a href={sectionId ? `#${sectionId}` : '#'} className="ml-1 text-sm font-semibold text-[#D71920] hover:text-[#BE161C]">
            See All
          </a>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-[#6B7280]">No events in this section right now.</p>
      ) : (
        <div id={carouselId} className="scrollbar-hide touch-pan-x flex gap-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
          {events.map((event, index) => (
            <EventCard key={`${title}-${event.id || index}`} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const [events, setEvents] = useState(LOCAL_FALLBACK_EVENTS);
  const [scrolled, setScrolled] = useState(false);
  const [activePill, setActivePill] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const normalized = data.map((event) => ({
            ...event,
            category: event.category || event.source_platform || 'Academic',
            tags: event.tags || [event.category || event.source_platform || 'Academic'],
          }));
          setEvents([TEST_EVENT, TODAY_EVENT_TWO, ...normalized]);
        } else {
          setEvents(LOCAL_FALLBACK_EVENTS);
        }
      } catch (error) {
        setEvents(LOCAL_FALLBACK_EVENTS);
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

  const searchableEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return events;

    return events.filter((event) => {
      const searchable = [
        event.title,
        event.description,
        event.location,
        event.category,
        ...(event.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchable.includes(query);
    });
  }, [events, searchQuery]);

  const activeTags = useMemo(() => {
    const tags = new Set();
    searchableEvents.forEach((event) => {
      (event.tags || []).forEach((tag) => tags.add(tag));
      if (event.category) tags.add(event.category);
    });

    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [searchableEvents]);

  const pillLabels = useMemo(() => {
    const ordered = [];
    const seen = new Set();

    [...DEFAULT_TAG_PILLS, ...activeTags].forEach((tag) => {
      if (!seen.has(tag)) {
        ordered.push(tag);
        seen.add(tag);
      }
    });

    return ordered;
  }, [activeTags]);

  const sections = useMemo(() => {
    const today = startOfDay(new Date());
    const weekEnd = addDays(today, 7);

    const sorted = [...searchableEvents].sort((a, b) => {
      const aDate = parseEventDate(a?.date)?.getTime() || Number.POSITIVE_INFINITY;
      const bDate = parseEventDate(b?.date)?.getTime() || Number.POSITIVE_INFINITY;
      return aDate - bDate;
    });

    const todayEvents = sorted.filter((event) => {
      const eventDate = parseEventDate(event?.date);
      return eventDate ? isSameDay(eventDate, today) : false;
    });

    const weekEvents = sorted.filter((event) => {
      const eventDate = parseEventDate(event?.date);
      if (!eventDate) return false;
      return eventDate >= today && eventDate <= weekEnd;
    });

    const tagSections = activeTags.map((tag) => ({
      title: tag,
      sectionId: slugifySection(tag),
      events: sorted.filter((event) => event.category === tag || (event.tags || []).includes(tag)),
    }));

    return [
      { title: 'Today', sectionId: slugifySection('Today'), events: todayEvents },
      { title: 'This Week', sectionId: slugifySection('This Week'), events: weekEvents },
      ...tagSections,
    ];
  }, [searchableEvents, activeTags]);

  function handlePillClick(pill) {
    setActivePill(pill);
    const targetId = pill === 'All' ? 'events-anchor' : slugifySection(pill);
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <main className="min-h-screen bg-[#FCFAF7] text-[#111827] pb-[max(3rem,env(safe-area-inset-bottom))]">
      <Header scrolled={scrolled} />
      <Hero />
      <SearchAndPills
        pills={pillLabels}
        activePill={activePill}
        onPillClick={handlePillClick}
        searchQuery={searchQuery}
        onSearchQuery={setSearchQuery}
      />

      {loading ? (
        <section className="mx-auto max-w-7xl px-4 py-10 text-[#6B7280] sm:px-6 lg:px-12">Loading events...</section>
      ) : (
        <section id="events" className="mx-auto max-w-7xl pb-10">
          {sections.map((section) => (
            <EventSection
              key={section.sectionId}
              title={section.title}
              sectionId={section.sectionId}
              events={section.events}
            />
          ))}
        </section>
      )}

    </main>
  );
}
