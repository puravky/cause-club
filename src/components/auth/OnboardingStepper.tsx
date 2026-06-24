"use client";

import { useState } from "react";
import { updateOnboardingPreferences } from "@/app/(dashboard)/dashboard/charity/actions";
import { Heart, Check, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface Charity {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
}

interface OnboardingStepperProps {
  charities: Charity[];
}

export function OnboardingStepper({ charities }: OnboardingStepperProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [percentage, setPercentage] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNextStep = () => {
    if (step === 1 && selectedId) {
      setStep(2);
    }
  };

  const handleComplete = async () => {
    if (!selectedId) {
      toast.error("Please select a charity first.");
      return;
    }
    setIsSubmitting(true);
    
    const result = await updateOnboardingPreferences(selectedId, percentage);

    setIsSubmitting(false);

    if (result && !result.success) {
      toast.error(result.error || "Failed to save preferences");
    } else {
      toast.success("Preferences saved successfully! Welcome to causeClub.");
      // Force a hard navigation to dashboard to bypass middleware cache
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Stepper Header */}
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-ink/10 -z-10" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-coral transition-all duration-500 -z-10" style={{ width: step === 2 ? '100%' : '50%' }} />
        
        <div className={`flex flex-col items-center gap-2 ${step >= 1 ? 'text-coral' : 'text-ink/40'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors duration-500 ${step >= 1 ? 'bg-coral' : 'bg-ink/20'}`}>
            {step > 1 ? <CheckCircle2 className="w-6 h-6" /> : "1"}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider">Select Cause</span>
        </div>

        <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-coral' : 'text-ink/40'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors duration-500 ${step >= 2 ? 'bg-coral' : 'bg-ink/20'}`}>
            2
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider">Set Split</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-border shadow-xl p-6 sm:p-10">
        
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="font-heading text-3xl font-bold text-ink">Who do you play for?</h2>
              <p className="text-ink/70">
                Choose the charity that will receive your subscription split. You can change this at any time in your dashboard.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto p-2">
              {charities.map(charity => {
                const isSelected = selectedId === charity.id;
                return (
                  <div 
                    key={charity.id}
                    onClick={() => setSelectedId(charity.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                      isSelected ? "border-coral bg-coral/5" : "border-transparent bg-ink/5 hover:border-coral/50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                      {charity.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={charity.logo_url} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <Heart className="w-6 h-6 text-coral/50" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-ink line-clamp-1">{charity.name}</h3>
                      <p className="text-xs text-ink/60 line-clamp-1">{charity.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button 
                onClick={handleNextStep} 
                disabled={!selectedId}
                className="bg-coral hover:bg-coral/90 text-white rounded-full px-8 py-6 text-lg"
              >
                Next Step <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="font-heading text-3xl font-bold text-ink">Set your contribution</h2>
              <p className="text-ink/70">
                A minimum of 10% from your £9.99 monthly subscription goes directly to your selected charity.
              </p>
            </div>

            <div className="py-12 px-4 space-y-8 max-w-md mx-auto">
              <div className="text-center">
                <span className="font-heading text-6xl font-bold text-coral">{percentage}%</span>
                <p className="text-ink/60 font-semibold uppercase tracking-wider mt-2">£{(9.99 * (percentage/100)).toFixed(2)} per month</p>
              </div>

              <div>
                <Slider
                  min={10}
                  max={100}
                  step={5}
                  value={percentage}
                  onValueChange={(val) => setPercentage(val)}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-ink/40 font-semibold uppercase tracking-wider">
                  <span>10% min</span>
                  <span>100% max</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border items-center">
              <Button 
                variant="ghost" 
                onClick={() => setStep(1)}
                className="text-ink/60 hover:text-ink"
              >
                Back
              </Button>
              <Button 
                onClick={handleComplete} 
                disabled={isSubmitting}
                className="bg-ink hover:bg-ink/90 text-white rounded-full px-8 py-6 text-lg"
              >
                {isSubmitting ? "Completing setup..." : (
                  <>Complete Setup <Check className="w-5 h-5 ml-2" /></>
                )}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
