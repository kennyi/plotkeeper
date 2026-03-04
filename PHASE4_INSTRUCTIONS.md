# PlotKeeper — Phase 4 Instructions

> Read `CLAUDE.md` first. This document describes what to build in Phase 4.
> Tasks are ordered by dependency — complete them in sequence.
> Each task ends with a deployed, working state before the next begins.

---

## Phase 4 Vision

Phase 4 transforms PlotKeeper from a single-user prototype into a personal tool that's also ready to share. The priorities are:

1. **Make it mine** — the app should know about Ian's actual plants, beds, and garden, not just a generic library
2. **Make it smart** — adding a custom plant should be fast and data-rich, not a blank form
3. **Make it visual** — real plant photos, personal photos of beds and plantings
4. **Make it personal** — dashboard and jobs relevant to what's actually growing
5. **Make it shareable** — authentication so friends can use it with their own data

---

## Task Order & Dependencies

```
P4-1  In-App Feedback          ← no dependencies, build first (quick win)
P4-2  Fix Known Issues         ← no dependencies, clean up before building more
P4-3  Authentication           ← foundational — everything else depends on this
P4-4  Custom Plants + AI       ← depends on P4-3 (user_id on plants)
P4-5  Image Support            ← depends on P4-3 (Supabase Storage needs auth)
P4-6  Dashboard Personalisation← depends on P4-3 and P4-4
P4-7  Planting Health Logs     ← depends on P4-3
P4-8  Beds UX Overhaul         ← depends on P4-5 and P4-7
P4-9  Calendar Category Filter ← can be done any time after P4-2
```

---

## P4-1 — In-App Feedback Mechanism

**What:** A simple feedback button available on every page that lets Ian log thoughts, bugs, and suggestions directly into the database. He can then query these in Supabase and use them as context for future Claude Code sessions.

**Why:** Ian is actively using the app and forming opinions. This captures those thoughts at the moment they happen rather than losing them.

### Database Migration

