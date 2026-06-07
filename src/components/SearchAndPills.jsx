'use client';

import { useEffect, useRef } from 'react';

const sideMargin = 'lg:px-37';

export default function SearchAndPills({
  pills,
  activePill,
  onPillClick,
  searchQuery,
  onSearchQuery,
  onSearchSubmit,
  showPills = true,
}) {
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
          className="absolute left-5 top-1/2 h-[20px] w-[20px] -translate-y-1/2 text-gray-400 group-focus-within:text-university-red transition-colors"
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
          className="w-full rounded-full border border-gray-200 bg-white py-4 pl-12 pr-6 font-sans text-base font-medium text-slate-800 shadow-sm placeholder:text-gray-400 focus:border-university-red focus:outline-none focus:ring-4 focus:ring-university-red/5 transition-all"
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
                  ? 'border-university-red bg-university-red text-white shadow-md'
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
