"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { m, AnimatePresence } from "framer-motion";
import { CalendarIcon, Plus, Minus, Edit2, Trash2, X, Check, Trash } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { updateScore, deleteScore } from "@/app/(dashboard)/dashboard/scores/actions";

/* ─── Validation Schema for Edit ────────────────────── */
const editScoreSchema = z.object({
  score: z
    .number({ message: "Score must be a number" })
    .int("Score must be a whole number")
    .min(1, "Score must be at least 1")
    .max(45, "Score cannot exceed 45"),
  date: z.date({ message: "Date is required" }).max(new Date(), "Date cannot be in the future"),
});

type EditScoreValues = z.infer<typeof editScoreSchema>;

interface ScoreRow {
  id: string;
  score: number;
  date: string;
  created_at: string;
}

interface ScoreListProps {
  scores: ScoreRow[];
  onRefresh: () => void;
}

export function ScoreList({ scores, onRefresh }: ScoreListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle deletion execution
  async function confirmDelete() {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await deleteScore(deleteTargetId);
      if (res.success) {
        toast.success("Score deleted successfully");
        onRefresh();
      } else {
        toast.error(res.error || "Failed to delete score");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred while deleting your score.");
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeleteTargetId(null);
    }
  }

  // Handle edit save
  async function handleSave(id: string, scoreVal: number, dateVal: string) {
    try {
      const res = await updateScore(id, scoreVal, dateVal);
      if (res.success) {
        toast.success("Score updated successfully");
        setEditingId(null);
        onRefresh();
        return true;
      } else {
        toast.error(res.error || "Failed to update score");
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred while updating your score.");
      return false;
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="font-heading text-lg font-semibold text-ink">Recent Rounds</h3>
        <span className="text-xs text-[#6B7280] font-medium">
          {scores.length} / 5 rounds logged
        </span>
      </div>

      {/* Empty State */}
      {scores.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-[#9CA3AF] mb-4">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <h4 className="font-heading text-base font-semibold text-ink">No scores logged</h4>
          <p className="mt-1.5 text-xs text-[#6B7280] max-w-xs leading-normal">
            Track your first score to enter the monthly draw. We only keep your last 5 rounds.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {scores.map((s) => {
              const isEditing = editingId === s.id;
              return (
                <m.div
                  key={s.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  layout
                  className="card p-4 hover:border-neutral-300 transition-colors duration-200"
                >
                  {isEditing ? (
                    <InlineEditRow
                      score={s}
                      onSave={(scoreVal, dateVal) => handleSave(s.id, scoreVal, dateVal)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      {/* Left: Score display in Fraunces font */}
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-neutral-50/50 border border-neutral-100 font-heading text-4xl font-extrabold tracking-tight select-none",
                            s.score > 30 ? "text-coral" : "text-ink"
                          )}
                        >
                          {s.score}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-ink">
                            {s.score} Stableford Points
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            Played on {format(new Date(s.date), "eeee, d MMMM yyyy")}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setEditingId(s.id)}
                          className="h-11 w-11 p-0 rounded-xl border border-border bg-white text-ink hover:bg-neutral-50 flex items-center justify-center shrink-0"
                          aria-label="Edit round score"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setDeleteTargetId(s.id);
                            setIsDeleteOpen(true);
                          }}
                          className="h-11 w-11 p-0 rounded-xl border border-border bg-white text-ink hover:text-destructive hover:bg-red-50/50 flex items-center justify-center shrink-0"
                          aria-label="Delete round score"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </m.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-destructive mb-2">
              <Trash className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="font-heading text-lg font-semibold text-ink">Delete Round Score</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#6B7280] leading-normal">
              Are you sure you want to delete this score? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="btn-secondary h-11 px-4 text-xs font-semibold rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="btn-primary bg-destructive hover:bg-destructive/90 text-white h-11 px-4 text-xs font-semibold rounded-xl"
            >
              {isDeleting ? "Deleting..." : "Delete Score"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ─── Inline Edit Component ─────────────────────────── */
interface InlineEditRowProps {
  score: ScoreRow;
  onSave: (scoreVal: number, dateVal: string) => Promise<boolean>;
  onCancel: () => void;
}

function InlineEditRow({ score, onSave, onCancel }: InlineEditRowProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Parse existing date safely
  const parsedDate = new Date(score.date);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditScoreValues>({
    resolver: zodResolver(editScoreSchema),
    defaultValues: {
      score: score.score,
      date: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
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

  async function onSubmit(data: EditScoreValues) {
    setIsSubmitting(true);
    const dateFormatted = data.date.toISOString().split("T")[0];
    const success = await onSave(data.score, dateFormatted);
    if (!success) {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-start">
        {/* Score edit field */}
        <div className="flex-1 space-y-1.5">
          <Label htmlFor={`edit-score-${score.id}`} className="text-[10px] font-semibold uppercase tracking-wider text-[#8C8C96]">
            Score (1-45)
          </Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={decrement}
              disabled={isSubmitting || (scoreValue !== undefined && scoreValue <= 1)}
              className="h-11 w-11 shrink-0 rounded-xl flex items-center justify-center border border-border bg-white text-ink hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-40"
              aria-label="Decrease score"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              id={`edit-score-${score.id}`}
              type="number"
              disabled={isSubmitting}
              className={cn(
                "h-11 text-center font-heading text-base font-bold border-border bg-white text-ink focus-visible:ring-ink [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                errors.score && "border-destructive focus-visible:ring-destructive"
              )}
              {...register("score", { valueAsNumber: true })}
            />
            <Button
              type="button"
              variant="outline"
              onClick={increment}
              disabled={isSubmitting || (scoreValue !== undefined && scoreValue >= 45)}
              className="h-11 w-11 shrink-0 rounded-xl flex items-center justify-center border border-border bg-white text-ink hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-40"
              aria-label="Increase score"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          {errors.score && (
            <p className="text-[10px] font-medium text-destructive mt-0.5">{errors.score.message}</p>
          )}
        </div>

        {/* Date edit field */}
        <div className="flex-1 space-y-1.5">
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-[#8C8C96]">
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
                      "w-full justify-start text-left font-normal h-11 px-3 border border-border bg-white text-ink hover:bg-neutral-50 rounded-xl",
                      !field.value && "text-[#9CA3AF]",
                      errors.date && "border-destructive focus-visible:ring-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#6B7280] shrink-0" />
                    <span className="truncate">
                      {field.value ? format(field.value, "d MMM yyyy") : <span>Date</span>}
                    </span>
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
            <p className="text-[10px] font-medium text-destructive mt-0.5">{errors.date.message}</p>
          )}
        </div>
      </div>

      {/* Save / Cancel buttons */}
      <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-dashed border-border mt-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-11 px-4 text-xs font-semibold rounded-xl border border-border hover:bg-neutral-50 text-ink flex items-center justify-center gap-1.5"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary h-11 px-4 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
        >
          <Check className="h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
