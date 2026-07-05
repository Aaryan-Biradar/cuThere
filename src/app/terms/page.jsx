import { LegalPageShell, LegalSection } from '@/components/LegalPageShell';

export const metadata = {
  title: 'Terms of Service — cuThere',
  description: 'Terms of Service for cuThere.',
};

const LAST_UPDATED = 'June 24, 2026';

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <LegalSection heading="1. Acceptance of Terms">
        <p className="mt-2">
          By accessing or using cuThere (the &ldquo;Service&rdquo;), you agree to be bound by these Terms
          of Service. If you do not agree, please do not use the Service.
        </p>
      </LegalSection>

      <LegalSection heading="2. The Service">
        <p className="mt-2">
          cuThere helps users discover and keep track of campus events. The Service is provided on an
          &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis and may change or be discontinued at any
          time without notice.
        </p>
      </LegalSection>

      <LegalSection heading="3. Acceptable Use">
        <p className="mt-2">
          You agree not to misuse the Service, including attempting to disrupt it, access it through
          unauthorized means, or use it for any unlawful purpose. You are responsible for any content you
          submit.
        </p>
      </LegalSection>

      <LegalSection heading="4. Third-Party Services">
        <p className="mt-2">
          The Service may integrate with third-party platforms such as Discord. Your use of those platforms
          is governed by their own terms and policies, and we are not responsible for them.
        </p>
      </LegalSection>

      <LegalSection heading="5. Disclaimer &amp; Limitation of Liability">
        <p className="mt-2">
          To the fullest extent permitted by law, cuThere is not liable for any indirect, incidental, or
          consequential damages arising from your use of the Service.
        </p>
      </LegalSection>

      <LegalSection heading="6. Changes to These Terms">
        <p className="mt-2">
          We may update these Terms from time to time. Continued use of the Service after changes take
          effect constitutes acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection heading="7. Contact">
        <p className="mt-2">
          Questions about these Terms? Reach us through our{' '}
          <a href="/feedback" className="font-semibold text-university-red hover:text-university-red-hover">
            feedback page
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
