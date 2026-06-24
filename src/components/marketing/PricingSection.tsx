"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { fadeIn, stagger } from "@/lib/motion";

const plans = [
  {
    name: "Monthly",
    price: "9.99",
    period: "per month",
    href: "/pricing",
    features: [
      "Automatic monthly draw entry",
      "10% to your chosen charity",
      "Full dashboard access",
      "24/7 support",
    ],
  },
  {
    name: "Yearly",
    price: "89.99",
    period: "per year",
    href: "/pricing",
    popular: true,
    features: [
      "All monthly features",
      "2 months free (save 20)",
      "Priority support",
      "Early draw notifications",
    ],
  },
];

export function PricingSection() {
  return (
    <m.section
      id="pricing"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="border-t border-border py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">
            Pricing
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            One price. Real impact.
          </h2>
          <p className="mt-4 text-muted-foreground">
            No hidden fees. No tiers. Just a fair entry to every monthly draw.
          </p>
        </div>

        <m.div variants={stagger} className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <m.div
              key={plan.name}
              variants={fadeIn}
              className={`relative rounded-2xl border p-8 ${
                plan.popular
                  ? "border-accent bg-accent/[0.02]"
                  : "border-border bg-background"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-semibold text-white">
                  Best value
                </div>
              )}

              <h3 className="font-heading text-2xl font-bold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-heading text-4xl font-bold">&pound;{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 flex-shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-8 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all ${
                  plan.popular
                    ? "bg-accent text-white hover:bg-accent/90"
                    : "border border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </m.div>
          ))}
        </m.div>
      </div>
    </m.section>
  );
}
