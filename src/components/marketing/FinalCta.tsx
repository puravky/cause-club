"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fadeIn } from "@/lib/motion";

export function FinalCta() {
  return (
    <m.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <m.div variants={fadeIn} className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Ready to play?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join 1,200+ players already making a difference. Your first draw is one click away.
          </p>
          <Link
            href="/signup"
            className="mt-10 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-accent px-8 text-base font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent/90 hover:shadow-xl"
          >
            Start playing
            <ArrowRight className="h-4 w-4" />
          </Link>
        </m.div>
      </div>
    </m.section>
  );
}
