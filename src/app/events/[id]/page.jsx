'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

function normalizeDateString(dateString) {
  if (!dateString) return '';
  const trimmed = String(dateString).trim();
  return trimmed.replace(/\b(\d+)(st|nd|rd|th)\b/gi, '$1');
}

function formatEventDateTime(date, time) {
  const normalized = normalizeDateString(date || '');
  if (!normalized && !time) return 'Date and time TBA';
  const dateLabel = normalized || 'Date TBA';
  return time ? `${dateLabel} • ${time}` : dateLabel;
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

function BrandLogo({ variant = 'header', scrolled = false }) {
  const isHeader = variant === 'header';
  
  // Base classes for the pill shape
  const baseClasses = "inline-flex items-center justify-center rounded-full px-4 py-0.5 transition-all duration-300 shadow-sm";
  
  // Logic: 
  // If it's the header, we want it white regardless of scroll.
  // If scrolled, we add a subtle border so it doesn't disappear into the white header.
  const headerStyles = scrolled 
    ? 'bg-white border border-gray-200' 
    : 'bg-white border border-transparent';

  const footerStyles = 'bg-white border border-gray-200 opacity-90 hover:opacity-100';

  const imgClass = variant === 'footer' ? 'h-7 w-auto' : 'h-8 w-auto sm:h-9';

  return (
    <a
      href="/"
      className={`${baseClasses} ${isHeader ? headerStyles : footerStyles}`}
    >
      <img 
        src="/logo.png" 
        alt="cuThere" 
        className={imgClass} 
      />
    </a>
  );
}

function Header({ scrolled }) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-colors duration-300 ease-out ${
        scrolled ? 'border-b border-[#FCFAF7] bg-[#FCFAF7] shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="flex min-h-14 items-center justify-between px-4 sm:min-h-16 sm:px-6 lg:px-12">
        <BrandLogo variant="header" scrolled={scrolled} />

        <div className="ml-auto flex items-center gap-2">
          <a
            href="/feedback"
            className="rounded-full border border-[#D71920] bg-[#D71920] px-4 py-2 text-sm font-bold text-white transition hover:border-[#b81419] hover:bg-[#b81419]"
          >
            Feedback
          </a>
        </div>
      </div>
    </header>
  );
}

function Footer({ className = '' }) {
  const year = new Date().getFullYear();
  return (
    <footer className={`border-t border-[#E5E7EB] bg-[#FCFAF7] px-4 py-8 sm:px-6 lg:px-12 ${className}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <BrandLogo variant="footer" />
        <p className="font-sans text-xs text-[#6B7280]">© {year}</p>
      </div>
    </footer>
  );
}

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

  const shell = (children, { hideFooterOnMobile } = {}) => (
    <div className="flex min-h-screen flex-col bg-[#FCFAF7] text-[#111827] [font-family:var(--font-brand-sans)]">
      {/* No hero on this route — keep header in solid “scrolled” style for contrast */}
      <Header scrolled />
      <div className="flex min-h-0 flex-1 flex-col pt-[calc(env(safe-area-inset-top)+3.5rem)] sm:pt-[calc(env(safe-area-inset-top)+4rem)]">
        {children}
      </div>
      <Footer className={hideFooterOnMobile ? 'hidden lg:block' : ''} />
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

  const eventButtons = (
    <>
      <button
        type="button"
        className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-[#D71920] bg-[#D71920] py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#b81419] sm:py-3"
      >
        Add to calendar
      </button>
      <a
        href={event.postUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-bold text-[#111827] transition hover:bg-gray-50 sm:py-3"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
        Instagram Post
      </a>
    </>
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
        <div className="relative -mx-4 mb-6 overflow-hidden bg-[#F8F9FA] sm:-mx-6 sm:rounded-2xl lg:hidden">
          <img
            src={imageSrc}
            alt={event.title || 'Event'}
            className="mx-auto block h-auto max-h-[min(42vh,20rem)] w-full object-contain object-center px-2 py-3 sm:max-h-[min(48vh,24rem)] sm:px-4"
          />
        </div>

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

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row lg:hidden">{eventButtons}</div>
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
          <div className="flex w-full flex-col gap-3">{eventButtons}</div>
        </div>
      </div>
    </main>,
    { hideFooterOnMobile: true }
  );
}
