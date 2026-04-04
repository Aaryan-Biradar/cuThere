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
  return (
    <a
      href="/"
      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium tracking-[0.18em] transition ${
        isHeader
          ? scrolled
            ? 'border border-[#E5E7EB] bg-white text-black hover:border-[#D71920]/30'
            : 'border border-white bg-white/10 text-white hover:bg-white/15'
          : 'border border-[#E5E7EB] bg-white text-[#111827] shadow-[0_1px_4px_rgba(17,24,39,0.04)] hover:border-[#D71920]/30'
      }`}
    >
      cuThere
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
    : '/image.png';

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
