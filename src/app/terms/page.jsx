import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { ChevronLeftIcon } from '@/components/icons';

export const metadata = {
  title: 'Terms of Service — cuThere',
  description: 'Terms of Service for cuThere.',
};

const LAST_UPDATED = 'June 24, 2026';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-cream text-[#111827] [font-family:var(--font-brand-sans)]">
      <SiteHeader />

      <main className="flex flex-1 flex-col px-4 pb-12 pt-[calc(env(safe-area-inset-top)+4.5rem)] sm:px-6 sm:pt-[calc(env(safe-area-inset-top)+5rem)] lg:px-12">
        <div className="mx-auto w-full max-w-2xl">
          <a
            href="/"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#6B7280] transition hover:text-[#111827]"
          >
            <ChevronLeftIcon />
            Back
          </a>
          <h1 className="mt-4 font-sans text-3xl font-black tracking-tight text-[#111827] sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>

          <div className="mt-8 space-y-6 rounded-2xl border border-gray-200 bg-white p-6 text-[15px] leading-relaxed text-slate-700 shadow-sm sm:p-8">
            <section>
              <h2 className="text-lg font-bold text-[#111827]">1. Acceptance of Terms</h2>
              <p className="mt-2">
                By accessing or using cuThere (the &ldquo;Service&rdquo;), you agree to be bound by these Terms
                of Service. If you do not agree, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#111827]">2. The Service</h2>
              <p className="mt-2">
                cuThere helps users discover and keep track of campus events. The Service is provided on an
                &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis and may change or be discontinued at any
                time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#111827]">3. Acceptable Use</h2>
              <p className="mt-2">
                You agree not to misuse the Service, including attempting to disrupt it, access it through
                unauthorized means, or use it for any unlawful purpose. You are responsible for any content you
                submit.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#111827]">4. Third-Party Services</h2>
              <p className="mt-2">
                The Service may integrate with third-party platforms such as Discord. Your use of those platforms
                is governed by their own terms and policies, and we are not responsible for them.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#111827]">5. Disclaimer &amp; Limitation of Liability</h2>
              <p className="mt-2">
                To the fullest extent permitted by law, cuThere is not liable for any indirect, incidental, or
                consequential damages arising from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#111827]">6. Changes to These Terms</h2>
              <p className="mt-2">
                We may update these Terms from time to time. Continued use of the Service after changes take
                effect constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#111827]">7. Contact</h2>
              <p className="mt-2">
                Questions about these Terms? Reach us through our{' '}
                <a href="/feedback" className="font-semibold text-university-red hover:text-university-red-hover">
                  feedback page
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
