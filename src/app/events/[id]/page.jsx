'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';

const CalendarButton = dynamic(() => import('@/components/CalendarButton'), {
  ssr: false,
  loading: () => (
    <button
      type="button"
      disabled
      className="flex w-full shrink-0 cursor-wait items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-bold text-[#111827] shadow-sm sm:py-3 box-border"
    >
      Add to calendar
    </button>
  ),
});

/**
 * Converts a YYYY-MM-DD date string (from the database) into a
 * human-friendly display string like "January 15".
 * If the string isn't in YYYY-MM-DD format, it passes through unchanged.
 */
function formatDisplayDate(dateString) {
  if (!dateString) return '';
  const trimmed = String(dateString).trim();

  // Detect YYYY-MM-DD format from the database
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day), 12);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  }

  // Fallback: strip ordinal suffixes for legacy strings
  return trimmed.replace(/\b(\d+)(st|nd|rd|th)\b/gi, '$1');
}

function formatEventDateTime(date, time) {
  const displayDate = formatDisplayDate(date || '');
  if (!displayDate && !time) return 'Date and time TBA';
  const dateLabel = displayDate || 'Date TBA';
  return time ? `${dateLabel} • ${time}` : dateLabel;
}

/**
 * Converts a 12-hour time string (e.g. "6:00 PM", "11:30 AM") to
 * 24-hour HH:mm format (e.g. "18:00", "11:30").
 * Returns null if the string can't be parsed.
 */
function to24Hour(timeStr) {
  if (!timeStr) return null;
  const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    // Already in 24h format like "18:00"?
    const mil = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})$/);
    if (mil) return `${mil[1].padStart(2, '0')}:${mil[2]}`;
    return null;
  }
  let [, hours, minutes, period] = match;
  hours = Number(hours);
  if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

/**
 * Given a start time in HH:mm, returns an end time ~1.5 hours later.
 */
