"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeIn } from "@/lib/motion";

const faqs = [
  {
    q: "How does the draw work?",
    a: "Each month, every active member is automatically entered. We randomly draw 5 numbers. If your number matches, you win. It is that simple.",
  },
  {
    q: "Where does my 9.99 go?",
    a: "50% goes to the monthly prize pool, 10% goes directly to the charity you choose, and the remaining covers platform costs, servers, payment fees, and a small operating margin.",
  },
  {
    q: "Can I change my chosen charity?",
    a: "Yes. You can switch your selected charity at any time from your dashboard. Your future monthly donations will go to the new cause.",
  },
  {
    q: "How do I claim a prize?",
    a: "If your number matches, we will notify you by email and on your dashboard. You upload a simple verification form and the prize is paid out within 5 working days.",
  },
  {
    q: "Is this legal?",
    a: "Yes. causeClub operates under UK law as a prize draw, not a lottery. We are registered with and exempt from the Gambling Commission.",
  },
];

export function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <m.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="border-t border-border py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">FAQ</p>
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Questions? Answered.
          </h2>
        </div>

        <m.div variants={fadeIn} className="mx-auto max-w-2xl">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className="border-b border-border">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="flex w-full min-h-[44px] items-center justify-between gap-4 py-5 text-left text-sm font-medium transition-colors hover:text-accent"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                {isOpen && (
                  <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
                      {faq.a}
                    </p>
                  </m.div>
                )}
              </div>
            );
          })}
        </m.div>
      </div>
    </m.section>
  );
}
