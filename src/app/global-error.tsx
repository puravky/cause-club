"use client";

import React, { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 text-center antialiased">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-coral/10 text-coral mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        
        <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          A critical error occurred
        </h1>
        
        <p className="mt-4 text-base text-[#6B7280] max-w-md leading-relaxed">
          The application encountered a critical error. Please reload the page or click below to retry.
        </p>

        {error.message && (
          <div className="mt-6 rounded-xl bg-ink/5 p-3.5 text-xs text-[#6B7280] max-w-xs font-mono break-all border border-border">
            {error.message}
          </div>
        )}

        <div className="mt-8">
          <Button
            onClick={reset}
            className="bg-ink hover:bg-ink/90 text-white rounded-xl px-6 py-5 font-semibold"
          >
            Retry Application
          </Button>
        </div>
      </body>
    </html>
  );
}
