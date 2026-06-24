"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Json } from "@/types/database.types";

interface Charity {
  id: string;
  name: string;
  description: string | null;
  images: string[] | null;
  logo_url: string | null;
  events: Json | null;
  featured: boolean | null;
  donations: { amount: number }[];
}

interface CharitiesDirectoryProps {
  charities: Charity[];
}

export function CharitiesDirectory({ charities }: CharitiesDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Extract unique categories from events jsonb (assuming events contain a 'category' or 'impact' field, or we just extract unique event names as tags)
  // For simplicity, let's assume 'events' is an array of objects and we use 'impact' as a category tag
  const allTags = charities.flatMap(c => {
    if (Array.isArray(c.events)) {
      return c.events
        .map(e => {
          const obj = e as Record<string, unknown>;
          const val = obj.impact || obj.name;
          return typeof val === "string" ? val : null;
        })
        .filter((v): v is string => v !== null);
    }
    return [];
  });
  const categories = ["All", "Featured", ...Array.from(new Set(allTags))];

  const filteredCharities = charities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    let matchesCategory = true;
    if (activeCategory === "Featured") {
      matchesCategory = !!c.featured;
    } else if (activeCategory !== "All") {
      const cTags = Array.isArray(c.events) ? c.events.map(e => (e as Record<string, unknown>).impact || (e as Record<string, unknown>).name) : [];
      matchesCategory = cTags.includes(activeCategory);
    }

    return matchesSearch && matchesCategory;
  });

  const featuredCharities = charities.filter(c => c.featured);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="font-heading text-4xl font-bold text-ink">Our Partner Causes</h1>
        <p className="text-ink/70">
          Discover the amazing charities we support. 10% of every causeClub membership goes directly to the cause of your choice.
        </p>
      </div>

      {featuredCharities.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-heading text-2xl font-bold text-ink">Featured Causes</h2>
          <div className="flex overflow-x-auto pb-4 gap-6 snap-x">
            {featuredCharities.map(charity => {
              const coverImage = charity.images?.[0] || "https://images.unsplash.com/photo-1500964757637-c85e8a162699";
              return (
                <Link key={charity.id} href={`/charities/${charity.id}`} className="min-w-[300px] sm:min-w-[400px] snap-start group">
                  <div className="relative h-64 rounded-2xl overflow-hidden shadow-sm border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverImage} alt={charity.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 w-full">
                      <h3 className="font-heading text-2xl font-bold text-white mb-2">{charity.name}</h3>
                      <p className="text-white/80 text-sm line-clamp-2">{charity.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h2 className="font-heading text-2xl font-bold text-ink">All Causes</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/50" />
            <Input 
              placeholder="Search charities..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 8).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === cat 
                  ? "bg-coral text-white" 
                  : "bg-white border border-border text-ink/70 hover:border-coral/50 hover:text-coral"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCharities.map(charity => {
            const sumRaised = charity.donations.reduce((acc, curr) => acc + curr.amount, 0);
            const coverImage = charity.images?.[0] || "https://images.unsplash.com/photo-1500964757637-c85e8a162699";
            
            return (
              <Link key={charity.id} href={`/charities/${charity.id}`} className="group h-full">
                <Card className="h-full rounded-2xl border-border bg-white shadow-sm overflow-hidden transition-all duration-200 group-hover:border-coral/50 group-hover:shadow-md flex flex-col">
                  <div className="h-40 relative bg-ink/5 border-b border-border flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverImage} alt={charity.name} className="w-full h-full object-cover" />
                    {charity.logo_url && (
                      <div className="absolute -bottom-6 left-6 w-12 h-12 rounded-lg bg-white shadow-sm border border-border overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={charity.logo_url} alt={`${charity.name} logo`} className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                  <CardHeader className={`${charity.logo_url ? 'pt-8' : ''} pb-2`}>
                    <CardTitle className="font-heading text-lg font-bold text-ink line-clamp-1">{charity.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between space-y-4 pb-6">
                    <p className="text-sm text-[#6B7280] line-clamp-2">
                      {charity.description}
                    </p>
                    <div className="flex items-center gap-2 pt-4 border-t border-border">
                      <div className="p-1.5 bg-coral/10 rounded-full">
                        <Heart className="w-4 h-4 text-coral" />
                      </div>
                      <div>
                        <p className="text-xs text-ink/60 uppercase tracking-wider font-semibold">Raised this year</p>
                        <p className="font-bold text-ink">£{sumRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
        {filteredCharities.length === 0 && (
          <div className="py-12 text-center text-ink/60">
            No charities found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
