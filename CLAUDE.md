# PlotKeeper — Claude Code Context

This file is the primary reference for any Claude Code session working on PlotKeeper.
Read this before making any changes. Follow the established patterns exactly.

---

## What This App Is

PlotKeeper is a personal garden management web app built for Kildare, Ireland. It's currently a single-user app (no auth) but is being migrated to a multi-user architecture. The core value is Ireland-calibrated plant data: frost dates, slug risk, RHS hardiness zones — all pre-seeded for Kildare.

- **Owner:** Ian Kenny (mr.iankenny@gmail.com)
- **Deployed at:** Vercel (auto-deploys from main branch)
- **Database:** Supabase (PostgreSQL, eu-west region)
- **Repository:** GitHub (plotkeeper)

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Use App Router patterns only — no Pages Router |
| Language | TypeScript | Strict typing throughout — match DB schema exactly |
| Styling | Tailwind CSS | Use `garden-*` custom colours (defined in `tailwind.config.ts`) |
| Components | shadcn/ui (Radix primitives) | Only add new shadcn components via `npx shadcn-ui@latest add` |
| Database | Supabase (PostgreSQL) | Direct JS client — no ORM |
| Auth | Supabase Auth (being added in Phase 4) | Use `@supabase/ssr` package |
| Hosting | Vercel | env vars set in Vercel project settings |
| Weather | Open-Meteo (free, no API key) | Kildare lat/lng hardcoded in `lib/constants.ts` |
| Images | Supabase Storage (being added in Phase 4) | Bucket: `plant-images`, `user-uploads` |

---

## Project Structure

```
plotkeeper/
├── app/
│   ├── layout.tsx                  # Root layout — sidebar + mobile nav. No auth wrapper yet.
│   ├── page.tsx                    # Redirects to /dashboard
│   ├── globals.css
│   │
│   ├── actions/                    # Server Actions (mutations)
│   │   ├── beds.ts                 # createBedAction, updateBedAction, deleteBedAction
│   │   ├── jobs.ts                 # toggleJobAction, createCustomJobAction, deleteCustomJobAction
│   │   ├── journal.ts              # createJournalEntryAction, deleteJournalEntryAction
│   │   ├── plantings.ts            # createPlantingAction, updatePlantingStatusAction, deletePlantingAction
│   │   └── settings.ts             # saveSettingsAction
│   │
│   ├── api/
│   │   └── weather/route.ts        # Proxy route to Open-Meteo (not currently used — weather.ts called directly)
│   │
│   ├── dashboard/page.tsx          # Server component. Stat cards, high-priority jobs, 3-day forecast.
│   ├── calendar/page.tsx           # Server component + MonthSelector client component
│   ├── plants/
│   │   ├── page.tsx                # Plant library with search (PlantSearch is 'use client')
│   │   └── [id]/page.tsx           # Full plant detail
│   ├── beds/
│   │   ├── page.tsx                # Beds overview grid
│   │   ├── new/page.tsx            # Add bed form
│   │   └── [id]/
│   │       ├── page.tsx            # Bed detail: plantings, spacing calc, crop history
│   │       ├── edit/page.tsx       # Edit bed form
│   │       └── plantings/new/page.tsx  # Add planting to bed
│   ├── jobs/page.tsx               # Monthly jobs with month picker, toggle done, add custom
│   ├── journal/
│   │   ├── page.tsx                # Journal entries grouped by date
│   │   └── new/page.tsx            # Add journal entry form
│   ├── pests/page.tsx              # Pest & disease guide (hardcoded data — not from DB)
│   ├── settings/page.tsx           # Garden settings form
│   └── auth/                       # TO BE CREATED in Phase 4
│       ├── login/page.tsx
│       └── signup/page.tsx
│
├── components/
│   ├── ui/                         # shadcn/ui components — DO NOT manually edit these
│   ├── layout/
│   │   ├── Sidebar.tsx             # Desktop nav. NOTE: currentPath prop exists but isn't passed from layout.tsx — needs usePathname() fix
│   │   ├── Header.tsx              # Page title + optional action button
│   │   └── MobileNav.tsx           # Bottom tab nav for mobile
│   ├── beds/
│   │   ├── BedCard.tsx
│   │   ├── BedForm.tsx             # Used for both add and edit
│   │   ├── PlantingCard.tsx        # Individual planting within a bed
│   │   └── PlantingForm.tsx
│   ├── calendar/
│   │   ├── CalendarPlantCard.tsx
│   │   └── MonthSelector.tsx       # 'use client' — reads/writes ?month= search param
│   ├── dashboard/
│   │   └── WeatherAlerts.tsx       # Renders frost/slug/blight alert banners
│   ├── jobs/
│   │   ├── JobItem.tsx             # 'use client' — checkbox toggle with server action
│   │   └── AddJobForm.tsx          # 'use client' — inline form to add custom job
│   ├── journal/
│   │   ├── EntryCard.tsx
│   │   └── EntryForm.tsx           # 'use client' — add journal entry form
│   └── plants/
│       ├── PlantCard.tsx           # Card in the plant library grid
│       └── PlantSearch.tsx         # 'use client' — search + category filter, uses URL params
│
├── lib/
│   ├── supabase.ts                 # ALL Supabase queries live here. See patterns below.
│   ├── weather.ts                  # Open-Meteo fetch + alert computation
│   ├── constants.ts                # KILDARE object, MONTH_NAMES, CALENDAR_ACTIONS, categories
│   └── utils.ts                    # cn() helper (Tailwind class merging)
│
├── types/
│   └── index.ts                    # TypeScript interfaces for all DB tables + utility types
│                                   # NOTE: MONTH_NAMES is duplicated here and in lib/constants.ts
│                                   # Prefer importing from lib/constants.ts
│
├── supabase/migrations/            # SQL migration files — run in order in Supabase dashboard
│   ├── 001_create_plants.sql
│   ├── 002_create_garden_beds.sql
│   ├── 003_create_bed_plantings.sql
│   ├── 004_create_monthly_jobs.sql
│   ├── 005_create_journal_entries.sql
│   ├── 006_create_tools.sql
│   ├── 007_create_garden_settings.sql
│   ├── 008_seed_garden_settings.sql
│   ├── 009_seed_plants.sql
│   └── 010_seed_monthly_jobs.sql
│
├── tailwind.config.ts              # Custom `garden-*` colour palette defined here
├── components.json                 # shadcn/ui config
└── .env.local                      # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Established Patterns — Follow These Exactly

### 1. Data Fetching — Server Components

All data fetching happens in server components using the functions in `lib/supabase.ts`. Never query Supabase directly in a component — always go through the lib functions.

```tsx
// ✅ Correct — server component with lib function
export default async function BedsPage() {
  const beds = await getBeds().catch(() => []);
  return <div>...</div>;
}

