"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* ─── Validation schemas ───────────────────── */

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signUpSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

/* ─── Spinner ──────────────────────────────── */

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ─── Login Form ───────────────────────────── */

function LoginForm({
  onSuccess,
  onToggle,
}: {
  onSuccess: () => void;
  onToggle: () => void;
}) {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const supabase = createClient();
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setLoading(true);
    setServerError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setServerError(error.message);
      setLoading(false);
      return;
    }

    onSuccess();
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg text-[#0A0A0B] dark:text-[#FAFAF9]">Welcome back</CardTitle>
        <CardDescription className="text-[#0A0A0B]/60 dark:text-[#FAFAF9]/60">Sign in to your account to continue</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="font-medium text-[#0A0A0B] dark:text-[#FAFAF9]">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="bg-transparent text-[#0A0A0B] dark:text-[#FAFAF9] placeholder:text-[#0A0A0B]/40 dark:placeholder:text-[#FAFAF9]/40 border-[#0A0A0B]/10 dark:border-[#FAFAF9]/10"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password" className="font-medium text-[#0A0A0B] dark:text-[#FAFAF9]">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="bg-transparent text-[#0A0A0B] dark:text-[#FAFAF9] placeholder:text-[#0A0A0B]/40 dark:placeholder:text-[#FAFAF9]/40 border-[#0A0A0B]/10 dark:border-[#FAFAF9]/10"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-ink text-white hover:bg-ink/90"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Signing in…
              </span>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[#0A0A0B]/60 dark:text-[#FAFAF9]/60">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onToggle}
            className="font-medium text-ink underline underline-offset-4 transition-colors hover:text-coral"
          >
            Sign up
          </button>
        </div>
      </CardContent>
    </>
  );
}

/* ─── Sign Up Form ─────────────────────────── */

function SignUpForm({ onToggle }: { onToggle: () => void }) {
  const supabase = createClient();

  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", name: "" },
  });

  async function onSubmit(values: SignUpValues) {
    setLoading(true);
    setServerError(null);

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { name: values.name },
      },
    });

    if (error) {
      setServerError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg text-[#0A0A0B] dark:text-[#FAFAF9]">Create your account</CardTitle>
        <CardDescription className="text-[#0A0A0B]/60 dark:text-[#FAFAF9]/60">Get started with causeClub today</CardDescription>
      </CardHeader>

      <CardContent>
        {success ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
              Check your email for a confirmation link to activate your account.
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="w-full text-center text-sm font-medium text-ink underline underline-offset-4 transition-colors hover:text-coral"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="font-medium text-[#0A0A0B] dark:text-[#FAFAF9]">Full name</Label>
                <Input
                  id="signup-name"
                  placeholder="Jane Smith"
                  autoComplete="name"
                  className="bg-transparent text-[#0A0A0B] dark:text-[#FAFAF9] placeholder:text-[#0A0A0B]/40 dark:placeholder:text-[#FAFAF9]/40 border-[#0A0A0B]/10 dark:border-[#FAFAF9]/10"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="font-medium text-[#0A0A0B] dark:text-[#FAFAF9]">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="bg-transparent text-[#0A0A0B] dark:text-[#FAFAF9] placeholder:text-[#0A0A0B]/40 dark:placeholder:text-[#FAFAF9]/40 border-[#0A0A0B]/10 dark:border-[#FAFAF9]/10"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="font-medium text-[#0A0A0B] dark:text-[#FAFAF9]">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="bg-transparent text-[#0A0A0B] dark:text-[#FAFAF9] placeholder:text-[#0A0A0B]/40 dark:placeholder:text-[#FAFAF9]/40 border-[#0A0A0B]/10 dark:border-[#FAFAF9]/10"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              {serverError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {serverError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-ink text-white hover:bg-ink/90"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner />
                    Creating account…
                  </span>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-[#0A0A0B]/60 dark:text-[#FAFAF9]/60">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onToggle}
                className="font-medium text-ink underline underline-offset-4 transition-colors hover:text-coral"
              >
                Sign in
              </button>
            </div>
          </>
        )}
      </CardContent>
    </>
  );
}

/* ─── Login Page Content ───────────────────── */

function LoginPageContent() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAF9] dark:bg-[#0A0A0B] px-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl font-semibold text-[#0A0A0B] dark:text-[#FAFAF9]">
            causeClub
          </h1>
          <p className="mt-1 text-sm text-[#0A0A0B]/60 dark:text-[#FAFAF9]/60">Play Golf, Find Good.</p>
        </div>

        <Card className="bg-[#FAFAF9] dark:bg-[#0A0A0B] border-[#0A0A0B]/10 dark:border-[#FAFAF9]/10">
          {mode === "login" ? (
            <LoginForm
              onSuccess={() => {}}
              onToggle={() => setMode("signup")}
            />
          ) : (
            <SignUpForm onToggle={() => setMode("login")} />
          )}
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[#0A0A0B]/60 dark:text-[#FAFAF9]/60">
          By continuing you agree to our{" "}
          <a href="/terms" className="underline underline-offset-2">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline underline-offset-2">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
}

/* ─── Login Page (with Suspense for useSearchParams) ── */

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
