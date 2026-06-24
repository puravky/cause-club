import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-ink/5", className)}
      {...props}
    />
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2 mb-8">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <Skeleton className="h-4 w-72 rounded" />
    </div>
  );
}

export function ScoresSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeaderSkeleton />
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Score Form Skeleton */}
        <div className="lg:col-span-1">
          <div className="border border-border bg-white rounded-2xl p-6 space-y-6">
            <Skeleton className="h-6 w-32 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <Skeleton className="h-11 w-full rounded-full" />
          </div>
        </div>

        {/* Right: Scores List & Chart Skeleton */}
        <div className="lg:col-span-2 space-y-8">
          {/* Chart Card */}
          <div className="border border-border bg-white rounded-2xl p-6 space-y-4">
            <Skeleton className="h-6 w-40 rounded" />
            <div className="h-32 flex items-end justify-between gap-2 pt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="w-full rounded-t-lg" style={{ height: `${20 + i * 15}%` }} />
              ))}
            </div>
          </div>
          
          {/* Scores list */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-28 rounded" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-border bg-white rounded-2xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-14 h-14 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24 rounded" />
                    <Skeleton className="h-4 w-32 rounded" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CharitySkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeaderSkeleton />
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Active Cause & History */}
        <div className="lg:col-span-2 space-y-8">
          <div className="border border-border bg-white rounded-2xl p-6 space-y-8">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48 rounded" />
                <Skeleton className="h-4 w-36 rounded" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
              <Skeleton className="h-6 w-full rounded-lg" />
            </div>
          </div>

          <div className="border border-border bg-white rounded-2xl p-6 space-y-4">
            <Skeleton className="h-6 w-36 rounded" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-border last:border-0">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: One-time donation */}
        <div className="lg:col-span-1">
          <div className="border border-border bg-white rounded-2xl p-6 space-y-4">
            <Skeleton className="h-6 w-32 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DrawsSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeaderSkeleton />
      <div className="border border-border bg-white rounded-2xl p-6 space-y-6">
        <Skeleton className="h-6 w-44 rounded" />
        <div className="grid sm:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-border rounded-xl p-4 space-y-3">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-8 w-28 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="border border-border bg-white rounded-2xl p-6 space-y-4">
        <Skeleton className="h-6 w-32 rounded" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex justify-between py-3 border-b border-border last:border-0">
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardHomeSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeaderSkeleton />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-border bg-white rounded-2xl p-6 space-y-3">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-7 w-32 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="border border-border bg-white rounded-2xl p-6 space-y-4">
            <Skeleton className="h-6 w-40 rounded" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex justify-between py-3 border-b border-border last:border-0">
                  <Skeleton className="h-5 w-32 rounded" />
                  <Skeleton className="h-5 w-20 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="border border-border bg-white rounded-2xl p-6 space-y-4">
            <Skeleton className="h-6 w-32 rounded" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-4 w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminUsersSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeaderSkeleton />
      <div className="border border-border bg-white rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center gap-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
        <div className="space-y-3 pt-4">
          <div className="grid grid-cols-4 gap-4 pb-2 border-b border-border font-semibold">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 py-3 border-b border-border last:border-0">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4.5 w-14 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
