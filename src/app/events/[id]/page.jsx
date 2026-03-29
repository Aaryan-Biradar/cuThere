'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

function parseEventDate(dateString) {
  if (!dateString) return null;
  const parsed = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatEventDateTime(date, time) {
  if (!date && !time) return 'Date and time TBA';
  const parsed = parseEventDate(date);
  const dateLabel = parsed
    ? parsed.toLocaleDateString('en-CA', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : 'Date TBA';
  return `${dateLabel} • ${time || 'Time TBA'}`;
}

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

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

  async function handleRsvp(eventObj) {
    eventObj.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFeedback('Please enter your name and email.');
      return;
    }

    setSubmitting(true);
    setFeedback('');
    try {
      const payload = { event_id: event?.id ?? id, user_name: name.trim() };
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data?.error || 'Could not submit RSVP right now.');
        return;
      }

      setFeedback('You are in! RSVP saved.');
      const refreshed = await fetch(`/api/events/${id}`);
      const refreshedData = await refreshed.json();
      setEvent(refreshedData);
      setName('');
      setEmail('');
    } catch (error) {
      setFeedback('Could not submit RSVP right now.');
    } finally {
      setSubmitting(false);
    }
  }

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
          {event.image_url ? (
            <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
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

        <section className="space-y-6 px-5 pb-24 pt-6 sm:px-8 sm:pb-10">
          <div className="space-y-3">
            <h1 className="font-sans text-3xl font-black leading-tight tracking-tight text-[#111827] sm:text-4xl">{event.title || 'Untitled Event'}</h1>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <p className="text-sm font-semibold text-slate-600 sm:text-base">{formatEventDateTime(event.date, event.time)}</p>
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

          <div className="rounded-2xl border border-gray-100 bg-[#FCFAF7] p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Attending</p>
            <p className="mt-2 text-2xl font-black text-[#111827]">{event.rsvp_count || 0}</p>
            <p className="text-sm text-slate-500">people RSVP&apos;d so far</p>
          </div>
        </section>

        <section className="sticky bottom-0 z-20 border-t border-gray-100 bg-white/95 px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 backdrop-blur md:static md:border-t-0 md:bg-white md:px-8 md:pb-8">
          <form onSubmit={handleRsvp} className="space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-[0.12em] text-slate-500">RSVP</h3>
            <input
              type="text"
              value={name}
              onChange={(eventObj) => setName(eventObj.target.value)}
              placeholder="Name"
              className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium text-[#111827] outline-none transition focus:border-[#D71920] focus:ring-2 focus:ring-[#D71920]/10"
            />
            <input
              type="email"
              value={email}
              onChange={(eventObj) => setEmail(eventObj.target.value)}
              placeholder="Email"
              className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium text-[#111827] outline-none transition focus:border-[#D71920] focus:ring-2 focus:ring-[#D71920]/10"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#D71920] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#BE161C] disabled:cursor-not-allowed disabled:opacity-75"
            >
              {submitting ? 'Submitting...' : 'RSVP Now'}
            </button>
            {feedback ? <p className="text-sm font-medium text-slate-600">{feedback}</p> : null}
          </form>
        </section>
      </motion.article>
    </main>
  );
}