// ❌ Wrong — don't query Supabase directly in components
const { data } = await supabase.from("garden_beds").select("*");
```

Use `Promise.all` when fetching multiple things:

```tsx
const [beds, jobs, settings] = await Promise.all([
  getBeds().catch(() => []),
  getMonthlyJobs(month).catch(() => []),
  getSettings().catch(() => ({} as Record<string, string>)),
]);
```

Always wrap fetches in `.catch()` with a sensible fallback — never let a DB error crash the page.

### 2. Mutations — Server Actions

All mutations (create, update, delete) use Next.js Server Actions defined in `/app/actions/`. Actions redirect or revalidate after completion.

```tsx
// In app/actions/beds.ts
"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createBed } from "@/lib/supabase";

export async function createBedAction(formData: FormData) {
  // parse formData, call lib function, revalidate/redirect
  const bed = await createBed({ ... });
  revalidatePath("/beds");
  redirect(`/beds/${bed.id}`);
}
```

Client components invoke actions via `useTransition` + direct call, or via `<form action={action}>`.

### 3. Client Components — Only When Needed

Use `'use client'` only for:
- Interactive state (search inputs, toggles, month pickers)
- Forms that need live validation
- Components using browser APIs

Never make a component client-side just to fetch data — use server components with Suspense for async sections instead.

### 4. Page Layout Pattern

Every page uses the `Header` component for the title + optional action button:

```tsx
<Header
  title="Page Title"
  description="Short description"
  action={<Button>Action</Button>}  // optional
/>
```

Content goes below the header with `mb-8` spacing between sections.

### 5. Empty States

Every list/grid must have a proper empty state with a helpful prompt and a CTA:

```tsx
if (items.length === 0) {
  return (
    <div className="text-center py-16 text-muted-foreground">
      <p className="text-lg font-medium">Nothing here yet</p>
      <p className="text-sm mt-1">Add your first item to get started.</p>
      <Button asChild className="mt-4" size="sm">
        <Link href="/items/new">Add item</Link>
      </Button>
    </div>
  );
}
```

### 6. Error Handling

Wrap DB calls in `try/catch` at the page level. Show a helpful error rather than crashing:

```tsx
let data;
try {
  data = await getSomething();
} catch {
  return (
    <div className="text-center py-16 text-muted-foreground">
      <p>Could not load data. Check Supabase environment variables.</p>
    </div>
  );
}
```

### 7. Styling Conventions

- Use the `garden-*` colour tokens (defined in `tailwind.config.ts`) for branded/earthy elements: `bg-garden-50`, `text-garden-700`, `border-garden-200`
- Use `stone-*` for neutral backgrounds and text
- Use `text-muted-foreground` for secondary text (maps to `stone-500`)
- Card borders: `border` class (uses CSS variable from shadcn theme)
- Section spacing: `mb-8` between page sections, `space-y-3` or `space-y-4` within sections
- Grid layouts: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`

### 8. TypeScript

All functions must have typed parameters and return types. DB types are in `types/index.ts` and mirror the Supabase schema exactly. When adding new DB columns, update `types/index.ts` first.

---

## Supabase Data Layer — `lib/supabase.ts`

This file is the single source of truth for all DB operations. Structure:

