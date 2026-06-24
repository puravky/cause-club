"use client";

import { m } from "framer-motion";
import { UserPlus, TicketCheck, Gift } from "lucide-react";
import { fadeIn, stagger } from "@/lib/motion";

const steps = [
  {
    icon: UserPlus,
    title: "Create your account",
    description:
      "Sign up in under a minute. Pick your favourite charity. 10% of your subscription goes straight to them.",
  },
  {
    icon: TicketCheck,
    title: "Enter the draw",
    description:
      "Get your monthly entry for 9.99. Every player has an equal chance. No skill required, just luck.",
  },
  {
    icon: Gift,
    title: "Win and give back",
    description:
      "If your numbers come up, claim your prize. Either way, your chosen charity gets a monthly donation from every player.",
  },
];

export function HowItWorks() {
  return (
    <m.section
      id="how"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">
            How it works
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Play in three simple steps
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join thousands of players making a difference.
          </p>
        </div>

        <m.div variants={stagger} className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <m.div
                key={step.title}
                variants={fadeIn}
                className="group relative rounded-2xl border border-border bg-background p-8 transition-all duration-200 hover:-translate-y-1"
              >
                <div className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {i + 1}
                </div>
                <div className="mb-5 mt-2 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="mb-2 font-heading text-xl font-bold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </m.div>
            );
          })}
        </m.div>
      </div>
    </m.section>
  );
}
