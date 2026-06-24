"use client";

import { m } from "framer-motion";
import { Users, HandCoins, ShieldCheck, Flag } from "lucide-react";
import { fadeIn, stagger } from "@/lib/motion";

const stats = [
  { icon: Users, value: "1,247", label: "Active players" },
  { icon: HandCoins, value: "£48k", label: "Donated to charity" },
  { icon: Flag, value: "18", label: "Holes per round" },
  { icon: ShieldCheck, value: "Verified", label: "by Stripe" },
];

export function TrustBar() {
  return (
    <m.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="border-y border-border bg-muted/50"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <m.div variants={stagger} className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <m.div
                key={stat.label}
                variants={fadeIn}
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
        </m.div>
      </div>
    </m.section>
  );
}
