"use client";

import { m } from "framer-motion";
import { Users, HandCoins, ShieldCheck, Scale } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "1,247",
    label: "Active players",
  },
  {
    icon: HandCoins,
    value: "£48k",
    label: "Donated to charity",
  },
  {
    icon: ShieldCheck,
    value: "Verified",
    label: "by Stripe",
  },
  {
    icon: Scale,
    value: "Exempt",
    label: "UK Gambling Commission",
  },
];

export function TrustBar() {
  return (
    <section className="border-y border-border bg-muted/50">
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <m.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                  <Icon className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
