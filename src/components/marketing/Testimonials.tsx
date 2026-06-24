"use client";

import { m } from "framer-motion";
import { Quote } from "lucide-react";
import { fadeIn } from "@/lib/motion";

const testimonials = [
  {
    quote: "I joined for the chance to win, but I stayed because I know my 10 is feeding kids every month. That feels good.",
    name: "Sarah K.",
    initials: "SK",
  },
  {
    quote: "Finally a prize draw that does not feel scummy. causeClub actually donates to real charities. I am in every month.",
    name: "Priya R.",
    initials: "PR",
  },
];

export function Testimonials() {
  return (
    <m.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="border-t border-border py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">
            Real players
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            What our community says
          </h2>
        </div>

        <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
          {testimonials.map((t) => (
            <m.div
              key={t.name}
              variants={fadeIn}
              className="flex flex-col gap-5 rounded-2xl border border-border bg-background p-8"
            >
              <Quote className="h-6 w-6 text-accent" />
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                  {t.initials}
                </div>
                <p className="text-sm font-semibold">{t.name}</p>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </m.section>
  );
}
