'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getUiTestEventById, isUiTestEventId } from '@/lib/ui-test-event';

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
            href="/about"
            className="rounded-full border border-[#D71920] bg-[#D71920] px-4 py-2 text-sm font-bold text-white transition hover:border-[#b81419] hover:bg-[#b81419]"
          >
            About
          </a>
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

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[#E5E7EB] bg-[#FCFAF7] px-4 py-8 sm:px-6 lg:px-12">
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

      if (isUiTestEventId(id)) {
        const demo = getUiTestEventById(id);
        if (!cancelled) {
          setEvent(demo ? { ...demo, is_demo: true } : null);
          setLoading(false);
        }
        return;
      }

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

  const shell = (children) => (
    <div className="flex min-h-screen flex-col bg-[#FCFAF7] text-[#111827] [font-family:var(--font-brand-sans)]">
      {/* No hero on this route — keep header in solid “scrolled” style for contrast */}
      <Header scrolled />
      <div className="flex flex-1 flex-col pt-[calc(env(safe-area-inset-top)+3.5rem)] sm:pt-[calc(env(safe-area-inset-top)+4rem)]">
        {children}
      </div>
      <Footer />
    </div>
  );

  if (loading) {
    return shell(
      <main className="flex flex-1 flex-col lg:flex-row">
        <div className="order-2 flex w-full flex-1 flex-col gap-4 px-5 py-8 sm:px-8 lg:order-1 lg:w-1/2 lg:max-w-[50%] lg:justify-center lg:py-12 lg:pl-12 lg:pr-8">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-[#E5E7EB]" />
          <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-[#E5E7EB]" />
          <div className="h-24 w-full animate-pulse rounded-lg bg-[#E5E7EB]" />
        </div>
        <div className="order-1 flex min-h-[40vh] w-full items-center justify-center bg-[#F3F4F6] p-6 sm:min-h-[50vh] lg:order-2 lg:min-h-[calc(100dvh-5rem)] lg:w-1/2 lg:max-w-[50%] lg:sticky lg:top-[calc(env(safe-area-inset-top)+4rem)] lg:self-start lg:p-10">
          <div className="aspect-square w-full max-w-md animate-pulse rounded-2xl bg-[#E5E7EB]" />
        </div>
      </main>
    );
  }

  if (!event || event.error) {
    return shell(
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-16 sm:px-8">
        <a
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-[#111827] transition hover:border-gray-300"
        >
          <span aria-hidden="true">←</span>
          Back to events
        </a>
        <p className="mt-8 text-base font-medium text-slate-600">Event not found.</p>
      </main>
    );
  }

  const imageSrc = event.displayUrl
    ? `/api/image-proxy?url=${encodeURIComponent(event.displayUrl)}`
    : '/heroimage.png';

  return shell(
    <main className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
      {/* Copy / meta — left on lg */}
      <article className="order-2 flex w-full flex-col justify-center px-5 py-10 sm:px-8 lg:order-1 lg:w-1/2 lg:max-w-[50%] lg:py-16 lg:pl-12 lg:pr-10 xl:pl-16">
        <a
          href="/"
          className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#6B7280] transition hover:text-[#111827]"
        >
          <span aria-hidden="true">←</span>
          Back to events
        </a>

        <div className="space-y-1.5">
          <h1 className="font-sans text-3xl font-black leading-tight tracking-tight text-[#111827] sm:text-4xl lg:text-[2.5rem] lg:leading-[1.15]">
            {event.title || 'Untitled Event'}
          </h1>
          <p className="font-sans text-base font-bold text-[#D71920] sm:text-lg">
            {formatEventDateTime(event.date || event.event_date, event.time)}
          </p>
          {event.location && (
            <p className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-[#D71920] sm:text-base">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
                <path
                  d="M12 21s6-5.8 6-11a6 6 0 10-12 0c0 5.2 6 11 6 11z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.7" />
              </svg>
              {event.location}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              className="inline-flex w-fit items-center justify-center gap-2 rounded-full border border-[#D71920] bg-white px-5 py-2.5 text-sm font-bold text-[#D71920] shadow-sm transition hover:bg-[#FFF5F5]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
                <path
                  d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Add to calendar
            </button>

              <a
                href={event.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#E4405F] underline decoration-[#E4405F]/40 underline-offset-2 transition hover:text-[#c13584] hover:decoration-[#c13584]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                View original Instagram post
              </a>

          </div>

          {event.hosts && event.hosts.length > 0 && (
            <div className="mt-4 rounded-xl bg-[#FFF7ED] p-3 text-sm text-[#92400E]">
              <p className="text-xs font-bold uppercase tracking-wide text-[#B45309]">Hosted by</p>
              <ul className="mt-1 list-disc pl-5">
                {event.hosts.map((host, index) => (
                  <li key={`${host}-${index}`} className="leading-5">
                    {host}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {event.description && (
          <p className="mt-8 max-w-xl text-[15px] leading-7 text-slate-700 sm:text-base sm:leading-8">
            {event.description}
          </p>
        )}
      </article>

      {/* Image — right on lg; full natural aspect, not cropped */}
      <div className="order-1 flex w-full items-center justify-center bg-[#F3F4F6] px-4 py-8 sm:px-6 sm:py-10 lg:order-2 lg:min-h-[calc(100dvh-env(safe-area-inset-top)-4rem)] lg:w-1/2 lg:max-w-[50%] lg:sticky lg:top-[calc(env(safe-area-inset-top)+4rem)] lg:self-start lg:px-10 lg:py-16">
        <img
          src={imageSrc}
          alt={event.title || 'Event'}
          className="h-auto w-full max-h-[min(85dvh,1200px)] max-w-full object-contain [image-rendering:auto]"
        />
      </div>
    </main>
  );
}
