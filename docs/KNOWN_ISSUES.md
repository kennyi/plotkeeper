# PlotKeeper — Known Issues

Current bugs and gaps in the app. No wishlist items — only things that exist and are broken or incomplete.

## Bugs

- **Sidebar active state never highlights** — `currentPath` prop is not passed from `layout.tsx`. Fix: convert `Sidebar` (`components/layout/Sidebar.tsx`) to `'use client'` and use `usePathname()` from `next/navigation`.

- **Sidebar frost dates are hardcoded** — The sidebar shows hardcoded frost date strings. Should read from `garden_settings` via `getSettings()`.

- **`deleteBed` soft-deletes, `deletePlanting` hard-deletes** — Naming inconsistency in `lib/supabase.ts`. Consider renaming `deleteBed` → `archiveBed` to make the distinction explicit.

## Missing Features

- **Calendar has no category filter** — No Vegetables/Flowers/Herbs/Perennials tabs on the calendar page.

- **No pagination on plant library or journal** — `getPlants()` fetches all plants; `getJournalEntries()` is capped at 50.

- **No edit flow for journal entries** — Can only create and delete. Edit to be added.

## Data Gaps

- **No seeded plants for Fruits, Shrubs, Bulbs** — The UI handles these categories but the DB has no pre-seeded records for `fruit`, `shrub`, or `bulb` categories. Data task, not a UI task.

## Code Debt

- **MONTH_NAMES duplicated** — Defined in both `types/index.ts` and `lib/constants.ts`. Always import from `lib/constants.ts`. Remove the copy in `types/index.ts`.
