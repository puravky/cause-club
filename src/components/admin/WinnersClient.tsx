"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { CheckCircle2, AlertCircle, XCircle, DollarSign, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { reviewSubmission, markPayoutPaid } from "@/app/(admin)/admin/winners/actions";

interface DrawResult {
  id: string;
  match_type: number;
  prize_amount: number;
  verification_status: string;
  payout_status: string;
  proof_url: string;
  admin_note: string | null;
  draws: {
    month: number;
    year: number;
  };
  users: {
    email: string;
  };
}

interface WinnersClientProps {
  results: DrawResult[];
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function WinnersClient({ results }: WinnersClientProps) {
  const [selectedResult, setSelectedResult] = useState<DrawResult | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReview = async (approve: boolean) => {
    if (!selectedResult) return;
    if (!approve && !adminNote.trim()) {
      toast.error("Please provide a note when rejecting.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await reviewSubmission(selectedResult.id, approve, adminNote);
      if (!res.success) throw new Error(res.error);

      toast.success(`Submission ${approve ? "approved" : "rejected"} successfully.`);
      setSelectedResult(null);
      setAdminNote("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred.";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    if (!confirm("Are you sure you want to mark this payout as paid?")) return;

    setIsProcessing(true);
    try {
      const res = await markPayoutPaid(id);
      if (!res.success) throw new Error(res.error);

      toast.success("Payout marked as paid.");
      if (selectedResult?.id === id) {
        setSelectedResult(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred.";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (verificationStatus: string, payoutStatus: string) => {
    if (payoutStatus === "paid") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> Paid
        </span>
      );
    }
    if (verificationStatus === "approved") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> Approved
        </span>
      );
    }
    if (verificationStatus === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
          <XCircle className="h-3.5 w-3.5" /> Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
        <AlertCircle className="h-3.5 w-3.5" /> Pending Review
      </span>
    );
  };

  // Replace default supabase public URL with width transform for thumbnail
  const getThumbnailUrl = (url: string) => {
    return `${url}?width=200&quality=80`;
  };

  const getFullImageUrl = (url: string) => {
    return `${url}?width=800&quality=80`;
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto bg-white rounded-2xl border border-border shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-ink/5">
              <th className="px-6 py-4 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">User</th>
              <th className="px-6 py-4 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Draw</th>
              <th className="px-6 py-4 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Match</th>
              <th className="px-6 py-4 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Prize</th>
              <th className="px-6 py-4 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Proof</th>
              <th className="px-6 py-4 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {results.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#6B7280]">
                  No verification submissions found.
                </td>
              </tr>
            ) : (
              results.map((result) => (
                <tr 
                  key={result.id} 
                  className="hover:bg-ink/5 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedResult(result);
                    setAdminNote(result.admin_note || "");
                  }}
                >
                  <td className="px-6 py-4 font-medium text-ink">{result.users.email}</td>
                  <td className="px-6 py-4 text-[#6B7280]">
                    {MONTHS[result.draws.month - 1]} {result.draws.year}
                  </td>
                  <td className="px-6 py-4 text-[#6B7280]">Tier {result.match_type}</td>
                  <td className="px-6 py-4 font-semibold text-ink">£{result.prize_amount}</td>
                  <td className="px-6 py-4">
                    {result.proof_url ? (
                      <div className="w-12 h-12 rounded overflow-hidden border border-border bg-ink/5 flex items-center justify-center relative">
                        <Image
                          src={getThumbnailUrl(result.proof_url)}
                          alt="Proof Thumbnail"
                          fill
                          className="object-cover"
                          sizes="48px"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded border border-border bg-ink/5 flex items-center justify-center text-[#6B7280]">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(result.verification_status, result.payout_status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
        <DialogContent className="max-w-2xl bg-paper sm:rounded-2xl border-none shadow-xl max-h-[90vh] overflow-y-auto">
          {selectedResult && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl text-ink">Review Submission</DialogTitle>
                <DialogDescription className="text-ink/70">
                  {selectedResult.users.email} • {MONTHS[selectedResult.draws.month - 1]} {selectedResult.draws.year} • £{selectedResult.prize_amount}
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 space-y-6">
                <div className="w-full rounded-xl overflow-hidden border border-border bg-ink/5 flex items-center justify-center min-h-[300px] relative">
                  {selectedResult.proof_url ? (
                    <Image
                      src={getFullImageUrl(selectedResult.proof_url)}
                      alt="Full Proof"
                      fill
                      className="object-contain"
                      sizes="800px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#6B7280] p-12">
                      <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
                      <p>No proof image available</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-ink text-sm uppercase tracking-wider">Current Status</h4>
                    <div className="mt-2">
                      {getStatusBadge(selectedResult.verification_status, selectedResult.payout_status)}
                    </div>
                  </div>
                </div>

                {selectedResult.verification_status === "submitted" && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="space-y-2">
                      <Label htmlFor="admin-note">Admin Note (Required for rejection)</Label>
                      <Input 
                        id="admin-note" 
                        placeholder="Reason for rejection or internal note..." 
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        className="bg-white border-border text-ink"
                      />
                    </div>
                    
                    <div className="flex gap-3 justify-end">
                      <Button 
                        variant="outline" 
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleReview(false)}
                        disabled={isProcessing || !adminNote.trim()}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleReview(true)}
                        disabled={isProcessing}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                )}

                {selectedResult.verification_status === "approved" && selectedResult.payout_status !== "paid" && (
                  <div className="pt-4 border-t border-border flex justify-end">
                    <Button 
                      className="bg-coral hover:bg-coral/90 text-white"
                      onClick={() => handleMarkPaid(selectedResult.id)}
                      disabled={isProcessing}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Mark as Paid
                    </Button>
                  </div>
                )}

                {selectedResult.verification_status === "rejected" && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold text-red-600 text-sm">Rejection Note:</h4>
                    <p className="mt-1 text-sm text-ink">{selectedResult.admin_note}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
