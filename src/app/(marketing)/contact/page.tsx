"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(data: ContactForm) {
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send message");
      }
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-paper px-4 py-16">
      <div className="max-w-lg w-full">
        <h1 className="font-heading text-3xl font-semibold text-ink">Contact Us</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Get in touch with the causeClub team.
        </p>

        {submitted ? (
          <div className="mt-8 rounded-2xl border border-border bg-white p-8 text-center">
            <p className="font-heading text-lg font-semibold text-ink">Message sent!</p>
            <p className="mt-1 text-sm text-[#6B7280]">
              We&apos;ll get back to you as soon as possible.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                Name
              </label>
              <input
                id="name"
                {...register("name")}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Your name"
              />
              {errors.name && (
                <p className="text-xs text-coral">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-xs text-coral">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="subject" className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                Subject
              </label>
              <input
                id="subject"
                {...register("subject")}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="How can we help?"
              />
              {errors.subject && (
                <p className="text-xs text-coral">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                {...register("message")}
                className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                placeholder="Tell us more..."
              />
              {errors.message && (
                <p className="text-xs text-coral">{errors.message.message}</p>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-coral/[0.04] border border-coral/30 p-3">
                <p className="text-xs font-medium text-coral">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full h-11 text-sm font-semibold rounded-xl"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}

        <div className="mt-10 pt-8 border-t border-border">
          <h2 className="font-heading text-lg font-semibold text-ink">Other ways to reach us</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#6B7280]">
            <li>
              Email:{" "}
              <a href="mailto:hello@paritygolf.com" className="underline underline-offset-4 hover:text-ink transition-colors">
                hello@paritygolf.com
              </a>
            </li>
            <li>
              Discord:{" "}
              <span className="text-[#9CA3AF]">Join our community (coming soon)</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
