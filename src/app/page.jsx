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

function slugifySection(title) {
  return `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function Header({ scrolled }) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-[#E5E7EB] bg-white/95 backdrop-blur' : 'bg-transparent'
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-12">
        <span className="text-xs font-bold tracking-[0.2em] text-[#111827]">CU-THERE</span>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="/about"
            className="rounded-full border border-[#D1D5DB] bg-white/70 px-4 py-2 text-sm font-medium text-[#111827] transition hover:border-[#6B7280]"
          >
            About
          </a>
          <a
            href="/feedback"
            className="rounded-full border border-[#D1D5DB] bg-white/70 px-4 py-2 text-sm font-medium text-[#111827] transition hover:border-[#6B7280]"
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
    <section className="relative h-[90vh] min-h-[680px] w-full overflow-hidden">
      <img src="/image.png" alt="Carleton University campus" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white" />

      <div className="relative z-10 flex h-full flex-col justify-between px-4 pb-20 pt-24 sm:px-6 lg:px-12">
        <span className="inline-flex w-fit items-center rounded-full border border-[#E5E7EB] bg-white/70 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-[#111827] backdrop-blur">
          CU-THERE
        </span>

        <div className="max-w-4xl">
          <h1 className="text-4xl font-extrabold leading-[1.05] text-[#111827] sm:text-5xl md:text-6xl lg:text-7xl">
            Discover What&apos;s Happening on Campus
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[#6B7280] md:text-lg">
            Your one-stop hub for Carleton University events. Find clubs, workshops, parties, career fairs, and
            everything in between.
          </p>
          <button
            type="button"
            onClick={() => document.getElementById('events-anchor')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#CF142B] px-7 py-3.5 text-base font-semibold text-white transition hover:bg-[#B50F25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CF142B]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="5" stroke="currentColor" strokeWidth="1.8" />
              <path d="M14.5 14.5L20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M10 7.7v4.6M7.7 10h4.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
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
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CF142B] ${
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

function EventCarouselCard({ event }) {
  const href = event?.id && !event?.isMock ? `/events/${event.id}` : '#';
  const imageSource = event?.image_url || '/image.png';
  const eventDate = parseEventDate(event?.date);
  const today = startOfDay(new Date());
  const isTodayEvent = eventDate ? isSameDay(eventDate, today) : false;

  return (
    <a
      href={href}
      className="group block w-72 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm transition hover:-translate-y-0.5"
      aria-label={`Open event: ${event?.title || 'Untitled event'}`}
    >
      <img src={imageSource} alt={event?.title || 'Event image'} className="h-40 w-full object-cover" />
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#111827]">{event?.title || 'Untitled Event'}</h3>
        <p className="text-sm font-semibold text-[#CF142B]">
          {isTodayEvent ? 'LIVE TODAY' : formatEventDateTime(event?.date, event?.time)}
        </p>
        <p className="line-clamp-1 text-sm text-[#6B7280]">{event?.location || 'Carleton University Campus'}</p>
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
            <EventCarouselCard key={`${title}-${event.id || index}`} event={event} />
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
    <main className="min-h-screen bg-white pb-12 text-[#111827]">
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
