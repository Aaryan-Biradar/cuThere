import { SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { ChevronLeftIcon } from '@/components/icons';

export const metadata = {
  title: 'Privacy Policy — cuThere',
  description: 'Privacy Policy for cuThere.',
};

const LAST_UPDATED = 'June 24, 2026';

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>

          <div className="mt-8 space-y-6 rounded-2xl border border-gray-200 bg-white p-6 text-[15px] leading-relaxed text-slate-700 shadow-sm sm:p-8">
            <section>
              <h2 className="text-lg font-bold text-[#111827]">1. Overview</h2>
              <p className="mt-2">
                This Privacy Policy explains what information cuThere (the &ldquo;Service&rdquo;) collects, how we
                use it, and the choices you have. We aim to collect only what we need to run the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#111827]">2. Information We Collect</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  <span className="font-semibold">Account information</span> you provide or that is shared when you
                  connect a third-party account such as Discord (e.g. username and account ID).
                </li>
                <li>
                  <span className="font-semibold">Usage data</span>, such as pages viewed and actions taken,
                  collected through product analytics to help us improve the Service.
                </li>
                <li>
                  <span className="font-semibold">Feedback</span> you choose to submit, including an optional email
                  address.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#111827]">3. How We Use Information</h2>
              <p className="mt-2">
                We use the information to provide and operate the Service, understand how it is used, improve
                features, and respond to feedback. We do not sell your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#111827]">4. Third-Party Services</h2>
              <p className="mt-2">
                We rely on third-party providers (for example, Discord for authentication and analytics providers
                to understand usage). These providers process data under their own privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#111827]">5. Data Retention</h2>
              <p className="mt-2">
                We retain information only as long as needed to provide the Service or as required by law, after
                which it is deleted or anonymized.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#111827]">6. Your Choices</h2>
              <p className="mt-2">
                You may request access to or deletion of your personal information by contacting us. You can also
                disconnect any linked third-party account at any time.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#111827]">7. Contact</h2>
              <p className="mt-2">
                Questions about this policy? Reach us through our{' '}
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
