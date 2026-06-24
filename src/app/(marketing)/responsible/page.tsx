import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Responsible Play | causeClub",
};

export default function ResponsiblePage() {
  return (
    <main className="min-h-screen pt-32 pb-24">
      <div className="mx-auto max-w-[800px] px-6">
        <h1 className="font-fraunces text-4xl font-bold tracking-tight sm:text-5xl">
          Responsible Play
        </h1>
        <p className="mt-4 text-[#0A0A0B]/60 dark:text-[#FAFAF9]/60">
          causeClub is a skill-based prize draw using Stableford scores. Not gambling. 18+.
        </p>

        <div className="mt-12 space-y-8">
          <section>
            <h2 className="font-fraunces text-2xl font-bold">Skill, Not Chance</h2>
            <p className="mt-3 leading-relaxed text-[#0A0A0B]/70 dark:text-[#FAFAF9]/70">
              causeClub is a prize draw based on your golf performance. The better your Stableford
              score, the more numbers you match. This is a game of skill, not a game of chance.
            </p>
          </section>

          <section>
            <h2 className="font-fraunces text-2xl font-bold">18+ Only</h2>
            <p className="mt-3 leading-relaxed text-[#0A0A0B]/70 dark:text-[#FAFAF9]/70">
              You must be 18 or over to participate in causeClub. We reserve the right to verify
              age and cancel entries from underage users.
            </p>
          </section>

          <section>
            <h2 className="font-fraunces text-2xl font-bold">Stay in Control</h2>
            <p className="mt-3 leading-relaxed text-[#0A0A0B]/70 dark:text-[#FAFAF9]/70">
              You can cancel your subscription at any time from your dashboard. There is no
              minimum commitment. If you ever feel that your participation is becoming
              problematic, please reach out to us at{" "}
              <a href="mailto:hello@causeclub.com" className="text-accent underline underline-offset-2">
                hello@causeclub.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-fraunces text-2xl font-bold">Support</h2>
            <p className="mt-3 leading-relaxed text-[#0A0A0B]/70 dark:text-[#FAFAF9]/70">
              If you need help or have questions about responsible participation, contact our
              support team at{" "}
              <a href="mailto:hello@causeclub.com" className="text-accent underline underline-offset-2">
                hello@causeclub.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
