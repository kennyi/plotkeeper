# PlotKeeper — Claude Code Context

PlotKeeper is a personal garden management app built for Kildare, Ireland. It's a single-user app with Ireland-calibrated plant data (frost dates, slug risk, RHS hardiness zones) pre-seeded for Kildare. Owner: Ian Kenny. Deployed on Vercel, database on Supabase (eu-west).

See `docs/SCHEMA.md` for DB schema reference. See `docs/KNOWN_ISSUES.md` for current bugs and gaps.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | App Router only — no Pages Router |
| Language | TypeScript | Strict typing — match DB schema exactly |
| Styling | Tailwind CSS | Use `garden-*` custom colours from `tailwind.config.ts` |
| Components | shadcn/ui (Radix primitives) | Add new components via `npx shadcn-ui@latest add` only |
| Database | Supabase (PostgreSQL) | Direct JS client — no ORM |
| Hosting | Vercel | env vars set in Vercel project settings |
| Weather | Open-Meteo (free, no key) | Kildare lat/lng hardcoded in `lib/constants.ts` |

---

## Project Structure

```
app/
  actions/          Server Actions (mutations) — beds.ts, jobs.ts, journal.ts, plantings.ts,
                    settings.ts, tasks.ts, plants.ts, auth.ts, feedback.ts, health.ts, photos.ts
  auth/             Login, callback, auth layout
  dashboard/        Dashboard page (server component)
  calendar/         Sowing calendar
  plants/           Plant library + detail pages
  beds/             Bed overview, add, edit, detail, add-planting
  jobs/             Monthly jobs
  journal/          Journal entries + add form
  tasks/            Smart task list
  pests/            Pest & disease guide (hardcoded data)
  settings/         Garden settings form
  api/weather/      Proxy route to Open-Meteo (not actively used)

components/
  ui/               shadcn/ui — DO NOT manually edit
  layout/           Sidebar, Header, MobileNav
  dashboard/        WeatherCard, QuickLogWidget, WeatherAlerts
  beds/             BedCard, BedForm, PlantingCard, PlantingForm
  calendar/         CalendarPlantCard, MonthSelector
  jobs/             JobItem, AddJobForm
  journal/          EntryCard, EntryForm
  plants/           PlantCard, PlantSearch
  photos/           BedPhotoAvatar, PhotoLightbox, PlantingPhotoGallery
  tasks/            TaskItem, AddCustomTaskForm

lib/
  supabase.ts       ALL DB queries — never query Supabase directly in components
  supabase/         SSR-aware Supabase client helpers (browser.ts, server.ts)
  tasks.ts          Pure task generation logic (generateSmartTasks, buildLastEventMap)
  weather.ts        Open-Meteo fetch + alert computation
  constants.ts      KILDARE coords, MONTH_NAMES, CALENDAR_ACTIONS, plant categories
  utils.ts          cn() Tailwind class helper

types/index.ts      TypeScript interfaces for all DB tables
supabase/migrations/ SQL files 001–025 — authoritative DB schema
```

---

## Established Patterns — Follow These Exactly

### 1. Data Fetching — Server Components

All data fetching uses functions from `lib/supabase.ts`. Never query Supabase directly in a component.

```tsx
// ✅ Correct
export default async function BedsPage() {
  const beds = await getBeds().catch(() => []);
  return <div>...</div>;
}

// ❌ Wrong
const { data } = await supabase.from("garden_beds").select("*");
```

Use `Promise.all` for multiple fetches. Always `.catch()` with a sensible fallback.

```tsx
const [beds, jobs] = await Promise.all([
  getBeds().catch(() => []),
  getMonthlyJobs(month).catch(() => []),
]);
```

### 2. Mutations — Server Actions

All mutations use Next.js Server Actions in `app/actions/`. Actions revalidate or redirect after completion.

```tsx
"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBedAction(formData: FormData) {
  const bed = await createBed({ ... });
  revalidatePath("/beds");
  redirect(`/beds/${bed.id}`);
}
```

Client components invoke actions via `useTransition` + direct call or `<form action={action}>`.

### 3. Client Components — Only When Needed