```sql
-- supabase/migrations/011_create_app_feedback.sql
CREATE TABLE app_feedback (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_type TEXT CHECK (feedback_type IN ('bug', 'suggestion', 'question', 'observation')),
  page_context  TEXT,           -- e.g. '/beds/123', '/dashboard'
  message       TEXT NOT NULL,
  status        TEXT DEFAULT 'open' CHECK (status IN ('open', 'noted', 'done', 'wontfix')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### What to Build

- Add `createFeedback(values)` and `getFeedback()` functions to `lib/supabase.ts`
- Create `app/actions/feedback.ts` with `createFeedbackAction`
- Build a small floating feedback button component (`components/layout/FeedbackButton.tsx`) — a fixed-position button (bottom-right, above the mobile nav) that opens a small popover/dialog
- The dialog has: feedback type selector (bug / suggestion / observation), a text area, and a submit button. It auto-captures the current URL as `page_context` using `usePathname()`
- Add the `FeedbackButton` to `app/layout.tsx` so it appears on every page
- No feedback list UI needed yet — Ian will read feedback directly in Supabase dashboard

### Acceptance Criteria

- [ ] Feedback button visible on every page (desktop and mobile)
- [ ] Can select type and write a message
- [ ] Submits without leaving the page
- [ ] Record appears in `app_feedback` table in Supabase with correct `page_context`
- [ ] Button doesn't overlap mobile nav

---

## P4-2 — Fix Known Issues

**What:** Clean up the issues identified in `CLAUDE.md` before building more on top of them.

### 2a — Fix Sidebar Active State

Convert `Sidebar.tsx` to a client component and use `usePathname()`:

```tsx
"use client";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  // use pathname for isActive check instead of currentPath prop
}
```

Remove the `currentPath` prop from the component signature. The Sidebar is already only rendered on desktop so the client component overhead is minimal.

Do the same for `MobileNav.tsx` if it has the same issue.

### 2b — Fix MONTH_NAMES Duplication

Remove the `MONTH_NAMES` constant and `PLANT_CATEGORIES` array from `types/index.ts`. They belong in `lib/constants.ts`. Update any imports that were pointing to `@/types` for these values to point to `@/lib/constants` instead. Check all files with: `grep -r "from \"@/types\"" --include="*.tsx" --include="*.ts"`.

### 2c — Fix Dashboard Stat Card Links

The "Active beds" and "Active plantings" stat cards both link to `/beds`. Active plantings should link to `/beds` with a `?filter=active` query param, or better — the dashboard stat cards should simply not be clickable links if they go to the same place. Make "Active beds" link to `/beds` and remove the link from "Active plantings", or differentiate them meaningfully.

### 2d — Fix Sidebar Frost Dates

The frost dates in the sidebar footer are hardcoded strings. Replace them with values from `garden_settings`. Since the sidebar is now a client component (from 2a), fetch the settings on the server and pass them as props, or read them from a context provider.

Actually, the simplest approach: create a small server component wrapper that fetches settings and passes frost dates as props to the Sidebar. Or just keep the hardcoded Kildare values for now and note this as a Phase 5 polish item — the values are correct for Ian's use case.

### Acceptance Criteria

- [ ] Active nav item is highlighted correctly in sidebar and mobile nav
- [ ] `MONTH_NAMES` is only defined in `lib/constants.ts`
- [ ] No TypeScript errors after import changes (`npm run build` passes)
- [ ] Dashboard stat cards don't link to the same page

---

## P4-3 — Authentication (Supabase Auth)

**What:** Add Supabase Auth so the app supports multiple users, each with their own isolated garden data. Ian is the first user. Friends can sign up later.

**Why this must be done before everything else:** Once users exist, every table needs a `user_id` column and RLS policies. Doing this early, while the dataset is small, means one clean migration rather than a painful retrofit.

### Package to Install

```bash
npm install @supabase/ssr
```

Do NOT use the older `@supabase/auth-helpers-nextjs` — use `@supabase/ssr` which is the current recommended approach for Next.js App Router.

### Supabase Client Refactor

Replace the current `lib/supabase.ts` client setup with the `@supabase/ssr` pattern. You need two client types:

1. **Server client** (for server components and server actions) — uses `createServerClient` from `@supabase/ssr` with cookie handling
2. **Browser client** (for client components) — uses `createBrowserClient` from `@supabase/ssr`

Create:
- `lib/supabase/server.ts` — server-side client factory
- `lib/supabase/client.ts` — browser-side client factory
- `lib/supabase/middleware.ts` — session refresh logic
- Keep `lib/supabase.ts` as the query functions file, but update it to accept/use the server client

Create `middleware.ts` at the project root:

```ts
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Refresh session, redirect unauthenticated users to /auth/login
  // Allow /auth/* routes through without checking
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth).*)"],
};
```

### Database Migrations

Run these in order in the Supabase SQL editor:

```sql
-- supabase/migrations/012_add_user_id_columns.sql
-- garden_beds: scope to user
ALTER TABLE garden_beds ADD COLUMN user_id UUID REFERENCES auth.users(id);
UPDATE garden_beds SET user_id = NULL; -- existing rows become orphaned (Ian will re-add his)
ALTER TABLE garden_beds ALTER COLUMN user_id SET NOT NULL;

-- bed_plantings: scope to user (via bed, but also directly for faster queries)
ALTER TABLE bed_plantings ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- monthly_jobs: custom jobs are per-user; pre-seeded jobs have user_id = NULL
ALTER TABLE monthly_jobs ADD COLUMN user_id UUID REFERENCES auth.users(id);
-- user_id NULL = system job visible to all; user_id = X = personal custom job

-- journal_entries: scope to user
ALTER TABLE journal_entries ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- garden_settings: scope to user (each user has their own settings)
ALTER TABLE garden_settings ADD COLUMN user_id UUID REFERENCES auth.users(id);
-- user_id NULL = system defaults; user_id = X = user's personal settings

-- plants: add user_created flag and optional user_id
ALTER TABLE plants ADD COLUMN is_user_created BOOLEAN DEFAULT false;
ALTER TABLE plants ADD COLUMN created_by UUID REFERENCES auth.users(id);
-- user_id NULL = shared library plant; created_by = X = user's custom plant
```

```sql
-- supabase/migrations/013_enable_rls.sql
-- Enable RLS on all user-scoped tables
ALTER TABLE garden_beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bed_plantings ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_feedback ENABLE ROW LEVEL SECURITY;

