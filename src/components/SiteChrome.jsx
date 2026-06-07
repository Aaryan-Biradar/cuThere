'use client';

function LinkedInIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function BrandLogo({ variant = 'header' }) {
  const isHeader = variant === 'header';

  const baseClasses =
    'inline-flex items-center justify-center rounded-full px-4 py-0.5 transition-all duration-300';

  const headerStyles = 'bg-white';

  const footerStyles = 'bg-white border border-gray-200 opacity-90 hover:opacity-100';

  const imgClass = variant === 'footer' ? 'h-7 w-auto' : 'h-8 w-auto sm:h-9';

  return (
    <a href="/" className={`${baseClasses} ${isHeader ? headerStyles : footerStyles}`}>
      <img src="/logo.png" alt="cuThere" className={imgClass} />
    </a>
  );
}

export function SiteHeader({ scrolled = false, activeLabel = null }) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-colors duration-300 ease-out ${
        scrolled
          ? 'border-b border-gray-100 bg-white shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="flex min-h-14 items-center justify-between px-4 sm:min-h-16 sm:px-6 lg:px-12">
        <BrandLogo variant="header" />

        <div className="ml-auto flex items-center gap-2">
          {activeLabel ? (
            <span
              className="rounded-full border border-[#D71920] bg-white px-4 py-2 text-sm font-bold text-[#D71920]"
              aria-current="page"
            >
              {activeLabel}
            </span>
          ) : (
            <a
              href="/feedback"
              className="rounded-full border border-[#D71920] bg-[#D71920] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#b81419] hover:border-[#b81419]"
            >
              Feedback
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

/** Home-page footer; pass `className` e.g. `hidden lg:block` to hide on mobile only. */
export function SiteFooter({ className = '' }) {
  const year = new Date().getFullYear();
  const linkedIn1 =
    process.env.NEXT_PUBLIC_LINKEDIN_URL_1 ?? 'https://www.linkedin.com/';
  const linkedIn2 =
    process.env.NEXT_PUBLIC_LINKEDIN_URL_2 ?? 'https://www.linkedin.com/';

  return (
    <footer
      className={`border-t border-[#E5E7EB] bg-[#FCFAF7] px-4 py-3 sm:px-6 lg:px-12 ${className}`}
    >
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-4">
        <div className="flex min-h-10 items-center gap-3">
          <a
            href={linkedIn1}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6B7280] transition hover:text-[#0A66C2]"
            aria-label="LinkedIn"
            title={linkedIn1}
          >
            <LinkedInIcon />
          </a>
          <a
            href={linkedIn2}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6B7280] transition hover:text-[#0A66C2]"
            aria-label="LinkedIn page"
            title={linkedIn2}
          >
            <LinkedInIcon />
          </a>
        </div>
        <p className="font-sans text-[10px] font-medium tracking-widest text-[#9CA3AF]">
          © {year} cuThere
        </p>
      </div>
    </footer>
  );
}
