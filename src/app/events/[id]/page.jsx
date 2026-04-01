'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

function normalizeDateString(dateString) {
  if (!dateString) return '';
  const trimmed = String(dateString).trim();
  return trimmed.replace(/\b(\d+)(st|nd|rd|th)\b/gi, '$1');
}

function parseEventDate(dateString) {
  const candidate = normalizeDateString(dateString);
  if (!candidate) return null;
  let parsed = new Date(candidate);
  if (Number.isNaN(parsed.getTime())) {
    parsed = new Date(`${candidate} ${new Date().getFullYear()}`);
  }
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatEventDateTime(date, time) {
  const normalized = normalizeDateString(date || '');
  if (!normalized && !time) return 'Date and time TBA';
  const dateLabel = normalized || 'Date TBA';
  return time ? `${dateLabel} • ${time}` : dateLabel;
}

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const apply = () => setIsMobile(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        if (!mounted) return;
        setEvent(data);
      } catch (error) {
        if (!mounted) return;
        setEvent({ error: 'Unable to load event.' });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (id) fetchEvent();
    return () => {
      mounted = false;
    };
  }, [id]);

  const cardMotion = useMemo(() => {
    return isMobile
      ? {
          initial: { y: 40, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0.36, ease: 'easeOut' },
        }
      : {
          initial: { scale: 0.96, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { duration: 0.32, ease: 'easeOut' },
        };
  }, [isMobile]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F4F1EE] px-4 py-6 [font-family:var(--font-brand-sans)] sm:px-6 sm:py-10">
        <div className="mx-auto h-[84vh] max-w-2xl animate-pulse rounded-3xl bg-white shadow-2xl" />
      </main>
    );
  }

  if (!event || event.error) {
    return (
      <main className="min-h-screen bg-[#F4F1EE] px-4 py-10 [font-family:var(--font-brand-sans)]">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-xl">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-[#111827] transition hover:border-gray-300"
          >
            <span aria-hidden="true">←</span>
            Back
          </a>
          <p className="mt-6 text-base font-medium text-slate-600">Event not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F1EE] [font-family:var(--font-brand-sans)]">
      <motion.article
        initial={cardMotion.initial}
        animate={cardMotion.animate}
        transition={cardMotion.transition}
        className="mx-auto min-h-screen overflow-hidden bg-white md:my-10 md:min-h-0 md:max-w-2xl md:rounded-3xl md:shadow-2xl"
      >
        <section className="relative aspect-[16/10] w-full bg-[#F3F4F6] sm:aspect-[16/9]">
          {event.displayUrl ? (
            <img src={`/api/image-proxy?url=${encodeURIComponent(event.displayUrl)}`} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <img src="/image.png" alt="Carleton University campus" className="h-full w-full object-cover" />
          )}

          <a
            href="/"
            aria-label="Back to events"
            className="absolute left-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/80 text-[#111827] shadow-md backdrop-blur transition hover:bg-white"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </section>

        <section className="space-y-6 px-5 pb-10 pt-6 sm:px-8">
          <div className="space-y-3">
            <h1 className="font-sans text-3xl font-black leading-tight tracking-tight text-[#111827] sm:text-4xl">{event.title || 'Untitled Event'}</h1>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <p className="text-sm font-semibold text-slate-600 sm:text-base">{formatEventDateTime(event.date || event.event_date, event.time)}</p>
              <span className="inline-flex w-fit items-center rounded-full bg-[#D71920] px-3 py-1 text-xs font-bold tracking-wide text-white">
                {event.location || 'Carleton Campus'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-500">Details</h2>
            <p className="text-[15px] leading-7 text-slate-700 sm:text-base sm:leading-8">
              {event.description || 'More details about this event will be shared soon.'}
            </p>
          </div>
        </section>
      </motion.article>
    </main>
  );
}
