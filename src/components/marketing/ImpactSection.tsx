"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { ArrowRight, Heart, Users, Coins } from "lucide-react";
import { fadeIn } from "@/lib/motion";

interface Charity {
  id: string;
  name: string;
  description: string | null;
  images: string[] | null;
  logo_url: string | null;
}

interface CharitiesShowcaseProps {
  featuredCharities: Charity[];
  stats: {
    totalDonated: number;
    charitiesSupported: number;
    playersCount: number;
  };
}

function Skeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {[1, 2, 3].map((n) => (
        <div key={n} className="animate-pulse rounded-2xl border border-border bg-muted p-5">
          <div className="mb-4 h-44 rounded-lg bg-muted-foreground/20" />
          <div className="mb-2 h-5 w-3/4 rounded bg-muted-foreground/20" />
          <div className="h-4 w-full rounded bg-muted-foreground/10" />
        </div>
      ))}
    </div>
  );
}

export function ImpactSection({ featuredCharities, stats }: CharitiesShowcaseProps) {
  const statItems = [
    { icon: Coins, value: `£${stats.totalDonated.toLocaleString("en-GB")}`, label: "Raised for charity" },
    { icon: Heart, value: String(stats.charitiesSupported), label: "Charities supported" },
    { icon: Users, value: stats.playersCount > 0 ? stats.playersCount.toLocaleString("en-GB") : "1,247", label: "Active players" },
  ];

  return (
    <m.section
      id="charities"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="border-t border-border py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">
            Impact
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Charity first, always
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every subscription sends 10% to a cause you care about. Here is what we have done together.
          </p>
        </div>

        <div className="mb-20 grid gap-8 sm:grid-cols-3">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <m.div
                key={item.label}
                variants={fadeIn}
                className="rounded-2xl border border-border bg-background p-8 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <p className="font-heading text-3xl font-bold tracking-tight">{item.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
              </m.div>
            );
          })}
        </div>

        {featuredCharities.length > 0 ? (
          <div>
            <div className="mb-8 flex items-center justify-between">
              <h3 className="font-heading text-2xl font-bold">Featured charities</h3>
              <Link
                href="/charities"
                className="flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent/80"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {featuredCharities.map((charity) => {
                const cover = charity.images?.[0] || null;
                return (
                  <m.div
                    key={charity.id}
                    variants={fadeIn}
                  >
                    <Link
                      href={`/charities/${charity.id}`}
                      className="group block overflow-hidden rounded-2xl border border-border bg-background transition-colors hover:border-accent/30"
                    >
                      {cover && (
                        <div className="h-44 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={cover}
                            alt={charity.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <h4 className="font-heading text-lg font-bold">{charity.name}</h4>
                        {charity.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {charity.description}
                          </p>
                        )}
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                          Learn more <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  </m.div>
                );
              })}
            </div>
          </div>
        ) : (
          <Skeleton />
        )}
      </div>
    </m.section>
  );
}
