'use client';

import { useEffect, useState } from 'react';

/** Same chevron as event page / home carousel “back” control */
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
  const baseClasses =
    'inline-flex items-center justify-center rounded-full px-4 py-0.5 transition-all duration-300 shadow-sm';
  const headerStyles = scrolled
    ? 'border border-gray-200 bg-white'
    : 'border border-transparent bg-white';
  const footerStyles =
    'border border-gray-200 bg-white opacity-90 hover:opacity-100';
  const imgClass = variant === 'footer' ? 'h-7 w-auto' : 'h-8 w-auto sm:h-9';

  return (
    <a href="/" className={`${baseClasses} ${isHeader ? headerStyles : footerStyles}`}>
      <img src="/logo.png" alt="cuThere" className={imgClass} />
    </a>
  );
}

function Header({ scrolled }) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-colors duration-300 ease-out ${
        scrolled ? 'border-b border-[#FCFAF7] bg-[#FCFAF7] shadow-md' : 'bg-[#FCFAF7]'
      }`}
    >
      <div className="flex min-h-14 items-center justify-between px-4 sm:min-h-16 sm:px-6 lg:px-12">
        <BrandLogo variant="header" scrolled={scrolled} />
        <div className="ml-auto flex items-center gap-2">
          <span
            className="rounded-full border border-[#D71920] bg-white px-4 py-2 text-sm font-bold text-[#D71920]"
            aria-current="page"
          >
            Feedback
          </span>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[#E5E7EB] bg-[#FCFAF7] px-4 py-3 sm:px-6 lg:px-12">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between">
        <BrandLogo variant="footer" />
        <p className="font-sans text-[10px] font-medium tracking-widest text-[#9CA3AF]">© {year} CU There</p>
      </div>
    </footer>
  );
}

/**
 * Future: POST /api/feedback with body:
 * { name: string | null, message: string, anonymous: boolean }
 */
export default function FeedbackPage() {
  const [scrolled, setScrolled] = useState(false);
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    // Wire-up point: send JSON to your API or third-party form endpoint.
    setSubmitted(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FCFAF7] text-[#111827] [font-family:var(--font-brand-sans)]">
      <Header scrolled={scrolled} />

      <main className="flex flex-1 flex-col px-4 pb-12 pt-[calc(env(safe-area-inset-top)+4.5rem)] sm:px-6 sm:pt-[calc(env(safe-area-inset-top)+5rem)] lg:px-12">
        <div className="mx-auto w-full max-w-lg">
          <a
            href="/"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#6B7280] transition hover:text-[#111827]"
          >
            <BackChevronIcon />
            Back
          </a>
          <h1 className="mt-4 font-sans text-3xl font-black tracking-tight text-[#111827] sm:text-4xl">
            Feedback
          </h1>
          <p className="mt-2 max-w-md text-base leading-relaxed text-slate-600">
            Tell us what&apos;s working, what isn&apos;t, or what you&apos;d like to see next. Your input helps shape
            cuThere.
          </p>

          {submitted ? (
            <div
              className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              role="status"
            >
              <p className="font-sans text-lg font-bold text-[#111827]">Thanks for reaching out.</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                This form isn&apos;t connected to a server yet — when it is, your message will be saved.
              </p>
              <a
                href="/"
                className="mt-4 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#6B7280] transition hover:text-[#111827]"
              >
                <BackChevronIcon />
                Back
              </a>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >

              <div>
                <label htmlFor="feedback-name" className="block text-sm font-semibold text-[#111827]">
                  Name <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  id="feedback-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={anonymous}
                  placeholder={anonymous ? 'Anonymous' : 'Your name'}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-[#FCFAF7] px-4 py-3 text-base text-[#111827] placeholder:text-gray-400 focus:border-[#D71920] focus:outline-none focus:ring-2 focus:ring-[#D71920]/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor="feedback-message" className="block text-sm font-semibold text-[#111827]">
                  Your feedback
                </label>
                <textarea
                  id="feedback-message"
                  name="message"
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What would you like us to know?"
                  className="mt-2 w-full resize-y rounded-xl border border-gray-200 bg-[#FCFAF7] px-4 py-3 text-base text-[#111827] placeholder:text-gray-400 focus:border-[#D71920] focus:outline-none focus:ring-2 focus:ring-[#D71920]/20"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl border border-[#D71920] bg-[#D71920] py-3.5 text-sm font-bold text-white shadow-sm transition hover:border-[#b81419] hover:bg-[#b81419] sm:w-auto sm:min-w-[200px] sm:px-10"
              >
                Submit feedback
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
