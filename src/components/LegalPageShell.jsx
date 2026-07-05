import { BackLink, SiteFooter, SiteHeader } from '@/components/SiteChrome';

/** Shared page shell for the static legal pages (Terms of Service, Privacy Policy). */
export function LegalPageShell({ title, lastUpdated, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-cream text-[#111827] [font-family:var(--font-brand-sans)]">
      <SiteHeader />

      <main className="flex flex-1 flex-col px-4 pb-12 pt-[calc(env(safe-area-inset-top)+4.5rem)] sm:px-6 sm:pt-[calc(env(safe-area-inset-top)+5rem)] lg:px-12">
        <div className="mx-auto w-full max-w-2xl">
          <BackLink />
          <h1 className="mt-4 font-sans text-3xl font-black tracking-tight text-[#111827] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: {lastUpdated}</p>

          <div className="mt-8 space-y-6 rounded-2xl border border-gray-200 bg-white p-6 text-[15px] leading-relaxed text-slate-700 shadow-sm sm:p-8">
            {children}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

/** One numbered section inside the legal card; children keep their own mt-2 spacing. */
export function LegalSection({ heading, children }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-[#111827]">{heading}</h2>
      {children}
    </section>
  );
}
