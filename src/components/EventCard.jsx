'use client';

import Link from 'next/link';
import { LocationPinIcon } from '@/components/icons';
import { formatEventDateTime, parseEventDate } from '@/lib/client/eventDateUtils';
import { DEFAULT_EVENT_LOCATION, UNTITLED_EVENT } from '@/lib/client/copy';

function isTodayEvent(dateString) {
  const eventDate = parseEventDate(dateString);
  if (!eventDate) return false;
  const today = new Date();
  return (
    eventDate.getFullYear() === today.getFullYear() &&
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getDate() === today.getDate()
  );
}

export default function EventCard({ event, layout = 'carousel' }) {
  const hasId = event?.id != null && event?.id !== '';
  const showTodayBadge = isTodayEvent(event?.date || event?.event_date);
  const eventHref = hasId ? `/events/${encodeURIComponent(String(event.id))}` : '#';

  const widthClass =
    layout === 'grid'
      ? 'h-full min-w-0 w-full max-w-none'
      : 'w-[min(13rem,calc(100vw-2.5rem))] shrink-0 sm:w-52 lg:w-[calc((100%_-_3rem)/4.5)]';

  return (
    <Link
      href={eventHref}
      onClick={(e) => {
        if (!hasId) e.preventDefault();
      }}
      className={`group block cursor-pointer overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_4px_rgba(17,24,39,0.04)] transition hover:-translate-y-0.5 ${widthClass}`}
      aria-label={`Open event: ${event?.title || UNTITLED_EVENT}`}
    >
      <div className="relative aspect-square w-full bg-[#0A0A0A] overflow-hidden border-b border-[#E5E7EB]">
        {event?.displayUrl && (
          <img
            src={event.displayUrl}
            alt={event?.title || 'Event'}
            className="absolute inset-0 z-10 h-full w-full object-cover object-center"
          />
        )}
        {showTodayBadge && (
          <span className="absolute left-3 top-3 z-20 rounded-full bg-university-red px-2.5 py-1 text-[11px] font-bold tracking-wide text-white">
            ● TODAY
          </span>
        )}
      </div>

      <div className="space-y-2 p-5">
        <h3 className="line-clamp-2 font-sans text-lg font-bold leading-snug text-[#111827]">{event?.title || UNTITLED_EVENT}</h3>
        <p className="font-sans text-sm font-bold text-university-red">
          {formatEventDateTime(event?.date || event?.event_date, event?.time, { omitYearIfCurrent: true })}
        </p>
        <p className="inline-flex line-clamp-1 items-center gap-1.5 font-sans text-xs font-medium text-[#6B7280]">
          <LocationPinIcon className="h-4 w-4 text-[#9CA3AF]" />
          {event?.location || DEFAULT_EVENT_LOCATION}
        </p>
      </div>
    </Link>
  );
}