-- garden_beds: user sees only their own
CREATE POLICY "Users see own beds" ON garden_beds
  FOR ALL USING (auth.uid() = user_id);

-- bed_plantings: user sees only their own
CREATE POLICY "Users see own plantings" ON bed_plantings
  FOR ALL USING (auth.uid() = user_id);

-- monthly_jobs: user sees system jobs (user_id IS NULL) + their own custom jobs
CREATE POLICY "Users see system and own jobs" ON monthly_jobs
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users manage own custom jobs" ON monthly_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own custom jobs" ON monthly_jobs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own custom jobs" ON monthly_jobs
  FOR DELETE USING (auth.uid() = user_id);

-- System jobs can be marked done per-user — see note below
CREATE POLICY "Users toggle done on system jobs" ON monthly_jobs
  FOR UPDATE USING (user_id IS NULL); -- any authenticated user can toggle system jobs

-- journal_entries
CREATE POLICY "Users see own journal" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);

-- garden_settings: user sees system defaults + own settings
CREATE POLICY "Users see system and own settings" ON garden_settings
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users manage own settings" ON garden_settings
  FOR ALL USING (auth.uid() = user_id);

-- plants: shared library visible to all; user-created plants visible to creator
CREATE POLICY "Shared plants visible to all" ON plants
  FOR SELECT USING (is_user_created = false OR auth.uid() = created_by);
CREATE POLICY "Users create own plants" ON plants
  FOR INSERT WITH CHECK (auth.uid() = created_by AND is_user_created = true);
CREATE POLICY "Users manage own plants" ON plants
  FOR UPDATE USING (auth.uid() = created_by);

-- app_feedback: Ian's personal table, but write-open for any authenticated user
CREATE POLICY "Authenticated users can submit feedback" ON app_feedback
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Owner sees all feedback" ON app_feedback
  FOR SELECT USING (auth.uid() = 'IAN_USER_ID_HERE'); -- replace with Ian's actual UUID after first login
