# PlotKeeper — Build Phases

## Overview

4 phases. Each phase ends with a working, deployed app. Don't start Phase 2 until Phase 1 checklist is complete.

| Phase | Focus | Outcome |
|---|---|---|
| 1 | Foundation | Deployed app with plant library + calendar |
| 2 | Core Features | Beds manager, plantings, monthly jobs |
| 3 | Smart Features | Weather alerts, journal, companion planting |
| 4 | Polish & Advanced | Visual grid, crop rotation, Google Calendar |

---

## Phase 1: Foundation (Days 1–3)

**Goal:** A deployed, working app that shows the planting calendar and plant library. Proves the stack works end-to-end.

### Tasks

- [ ] **#1** Create GitHub repository `plotkeeper`
- [ ] **#2** Initialise Next.js 14 project with TypeScript + Tailwind + shadcn/ui
- [ ] **#3** Set up Supabase project (eu-west region), add environment variables to Vercel
- [ ] **#4** Create and run migration: `001_create_plants.sql`
- [ ] **#5** Create and run migration: `007_create_garden_settings.sql`
- [ ] **#6** Seed garden settings (Kildare defaults: lat/lng, frost dates, hardiness zone)
- [ ] **#7** Write and run `008_seed_plants.sql` — full plant database (vegetables + flowers + herbs)
- [ ] **#8** Build root layout: sidebar nav (desktop) + bottom nav (mobile)
- [ ] **#9** Build Plant Library page (`/plants`) with search and category filters
- [ ] **#10** Build Plant Detail page (`/plants/[id]`) with full growing info
- [ ] **#11** Build Planting Calendar page (`/calendar`) with month selector and category filters
- [ ] **#12** Deploy to Vercel, verify plant library and calendar work on mobile

### Phase 1 Checklist

**Functionality:**
- [ ] Plant library loads and is searchable
- [ ] Category filters work (veg / flowers / herbs / perennials)
- [ ] Plant detail page shows full info (sow dates, spacing, germination, frost risk, etc.)
- [ ] Calendar shows correct plants for each month
- [ ] Month navigation works
- [ ] Calendar filters by category

**Deployment:**
- [ ] Vercel build succeeds with no errors
- [ ] Environment variables set in Vercel
- [ ] App loads on mobile browser
- [ ] Supabase queries work in production

**Data Quality:**
- [ ] At least 20 vegetables seeded with complete data
- [ ] At least 15 cut flowers seeded with complete data
- [ ] At least 10 herbs/perennials seeded
- [ ] All plants have: sow dates, plant out dates, harvest dates, spacing, germination info

---

## Phase 2: Core Features (Days 4–9)

**Goal:** Full bed management system, planting tracker, and monthly jobs list. The app becomes genuinely useful for planning.

### Tasks

- [ ] **#13** Create and run migrations for `garden_beds`, `bed_plantings`, `monthly_jobs`, `tools`
- [ ] **#14** Seed monthly jobs — all 12 months of Kildare-specific gardening tasks
- [ ] **#15** Build Beds Overview page (`/beds`) — list all beds with status
- [ ] **#16** Build Add/Edit Bed form — with all fields (type, dimensions, sun, soil, section)
- [ ] **#17** Build Bed Detail page (`/beds/[id]`) — shows all plantings, history, spacing guide
- [ ] **#18** Build Add Planting form — search plant library or type custom, set row, quantity, dates
- [ ] **#19** Build planting status lifecycle (planned → seeds started → growing → harvested → finished)
- [ ] **#20** Build Monthly Jobs page (`/jobs`) — month selector, category filter, mark done
- [ ] **#21** Add custom job functionality (user can add jobs to any month)
- [ ] **#22** Build Dashboard (`/dashboard`) — current month summary, top jobs, bed snapshot, sow-this-month section
- [ ] **#23** Build Settings page (`/settings`) — edit garden profile
- [ ] **#24** Add spacing calculator to bed detail (based on bed width ÷ plant spacing)
- [ ] **#25** Build crop history section on bed detail (previous years' plantings)
- [ ] **#26** Final mobile responsiveness pass across all pages

### Phase 2 Checklist