function estimateEndTime(startTime24) {
  if (!startTime24) return null;
  const [h, m] = startTime24.split(':').map(Number);
  const endH = Math.min(h + 1, 23);
  const endM = m + 30 >= 60 ? m + 30 - 60 : m + 30;
  const endHour = m + 30 >= 60 ? Math.min(endH + 1, 23) : endH;
  return `${String(endHour).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

/** Same chevron as home page carousel “scroll left” control */
function BackChevronIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const DEFAULT_DOCUMENT_TITLE = 'cuThere — Discover Local Events';

export default function EventDetailPage() {
  const params = useParams();
  const idValue = params?.id;
  const id = Array.isArray(idValue) ? idValue[0] : idValue;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return undefined;

    let cancelled = false;

    async function fetchEvent() {
      setLoading(true);
      setEvent(null);

      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        if (cancelled) return;
        setEvent(data?.error ? null : data);
      } catch (error) {
        if (cancelled) return;
        setEvent({ error: 'Unable to load event.' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchEvent();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!event || event.error) {
      document.title = DEFAULT_DOCUMENT_TITLE;
      return undefined;
    }
    const label = event.title?.trim() || 'Untitled Event';
    document.title = `${label} — CUThere`;
    return () => {
      document.title = DEFAULT_DOCUMENT_TITLE;
    };
  }, [event]);

  const shell = (children, { hideFooterOnMobile } = {}) => (
    <div className="flex min-h-screen flex-col bg-[#FCFAF7] text-[#111827] [font-family:var(--font-brand-sans)]">
      <SiteHeader scrolled />
      <div className="flex min-h-0 flex-1 flex-col pt-[calc(env(safe-area-inset-top)+3.5rem)] sm:pt-[calc(env(safe-area-inset-top)+4rem)]">
        {children}
      </div>
      <SiteFooter className={hideFooterOnMobile ? 'hidden lg:block' : ''} />
    </div>
  );

  if (loading) {
    return shell(
      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col lg:h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4rem)] lg:flex-row lg:overflow-hidden">
        <div className="flex min-h-0 w-full flex-1 flex-col gap-4 px-4 pb-8 pt-5 sm:pt-6 lg:w-[60%] lg:justify-center lg:px-10 lg:py-16 lg:pr-12">
          <div className="h-7 w-40 animate-pulse rounded-lg bg-[#E5E7EB] lg:hidden" />
          <div className="h-[min(40vh,18rem)] w-full animate-pulse rounded-2xl bg-[#E5E7EB] lg:hidden" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-[#E5E7EB] sm:h-12" />
          <div className="h-6 w-56 animate-pulse rounded bg-[#E5E7EB]" />
          <div className="h-28 w-full animate-pulse rounded-lg bg-[#E5E7EB]" />
          <div className="mt-2 flex flex-col gap-3 lg:hidden">
            <div className="h-12 w-full animate-pulse rounded-xl bg-[#E5E7EB]" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-[#E5E7EB]" />
          </div>
        </div>
        <div className="hidden min-h-[calc(100dvh-8rem)] w-full flex-1 items-center justify-center bg-[#F3F4F6] p-10 lg:flex lg:w-[40%]">
          <div className="aspect-square w-full max-w-md animate-pulse rounded-2xl bg-[#E5E7EB]" />
        </div>
      </main>,
      { hideFooterOnMobile: true }
    );
  }

  if (!event || event.error) {
    return shell(
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-16 sm:px-8">
        <a
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-[#111827] transition hover:border-gray-300"
        >
          <BackChevronIcon />
          Back
        </a>
        <p className="mt-8 text-base font-medium text-slate-600">Event not found.</p>
      </main>,
      { hideFooterOnMobile: true }
    );
  }

  const imageSrc = event.displayUrl || '/heroimage.png';

  const startTime24 = to24Hour(event.time);
  const endTime24 = estimateEndTime(startTime24);
  const calendarDate = event.date || event.event_date || '';
  
  let parsedDateStr = calendarDate;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(calendarDate) && calendarDate) {
    const d = new Date(`${calendarDate}, ${new Date().getFullYear()}`);
    if (!isNaN(d.getTime())) {
      parsedDateStr = d.toISOString().split('T')[0];
    }
  }
  
  // Only pass times if we have a valid YYYY-MM-DD date and a parseable time
  const hasValidDate = /^\d{4}-\d{2}-\d{2}$/.test(parsedDateStr);

  const eventButtons = (
    <div className="flex w-full min-w-0 flex-row flex-nowrap gap-2 sm:gap-3">
      <div className="flex min-w-0 flex-1 [&>add-to-calendar-button]:w-full [&>div]:w-full">
        <CalendarButton
          name={event.title || 'Untitled Event'}
          options={['Apple', 'Google', 'Outlook.com']}
          location={event.location || ''}
          {...(hasValidDate ? { startDate: parsedDateStr } : {})}
          {...(hasValidDate && startTime24 ? { startTime: startTime24 } : {})}
          {...(hasValidDate && endTime24 ? { endTime: endTime24 } : {})}
          timeZone="America/Toronto"
          description={event.description || ''}
          lightMode="light"
        />
      </div>
      <a
        href={event.postUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 flex-1 shrink items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-1 py-2.5 text-xs font-bold text-[#111827] transition hover:bg-gray-50 sm:gap-2 sm:px-2 sm:py-3 sm:text-sm box-border"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
        Instagram Post
      </a>
    </div>
  );

  return shell(
    <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col lg:h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4rem)] lg:flex-row lg:overflow-hidden">
      {/* Mobile / tablet: full-width single column */}
      <article className="flex min-h-0 w-full min-w-0 flex-col px-4 pb-10 pt-8 sm:px-6 sm:pt-6 lg:order-1 lg:w-[60%] lg:overflow-y-auto lg:px-10 lg:py-16 lg:pr-12">
        <a
          href="/"
          className="mb-4 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#6B7280] transition hover:text-[#111827] lg:hidden"
        >
          <BackChevronIcon />
          Back
        </a>

        {/* Full-width image band on small screens */}
        <div className="relative -mx-4 mb-4 overflow-hidden bg-[#F8F9FA] sm:-mx-6 sm:rounded-2xl lg:hidden">
          <img
            src={imageSrc}
            alt={event.title || 'Event'}
            className="mx-auto block h-auto max-h-[min(42vh,20rem)] w-full object-contain object-center px-2 py-3 sm:max-h-[min(48vh,24rem)] sm:px-4"
          />
        </div>

        {/* Mobile / tablet: calendar + Instagram in one row, directly under the image */}
        <div className="mb-8 w-full min-w-0 lg:hidden">{eventButtons}</div>

        <a
          href="/"
          className="mb-8 hidden w-fit items-center gap-2 text-sm font-semibold text-[#6B7280] transition hover:text-[#111827] lg:inline-flex"
        >
          <BackChevronIcon />
          Back
        </a>

        <div className="space-y-3 sm:space-y-4 lg:space-y-4">
          <h1 className="font-sans text-3xl font-black leading-tight tracking-tight text-[#111827] sm:text-4xl lg:text-5xl">
            {event.title || 'Untitled Event'}
          </h1>

          <div className="flex flex-col gap-1">
            <p className="font-sans text-lg font-bold text-[#D71920] sm:text-xl">
              {formatEventDateTime(event.date || event.event_date, event.time)}
            </p>
            {event.location && (
              <p className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-slate-500 sm:text-base">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21s6-5.8 6-11a6 6 0 10-12 0c0 5.2 6 11 6 11z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="10" r="2" />
                </svg>
                {event.location}
              </p>
            )}
          </div>

          {event.hosts && event.hosts.length > 0 && (
            <div className="mt-2 inline-block max-w-full rounded-xl bg-[#FFF7ED] px-4 py-2 text-[#92400E] sm:mt-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B45309]">Hosted by: </span>
              <span className="ml-1 font-bold">{event.hosts.join(', ')}</span>
            </div>
          )}
        </div>

        {event.description && (
          <div className="mt-8 border-t border-gray-100 pt-8">
            <p className="w-full text-base leading-relaxed text-slate-700 sm:text-[17px]">
              {event.description}
            </p>
          </div>
        )}
      </article>

      {/* Desktop: Image + Buttons */}
      <div className="hidden w-full flex-col items-center justify-center bg-[#F8F9FA] p-6 sm:p-10 lg:order-2 lg:flex lg:w-[40%] lg:p-12">
        <div className="flex w-full max-w-lg flex-col items-center gap-6">
          <div className="w-full overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5">
            <img
              src={imageSrc}
              alt={event.title || 'Event'}
              className="mx-auto h-auto max-h-[50vh] w-full object-contain"
            />
          </div>
          <div className="flex w-full min-w-0 flex-col gap-3">{eventButtons}</div>
        </div>
      </div>
    </main>,
    { hideFooterOnMobile: true }
  );
}
