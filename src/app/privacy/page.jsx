import { LegalPageShell, LegalSection } from '@/components/LegalPageShell';

export const metadata = {
  title: 'Privacy Policy — cuThere',
  description: 'Privacy Policy for cuThere.',
};

const LAST_UPDATED = 'June 24, 2026';

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <LegalSection heading="1. Overview">
        <p className="mt-2">
          This Privacy Policy explains what information cuThere (the &ldquo;Service&rdquo;) collects, how we
          use it, and the choices you have. We aim to collect only what we need to run the Service.
        </p>
      </LegalSection>

      <LegalSection heading="2. Information We Collect">
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
      </LegalSection>

      <LegalSection heading="3. How We Use Information">
        <p className="mt-2">
          We use the information to provide and operate the Service, understand how it is used, improve
          features, and respond to feedback. We do not sell your personal information.
        </p>
      </LegalSection>

      <LegalSection heading="4. Third-Party Services">
        <p className="mt-2">
          We rely on third-party providers (for example, Discord for authentication and analytics providers
          to understand usage). These providers process data under their own privacy policies.
        </p>
      </LegalSection>

      <LegalSection heading="5. Data Retention">
        <p className="mt-2">
          We retain information only as long as needed to provide the Service or as required by law, after
          which it is deleted or anonymized.
        </p>
      </LegalSection>

      <LegalSection heading="6. Your Choices">
        <p className="mt-2">
          You may request access to or deletion of your personal information by contacting us. You can also
          disconnect any linked third-party account at any time.
        </p>
      </LegalSection>

      <LegalSection heading="7. Contact">
        <p className="mt-2">
          Questions about this policy? Reach us through our{' '}
          <a href="/feedback" className="font-semibold text-university-red hover:text-university-red-hover">
            feedback page
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
