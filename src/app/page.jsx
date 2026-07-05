'use client';

import { useRef, useState } from 'react';
import EventSection from '@/components/EventSection';
import Hero from '@/components/Hero';
import SearchAndPills from '@/components/SearchAndPills';
import SearchResultsSection from '@/components/SearchResultsSection';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { slugifySection, useEvents } from '@/lib/client/useEvents';

export default function HomePage() {
  const { loading, sections, pillLabels } = useEvents();
  const [activePill, setActivePill] = useState('All');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  // Monotonic submit token: only the LATEST submit may write results/spinner state,
  // so a slow earlier response can't land under a newer query's heading.
  const searchRequestRef = useRef(0);

  async function handleSearchSubmit(e) {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    setActiveSearchQuery(query);

    const reqId = ++searchRequestRef.current;

    if (!query) {
      // Settle state here: any in-flight request is now stale and will never
      // touch state again (including clearing the spinner).
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/events/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (reqId !== searchRequestRef.current) return;
      setSearchResults(data);
    } catch (err) {
      if (reqId !== searchRequestRef.current) return;
      console.error(err);
      setSearchResults([]);
    } finally {
      if (reqId === searchRequestRef.current) setIsSearching(false);
    }
  }

  function handlePillClick(pill) {
    setActivePill(pill);
    const targetId = pill === 'All' ? 'events-anchor' : slugifySection(pill);
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const isSearchActive = activeSearchQuery.trim().length > 0;

  return (
    <main className="min-h-screen bg-brand-cream text-[#111827] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <SiteHeader />
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
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-r-transparent border-university-red"></div>
            <span className="ml-3 font-medium text-slate-600">Searching database...</span>
        </section>
      ) : isSearchActive ? (
        <SearchResultsSection query={activeSearchQuery} events={searchResults} />
      ) : (
        <section id="events" className="mx-auto max-w-7xl pb-10">
          {sections.length === 0 ? (
            <p className="px-4 py-10 text-sm text-[#6B7280] sm:px-6 lg:px-12">
              No upcoming events right now. Check back soon!
            </p>
          ) : (
            sections.map((section) => (
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
