# Codebase Documentation Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all stale planning docs and rewrite CLAUDE.md to reflect only the current app state, keeping it lean to reduce context on every session.

**Architecture:** Delete 9 stale root-level markdown files and two legacy directories, then write three replacement files: a lean CLAUDE.md (rules + patterns only), docs/SCHEMA.md (DB reference), and docs/KNOWN_ISSUES.md (current bugs). No code changes — documentation only.

**Tech Stack:** Git, markdown

---

## File Map

| Action | File |
|---|---|
| Overwrite | `CLAUDE.md` |
| Create | `docs/SCHEMA.md` |
| Create | `docs/KNOWN_ISSUES.md` |
| Delete | `PROJECT_OVERVIEW.md` |
| Delete | `BUILD_PHASES.md` |
| Delete | `PROJECT_INSTRUCTIONS.md` |
| Delete | `TECHNICAL_ARCHITECTURE.md` |
| Delete | `DATABASE_SCHEMA.md` |
| Delete | `PHASE4_INSTRUCTIONS.md` |
| Delete | `API_INTEGRATIONS.md` |
| Delete | `UI_SPECIFICATIONS.md` |
| Delete | `DEBUGGING_GUIDE.md` |
| Delete dir | `docs/superpowers/` (entire) |
| Delete dir | `.superpowers/` (entire) |

---

## Task 1: Delete stale root-level markdown files

**Files:** Delete 9 files from repo root.

- [ ] **Step 1: Delete the files**

```bash
cd /c/Users/Ian/Desktop/plotkeeper
rm PROJECT_OVERVIEW.md BUILD_PHASES.md PROJECT_INSTRUCTIONS.md TECHNICAL_ARCHITECTURE.md DATABASE_SCHEMA.md PHASE4_INSTRUCTIONS.md API_INTEGRATIONS.md UI_SPECIFICATIONS.md DEBUGGING_GUIDE.md
```

- [ ] **Step 2: Verify they're gone**

```bash
ls *.md
```

Expected output: only `CLAUDE.md` remains (plus `README.md` if it exists).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: delete stale planning docs from repo root"
```

---

## Task 2: Create docs/SCHEMA.md

**Files:**
- Create: `docs/SCHEMA.md`

- [ ] **Step 1: Create the file with this exact content**

~~~~markdown
# PlotKeeper — Database Schema

> The authoritative source is `supabase/migrations/` — this file is a quick reference.

## Tables

| Table | Purpose |
|---|---|
| `plants` | Master plant library. Pre-seeded + user-created. `created_by` is null for shared plants, user UUID for personal ones. `forked_from` tracks if a user copy was derived from a shared plant. |
| `garden_beds` | Beds, pots, raised beds, planters. Soft delete via `is_active = false`. |
| `bed_plantings` | What's planted in each bed. Links to `plants` OR uses `custom_plant_name` for unlisted plants. |
| `monthly_jobs` | Monthly task list. `is_custom = false` for pre-seeded jobs. `done_year` tracks completion year. |
| `journal_entries` | Log entries. Types: `harvest`, `observation`, `problem`, `note`, `weather`, `purchase`. Optional FK to bed and plant. |
| `garden_settings` | Key-value config store. Keys: `location_name`, `latitude`, `longitude`, `hardiness_zone`, `last_frost_approx`, `first_frost_approx`, `garden_name`, `owner_name`. |
| `tools` | Tool inventory. Migration exists, no UI yet. |
| `planting_task_events` | Every care action logged: `watered`, `fed`, `pruned`, `harvested`, `hardened_off`, `transplanted`. Used by smart task generation. |
| `custom_tasks` | User-created one-off tasks with optional due date. |
| `planting_health_logs` | Timestamped health observations per planting. |
| `bed_photos` | Photos attached to beds. `is_profile` marks the cover image. |
| `planting_photos` | Photos attached to plantings. `is_profile` marks the cover image. |
| `app_feedback` | In-app feedback submissions. |

## bed_plantings Status Lifecycle

    planned → seeds_started → germinating → growing → ready → harvested → finished
                                                                        ↘ failed

## Migrations

Files in `supabase/migrations/` are numbered `001` → `025`. Applied to Supabase via the dashboard SQL editor or Supabase MCP tool. Never modify existing migrations — add new ones.
~~~~

- [ ] **Step 2: Verify the file was created**

```bash
cat docs/SCHEMA.md | head -5
```

- [ ] **Step 3: Commit**

```bash
git add docs/SCHEMA.md
git commit -m "docs: add SCHEMA.md reference file"
```

---

## Task 3: Create docs/KNOWN_ISSUES.md

**Files:**
- Create: `docs/KNOWN_ISSUES.md`

- [ ] **Step 1: Create the file with this exact content**

```markdown
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
```

- [ ] **Step 2: Verify the file was created**

```bash
cat docs/KNOWN_ISSUES.md | head -5
```

- [ ] **Step 3: Commit**

```bash
git add docs/KNOWN_ISSUES.md
git commit -m "docs: add KNOWN_ISSUES.md reference file"
```

---

## Task 4: Rewrite CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Replace the entire file with this content**

```markdown
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
```

- [ ] **Step 2: Verify the word count is reasonable**

```bash
wc -w CLAUDE.md
```

Expected: under 900 words (original was ~1800).

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: rewrite CLAUDE.md — lean rules-and-patterns only, extract schema and known issues"
```

---

## Task 5: Delete legacy directories

**Files:** Remove `docs/superpowers/` and `.superpowers/`.

- [ ] **Step 1: Delete the directories**

```bash
cd /c/Users/Ian/Desktop/plotkeeper
rm -rf docs/superpowers .superpowers
```

- [ ] **Step 2: Verify docs/ only contains the two new reference files**

```bash
find docs -type f
```

Expected output:
```
docs/SCHEMA.md
docs/KNOWN_ISSUES.md
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: delete docs/superpowers and .superpowers brainstorm artifacts"
```

---

## Verification

After all tasks complete:

- [ ] `ls *.md` at repo root shows only `CLAUDE.md`
- [ ] `wc -w CLAUDE.md` is under 900 words
- [ ] `cat docs/SCHEMA.md` renders correctly
- [ ] `cat docs/KNOWN_ISSUES.md` renders correctly
- [ ] `find docs -type f` shows exactly 2 files
- [ ] `ls .superpowers 2>/dev/null || echo "gone"` prints "gone"
- [ ] `npx vitest run` — all tests still pass (no code was touched)
- [ ] `git log --oneline -5` shows 4 clean commits
