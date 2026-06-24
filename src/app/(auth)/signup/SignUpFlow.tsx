"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Heart, Search, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

const accountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type AccountValues = z.infer<typeof accountSchema>;

interface Charity {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
}

interface SignUpFlowProps {
  charities: Charity[];
}

export default function SignUpFlow({ charities }: SignUpFlowProps) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [percentage, setPercentage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const handleNext = async () => {
    // Validate fields on step 1 before proceeding
    const isValid = await trigger();
    if (isValid) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const onSubmit = async () => {
    if (!selectedCharity) {
      toast.error("Please select a charity first.");
      return;
    }

    setLoading(true);
    setServerError(null);

    const values = getValues();

    // Sign up with Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          name: values.name,
          charity_id: selectedCharity.id,
          charity_percentage: percentage,
        },
      },
    });

    if (error) {
      setServerError(error.message);
      setLoading(false);
      return;
    }

    // If auto-logged in (email verification disabled)
    if (data?.session?.user) {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          charity_id: selectedCharity.id,
          charity_percentage: percentage,
        })
        .eq("id", data.session.user.id);

      if (updateError) {
        toast.error("Could not save charity selection: " + updateError.message);
      }
      
      toast.success("Account created successfully!");
      window.location.href = "/dashboard";
    } else {
      // Email confirmation required
      setSuccess(true);
      setLoading(false);
    }
  };

  const filteredCharities = charities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="w-full max-w-md bg-white border border-border shadow-xl rounded-2xl overflow-hidden">
      {success ? (
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-coral/10 rounded-full flex items-center justify-center text-coral">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <CardTitle className="font-heading text-2xl">Check your email</CardTitle>
          <p className="text-sm text-ink/70">
            We&apos;ve sent a confirmation link to your email. Once clicked, your charity split settings will be finalized, and you will be ready to play.
          </p>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => router.push("/login")}
          >
            Back to sign in
          </Button>
        </CardContent>
      ) : (
        <>
          <div className="h-1.5 bg-ink/10 w-full relative">
            <div
              className="absolute left-0 top-0 h-full bg-coral transition-all duration-300"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>

          <CardHeader>
            <CardTitle className="font-heading text-2xl font-bold text-ink">
              {step === 1 ? "Create your account" : "Pick your cause"}
            </CardTitle>
            <CardDescription>
              {step === 1
                ? "Enter your details to get started with causeClub."
                : "Choose the cause you play for. You can change this anytime."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {serverError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {serverError}
              </div>
            )}

            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full name</Label>
                  <Input
                    id="signup-name"
                    placeholder="Jane Smith"
                    autoComplete="name"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-ink hover:bg-ink/90 text-white rounded-xl py-6 mt-4"
                >
                  Continue <ChevronRight className="w-4 h-4 ml-2" />
                </Button>

                <div className="text-center text-sm text-ink/60 mt-4">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="font-semibold text-ink hover:text-coral underline underline-offset-4"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2 flex flex-col">
                  <Label>Selected Charity</Label>
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isPopoverOpen}
                        className="w-full justify-between h-12 px-4 rounded-xl border border-border bg-white text-ink text-left font-normal"
                      >
                        {selectedCharity ? (
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-6 h-6 rounded bg-ink/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {selectedCharity.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={selectedCharity.logo_url}
                                  alt=""
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Heart className="w-3.5 h-3.5 text-coral/50" />
                              )}
                            </div>
                            <span className="truncate font-semibold text-sm">{selectedCharity.name}</span>
                          </div>
                        ) : (
                          <span className="text-ink/50 text-sm">Select a charity...</span>
                        )}
                        <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50 rotate-90" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 bg-white border border-border rounded-xl shadow-xl max-h-[300px] overflow-y-auto flex flex-col gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
                        <Input
                          placeholder="Search charities..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1 mt-1">
                        {filteredCharities.length === 0 ? (
                          <p className="text-xs text-ink/50 text-center py-4">No charity found.</p>
                        ) : (
                          filteredCharities.map((charity) => (
                            <button
                              key={charity.id}
                              onClick={() => {
                                setSelectedCharity(charity);
                                setIsPopoverOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-ink/5 flex items-center justify-between transition-colors"
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <div className="w-5 h-5 rounded bg-ink/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {charity.logo_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={charity.logo_url}
                                      alt=""
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <Heart className="w-3 h-3 text-coral/50" />
                                  )}
                                </div>
                                <span className="truncate font-medium">{charity.name}</span>
                              </div>
                              {selectedCharity?.id === charity.id && (
                                <Check className="w-3.5 h-3.5 text-coral flex-shrink-0" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Contribution Split</Label>
                    <span className="text-sm font-bold text-coral">
                      {percentage}%
                    </span>
                  </div>
                  <Slider
                    min={10}
                    max={100}
                    step={5}
                    value={percentage}
                    onValueChange={(val) => setPercentage(val)}
                    className="py-2"
                  />
                  <div className="flex justify-between text-[10px] text-ink/40 font-semibold uppercase tracking-wider">
                    <span>10% min</span>
                    <span>100% max</span>
                  </div>

                  {selectedCharity && (
                    <div className="rounded-xl bg-coral/5 border border-coral/10 p-3.5 text-xs text-ink/80 flex items-start gap-2.5">
                      <Heart className="w-4 h-4 text-coral mt-0.5 fill-coral/10 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-ink">Live Calculation: </span>
                        <span>
                          £{(9.99 * (percentage / 100)).toFixed(2)} of your £9.99 monthly subscription goes directly to {selectedCharity.name}.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleBack}
                    className="flex-shrink-0 rounded-xl"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={loading || !selectedCharity}
                    className="w-full bg-ink hover:bg-ink/90 text-white rounded-xl py-6"
                  >
                    {loading ? "Creating account..." : "Complete Sign Up"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}