```

> **Important note on monthly_jobs done-state:** The current design stores `is_done` and `done_year` on the job row itself. This breaks for multi-user — if Ian marks a job done, it's done for everyone. In Phase 4, create a separate `job_completions` table:
>
> ```sql
> CREATE TABLE job_completions (
>   id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
>   job_id   UUID NOT NULL REFERENCES monthly_jobs(id) ON DELETE CASCADE,
>   user_id  UUID NOT NULL REFERENCES auth.users(id),
>   year     INTEGER NOT NULL,
>   UNIQUE(job_id, user_id, year)
> );
> ALTER TABLE job_completions ENABLE ROW LEVEL SECURITY;
> CREATE POLICY "Users manage own completions" ON job_completions
>   FOR ALL USING (auth.uid() = user_id);
> ```
> Update `getMonthlyJobs(month)` to join with `job_completions` for the current user, and update `toggleJobDone()` to insert/delete from `job_completions` rather than updating the job row.

### Auth UI

Create:
- `app/auth/login/page.tsx` — email/password login form + "Sign up" link
- `app/auth/signup/page.tsx` — sign up form (email, password, name) + creates user + redirects to `/dashboard`

Use Supabase Auth `signInWithPassword` and `signUp`. Keep the UI consistent with the rest of the app (same `Header` component, same card styling).

On sign up, automatically create a row in `garden_settings` for the new user using Supabase's `on auth.users insert` trigger or via a server action after signup.

### Update All Query Functions

Every function in `lib/supabase.ts` must be updated to pass the authenticated user's ID. The server client from `@supabase/ssr` handles this automatically via the session cookie — the RLS policies will scope results without needing to manually filter by user_id in every query.

Update `lib/supabase.ts` to use the server client factory rather than the global `createClient` singleton.

### Update Layout

Add session check to `app/layout.tsx`. If no session, redirect to `/auth/login`. The middleware handles this but the layout should also handle the initial render gracefully.

### Acceptance Criteria

- [ ] Can sign up with email + password
- [ ] Can log in / log out
- [ ] Unauthenticated users are redirected to `/auth/login`
- [ ] After login, user sees their own data only
- [ ] Ian's existing data (once he re-adds it after migration) is visible only to him
- [ ] Pre-seeded jobs and plants are visible to all authenticated users
- [ ] `npm run build` passes with no TypeScript errors
- [ ] App works correctly in production on Vercel

---

## P4-4 — Custom Plants with AI Enrichment

**What:** Allow users to add plants that aren't in the shared library. When a user types a plant name, an AI endpoint pre-fills all the growing information fields. The user reviews, adjusts, and saves. The plant then appears in all dropdowns and searches across the app, just like library plants.

**Why:** Ian has plants like Dracaena Fragans that aren't in the pre-seeded library. Adding a blank form and filling it manually is tedious. AI-assisted population makes this fast.

### What to Build

**New API route: `app/api/plants/enrich/route.ts`**

POST endpoint that accepts `{ name: string, context?: string }` and returns a partially populated plant object. Use OpenAI's API (model: `gpt-4o-mini` for cost efficiency) with a structured prompt. The prompt should instruct the model to return JSON matching the `Plant` TypeScript interface with all known fields populated for the given plant name, calibrated for an Irish/temperate garden context where applicable.

```ts
// POST /api/plants/enrich
// Body: { name: string }
// Returns: Partial<Plant> with AI-populated fields
```

Example system prompt:
```
You are a horticultural expert. Given a plant name, return growing information as a JSON object.
Fields to populate where known: latin_name, category, subcategory, description, sow_indoors_start/end,
sow_outdoors_start/end, transplant_start/end, harvest_start/end, weeks_indoors_min/max,
germination_days_min/max, germination_temp_min/max, spacing_cm, row_spacing_cm, height_cm_min/max,
sun_requirement, water_needs, soil_preference, hardiness_zone (use RHS H-scale),
frost_tolerant, frost_tender, slug_risk, is_perennial, is_cut_flower, companion_plants,
avoid_near, common_pests, common_diseases, growing_tips, notes.
All timing values are month numbers (1=January, 12=December) calibrated for Ireland/temperate Atlantic climate.
Return only the JSON object, no explanation.
```

**New Page: `app/plants/new/page.tsx`**

A plant creation form with two modes:
1. **AI-assisted mode** (default): Type a plant name → click "Look up" → AI fills in the fields → user reviews and edits → saves
2. **Manual mode**: Fill in all fields manually (for plants where AI doesn't have good data)

The form should use the same fields as the `Plant` interface. Group fields logically: Basic Info, Sowing & Timing, Growing Conditions, Ireland Notes, Companion Planting.

**Updates to `lib/supabase.ts`**

Add:
```ts
export async function createPlant(values: Omit<Plant, "id" | "created_at">, userId: string): Promise<Plant>
export async function updatePlant(id: string, values: Partial<Plant>): Promise<Plant>
export async function getUserPlants(userId: string): Promise<Plant[]>
```

**Updates to Plant Dropdowns**

The plant selector in the "Add Planting" form (`components/beds/PlantingForm.tsx`) currently searches the shared library only. Update it to also include the user's custom plants. The query should be `is_user_created = false OR created_by = current_user_id`.

Add a "Can't find your plant? Add it →" link at the bottom of the plant search dropdown that goes to `/plants/new`.

**Add plant to `plants` page**

Add an "+ Add plant" button to the Plant Library page header, linking to `/plants/new`. User-created plants should show a small "My plant" badge in the library grid.

### Acceptance Criteria

- [ ] Can navigate to `/plants/new` and type a plant name
- [ ] "Look up" button calls the AI endpoint and pre-fills the form fields
- [ ] User can edit any AI-populated field before saving
- [ ] Saved plant appears in plant library with a "My plant" badge
- [ ] Custom plant appears in the plant selector when adding a planting to a bed
- [ ] Custom plant detail page shows all populated information
- [ ] Plant is scoped to the creating user (not visible to other users)
- [ ] If AI endpoint fails, form still works in manual mode

---

## P4-5 — Image Support

**What:** Plant cards and plant detail pages show real photos. Users can upload personal photos of their specific plants, beds, and plantings.

**Two types of images:**
1. **Reference photos** — sourced from Perenual API (free tier, 10,000 calls/month) for the shared plant library
2. **Personal photos** — uploaded by the user from their phone, stored in Supabase Storage

### Supabase Storage Setup

Create two buckets in the Supabase dashboard:
- `plant-images` — public bucket for reference photos (cached, not user-specific)
- `user-uploads` — private bucket, scoped per user. Path structure: `{user_id}/{resource_type}/{resource_id}/{filename}`

Add a `photo_url` column to the relevant tables:

```sql
-- supabase/migrations/014_add_photo_urls.sql
ALTER TABLE plants ADD COLUMN photo_url TEXT;
ALTER TABLE garden_beds ADD COLUMN photo_url TEXT;
ALTER TABLE bed_plantings ADD COLUMN photo_url TEXT;
```

### Perenual API Integration (Reference Photos)

When a plant is saved to the library (either pre-seeded or user-created), optionally fetch a reference photo from Perenual and store the URL in `plants.photo_url`.

Create `lib/perenual.ts`:
```ts
export async function fetchPlantPhoto(plantName: string): Promise<string | null>
// Calls https://perenual.com/api/species-list?key={KEY}&q={name}
// Returns the first result's `default_image.medium_url` or null
```

This can be called during the AI-assisted plant creation flow (P4-4) — after the AI fills the fields, also fetch a photo.

For the pre-seeded library plants, this can be a one-time script that runs against all existing plants with no `photo_url` and backfills them.

### Personal Photo Upload

Add photo upload capability to:
- Bed creation/edit form — photo of the physical bed
- Planting card — photo of the plant as it actually looks in Ian's garden

Build a reusable `PhotoUpload` component (`components/ui/PhotoUpload.tsx`):
- Accepts a `value` (current URL) and `onChange` (called with new URL after upload)
- Shows current photo if exists, or a placeholder
- On tap/click, opens the device's file picker (or camera on mobile: `<input type="file" accept="image/*" capture="environment">`)
- On file select, uploads to Supabase Storage under the correct path and calls `onChange` with the new URL
- Shows upload progress

### Displaying Photos

Update `PlantCard.tsx` to show `photo_url` if available, falling back to the category emoji.
Update `BedCard.tsx` to show `photo_url` if available.
Update plant detail page to show the photo prominently at the top.

### Acceptance Criteria

- [ ] Plant library cards show a real photo where available
- [ ] Plant detail page shows photo at top if available
- [ ] When adding a custom plant, a reference photo is fetched automatically
- [ ] Can upload a personal photo when adding/editing a bed
- [ ] Can upload a personal photo for a planting
- [ ] Photos are stored in Supabase Storage, not embedded
- [ ] Upload works on mobile (device camera option available)
- [ ] Falls back gracefully to emoji/placeholder if no photo

---

## P4-6 — Dashboard Personalisation

**What:** The dashboard should reflect what Ian actually has growing, not just generic monthly data. High-priority jobs should be relevant to his actual plantings. The "what to do this month" section should pull from his beds.

### Changes

**"What to Sow This Month" section** (missing from current implementation — add it)

Pull plants from the calendar for the current month that match the user's established plant categories. Show as pill chips linking to the plant detail:

```tsx
<div className="flex flex-wrap gap-2">
  {plantsToSow.map(plant => (
    <Link key={plant.id} href={`/plants/${plant.id}`} className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 hover:bg-green-200">
      {plant.name}
    </Link>
  ))}