**Functionality:**
- [ ] Can add, edit, delete beds
- [ ] Can add plantings to beds from plant library or custom entry
- [ ] Can update planting status through lifecycle
- [ ] Monthly jobs show for current month with correct priority
- [ ] Jobs can be marked done (persists)
- [ ] Custom jobs can be added to any month
- [ ] Dashboard shows current month's sow list and top jobs
- [ ] Spacing calculator gives sensible result
- [ ] Bed history shows previous years

**Data:**
- [ ] All 12 months have at least 5 pre-seeded jobs
- [ ] High-priority months (March–May, September) have 8+ jobs

**UX:**
- [ ] All forms have validation
- [ ] Loading states on async operations
- [ ] Empty states (no beds yet, no plantings yet) have helpful prompts
- [ ] Works on mobile without horizontal scroll

---

## Phase 3: Smart Features (Days 10–14)

**Goal:** Weather integration, harvest/journal logging, companion planting, pest guide.

### Tasks

- [ ] **#27** Create `journal_entries` migration and seed with example entries
- [ ] **#28** Integrate Open-Meteo API — build `/api/weather` proxy route
- [ ] **#29** Add weather alert logic: frost warning (< 2°C in next 3 days) + slug alert (rain + temp > 5°C)
- [ ] **#30** Display weather alerts on dashboard (dismissable, refresh daily)
- [ ] **#31** Build Journal page (`/journal`) — list entries by date, filter by type
- [ ] **#32** Build Add Journal Entry form — type selector, optional bed/plant link, quantity for harvests
- [ ] **#33** Add problem/diagnosis section to journal entries
- [ ] **#34** Add companion planting section to Plant Detail page
- [ ] **#35** Build Pest Guide — common Irish garden pests with identification + treatment info
- [ ] **#36** Add slug risk indicator to plant cards (high risk = 🐌 warning badge)
- [ ] **#37** Add "sow succession" flag to calendar for plants that should be staggered

### Phase 3 Checklist

- [ ] Weather alerts appear on dashboard when conditions met
- [ ] Weather data refreshes daily (cached for 1 hour)
- [ ] Journal entries can be created, viewed, and filtered
- [ ] Harvest entries can record quantity with units
- [ ] Problem entries support diagnosis and treatment fields
- [ ] Companion planting shows on plant detail pages
- [ ] Pest guide covers at least: slugs, aphids, carrot fly, cabbage white, vine weevil, blight
- [ ] No crashes when Open-Meteo is unavailable (graceful fallback)

---

## Phase 4: Polish & Advanced (Days 15+)

**Goal:** Visual grid designer, crop rotation helpers, Google Calendar export, overall polish.

### Tasks

- [ ] **#38** Build visual garden grid designer — SVG or canvas-based, place beds on a grid
- [ ] **#39** Add crop rotation tracker — warn if same plant family used in bed within 3 years
- [ ] **#40** Add composting tracker — log what goes in, estimated ready date
- [ ] **#41** Build tool inventory page — list owned tools with condition tracker
- [ ] **#42** Build Google Calendar export (iCal format) — export upcoming jobs as .ics file
- [ ] **#43** Add plant health diagnosis helper — symptom checklist → likely diagnosis
- [ ] **#44** Performance audit — check Supabase query times, add caching where needed
- [ ] **#45** Accessibility pass — keyboard navigation, screen reader labels
- [ ] **#46** SEO and PWA setup — manifest, icons, "Add to Home Screen" prompt

---

## GitHub Project Board Setup

Create the following columns:

```
📋 Backlog → 🎯 Sprint → 🔨 In Progress → 👀 Review → ✅ Done
```

Labels to create:
- `phase-1` (green)
- `phase-2` (blue)
- `phase-3` (purple)
- `phase-4` (orange)
- `bug` (red)
- `enhancement` (yellow)
- `data` (teal) — for seed data / database tasks
- `ui` (pink)
- `blocked` (grey)

At project start, create all Phase 1 issues (#1–#12) in Backlog. Move to Sprint before each work session. Move to Done as completed.

---

## Issue Template

Use this format for each GitHub issue:

```markdown
## What
[One sentence description]

## Why
[Why this is needed / what it unlocks]

## Acceptance Criteria
- [ ] Specific, testable condition 1
- [ ] Specific, testable condition 2
- [ ] Deployed and working in production

## Notes
[Any technical details, edge cases, or references]
```
