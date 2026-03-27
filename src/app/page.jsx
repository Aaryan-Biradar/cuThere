'use client';

import { useEffect, useMemo, useState } from 'react';
import EventCard from '@/components/EventCard';

const ACCENT_RED = '#CF142B';

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
    location: 'Library Innovation Lab',
    image_url: '',
    tags: ['Tech', 'Academic'],
    category: 'Academic',
    isMock: true,
  },
  {
    id: 'local-3',
    title: 'Athletics Open House',
    description: 'Try campus sports clubs, meet team captains, and sign up for intramural leagues.',
    date: '2026-09-18',
    time: '4:00 PM',
    location: 'Fieldhouse',
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
    tags: ['Tech', 'Career'],
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
    tags: ['Social', 'Cultural'],
    category: 'Social',
    isMock: true,
  },
];

const BASE_CATEGORIES = ['Academic', 'Social', 'Sports', 'Career', 'Cultural', 'Wellness', 'Tech'];

const FilterIcon = () => (
  <svg className="h-3.5 w-3.5 text-white/70" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const SearchIcon = ({ className = 'h-5 w-5 text-white/40' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
    <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

function isPastEvent(dateString) {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(`${dateString}T00:00:00`);
  return !Number.isNaN(eventDate.getTime()) && eventDate < today;
}

function Header({ scrolled }) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-white/10 bg-black/90 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-white">
          CU THERE
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
            About
          </button>
          <button className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
            Feedback
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-[1500px] px-4 pb-8 pt-20 md:px-8 md:pb-10">
      <div className="relative min-h-[560px] w-full overflow-hidden rounded-3xl border border-white/10">
        <img src="/campus.jpg" alt="Carleton University campus" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/90" />

        <div className="absolute left-6 top-6 z-10 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.3em] text-white backdrop-blur-sm">
          CU-THERE
        </div>

        <div className="relative z-10 flex h-full max-w-4xl flex-col justify-end px-6 pb-10 pt-20 md:px-10 md:pb-12">
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl xl:text-7xl">
            Discover What&apos;s Happening on Campus
          </h1>
          <p className="mt-5 max-w-2xl text-base text-[#E5E7EB] md:text-lg">
            Your one-stop hub for Carleton events. Find clubs, workshops, parties, career fairs, and everything in
            between.
          </p>
          <div className="mt-8">
            <button
              type="button"
              onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              style={{ backgroundColor: ACCENT_RED }}
            >
              <SearchIcon className="h-4 w-4 text-white" />
              Explore Events
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterBar({ categories, activeTag, onTagSelect, searchTerm, onSearchChange }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="space-y-4 rounded-3xl border border-white/10 bg-[#0B0B0B] p-4 sm:p-5">
        <label className="relative block">
          <span className="sr-only">Search events</span>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events, clubs, or topics..."
            className="w-full rounded-full border border-white/10 bg-[#111111] py-3 pl-11 pr-4 text-sm text-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#CF142B]"
          />
        </label>

        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => onTagSelect('All')}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              activeTag === 'All'
                ? 'border-[#CF142B] bg-white/5 text-white'
                : 'border-white/15 bg-[#161616] text-[#D1D5DB] hover:text-white'
            }`}
            aria-pressed={activeTag === 'All'}
          >
            <FilterIcon />
            All
          </button>
          {categories.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagSelect(tag)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeTag === tag
                  ? 'border-white bg-white/10 text-white'
                  : 'border-white/15 bg-[#161616] text-[#D1D5DB] hover:text-white'
              }`}
              aria-pressed={activeTag === tag}
            >
              <FilterIcon />
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function EventSection({ title, events, showTrendingRank = false }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-black sm:text-3xl">
          {title}
          <span className="ml-2 text-sm font-normal text-[#9CA3AF]">• {events.length} events</span>
        </h2>
        <a href="#" className="text-sm font-semibold text-[#CF142B] transition hover:text-[#ff5a6d]">
          See All
        </a>
      </div>

      {events.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-[#0F0F0F] p-5 text-[#9CA3AF]">No events in this section yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {events.map((event, index) => (
            <EventCard
              key={`${title}-${event.id}-${index}`}
              event={event}
              isPast={isPastEvent(event?.date)}
              trendingRank={showTrendingRank ? index + 1 : null}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const [events, setEvents] = useState(LOCAL_FALLBACK_EVENTS);
  const [scrolled, setScrolled] = useState(false);
  const [activeTag, setActiveTag] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = useMemo(() => {
    const set = new Set(BASE_CATEGORIES);
    events.forEach((event) => {
      (event.tags || []).forEach((tag) => set.add(tag));
      if (event.category) set.add(event.category);
    });
    return Array.from(set);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesTag = activeTag === 'All' || event.category === activeTag || event.tags?.includes(activeTag);
      const haystack = `${event.title || ''} ${event.description || ''} ${event.category || ''} ${(event.tags || []).join(' ')}`.toLowerCase();
      const matchesSearch = searchTerm.trim().length === 0 || haystack.includes(searchTerm.trim().toLowerCase());
      return matchesTag && matchesSearch;
    });
  }, [events, activeTag, searchTerm]);

  const happeningNowEvents = useMemo(() => filteredEvents.slice(0, 4), [filteredEvents]);
  const trendingEvents = useMemo(() => filteredEvents.slice(0, 4), [filteredEvents]);
  const careerEvents = useMemo(
    () =>
      filteredEvents
        .filter((event) => event.category === 'Career' || event.tags?.includes('Career'))
        .slice(0, 4),
    [filteredEvents]
  );

  return (
    <main className="min-h-screen bg-white text-white">
      <Header scrolled={scrolled} />
      <Hero />
      <FilterBar
        categories={categories}
        activeTag={activeTag}
        onTagSelect={setActiveTag}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <section id="events" aria-live="polite" className="pb-14">
        {loading ? (
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <p className="rounded-2xl border border-white/10 bg-[#0F0F0F] p-6 text-[#9CA3AF]">Loading events...</p>
          </div>
        ) : (
          <>
            <EventSection title="Happening Now" events={happeningNowEvents} />
            <EventSection title="Trending Events" events={trendingEvents} showTrendingRank />
            <EventSection title="Career" events={careerEvents} />
          </>
        )}
      </section>
    </main>
  );
}
