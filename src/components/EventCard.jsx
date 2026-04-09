'use client';

import { useRouter } from 'next/navigation';

function normalizeDateString(dateString) {
  if (!dateString) return '';
  const trimmed = String(dateString).trim();
  return trimmed.replace(/\b(\d+)(st|nd|rd|th)\b/gi, '$1');
}

function parseEventDate(dateString) {
  const candidate = normalizeDateString(dateString);
  if (!candidate) return null;

  let date = new Date(candidate);
  if (Number.isNaN(date.getTime())) {
    date = new Date(`${candidate} ${new Date().getFullYear()}`);
  }
  return Number.isNaN(date.getTime()) ? null : date;
}

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

function formatEventDateTime(date, time) {
  const normalized = normalizeDateString(date || '');
  if (!normalized && !time) return 'Date and time TBA';
  const dateLabel = normalized || 'Date TBA';
  return time ? `${dateLabel} · ${time}` : dateLabel;
}

export default function EventCard({ event, layout = 'carousel' }) {
  const router = useRouter();
  const hasId = event?.id != null && event?.id !== '';
  const showTodayBadge = isTodayEvent(event?.date);
  const eventHref = hasId ? `/events/${encodeURIComponent(String(event.id))}` : '#';

  const widthClass =
    layout === 'grid'
      ? 'h-full min-w-0 w-full max-w-none'
      : 'w-[min(13rem,calc(100vw-2.5rem))] shrink-0 sm:w-52';

  function handleClick(e) {
    if (!hasId) return;
    e.preventDefault();
    router.push(eventHref);
  }

  return (
    <a
      href={eventHref}
      onClick={handleClick}
      className={`group block cursor-pointer overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_4px_rgba(17,24,39,0.04)] transition hover:-translate-y-0.5 ${widthClass} `}
      aria-label={`Open event: ${event?.title || 'Untitled event'}`}      
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
          <span className="absolute left-3 top-3 z-20 rounded-full bg-[#D71920] px-2.5 py-1 text-[11px] font-bold tracking-wide text-white">
            ● TODAY
          </span>
        )}
      </div>

      <div className="space-y-2 p-5">
        <h3 className="line-clamp-2 font-sans text-lg font-bold leading-snug text-[#111827]">{event?.title || 'Untitled Event'}</h3>
        <p className="font-sans text-sm font-bold text-[#D71920]">{formatEventDateTime(event?.date || event?.event_date, event?.time)}</p>
        <p className="inline-flex line-clamp-1 items-center gap-1.5 font-sans text-xs font-medium text-[#6B7280]">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#9CA3AF]" fill="none" aria-hidden="true">
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
