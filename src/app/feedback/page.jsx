'use client';

import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { ChevronLeftIcon } from '@/components/icons';

/** Toast notification that auto-dismisses */
function Toast({ message, visible, onClose }) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 transition-all duration-300 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-lg">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="text-sm font-semibold text-[#111827]">{message}</p>
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [toastVisible, setToastVisible] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');

    // Grab the honeypot value from the hidden field
    const honeypot = e.target.elements['_hp_company'].value;

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          feedback: feedback.trim(),
          _hp_company: honeypot,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit');

      posthog.capture('feedback_submitted', { has_email: !!email.trim() });
      setStatus('success');
      setToastVisible(true);
      setEmail('');
      setFeedback('');
    } catch (err) {
      posthog.captureException(err);
      setStatus('error');
    }
  }

  const isSuccess = status === 'success';

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream text-[#111827] [font-family:var(--font-brand-sans)]">
      <SiteHeader activeLabel="Feedback" />

      <main className="flex flex-1 flex-col px-4 pb-12 pt-[calc(env(safe-area-inset-top)+4.5rem)] sm:px-6 sm:pt-[calc(env(safe-area-inset-top)+5rem)] lg:px-12">
        <div className="mx-auto w-full max-w-lg">
          <a
            href="/"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#6B7280] transition hover:text-[#111827]"
          >
            <ChevronLeftIcon />
            Back
          </a>
          <h1 className="mt-4 font-sans text-3xl font-black tracking-tight text-[#111827] sm:text-4xl">
            Feedback
          </h1>
          <p className="mt-2 max-w-md text-base leading-relaxed text-slate-600">
            Tell us what&apos;s working, what isn&apos;t, or what you&apos;d like to see next. Your input helps shape
            cuThere.
          </p>

          {isSuccess ? (
            <div
              className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              role="status"
            >
              <p className="font-sans text-lg font-bold text-[#111827]">Thanks for reaching out! 🎉</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Your feedback has been sent to the team. We appreciate you helping us improve cuThere.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <a
                  href="/"
                  className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#6B7280] transition hover:text-[#111827]"
                >
                  <ChevronLeftIcon />
                  Back to events
                </a>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="text-sm font-semibold text-university-red transition hover:text-university-red-hover"
                >
                  Send more feedback
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              {/* ── Honeypot field — invisible to real users, traps bots ── */}
              <div
                className="absolute overflow-hidden"
                style={{ height: 0, width: 0, opacity: 0 }}
                aria-hidden="true"
              >
                <label htmlFor="_hp_company">
                  Do not fill this out
                  <input
                    type="text"
                    id="_hp_company"
                    name="_hp_company"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
              </div>

              {/* ── Email (optional) ── */}
              <div>
                <label htmlFor="feedback-email" className="block text-sm font-semibold text-[#111827]">
                  Email <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-brand-cream px-4 py-3 text-base text-[#111827] placeholder:text-gray-400 focus:border-university-red focus:outline-none focus:ring-2 focus:ring-university-red/20"
                />
              </div>

              {/* ── Feedback (required) ── */}
              <div>
                <label htmlFor="feedback-message" className="block text-sm font-semibold text-[#111827]">
                  Your feedback
                </label>
                <textarea
                  id="feedback-message"
                  name="feedback"
                  required
                  rows={6}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What would you like us to know?"
                  className="mt-2 w-full resize-y rounded-xl border border-gray-200 bg-brand-cream px-4 py-3 text-base text-[#111827] placeholder:text-gray-400 focus:border-university-red focus:outline-none focus:ring-2 focus:ring-university-red/20"
                />
              </div>

              {/* ── Error message ── */}
              {status === 'error' && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  Something went wrong. Please try again.
                </p>
              )}

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full rounded-xl border border-university-red bg-university-red py-3.5 text-sm font-bold text-white shadow-sm transition hover:border-university-red-hover hover:bg-university-red-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[200px] sm:px-10"
              >
                {status === 'submitting' ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                    Sending…
                  </span>
                ) : (
                  'Submit feedback'
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <SiteFooter />
      <Toast
        message="Feedback sent — thank you!"
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}
