'use client';

import { useEffect, useMemo, useState } from 'react';

const TEST_EVENT = {
  id: 'test-event-001',
  title: 'CCSS Networking Night',
  description: 'Come to a night of networking and fun with alumni, recruiters, and student leaders.',
  date: '2026-10-25',
  time: '6:00 PM',
  location: 'UC Atrium',
  image_url: '',
  tags: ['Social', 'Career'],
  category: 'Career',
  isMock: true,
};

const LOCAL_FALLBACK_EVENTS = [
  TEST_EVENT,
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

const DEFAULT_TAG_PILLS = ['All', 'Academic', 'Social', 'Sports', 'Career', 'Cultural', 'Wellness', 'Tech'];

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

function formatEventDateTimeCompact(eventDate, eventTime) {
  if (!eventDate && !eventTime) return 'Date and time TBA';
  const parsed = parseEventDate(eventDate);
  const dateLabel = parsed
    ? parsed.toLocaleDateString('en-CA', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : 'Date TBA';
  return `${dateLabel} - ${eventTime || 'Time TBA'}`;
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
    <section id="events-anchor" className="px-4 py-6 sm:px-6 lg:px-12">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchQuery(event.target.value)}
          placeholder="Search events, clubs, topics, or locations..."
          className="w-full rounded-full border border-[#E5E7EB] bg-[#F9FAFB] py-3 pl-14 pr-5 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CF142B]"
        />
      </div>

      <div className="thin-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
        {pills.map((pill) => (
          <button
            key={pill}
            onClick={() => onPillClick(pill)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-md border px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CF142B] ${
              activePill === pill
                ? 'border-[#CF142B] bg-[#CF142B]/5 text-[#CF142B]'
                : 'border-[#E5E7EB] bg-white text-[#374151] hover:border-[#9CA3AF]'
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

function EventCarouselCard({ event, sectionTitle }) {
  const href = event?.id && !event?.isMock ? `/events/${event.id}` : '#';
  const imageSource = event?.image_url || '/image.png';
  const eventDate = parseEventDate(event?.date);
  const today = startOfDay(new Date());
  const isTodaySection = sectionTitle === 'Today';

  return (
    <a
      href={href}
      className="group block w-72 shrink-0 overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5"
      aria-label={`Open event: ${event?.title || 'Untitled event'}`}
    >
      <div className="relative h-40 w-full overflow-hidden border-b border-[#F3F4F6] bg-[#F3F4F6]">
        <img src={imageSource} alt={event?.title || 'Event image'} className="h-full w-full object-cover" />
        {isTodaySection && (
          <span className="absolute left-3 top-3 rounded-full bg-[#CF142B] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white">
            ● TODAY
          </span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#111827]">{event?.title || 'Untitled Event'}</h3>
        <p className="text-sm font-semibold text-[#CF142B]">{formatEventDateTimeCompact(event?.date, event?.time)}</p>
        <p className="inline-flex line-clamp-1 items-center gap-1.5 text-sm text-[#4B5563]">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#6B7280]" fill="none" aria-hidden="true">
            <path
              d="M12 21s6-5.8 6-11a6 6 0 10-12 0c0 5.2 6 11 6 11z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.7" />
          </svg>
          {event?.location || 'Carleton University Campus'}
        </p>
      </div>
    </a>
  );
}

function EventSection({ title, sectionId, events }) {
  return (
    <section id={sectionId} className="scroll-mt-24 px-4 py-5 sm:px-6 lg:px-12">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-extrabold text-[#111827]">
          {title}
          <span className="ml-2 text-sm font-medium text-[#6B7280]">• {events.length} events</span>
        </h2>
        <a href={sectionId ? `#${sectionId}` : '#'} className="text-sm font-semibold text-[#CF142B] hover:text-[#B50F25]">
          See All
        </a>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-[#6B7280]">No events in this section right now.</p>
      ) : (
        <div className="thin-scrollbar flex gap-4 overflow-x-auto pb-2">
          {events.map((event, index) => (
            <EventCarouselCard key={`${title}-${event.id || index}`} event={event} sectionTitle={title} />
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
          setEvents([TEST_EVENT, ...normalized]);
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
      return eventDate > today && eventDate <= weekEnd;
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
    <main className="min-h-screen bg-[#FDFBF7] pb-12 text-[#111827]">
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
