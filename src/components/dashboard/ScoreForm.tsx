"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Minus, Info, Target } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createScore } from "@/app/(dashboard)/dashboard/scores/actions";

const scoreFormSchema = z.object({
  score: z
    .number({ message: "Score must be a number" })
    .int("Score must be a whole number")
    .min(1, "Score must be at least 1")
    .max(45, "Score cannot exceed 45"),
  date: z.date({ message: "Date is required" }).max(new Date(), "Date cannot be in the future"),
});

type ScoreFormValues = z.infer<typeof scoreFormSchema>;

interface ScoreFormProps {
  onSuccess: () => void;
  oldestScoreDate: string | null;
}

export function ScoreForm({ onSuccess, oldestScoreDate }: ScoreFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ScoreFormValues>({
    resolver: zodResolver(scoreFormSchema),
    defaultValues: {
      score: 36,
      date: new Date(),
    },
  });

  const scoreValue = watch("score");

  const increment = () => {
    const current = scoreValue ?? 36;
    if (current < 45) {
      setValue("score", current + 1, { shouldValidate: true });
    }
  };

  const decrement = () => {
    const current = scoreValue ?? 36;
    if (current > 1) {
      setValue("score", current - 1, { shouldValidate: true });
    }
  };

  async function onSubmit(data: ScoreFormValues) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("score", data.score.toString());
      formData.append("date", data.date.toISOString());

      const result = await createScore(formData);
      if (result.success) {
        toast.success("Score logged successfully");
        if (result.oldestRemoved) {
          toast.warning("Oldest score removed to keep your latest 5");
        }
        reset({
          score: 36,
          date: new Date(),
        });
        onSuccess();
      } else {
        toast.error(result.error || "Failed to log score");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred while logging your score.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card">
      <div className="mb-5">
        <h3 className="font-heading text-lg font-semibold text-ink">Log New Score</h3>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Enter your stableford points and the date of the round.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Score Input with +/- controls */}
        <div className="space-y-2">
          <Label htmlFor="score" className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
            Stableford Score (1-45)
          </Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={decrement}
              disabled={isSubmitting || (scoreValue !== undefined && scoreValue <= 1)}
              className="h-11 w-11 shrink-0 rounded-lg flex items-center justify-center border border-border bg-white text-ink hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-40"
              aria-label="Decrease score"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="relative flex-1">
              <Input
                id="score"
                type="number"
                disabled={isSubmitting}
                className={cn(
                  "h-11 text-center font-heading text-lg font-bold border-border bg-white text-ink focus-visible:ring-ink [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                  errors.score && "border-destructive focus-visible:ring-destructive"
                )}
                {...register("score", { valueAsNumber: true })}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={increment}
              disabled={isSubmitting || (scoreValue !== undefined && scoreValue >= 45)}
              className="h-11 w-11 shrink-0 rounded-lg flex items-center justify-center border border-border bg-white text-ink hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-40"
              aria-label="Increase score"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.score && (
            <p className="text-xs font-medium text-destructive mt-1">{errors.score.message}</p>
          )}
        </div>

        {/* Date Selection via Popover + Calendar */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
            Round Date
          </Label>
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full justify-start text-left font-normal h-11 px-3 border border-border bg-white text-ink hover:bg-neutral-50",
                      !field.value && "text-[#9CA3AF]",
                      errors.date && "border-destructive focus-visible:ring-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#6B7280]" />
                    {field.value ? format(field.value, "eeee, d MMMM yyyy") : <span>Select round date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date || new Date());
                      setIsCalendarOpen(false);
                    }}
                    disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.date && (
            <p className="text-xs font-medium text-destructive mt-1">{errors.date.message}</p>
          )}
        </div>

        {/* Warning Badge if 5 scores logged */}
        {/* Golf Motivation */}
        <div className="flex items-start gap-2.5 rounded-xl bg-coral/5 border border-coral/10 p-3.5 text-xs">
          <Target className="h-4 w-4 shrink-0 text-accent mt-0.5" />
          <div>
            <span className="font-semibold text-ink">Lower handicap, higher stakes</span>
            <span className="text-[#6B7280]">
              {" "}&mdash; The better your stableford score, the more numbers you match. Every point counts.
            </span>
          </div>
        </div>

          {oldestScoreDate && (
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50/50 border border-amber-200/40 p-3.5 text-xs text-amber-800 animate-in fade-in slide-in-from-top-1 duration-200">
            <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-900">Oldest score replaced:</span> Saving this will remove the score of{" "}
              <span className="font-semibold text-amber-950">
                {format(new Date(oldestScoreDate), "d MMMM yyyy")}
              </span>{" "}
              to keep only your 5 latest rounds.
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full h-11 text-sm font-semibold rounded-xl"
        >
          {isSubmitting ? "Logging Score..." : "Log Round"}
        </Button>
      </form>
    </div>
  );
}
