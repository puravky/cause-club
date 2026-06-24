"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Heart, Search, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { addCharity, updateCharity, deleteCharity } from "@/app/(admin)/admin/charities/actions";

import { Json } from "@/types/database.types";

interface Charity {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  stripe_account_id: string | null;
  featured: boolean | null;
  images: string[] | null;
  events: Json | null;
  donations: { amount: number }[];
  users: { id: string }[];
}

interface CharitiesAdminProps {
  charities: Charity[];
}

export function CharitiesAdmin({ charities }: CharitiesAdminProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo_url: "",
    website: "",
    stripe_account_id: "",
    featured: false,
    images: "",
    events: "",
  });

  const filteredCharities = charities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (charity?: Charity) => {
    if (charity) {
      setEditingCharity(charity);
      setFormData({
        name: charity.name || "",
        description: charity.description || "",
        logo_url: charity.logo_url || "",
        website: charity.website || "",
        stripe_account_id: charity.stripe_account_id || "",
        featured: !!charity.featured,
        images: charity.images?.join(", ") || "",
        events: charity.events ? JSON.stringify(charity.events, null, 2) : "[]",
      });
    } else {
      setEditingCharity(null);
      setFormData({
        name: "",
        description: "",
        logo_url: "",
        website: "",
        stripe_account_id: "",
        featured: false,
        images: "",
        events: "[]",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    setIsProcessing(true);
    try {
      let parsedEvents = [];
      try {
        if (formData.events) parsedEvents = JSON.parse(formData.events);
      } catch {
        throw new Error("Invalid JSON in Events field");
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        logo_url: formData.logo_url,
        website: formData.website,
        stripe_account_id: formData.stripe_account_id,
        featured: formData.featured,
        images: formData.images.split(",").map(s => s.trim()).filter(Boolean),
        events: parsedEvents,
      };

      let res;
      if (editingCharity) {
        res = await updateCharity(editingCharity.id, payload);
      } else {
        res = await addCharity(payload);
      }

      if (!res.success) throw new Error(res.error);

      toast.success(`Charity ${editingCharity ? "updated" : "added"} successfully`);
      setIsDialogOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save charity";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this charity? All associated records may be affected.")) return;
    
    setIsProcessing(true);
    try {
      const res = await deleteCharity(id);
      if (!res.success) throw new Error(res.error);
      toast.success("Charity deleted");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete charity";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/50" />
          <Input 
            placeholder="Search causes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-ink/5 border-transparent"
          />
        </div>
        <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto bg-ink hover:bg-ink/90 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Charity
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-ink/5">
              <th className="px-6 py-4 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Cause</th>
              <th className="px-6 py-4 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Raised</th>
              <th className="px-6 py-4 font-semibold text-[#6B7280] text-xs uppercase tracking-wider">Supporters</th>
              <th className="px-6 py-4 font-semibold text-[#6B7280] text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredCharities.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-ink/50">
                  No charities found.
                </td>
              </tr>
            ) : (
              filteredCharities.map((c) => {
                const totalRaised = c.donations?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
                const supportersCount = c.users?.length || 0;

                return (
                  <tr key={c.id} className="hover:bg-ink/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-ink/5 border border-border overflow-hidden flex items-center justify-center flex-shrink-0">
                          {c.logo_url ? (
                            <Image
                              src={c.logo_url}
                              alt={c.name}
                              fill
                              className="object-contain"
                              sizes="40px"
                            />
                          ) : (
                            <Heart className="w-4 h-4 text-ink/30" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-ink line-clamp-1">{c.name}</p>
                          <p className="text-xs text-ink/60 line-clamp-1">{c.website || "No website"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {c.featured ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-coral/10 px-2.5 py-0.5 text-xs font-semibold text-coral">
                          <CheckCircle2 className="w-3 h-3" /> Featured
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-semibold text-ink/60">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      £{totalRaised.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-ink/70">
                      {supportersCount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(c)} className="h-8 w-8 text-ink/70 hover:text-ink">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} disabled={isProcessing} className="h-8 w-8 text-red-600/70 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-paper sm:rounded-2xl border-none shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl text-ink">
              {editingCharity ? "Edit Cause" : "Add New Cause"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea 
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                rows={4}
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input value={formData.logo_url} onChange={e => setFormData({...formData, logo_url: e.target.value})} placeholder="https://" />
              </div>
              <div className="space-y-2">
                <Label>Stripe Account ID</Label>
                <Input value={formData.stripe_account_id} onChange={e => setFormData({...formData, stripe_account_id: e.target.value})} placeholder="acct_123..." />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gallery Image URLs (comma separated)</Label>
              <Input value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})} placeholder="https://img1.jpg, https://img2.jpg" />
            </div>

            <div className="space-y-2">
              <Label>Events (JSON format)</Label>
              <textarea 
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm font-mono text-xs"
                rows={4}
                value={formData.events} 
                onChange={e => setFormData({...formData, events: e.target.value})}
                placeholder='[{"name": "Marathon", "date": "2024-10-01", "impact": "Health"}]'
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="featured"
                checked={formData.featured}
                onChange={e => setFormData({...formData, featured: e.target.checked})}
                className="rounded border-border text-coral focus:ring-coral"
              />
              <Label htmlFor="featured">Featured Cause (shows on homepage)</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>Cancel</Button>
              <Button onClick={handleSave} disabled={isProcessing || !formData.name} className="bg-ink hover:bg-ink/90 text-white">
                {isProcessing ? "Saving..." : "Save Cause"}
              </Button>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
