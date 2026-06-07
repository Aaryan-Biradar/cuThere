'use client';

import EventCard from '@/components/EventCard';
import { ChevronLeftIcon } from '@/components/icons';

const sideMargin = 'lg:px-37';

export default function EventSection({ title, sectionId, events }) {
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
            <ChevronLeftIcon />
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