- **Plants:** `getPlants()`, `getPlant(id)`, `getPlantsForMonth(month)`, `createPlant()`, `updatePlant()`
- **Beds:** `getBeds()`, `getBed(id)`, `createBed()`, `updateBed()`, `deleteBed()` (soft delete — sets `is_active = false`)
- **Plantings:** `getBedPlantings(bedId)`, `createPlanting()`, `updatePlantingStatus()`, `deletePlanting()` (hard delete)
- **Jobs:** `getMonthlyJobs(month)`, `toggleJobDone()`, `createCustomJob()`, `deleteCustomJob()`
- **Journal:** `getJournalEntries()`, `createJournalEntry()`, `deleteJournalEntry()`
- **Settings:** `getSettings()` → returns `Record<string, string>`, `upsertSettings()`
- **Dashboard:** `getDashboardCounts()` → `{ bedCount, activePlantingCount, journalCount }`

When Phase 4 auth is added, ALL functions must accept an optional `userId` parameter and scope queries accordingly. The supabase client will need to be replaced with a server-side auth-aware client from `@supabase/ssr`.

---

## Database Schema Summary

### Core Tables

| Table | Purpose | Notes |
|---|---|---|
| `plants` | Master plant library | Pre-seeded + user-created plants. `is_user_created` flag to be added in Phase 4. |
| `garden_beds` | Beds, pots, planters | Soft delete via `is_active`. `grid_x`/`grid_y` reserved for future visual designer. |
| `bed_plantings` | What's planted where | Status lifecycle: `planned → seeds_started → germinating → growing → ready → harvested → finished/failed`. Links to `plants` OR uses `custom_plant_name`. |
| `monthly_jobs` | Monthly task list | Pre-seeded jobs have `is_custom = false`. User jobs have `is_custom = true`. `done_year` tracks which year a job was completed. |
| `journal_entries` | Log entries | Types: `harvest`, `observation`, `problem`, `note`, `weather`, `purchase`. Optional links to bed and plant. |
| `garden_settings` | Key-value config | Keys include: `location_name`, `latitude`, `longitude`, `hardiness_zone`, `last_frost_approx`, `first_frost_approx`, `garden_name`, `owner_name` |
| `tools` | Tool inventory | Migration exists but no UI yet (Phase 4+) |

### Phase 4 Tables To Be Added

| Table | Purpose |
|---|---|
| `users` (Supabase Auth) | Managed by Supabase Auth automatically |
| `plant_health_logs` | Timestamped health observations per planting |
| `app_feedback` | In-app feedback submissions |
| `plant_images` | Image metadata (URL, source, plant_id) |

---

## Known Issues & TODOs

- **Sidebar active state never highlights** — `currentPath` prop is not passed from `layout.tsx`. Fix: convert `Sidebar` to `'use client'` and use `usePathname()` from `next/navigation`.
- **MONTH_NAMES duplication** — defined in both `types/index.ts` and `lib/constants.ts`. Always import from `lib/constants.ts`. The copy in `types/index.ts` should be removed.
- **Calendar has no category filter** — The UI spec calls for Vegetables/Flowers/Herbs/Perennials tabs but the current implementation has no category filtering on the calendar page.
- **Dashboard missing "What to Sow This Month" section** — The design spec includes a plant chip section showing what to sow this month, but it isn't implemented.
- **`deleteBed` soft-deletes, `deletePlanting` hard-deletes** — Inconsistency. Consider making this explicit in naming (`archiveBed` vs `deletePlanting`).
- **No pagination** — Plant library and journal entries have no pagination. Plant library fetches all plants, journal is capped at 50.
- **Content backlog — Fruits, Shrubs, Bulbs** — The plant library UI handles these three categories correctly but the database has no pre-seeded plant records for them. This is a data/content task, not a UI task. Needs real plant data entries created in the `plants` table for categories `fruit`, `shrub`, and `bulb`.
- **No edit on journal entries** — Can only create and delete. Edit flow to be added.
- **Sidebar frost dates are hardcoded** — Should read from `garden_settings`.

---

## Environment Variables

```env
# .env.local (local development)
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Phase 4 additions:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...           # For AI-assisted plant data enrichment
PERENUAL_API_KEY=...         # Optional: plant photo API (free tier available)
```

All environment variables are also set in the Vercel project settings for production.

---

## Running Locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (run this before deploying to catch type errors)
npm run lint
```

Migrations are run manually in the Supabase dashboard SQL editor in order (`001` → `010`).

---

## Design Principles (Don't Break These)

- **Mobile-first** — every page must work on a phone browser in the garden
- **Server components by default** — only use `'use client'` when genuinely needed
- **Earthy, calm palette** — greens, browns, creams. Not clinical. Not tech-looking.
- **Graceful degradation** — every DB call has a fallback. The app never hard-crashes.
- **Ireland-specific** — everything is calibrated for Kildare. Don't genericise the data or UI copy unless explicitly asked.
- **Personal first, shareable second** — the app is Ian's daily tool. Multi-user features should never degrade the single-user experience.
