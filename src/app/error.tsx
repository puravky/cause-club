"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-coral/10 text-coral mb-6 animate-bounce">
        <AlertCircle className="h-8 w-8" />
      </div>
      
      <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        Something went wrong
      </h1>
      
      <p className="mt-4 text-base text-[#6B7280] max-w-md leading-relaxed">
        An unexpected error occurred while loading this page. Please try again or head back to the home dashboard.
      </p>

      {error.message && (
        <div className="mt-6 rounded-xl bg-ink/5 p-3.5 text-xs text-[#6B7280] max-w-xs font-mono break-all border border-border">
          {error.message}
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Button
          onClick={reset}
          className="w-full sm:w-auto bg-ink hover:bg-ink/90 text-white rounded-xl px-6 py-5 font-semibold"
        >
          Try Again
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full sm:w-auto rounded-xl px-6 py-5 font-semibold"
        >
          <Link href="/dashboard">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