</div>
```

Split by "Sow Indoors" and "Sow Outdoors" sub-sections.

**Planting reminders based on actual plantings**

If the user has a planting with status `seeds_started` and the expected plant-out date is within 2 weeks, surface a reminder: "Time to harden off your [Plant]". If a planting has status `growing` and harvest window starts this month, surface "Ready to harvest this month: [Plant]".

Create `lib/reminders.ts` with a `getPlantingReminders(userId)` function that queries active plantings and returns contextual reminder objects.

**Dashboard stat cards**

Currently: "Active beds" and "Active plantings" both link to `/beds`. Change "Active plantings" to show a summary breakdown (e.g. "3 growing, 2 planned") and link to `/beds?filter=active`. The "Monthly jobs" card should show progress as a visual ring or bar, not just a number.

**Beds at a glance section**

Add a condensed beds overview to the dashboard (currently in the spec but not implemented). Show 3–4 bed cards in a horizontal scroll on mobile, grid on desktop. Each card shows the bed name, active planting count, and a warning if any planting is overdue for status update.

### Acceptance Criteria

- [ ] Dashboard shows "Sow this month" section with relevant plants
- [ ] Dashboard surfaces planting reminders based on actual growing status
- [ ] Dashboard beds snapshot shows user's actual beds
- [ ] High-priority jobs are the pre-seeded jobs for the current month (always relevant regardless of personal plants)
- [ ] Stat cards don't link to duplicate pages

---

## P4-7 — Planting Health Logs

**What:** Replace the vegetable-centric harvest lifecycle with a health logging system that works for all plant types — vegetables, houseplants, cut flowers, perennials, and everything in between.

**Why:** Ian has Dracaena Fragans and other houseplants where "mark ready for harvest" makes no sense. He needs to track how plants are doing over time with observations.

### New Table

```sql
-- supabase/migrations/015_create_health_logs.sql
CREATE TABLE planting_health_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planting_id    UUID NOT NULL REFERENCES bed_plantings(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id),
  logged_at      DATE NOT NULL DEFAULT CURRENT_DATE,
  health_status  TEXT NOT NULL CHECK (health_status IN (
                   'thriving',    -- looking great
                   'healthy',     -- normal, no concerns
                   'ok',          -- fine but not flourishing
                   'struggling',  -- visible stress or problem
                   'critical',    -- serious issue, needs immediate attention
                   'dormant'      -- expected dormancy, not a problem
                 )),
  notes          TEXT,            -- what you observed
  photo_url      TEXT,            -- optional photo of the plant at this point
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE planting_health_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own health logs" ON planting_health_logs
  FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_health_logs_planting ON planting_health_logs(planting_id);
