"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import { m, useMotionValue, useTransform, animate, useInView, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fadeIn, stagger, spring } from "@/lib/motion";

function AnimatedCounter({ target, prefix = "" }: { target: number; prefix?: string }) {
  const count = useMotionValue(0);
  const springCount = useSpring(count, { stiffness: 60, damping: 20 });
  const rounded = useTransform(springCount, (v) =>
    `${prefix}${Math.round(v).toLocaleString("en-GB")}`
  );
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      count.set(0);
      animate(count, target, { duration: 2.4, ease: "easeOut" });
    }
  }, [isInView, count, target]);

  return (
    <div ref={ref}>
      <m.span className="font-heading text-5xl font-bold tracking-tight sm:text-6xl">
        {rounded}
      </m.span>
    </div>
  );
}

function DrawNumbers() {
  const numbers = [7, 14, 23, 31, 42];

  return (
    <div className="relative">
      <div className="rounded-2xl border border-border/50 bg-background/60 p-8 backdrop-blur-xl will-change-transform">
        <div className="mb-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            This month&apos;s draw
          </p>
          <p className="mt-1 font-heading text-lg font-bold">£10,000 prize pool</p>
        </div>

        <div className="flex items-center justify-center gap-3">
          {numbers.map((n, i) => (
            <m.div
              key={n}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, ...spring }}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent bg-accent/10 will-change-transform sm:h-16 sm:w-16"
            >
              <span className="font-heading text-lg font-bold text-accent sm:text-xl">
                {n}
              </span>
            </m.div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-center text-xs text-muted-foreground">
          <span>5 numbers drawn</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground" />
          <span>Random and verifiable</span>
        </div>
      </div>

      <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-accent/5 blur-3xl" />
    </div>
  );
}

export function Hero() {
  return (
    <m.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="relative overflow-hidden pb-24 pt-32 lg:pb-32 lg:pt-40"
    >
      <div className="absolute inset-0 bg-grid dark:bg-grid-dark" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      <div className="relative mx-auto max-w-[1200px] px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          <m.div variants={stagger} className="will-change-transform">
            <m.div
              variants={fadeIn}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-xs font-medium text-muted-foreground">
                July draw. 14 days left to enter.
              </span>
            </m.div>

            <m.h1
              variants={fadeIn}
              className="font-heading text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
            >
              Win up to{" "}
              <span className="text-accent">£10,000</span>{" "}
              every month
            </m.h1>

            <m.p
              variants={fadeIn}
              className="mt-6 text-lg leading-relaxed text-muted-foreground"
            >
              £9.99 a month. 10% goes to the charity you choose. 50% funds the prize pool. No ads, no gimmicks.
            </m.p>

            <m.div variants={fadeIn} className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-accent px-6 text-[15px] font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent/90 hover:shadow-xl"
              >
                Start playing
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/draws"
                className="inline-flex min-h-[44px] items-center rounded-xl border border-border bg-background px-6 text-[15px] font-medium text-foreground transition-colors hover:bg-muted"
              >
                See last draw
              </Link>
            </m.div>

            <m.div
              variants={fadeIn}
              className="mt-12 border-t border-border pt-6"
            >
              <p className="text-sm text-muted-foreground">Already raised for charity</p>
              <AnimatedCounter target={12430} prefix="£" />
            </m.div>
          </m.div>

          <m.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden will-change-transform lg:block"
          >
            <DrawNumbers />
          </m.div>
        </div>
      </div>
    </m.section>
  );
}
