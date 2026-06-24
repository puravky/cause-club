"use client";

import { useState } from "react";
import { changeCharity, updateCharityPercentage } from "@/app/(dashboard)/dashboard/charity/actions";
import { Heart, Check, Search, CreditCard, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "next/image";
import { Json } from "@/types/database.types";

interface Charity {
  id: string;
  name: string;
  description: string | null;
  images: string[] | null;
  logo_url: string | null;
  events: Json | null;
  featured: boolean | null;
}

interface UserProfile {
  charity_id: string | null;
  charity_percentage: number;
}

interface Donation {
  id: string;
  amount: number;
  type: string;
  created_at: string;
  charity_name: string;
}

interface CharityClientProps {
  charities: Charity[];
  userProfile: UserProfile;
  donations: Donation[];
}

export function CharityClient({ charities, userProfile, donations }: CharityClientProps) {
  const [selectedId, setSelectedId] = useState<string | null>(userProfile.charity_id);
  const [percentage, setPercentage] = useState<number>(userProfile.charity_percentage || 10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [isDonating, setIsDonating] = useState(false);

  const currentSelection = charities.find((c) => c.id === selectedId);

  // Total donated via user
  const totalDonated = donations.reduce((acc, curr) => acc + curr.amount, 0);

  // Filter for search dialog
  const filteredCharities = charities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectCharity = async (id: string) => {
    setSelectedId(id);
    setIsDialogOpen(false);
    
    const result = await changeCharity(id);
      
    if (result && !result.success) {
      toast.error(result.error || "Failed to update selected charity.");
    } else {
      toast.success("Charity updated successfully.");
    }
  };

  const handlePercentageChange = async (newPercent: number) => {
    setPercentage(newPercent);
    
    const result = await updateCharityPercentage(newPercent);

    if (result && !result.success) {
      toast.error(result.error || "Failed to update contribution split.");
    } else {
      toast.success("Contribution split updated.");
    }
  };

  const handleIndependentDonation = async () => {
    if (!selectedId) {
      toast.error("Please select a charity first.");
      return;
    }
    
    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setIsDonating(true);
    try {
      const response = await fetch("/api/stripe/checkout/independent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          charityId: selectedId,
        }),
      });
      
      const { url, error } = await response.json();
      if (error) throw new Error(error);

      if (url) {
        window.location.assign(url);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to initialize donation.";
      toast.error(message);
      setIsDonating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink">Your Impact</h1>
        <p className="mt-1.5 text-sm text-[#6B7280]">
          Manage your charitable splits and track the impact of your play.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Selection & Donation */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Settings Control Panel */}
          <Card className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
            <CardHeader className="bg-ink/[0.01] border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-heading text-lg font-semibold text-ink">Active Cause</CardTitle>
                <CardDescription>
                  Your selected charity receives your subscription split.
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-9 px-4 text-xs font-semibold">
                    Change Charity
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl bg-paper sm:rounded-2xl border-none shadow-xl">
                  <DialogHeader>
                    <DialogTitle className="font-heading text-2xl text-ink">Search Charities</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/50" />
                      <Input 
                        placeholder="Search by name or cause..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white"
                      />
                    </div>
                    <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                      {filteredCharities.map(charity => (
                        <div 
                          key={charity.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-border bg-white hover:border-coral transition-colors cursor-pointer"
                          onClick={() => handleSelectCharity(charity.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded overflow-hidden bg-ink/5 flex-shrink-0">
                              {charity.logo_url ? (
                                <Image
                                  src={charity.logo_url}
                                  alt={charity.name}
                                  fill
                                  className="object-contain"
                                  sizes="40px"
                                />
                              ) : (
                                <Heart className="w-5 h-5 m-2.5 text-ink/40" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-ink">{charity.name}</p>
                              <p className="text-xs text-ink/60 line-clamp-1">{charity.description}</p>
                            </div>
                          </div>
                          {selectedId === charity.id && (
                            <Check className="w-5 h-5 text-coral flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              {/* Selected Charity Details */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-border bg-ink/5 flex items-center justify-center flex-shrink-0">
                  {currentSelection?.logo_url ? (
                    <Image
                      src={currentSelection.logo_url}
                      alt={currentSelection.name}
                      fill
                      className="object-contain rounded-xl"
                      sizes="64px"
                    />
                  ) : (
                    <Heart className="w-8 h-8 text-coral/50" />
                  )}
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-ink">
                    {currentSelection ? currentSelection.name : "No Charity Selected"}
                  </h3>
                  <p className="text-sm text-ink/70">
                    £{totalDonated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} donated via your account so far.
                  </p>
                </div>
              </div>

              {/* Slider Split */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Subscription Split</span>
                  <span className="text-sm font-bold text-coral flex items-center gap-1">
                    {percentage}% (£{(9.99 * (percentage / 100)).toFixed(2)}/mo)
                  </span>
                </div>
                <div>
                  <Slider
                    min={10}
                    max={100}
                    step={5}
                    value={percentage}
                    onValueChange={handlePercentageChange}
                    className="py-4"
                  />
                  <p className="text-xs text-ink/50 mt-1">Minimum 10% per platform rules.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Table */}
          <Card className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
            <CardHeader className="bg-ink/[0.01] border-b border-border">
              <CardTitle className="font-heading text-lg font-semibold text-ink flex items-center gap-2">
                <History className="w-4 h-4" /> Donation History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {donations.length === 0 ? (
                <div className="p-8 text-center text-ink/60 text-sm">
                  No donations recorded yet. Your monthly splits will appear here.
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-ink/5 text-ink/60 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Charity</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {donations.map(d => (
                      <tr key={d.id} className="hover:bg-ink/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-ink">
                          {new Date(d.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-ink">
                          {d.charity_name}
                        </td>
                        <td className="px-6 py-4 text-ink/70">
                          {d.type === 'independent' ? 'One-time' : 'Subscription Split'}
                        </td>
                        <td className="px-6 py-4 font-bold text-ink text-right">
                          £{d.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Independent Donation */}
        <div className="lg:col-span-1">
          <Card className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden sticky top-8">
            <CardHeader className="bg-coral text-white">
              <CardTitle className="font-heading text-lg font-semibold flex items-center gap-2">
                <Heart className="w-5 h-5 fill-current" /> Extra Support
              </CardTitle>
              <CardDescription className="text-white/80">
                Make a one-time independent donation to your active cause.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Amount (GBP)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/50 font-medium">£</span>
                  <Input 
                    type="number"
                    min="1"
                    step="1"
                    placeholder="25"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    className="pl-8 bg-white"
                  />
                </div>
              </div>
              <Button 
                onClick={handleIndependentDonation}
                disabled={isDonating || !donationAmount || !selectedId}
                className="w-full bg-ink hover:bg-ink/90 text-white"
              >
                {isDonating ? "Processing..." : "Donate Now"}
              </Button>
              <p className="text-xs text-center text-ink/50 flex items-center justify-center gap-1">
                <CreditCard className="w-3 h-3" /> Secure payment via Stripe
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
