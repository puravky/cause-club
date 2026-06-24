"use client";

import Link from "next/link";
import { ArrowLeft, Globe, Heart, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Json } from "@/types/database.types";

interface Charity {
  id: string;
  name: string;
  description: string | null;
  images: string[] | null;
  logo_url: string | null;
  website: string | null;
  events: Json | null;
  donations: { amount: number, user_id: string }[];
}

interface CharityProfileProps {
  charity: Charity;
  isLoggedIn: boolean;
}

export function CharityProfile({ charity, isLoggedIn }: CharityProfileProps) {
  const sumRaised = charity.donations.reduce((acc, curr) => acc + curr.amount, 0);
  const uniqueSupporters = new Set(charity.donations.map(d => d.user_id)).size;
  const eventsList = (Array.isArray(charity.events) ? charity.events : []) as Record<string, unknown>[];
  
  // Default cover if none provided
  const coverImage = charity.images?.[0] || "https://images.unsplash.com/photo-1500964757637-c85e8a162699";

  return (
    <div className="bg-paper min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        
        {/* Back Link */}
        <Link href="/charities" className="inline-flex items-center text-sm font-semibold text-ink/60 hover:text-ink transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Causes
        </Link>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-border">
          <div className="h-64 sm:h-80 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImage} alt={charity.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-ink/20" />
            {charity.logo_url && (
              <div className="absolute -bottom-10 left-8 w-24 h-24 rounded-2xl bg-white shadow-md border border-border overflow-hidden p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={charity.logo_url} alt={`${charity.name} logo`} className="w-full h-full object-contain" />
              </div>
            )}
          </div>
          
          <div className={`p-8 sm:p-12 ${charity.logo_url ? 'pt-16' : ''}`}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <h1 className="font-heading text-4xl sm:text-5xl font-bold text-ink leading-tight">
                  {charity.name}
                </h1>
                {charity.website && (
                  <a href={charity.website} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-semibold text-coral hover:underline">
                    <Globe className="w-4 h-4 mr-1.5" /> Visit Website
                  </a>
                )}
                <p className="text-lg text-ink/80 leading-relaxed whitespace-pre-wrap">
                  {charity.description}
                </p>
              </div>

              <div className="flex-shrink-0">
                <Link href={isLoggedIn ? `/dashboard/charity?select=${charity.id}` : "/login"}>
                  <Button className="w-full md:w-auto bg-coral hover:bg-coral/90 text-white text-base py-6 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                    Select this cause
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink/60 uppercase tracking-wider">Total Raised</p>
              <p className="text-2xl font-bold text-ink">£{sumRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink/60 uppercase tracking-wider">Supporters</p>
              <p className="text-2xl font-bold text-ink">{uniqueSupporters}</p>
            </div>
          </div>
        </div>

        {/* Events & Gallery */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Events Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <h3 className="font-heading text-2xl font-bold text-ink">Upcoming Focus</h3>
            <div className="space-y-4">
              {eventsList.length > 0 ? eventsList.map((ev: Record<string, unknown>, idx: number) => (
                <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-border relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-coral" />
              <div className="flex items-center gap-2 text-xs font-bold text-coral uppercase tracking-wider mb- mb-2">
                <Calendar className="w-3.5 h-3.5" />
                {typeof ev.date === "string" ? ev.date : "Ongoing"}
              </div>
              <h4 className="font-bold text-ink text-base mb-1">{typeof ev.name === "string" ? ev.name : "Event"}</h4>
              <p className="text-sm text-ink/70">{typeof ev.impact === "string" ? ev.impact : "Community Impact"}</p>
                </div>
              )) : (
                <p className="text-sm text-ink/60 italic">No specific events listed currently.</p>
              )}
            </div>
          </div>

          {/* Image Gallery */}
          <div className="md:col-span-2 space-y-6">
            <h3 className="font-heading text-2xl font-bold text-ink">Impact Gallery</h3>
            {charity.images && charity.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 auto-rows-[200px]">
                {charity.images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`rounded-2xl overflow-hidden bg-ink/5 ${idx === 0 && charity.images!.length > 1 ? 'col-span-2 row-span-2' : ''}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-border">
                <p className="text-ink/60">More photos coming soon.</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
