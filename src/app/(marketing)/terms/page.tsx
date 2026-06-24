export default function TermsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-paper px-4 py-16">
      <div className="max-w-2xl w-full">
        <h1 className="font-heading text-3xl font-semibold text-ink">Terms of Service</h1>
        <p className="mt-2 text-sm text-[#6B7280]">Last updated: June 2026</p>

        <div className="mt-8 space-y-8 text-sm text-ink leading-relaxed">
          <section>
            <h2 className="font-heading text-xl font-semibold text-ink mb-3">1. Introduction</h2>
            <p>
              Welcome to causeClub (operated by Parity Golf Ltd). By subscribing to our service, you agree to be bound by these Terms of Service. If you do not agree, please do not use our service.
            </p>
            <p className="mt-2">
              causeClub is a monthly golf score draw that combines charitable giving with the chance to win prizes based on your on-course performance.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-ink mb-3">2. Subscription Terms</h2>
            <p>
              Subscriptions are billed on a recurring basis at the following rates:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Monthly plan: <strong>£9.99/month</strong></li>
              <li>Yearly plan: <strong>£89.99/year</strong> (save approximately 20%)</li>
            </ul>
            <p className="mt-2">
              Subscriptions auto-renew until cancelled. You may cancel at any time through your account settings. Cancellation takes effect at the end of the current billing period.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-ink mb-3">3. Charitable Contribution</h2>
            <p>
              A minimum of 10% of each subscription fee is donated to a charitable cause of your choice. We publish verified donation receipts on our platform. causeClub does not profit from the charitable portion of your subscription.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-ink mb-3">4. Prize Draws</h2>
            <p>
              Prize draws are promotional activities based on golf scores submitted by subscribers. No purchase is necessary to enter. Winners are selected algorithmically based on their submitted scores matching drawn numbers. Full draw rules are available on request.
            </p>
            <p className="mt-2">
              Prizes are funded from the prize pool allocation (50% of subscription revenue). All prize distributions are recorded and auditable on the platform.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-ink mb-3">5. User Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must provide accurate information when registering.</li>
              <li>You are responsible for maintaining the confidentiality of your account.</li>
              <li>Scores submitted must reflect genuine rounds of golf played by you.</li>
              <li>You may not manipulate scores or engage in fraudulent activity.</li>
              <li>You must comply with all applicable laws and regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-ink mb-3">6. Limitation of Liability</h2>
            <p>
              causeClub is provided on an &quot;as is&quot; basis. To the maximum extent permitted by law, Parity Golf Ltd disclaims all warranties, express or implied. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-ink mb-3">7. Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity. Upon termination, your subscription will be cancelled and any unfulfilled prize obligations will be handled in accordance with applicable law.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-ink mb-3">8. Contact</h2>
            <p>
              For questions about these terms, please contact us at{" "}
              <a href="mailto:hello@paritygolf.com" className="underline underline-offset-4 hover:text-ink transition-colors">
                hello@paritygolf.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
