'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function normalizeDateString(dateString) {
  if (!dateString) return '';
  const trimmed = String(dateString).trim();
  return trimmed.replace(/\b(\d+)(st|nd|rd|th)\b/gi, '$1');
}

function parseEventDate(dateString) {
  const candidate = normalizeDateString(dateString);
  if (!candidate) return null;

  let d = new Date(candidate);
  if (Number.isNaN(d.getTime())) {
    d = new Date(`${candidate} ${new Date().getFullYear()}`);
  }
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatEventDate(date) {
  const normalized = normalizeDateString(date || '');
  return normalized || 'Date TBA';
}

export default function EventModal({ eventId }) {
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Trigger CSS enter transition one frame after mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Fetch event from existing API route
  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    setEvent(null);
    setFeedback('');
    setName('');
    setEmail('');

    fetch(`/api/events/${eventId}`)
      .then((r) => r.json())
      .then((data) => setEvent(data?.error ? null : data))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [eventId]);

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function close() {
    router.push('/', { scroll: false });
  }

  async function handleRsvp(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFeedback('Please fill in both fields.');
      return;
    }
    setSubmitting(true);
    setFeedback('');
    try {
      // Demo events have no DB row — show success locally
      if (event?.is_demo) {
        setFeedback("You're in! (demo event)");
        setEvent((prev) => ({ ...prev, rsvp_count: (prev.rsvp_count || 0) + 1 }));
        setName('');
        setEmail('');
        return;
      }

      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: event.id, user_name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setFeedback(data?.error || 'Could not submit RSVP.'); return; }
      setFeedback("You're in! RSVP saved.");
      setEvent((prev) => ({ ...prev, rsvp_count: data.rsvp_count }));
      setName('');
      setEmail('');
    } catch {
      setFeedback('Could not submit RSVP right now.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        mounted ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Card — centered popup on all breakpoints */}
      <div
        className={`relative z-10 flex max-h-[min(90dvh,800px)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-[#FCFAF7] shadow-2xl transition-transform duration-300 ${
          mounted ? 'scale-100' : 'scale-95'
        }`}
      >
        {loading && (
          <div className="h-40 animate-pulse rounded-t-3xl bg-[#F3F4F6] sm:h-44" />
        )}

        {!loading && !event && (
          <div className="p-8">
            <button type="button" onClick={close} className="mb-4 text-sm font-semibold text-[#6B7280]">← Back</button>
            <p className="text-base font-medium text-slate-600">Event not found.</p>
          </div>
        )}

        {!loading && event && (
          <>
            {/* Scrollable body — scrollbar hidden (scroll still works) */}
            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
              {/* Compact hero-style image band (similar vibe to main Hero, smaller) */}
              <div className="relative h-36 w-full shrink-0 overflow-hidden bg-[#F3F4F6] sm:h-44 md:h-48">
                <img
                  src={event.displayUrl ? `/api/image-proxy?url=${encodeURIComponent(event.displayUrl)}` : '/image.png'}
                  alt={event.title || 'Event'}
                  className="h-full w-full object-cover object-[center_35%]"
                />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-[#111827] shadow-md backdrop-blur transition hover:bg-white"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Event info */}
              <div className="space-y-5 px-5 pb-6 pt-5 sm:px-8">
                <div className="space-y-1.5">
                  <h2 className="font-sans text-2xl font-black leading-tight tracking-tight text-[#111827] sm:text-3xl">
                    {event.title || 'Untitled Event'}
                  </h2>
                  <p className="font-sans text-sm font-bold text-[#D71920] sm:text-base">
                    {formatEventDate(event.date || event.event_date)}{event.time ? ` • ${event.time}` : ''}
                  </p>
                  {event.location && (
                    <p className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-[#D71920]">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
                        <path d="M12 21s6-5.8 6-11a6 6 0 10-12 0c0 5.2 6 11 6 11z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.7" />
                      </svg>
                      {event.location}
                    </p>
                  )}
                </div>

                {event.description && (
                  <p className="text-[15px] leading-7 text-slate-700">{event.description}</p>
                )}

                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Attending</p>
                  <p className="mt-1 text-2xl font-black text-[#111827]">{event.rsvp_count || 0}</p>
                  <p className="text-xs text-slate-500">people RSVP&apos;d so far</p>
                </div>
              </div>
            </div>

            {/* Sticky RSVP */}
            <div className="shrink-0 border-t border-[#E5E7EB] bg-[#FCFAF7] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-8">
              <form onSubmit={handleRsvp} className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">RSVP</p>
                <div className="flex gap-2.5 sm:gap-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="min-w-0 flex-1 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#111827] outline-none transition focus:border-[#D71920] focus:ring-2 focus:ring-[#D71920]/10"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="min-w-0 flex-1 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#111827] outline-none transition focus:border-[#D71920] focus:ring-2 focus:ring-[#D71920]/10"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-[#D71920] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#BE161C] disabled:opacity-60"
                >
                  {submitting ? 'Submitting…' : 'RSVP Now'}
                </button>
                {feedback && (
                  <p className="text-center text-sm font-medium text-slate-600">{feedback}</p>
                )}
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