CREATE INDEX idx_health_logs_date ON planting_health_logs(logged_at DESC);
```

Also add a `current_health` column to `bed_plantings` as a denormalised snapshot:

```sql
ALTER TABLE bed_plantings ADD COLUMN current_health TEXT
  CHECK (current_health IN ('thriving', 'healthy', 'ok', 'struggling', 'critical', 'dormant'));
```

### What to Build

**New `PlantHealthBadge` component** — shows a coloured dot + label based on `current_health`. Colours: thriving = green-600, healthy = green-400, ok = stone-400, struggling = amber-500, critical = red-500, dormant = blue-300.

**Health log button on `PlantingCard`** — replace the current "Mark ready for harvest" / "Mark failed" / "Remove" buttons with:
- "Log health" — opens a quick inline form: health status selector + optional note + optional photo
- "View history" — expands a timeline of past health logs for this planting
- "Remove" — unchanged, still needed

For vegetables specifically, also show "Log harvest" button which goes to `/journal/new?type=harvest&planting_id=...&bed_id=...` (pre-filling the journal entry form).

**Health timeline in Planting detail** — when viewing a planting's logs, show them as a timeline: date, health status badge, notes, optional photo thumbnail.

**Updates to `lib/supabase.ts`**:
```ts
export async function logPlantingHealth(values: {
  planting_id: string;
  user_id: string;
  health_status: string;
  notes?: string;
  photo_url?: string;
}): Promise<void>

