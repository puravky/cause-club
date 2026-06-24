"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { submitClaim } from "@/app/(dashboard)/dashboard/draws/[drawId]/claim/actions";
import { toast } from "sonner";
import { FileText, Loader2, CheckCircle, Clock, XCircle, DollarSign } from "lucide-react";

interface ClaimFormProps {
  drawId: string;
  userId: string;
  verificationStatus: string;
  payoutStatus: string;
}

export function ClaimForm({ drawId, userId, verificationStatus, payoutStatus }: ClaimFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Upload to Supabase Storage
      const ext = file.name.split(".").pop();
      const filePath = `${userId}/${drawId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("proofs")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // 2. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("proofs")
        .getPublicUrl(filePath);

      // 3. Update draw_results using Server Action
      const res = await submitClaim(drawId, publicUrlData.publicUrl);
      
      if (!res.success) {
        throw new Error(res.error || "Failed to submit claim");
      }

      toast.success("Proof uploaded successfully!");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred during upload.";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const renderStatus = () => {
    if (payoutStatus === "paid") {
      return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4 text-ink">
          <DollarSign className="w-12 h-12 text-coral" />
          <h3 className="text-xl font-heading font-semibold">Winnings Paid</h3>
          <p className="text-sm text-center">Your prize has been transferred to your account.</p>
        </div>
      );
    }

    if (verificationStatus === "approved") {
      return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4 text-ink">
          <CheckCircle className="w-12 h-12 text-coral" />
          <h3 className="text-xl font-heading font-semibold">Verification Approved</h3>
          <p className="text-sm text-center">Your proof has been reviewed and accepted. Your payout is pending.</p>
        </div>
      );
    }

    if (verificationStatus === "rejected") {
      return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4 text-red-600">
          <XCircle className="w-12 h-12" />
          <h3 className="text-xl font-heading font-semibold">Verification Rejected</h3>
          <p className="text-sm text-center">Your uploaded proof was not accepted. Please review the admin notes and contact support.</p>
        </div>
      );
    }

    if (verificationStatus === "submitted") {
      return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4 text-ink">
          <Clock className="w-12 h-12 text-coral opacity-80" />
          <h3 className="text-xl font-heading font-semibold">Under Review</h3>
          <p className="text-sm text-center">Your proof has been submitted and is currently being reviewed by our team.</p>
        </div>
      );
    }

    // Default: Pending Upload
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4 bg-ink/5 p-4 rounded-lg">
          <div className="p-3 bg-coral/10 rounded-full">
            <FileText className="w-6 h-6 text-coral" />
          </div>
          <div>
            <h4 className="font-medium text-ink">Upload Scorecard Proof</h4>
            <p className="text-sm text-ink/70">Accepted formats: JPG, PNG, PDF (Max 5MB)</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="proof-file">Select file</Label>
          <Input
            id="proof-file"
            type="file"
            accept="image/png, image/jpeg, application/pdf"
            onChange={handleFileChange}
            disabled={isUploading}
            className="file:bg-coral file:text-white file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:font-medium hover:file:bg-coral/90 cursor-pointer"
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full bg-coral hover:bg-coral/90 text-white transition-colors"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            "Submit Proof"
          )}
        </Button>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto rounded-2xl shadow-sm border-ink/10 overflow-hidden">
      <CardHeader className="bg-ink text-white p-6">
        <CardTitle className="font-heading text-2xl">Claim Your Winnings</CardTitle>
        <CardDescription className="text-white/80">
          Verify your scorecard to process your prize payout.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 bg-paper">
        {renderStatus()}
      </CardContent>
    </Card>
  );
}
