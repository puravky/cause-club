# Production Pass -- Gaps & Skipped Items

## Skipped (Safe to Defer)
- **Dashboard loading.tsx**: No Suspense/loading.tsx for dashboard pages. RSC waterfall is fine per constraints.
- **EmptyState component**: Exported but not imported anywhere. No pages use it -- existing inline empty states work fine.
- **`checkout_cancelled` handling**: Cancel URL returns to `/pricing?checkout_cancelled=true` but no UI feedback. Low-impact since user can retry.
- **Button `as any` cast** in `src/components/ui/button.tsx:44`: Framer Motion `m.button` type conflict with native HTML attributes. Known workaround, not worth fixing.
- **Charity events JSONB cast** in `CharitiesDirectory.tsx`: Uses `as Record<string, unknown>` for `events` field. Safe cast, works correctly.
- **`userId` unused prop** in `ScoresClient`: Server page passes `userId` but client component only uses `initialScores`. Clean but not breaking.
- **Em dashes in display strings**: `"—"` fallback values in ScoresClient, DrawsDashboardClient, admin page are intentional UI characters, not code prose.
