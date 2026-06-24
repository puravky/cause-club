"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SubscribeButtonProps {
  priceId: string;
  label: string;
  variant?: "primary" | "secondary";
}

export function SubscribeButton({ priceId, label, variant = "secondary" }: SubscribeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubscribe() {
    if (!priceId) {
      toast.error("Pricing configuration is missing. Please contact support.");
      return;
    }

    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirect=/pricing");
        return;
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.assign(data.url);
      } else {
        toast.error(data.error || "Failed to start checkout");
        setIsLoading(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(message);
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={handleSubscribe}
      disabled={isLoading}
      className={
        variant === "primary"
          ? "bg-coral hover:bg-coral/90 text-white h-11 px-6 text-sm font-semibold rounded-xl"
          : "btn-secondary h-11 px-6 text-sm font-semibold rounded-xl"
      }
    >
      {isLoading ? "Redirecting..." : label}
    </Button>
  );
}
