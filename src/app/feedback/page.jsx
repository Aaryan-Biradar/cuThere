'use client';

import { useCallback, useState } from 'react';
import { BackLink, SiteFooter, SiteHeader } from '@/components/SiteChrome';
import Toast from '@/components/Toast';

export default function FeedbackPage() {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [toastVisible, setToastVisible] = useState(false);
  // Stable callback so Toast's auto-dismiss timer isn't restarted by unrelated re-renders.
  const closeToast = useCallback(() => setToastVisible(false), []);

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

      setStatus('success');
      setToastVisible(true);
      setEmail('');
      setFeedback('');
    } catch (err) {
      setStatus('error');
    }
  }

  const isSuccess = status === 'success';

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream text-[#111827] [font-family:var(--font-brand-sans)]">
      <SiteHeader activeLabel="Feedback" />

      <main className="flex flex-1 flex-col px-4 pb-12 pt-[calc(env(safe-area-inset-top)+4.5rem)] sm:px-6 sm:pt-[calc(env(safe-area-inset-top)+5rem)] lg:px-12">
        <div className="mx-auto w-full max-w-lg">
          <BackLink />
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
                <BackLink>Back to events</BackLink>
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
        onClose={closeToast}
      />
    </div>
  );
}
