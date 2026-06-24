export default function PrivacyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-paper px-4 py-16">
      <div className="max-w-2xl w-full">
        <h1 className="font-heading text-3xl font-semibold text-ink">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[#6B7280]">Last updated: June 2026</p>

        <div className="mt-8 space-y-8 text-sm text-ink leading-relaxed">
          <section>
            <h2 className="font-heading text-xl font-semibold text-ink mb-3">1. Data We Collect</h2>
            <p>We collect the following personal data when you use causeClub:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Email address</strong> &ndash; for account registration and communications</li>
              <li><strong>Name</strong> &ndash; for your public profile and winner announcements</li>
              <li><strong>Golf scores</strong> &ndash; submitted for draw eligibility</li>
              <li><strong>Charity choice</strong> &ndash; the cause you wish to support</li>
              <li><strong>Payment information</strong> &ndash; processed securely via Stripe (we do not store full card details)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-ink mb-3">2. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To operate your account and process subscriptions</li>
              <li>To administer monthly draws and verify scores</li>
              <li>To process charitable donations to your chosen cause</li>
              <li>To send service-related communications (draw results, receipts)</li>
              <li>To improve our service and comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-ink mb-3">3. Legal Basis (GDPR)</h2>
            <p>We process your data under the following lawful bases:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Consent</strong> &ndash; you explicitly agree to data processing when creating an account</li>
              <li><strong>Contract</strong> &ndash; processing is necessary to fulfil our subscription agreement with you</li>
              <li><strong>Legitimate interest</strong> &ndash; for service improvement and fraud prevention</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-ink mb-3">4. Data Processors</h2>
            <p>We use the following third-party services to process your data:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Supabase</strong> &ndash; database and authentication</li>
              <li><strong>Stripe</strong> &ndash; payment processing</li>
              <li><strong>Resend</strong> &ndash; email communications</li>
            </ul>
            <p className="mt-2">
              Each processor is contractually obligated to protect your data and comply with GDPR requirements.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-ink mb-3">5. Your Rights</h2>
            <p>Under GDPR, you have the following rights:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Access</strong> &ndash; request a copy of your personal data</li>
              <li><strong>Rectification</strong> &ndash; correct inaccurate data</li>
              <li><strong>Erasure</strong> &ndash; request deletion of your data (subject to legal retention requirements)</li>
              <li><strong>Portability</strong> &ndash; receive your data in a machine-readable format</li>
              <li><strong>Objection</strong> &ndash; object to processing for direct marketing</li>
              <li><strong>Withdraw consent</strong> &ndash; at any time, without affecting the lawfulness of processing before withdrawal</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:hello@causeclub.com" className="underline underline-offset-4 hover:text-ink transition-colors">
                hello@causeclub.com
              </a>. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-ink mb-3">6. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active and for a period of 6 years after cancellation for legal and tax purposes. Golf scores may be anonymised after 12 months of inactivity.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-ink mb-3">7. Contact</h2>
            <p>
              Data controller: causeClub Ltd<br />
              Email:{" "}
              <a href="mailto:hello@causeclub.com" className="underline underline-offset-4 hover:text-ink transition-colors">
                hello@causeclub.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
