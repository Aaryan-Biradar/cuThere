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
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-black/5 bg-white/70 backdrop-blur' : 'bg-transparent'
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-12">
        <span
          className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-bold tracking-[0.2em] ${
            scrolled ? 'border-[#E5E7EB] bg-white text-[#111827]' : 'border-[#E5E7EB] bg-white text-[#111827]'
          }`}
        >
          CU THERE
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
  const ACCENT_RED = '#CF142B';

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: '90vh' }}>
      {/* 1. Base Image */}
      <img
        src="/image.png"
        alt="Carleton University campus"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* 2. Horizontal Scrim (The Fix for Legibility) */}
      {/* This creates a dark fade from the left to make white text pop */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent z-0" />

      {/* 3. Bottom Fade-to-White */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white via-white/80 to-transparent z-[5]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-40 pt-36 md:px-10 md:pb-48 md:pt-44">

        <h1
          className="max-w-3xl text-5xl font-black leading-[1.1] text-white sm:text-6xl md:text-7xl"
          style={{ textShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
        >
          Discover the Best of Carleton.
        </h1>
        
        <p
          className="mt-6 max-w-xl text-lg font-medium text-white/95 md:text-xl"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
        >
          From the tunnels to the quad, stay in the loop with every club event, party, and career fair happening across campus.
        </p>

        <div className="mt-10">
          <button
            type="button"
            onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: ACCENT_RED }}
          >
            Explore Events
          </button>
        </div>
      </div>
    </section>
  );
}

function SearchAndPills({ pills, activePill, onPillClick, searchQuery, onSearchQuery }) {
  return (
    <section id="events-anchor" className="px-4 pb-8 pt-16 sm:px-6 sm:pt-20 lg:px-12">
      {/* Search bar */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          strokeWidth="1.6"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeLinecap="round" />
          <path d="M16.5 16.5L21 21" stroke="currentColor" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchQuery(e.target.value)}
          placeholder="Search Carleton events, clubs, or topics..."
          className="w-full rounded-full border border-gray-200 bg-white py-3.5 pl-12 pr-5 font-sans text-sm text-slate-800 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D71920]"
        />
      </div>

      {/* Filter pills */}
      <div className="thin-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
        {pills.map((pill) => (
          <button
            key={pill}
            onClick={() => onPillClick(pill)}
            className={`inline-flex shrink-0 items-center rounded-full border px-6 py-1.5 font-sans text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D71920] ${
              activePill === pill
                ? 'border-[#D71920] bg-[#D71920] text-white'
                : 'border-gray-100 bg-white text-slate-700 hover:border-gray-300'
            }`}
            aria-pressed={activePill === pill}
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
  const scrollByAmount = 320;

  function scrollCarousel(direction) {
    const element = document.getElementById(carouselId);
    if (!element) return;
    element.scrollBy({ left: direction * scrollByAmount, behavior: 'smooth' });
  }

  return (
    <section id={sectionId} className="scroll-mt-24 px-4 py-5 sm:px-6 lg:px-12">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="inline-flex items-baseline gap-2">
          <h2 className="font-sans text-3xl font-medium text-[#111827]">{title}</h2>
          <span className="font-sans text-sm font-medium text-slate-500">• {events.length} events</span>
        </div>
        <div className="flex items-center gap-2">
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
          <a href={sectionId ? `#${sectionId}` : '#'} className="ml-1 text-sm font-semibold text-[#D71920] hover:text-[#BE161C]">
            See All
          </a>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-[#6B7280]">No events in this section right now.</p>
      ) : (
        <div id={carouselId} className="thin-scrollbar flex gap-3 overflow-x-auto pb-2">
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
    <main className="min-h-screen bg-[#FCFAF7] pb-12 text-[#111827]">
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
        <section className="px-4 py-10 text-[#6B7280] sm:px-6 lg:px-12">Loading events...</section>
      ) : (
        <section id="events" className="pb-10">
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

      <style jsx>{`
        :global(.thin-scrollbar) {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
        :global(.thin-scrollbar::-webkit-scrollbar) {
          height: 7px;
        }
        :global(.thin-scrollbar::-webkit-scrollbar-track) {
          background: transparent;
        }
        :global(.thin-scrollbar::-webkit-scrollbar-thumb) {
          background: #d1d5db;
          border-radius: 9999px;
        }
      `}</style>
    </main>
  );
}
