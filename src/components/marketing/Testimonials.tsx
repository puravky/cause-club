"use client";

import { m } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "I joined for the chance to win, but I stayed because I know my £10 is feeding kids every month. That feels good.",
    name: "Sarah K.",
    role: "Player since 2024",
  },
  {
    quote:
      "The transparency is unreal. I can see exactly how much went to my chosen charity and how much went to the prize pool.",
    name: "James M.",
    role: "Player since 2024",
  },
  {
    quote:
      "Finally a lottery that doesn't feel scummy. causeClub actually donates to real charities. I'm in every month.",
    name: "Priya R.",
    role: "Player since 2025",
  },
];

export function Testimonials() {
  return (
    <section id="winners" className="border-t border-border py-24 lg:py-32">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">
            Real players
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            What our community says
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <m.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="flex flex-col gap-5 rounded-2xl border border-border bg-background p-8"
            >
              <Quote className="h-6 w-6 text-accent" />
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
