'use client';

function BrandLogo({ variant = 'header', scrolled = false }) {
  const isHeader = variant === 'header';

  const baseClasses =
    'inline-flex items-center justify-center rounded-full px-4 py-0.5 transition-all duration-300 shadow-sm';

  const headerStyles = scrolled
    ? 'bg-white border border-gray-200'
    : 'bg-white border border-transparent';

  const footerStyles = 'bg-white border border-gray-200 opacity-90 hover:opacity-100';

  const imgClass = variant === 'footer' ? 'h-7 w-auto' : 'h-8 w-auto sm:h-9';

  return (
    <a href="/" className={`${baseClasses} ${isHeader ? headerStyles : footerStyles}`}>
      <img src="/logo.png" alt="cuThere" className={imgClass} />
    </a>
  );
}

export function SiteHeader({ scrolled }) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-colors duration-300 ease-out ${
        scrolled ? 'bg-[#FCFAF7] border-b border-[#FCFAF7] shadow-md' : 'bg-transparent '
      }`}
    >
      <div className="flex min-h-14 items-center justify-between px-4 sm:min-h-16 sm:px-6 lg:px-12">
        <BrandLogo variant="header" scrolled={scrolled} />

        <div className="ml-auto flex items-center gap-2">
          <a
            href="/feedback"
            className="rounded-full border border-[#D71920] bg-[#D71920] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#b81419] hover:border-[#b81419]"
          >
            Feedback
          </a>
        </div>
      </div>
    </header>
  );
}

/** Home-page footer; pass `className` e.g. `hidden lg:block` to hide on mobile only. */
export function SiteFooter({ className = '' }) {
  const year = new Date().getFullYear();
  return (
    <footer
      className={`border-t border-[#E5E7EB] bg-[#FCFAF7] px-4 py-3 sm:px-6 lg:px-12 ${className}`}
    >
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between">
        <div className="flex items-center" />
        <p className="font-sans text-[10px] font-medium tracking-widest text-[#9CA3AF]">
          © {year} CU There
        </p>
      </div>
    </footer>
  );
}