export async function getHealthLogs(plantingId: string): Promise<PlantingHealthLog[]>
```

### Acceptance Criteria

- [ ] "Log health" replaces "Mark ready" / "Mark failed" on planting cards
- [ ] Health log shows status selector + notes + optional photo
- [ ] After logging, planting card shows the new health status badge
- [ ] Can view full health history for a planting as a timeline
- [ ] "Log harvest" button still available for vegetable plantings (navigates to journal form)
- [ ] Health status badge visible on planting cards in bed detail page
- [ ] Works for all plant types — no vegetable-specific language in the UI

---

## P4-8 — Beds UX Overhaul

**What:** Fix the navigation and information architecture of the Beds section. Currently: clicking a planting takes you to the plant library and loses the bed context. Plant info is not visible without leaving the bed. The flow is broken.

### Navigation Fixes

**Back navigation:** When navigating from a bed to a plant detail page, the back button must return to the bed. Implement this with a `from` query param: `/plants/{id}?from=/beds/{bedId}`. The plant detail page reads `from` from `searchParams` and shows a back link accordingly:

```tsx
// app/plants/[id]/page.tsx
const backHref = searchParams.from ?? "/plants";
<Link href={backHref}>← Back</Link>
```

**Planting card improvement:** The planting card currently shows very minimal info. Expand it to show:
- Plant name (clickable → plant detail with `from` param set to this bed)
- Health status badge (from P4-7)
- Key dates (sown, expected harvest if relevant)
- Inline growing tip if the plant is in a critical phase this month
- Quick action buttons (Log health, Log harvest if vegetable, Remove)

**Bed card improvement** (`BedCard.tsx`): Show a mini list of active plantings directly on the bed card (up to 3, then "+ N more"). This means the beds overview page tells you what's in each bed without requiring a click-through.

### Inline Plant Info Panel

On the bed detail page, when a user clicks a planting, instead of navigating away, show an expandable panel below the planting card that displays the key growing info from the plant library (sun, water, spacing, current month's calendar advice, companion plants). This keeps the user in the bed context.

The panel should be a client component with a `useState` toggle. Fetch the plant data client-side when the panel is opened (or pass it as a prop since the parent server component already has it via the join).

### Acceptance Criteria

- [ ] Clicking a plant name in a bed opens plant detail with a "Back to [Bed name]" link
- [ ] Back link returns to the correct bed, not the plant library
- [ ] Bed cards on the overview page show a preview of active plantings
- [ ] Planting cards show health status, key dates, and quick actions
- [ ] Inline plant info panel works without navigating away from the bed
- [ ] Mobile layout works correctly — panels don't cause horizontal scroll

---

## P4-9 — Calendar Category Filter

**What:** The calendar page currently shows all plants for a month grouped by action type (Sow Indoors / Sow Outdoors / Plant Out / Harvest) but has no way to filter by plant category. The UI spec called for filter tabs (All / Vegetables / Flowers / Herbs / Perennials) but they were never implemented.

### What to Build

Update `CalendarPage` to read a `category` search param in addition to `month`. Pass it to `getPlantsForMonth()` which should accept an optional category filter.

Update `MonthSelector.tsx` (or create a sibling `CalendarFilters.tsx` client component) to render the category filter tabs. The tabs should preserve the current `month` param when changing category.

Update `lib/supabase.ts` `getPlantsForMonth()` to accept an optional category:

```ts
export async function getPlantsForMonth(month: number, category?: string): Promise<Plant[]>
```

### Acceptance Criteria

- [ ] Category filter tabs visible on calendar page: All / Vegetables / Flowers / Herbs / Perennials
- [ ] Selecting a category filters the plants shown
- [ ] Month navigation preserves the selected category
- [ ] "All" tab is selected by default
- [ ] Filter state is in the URL (`?month=3&category=vegetable`) so it's shareable/bookmarkable

---

## Phase 4 Checklist

Before declaring Phase 4 complete:

- [ ] All 9 tasks completed and deployed
- [ ] Ian can log in with his own account
- [ ] Ian's beds, plantings, and settings are private to him
- [ ] A friend can sign up and see their own empty garden (not Ian's data)
- [ ] Pre-seeded plant library and monthly jobs are visible to all users
- [ ] Ian has added at least one custom plant (e.g. Dracaena Fragans) with AI enrichment
- [ ] At least one bed and one planting have personal photos
- [ ] Dashboard shows relevant content based on Ian's actual plantings
- [ ] Health logging works for both vegetable and non-vegetable plants
- [ ] In-app feedback is capturing Ian's thoughts
- [ ] `npm run build` passes with no errors or warnings
- [ ] App is fully functional on mobile (test on actual phone)

---

## Future Phase 5 (Do Not Build Now — Reference Only)

- Visual garden grid designer (SVG/canvas based bed layout)
- Crop rotation warnings (flag if same plant family in bed within 3 years)
- Composting tracker
- Tool inventory UI (`tools` table already exists)
- Google Calendar export (iCal .ics)
- Plant health diagnosis assistant (symptom checklist → likely cause)
- PWA setup (manifest, Add to Home Screen)
- Admin dashboard for Ian to manage feedback and users