Use `'use client'` only for interactive state, live-validation forms, or browser APIs. Never for data fetching.

### 4. Page Layout Pattern

Every page uses `Header` for title + optional action:

```tsx
<Header
  title="Page Title"
  description="Short description"
  action={<Button>Action</Button>}
/>
```

Content below header with `mb-8` spacing between sections.

### 5. Empty States

Every list/grid must have an empty state with a CTA:

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

Wrap DB calls in `try/catch` at page level. Show a helpful error, never crash:

```tsx
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

- `garden-*` tokens for branded elements: `bg-garden-50`, `text-garden-700`, `border-garden-200`
- `stone-*` for neutral backgrounds and text
- `text-muted-foreground` for secondary text
- `border` class for card borders
- `mb-8` between page sections, `space-y-3` or `space-y-4` within sections
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` for grids

### 8. TypeScript

Typed parameters and return types everywhere. DB types in `types/index.ts` mirror the schema exactly. Update `types/index.ts` first when adding new DB columns.

---

## Supabase Data Layer — `lib/supabase.ts`

Single source of truth for all DB operations. Never call Supabase outside this file.

- **Plants:** `getPlants()`, `getPlant(id)`, `getMyPlants()`, `getMyPlantsForMonth(month)`, `getPlantsForMonth(month, category?)`, `createPlant()`, `forkOrUpdatePlant()`, `deletePlant()`, `getActivePlantingCountByPlant(plantId)`
- **Beds:** `getBeds()`, `getBed(id)`, `getBedsOverview()`, `getBedsWithPlantingCount()`, `createBed()`, `updateBed()`, `deleteBed()` (soft delete — sets `is_active = false`)
- **Plantings:** `getBedPlantings(bedId)`, `getActivePlantings()`, `getAllPlantings()`, `getPlanting(id)`, `getActivePlantingsWithBeds()`, `createPlanting()`, `updatePlanting()`, `updatePlantingStatus()`, `updatePlantingPhoto()`, `deletePlanting()` (hard delete)
- **Jobs:** `getMonthlyJobs(month)`, `getInventoryJobs(month)`, `toggleJobDone()`, `createCustomJob()`, `updateCustomJob()`, `deleteCustomJob()`, `deleteJob()`
- **Journal:** `getJournalEntries(limit?)`, `createJournalEntry()`, `deleteJournalEntry()`
- **Settings:** `getSettings()` → `Record<string, string>`, `upsertSettings()`
- **Dashboard:** `getDashboardCounts()` → `{ bedCount, activePlantingCount, journalCount }`
- **Tasks:** `getCustomTasks()`, `createCustomTask()`, `completeCustomTask()`, `deleteCustomTask()`, `getTaskEvents(plantingIds)`, `logTaskEvent()`
- **Health:** `logPlantingHealth()`, `getHealthLogs(plantingId)`
- **Photos:** `getPlantingPhotos(plantingId)`, `addPlantingPhoto()`, `deletePlantingPhoto()`, `updatePlantingProfilePhoto()`, `getBedPhotos(bedId)`, `addBedPhoto()`, `deleteBedPhoto()`, `updateBedProfilePhoto()`
- **Other:** `createFeedback()`, `uploadToStorage()`

---

## Workflow Rules

**Before every commit:** Run `npx vitest run` — fix all failures before committing.

**Before every push:** Run `npm run build` to catch type errors. If you've touched auth flows, navigation, or `e2e/global-setup.ts`, run `npx playwright test` locally first.

---

## Design Principles

- **Mobile-first** — every page must work on a phone in the garden
- **Server components by default** — `'use client'` only when genuinely needed
- **Earthy, calm palette** — greens, browns, creams. Not clinical or tech-looking.
- **Graceful degradation** — every DB call has a fallback; the app never hard-crashes
- **Ireland-specific** — calibrated for Kildare. Don't genericise data or copy unless asked.
- **Personal first** — Ian's daily tool. Don't degrade the single-user experience.

---

## Running Locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # catch type errors before pushing
npm run lint
npx vitest run     # unit tests
```

Environment variables needed in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```
