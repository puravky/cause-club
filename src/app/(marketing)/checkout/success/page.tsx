"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [error, setError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const startTime = Date.now();

    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/subscription/status");
        const data = await res.json();

        if (!mountedRef.current) return;

        if (data.status === "active" || data.status === "trialing") {
          if (intervalRef.current) clearInterval(intervalRef.current);
          router.push("/dashboard");
          return;
        }

        if (Date.now() - startTime > 30000) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setError(true);
        }
      } catch {
        // retry on next tick
      }
    }, 2000);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-4">
      {error ? (
        <div className="max-w-md text-center">
          <h1 className="font-heading text-2xl font-semibold text-ink">
            Something went wrong
          </h1>
          <p className="mt-3 text-[#6B7280]">
            Your payment was received but activation is taking longer than
            expected. Please refresh or contact support.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-coral px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-coral/90"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <span className="font-heading text-3xl font-bold text-ink">
            causeClub
          </span>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-coral border-t-transparent" />
          <p className="text-[#6B7280]">Activating your account...</p>
        </div>
      )}
    </main>
  );
}
