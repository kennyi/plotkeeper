# Design: Codebase Documentation Cleanup
**Date:** 2026-03-23
**Status:** Approved

## Problem

The PlotKeeper repo has accumulated ~10 root-level markdown files and a `docs/superpowers/` tree from early planning phases. These files:
- Reflect an old Phase 1–4 roadmap framing that no longer matches the app's direction
- Contain forward-looking content (Phase 4 plans, wishlist features) that constrains rather than guides
- Load unnecessary context into every Claude Code session via CLAUDE.md's size (17KB)
- Duplicate information already in the live codebase (schema in migrations, patterns in code)

## Goal

A lean, current-state documentation setup where:
- CLAUDE.md is small (~4KB) and contains only rules + patterns — always relevant, always loaded
- Reference material lives in dedicated files only pulled in when needed
- Nothing forward-looking, speculative, or superseded remains in the repo

## New File Structure

```
CLAUDE.md                  # rules + patterns only (~4KB)
docs/
  SCHEMA.md                # DB tables, column notes, status lifecycles
  KNOWN_ISSUES.md          # current bugs and gaps (no wishlist/roadmap items)
```

## CLAUDE.md Contents (rewritten from scratch)

Sections to include:
1. **What this app is** — 2-3 sentences: personal garden manager, Kildare/Ireland-calibrated, single-user, deployed on Vercel + Supabase
2. **Tech stack** — one-line-per-layer table (Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui, Supabase, Open-Meteo). No forward-looking auth/image notes.
3. **Condensed project structure** — key directories only with one-line annotations (no per-file annotations). Cover `app/`, `app/actions/`, `components/`, `lib/`, `types/`, `supabase/migrations/`. ~500 words.
4. **Established patterns** — the must-follow coding rules:
   - Server components by default, `use client` only when needed
   - All data fetching via `lib/supabase.ts` functions (never query directly in components)
   - All mutations via Server Actions in `app/actions/`
   - `.catch()` fallbacks on every DB call
   - `Header` component on every page
   - Empty states on every list
   - `garden-*` colour tokens for branded elements
5. **Supabase data layer** — grouped function index for `lib/supabase.ts`: Plants, Beds, Plantings, Jobs, Journal, Settings, Dashboard, Tasks. This prevents agents re-querying Supabase directly or inventing function names.
6. **Workflow rules** — `npx vitest run` before commit, `npm run build` before push
7. **Design principles** — mobile-first, earthy calm palette, graceful degradation, Ireland-specific
8. **Running locally** — `npm install`, `npm run dev`, `npm run build`
9. **Reference pointers** — "See docs/SCHEMA.md" and "See docs/KNOWN_ISSUES.md"

## docs/SCHEMA.md Contents

- Current tables only (no Phase 4 tables): `plants`, `garden_beds`, `bed_plantings`, `monthly_jobs`, `journal_entries`, `garden_settings`, `tools`
- One-line purpose per table
- `bed_plantings` status lifecycle: `planned → seeds_started → germinating → growing → ready → harvested → finished/failed`
- Note that migrations in `supabase/migrations/` are the authoritative source

## docs/KNOWN_ISSUES.md Contents

Current bugs and gaps only — no wishlist, no roadmap:
- Sidebar active state never highlights (missing `usePathname()`)
- MONTH_NAMES duplicated in `types/index.ts` and `lib/constants.ts`
- Calendar has no category filter
- No pagination on plant library or journal
- No edit flow for journal entries
- Sidebar frost dates are hardcoded (should read from `garden_settings`)
- Content gap: no seeded plants for `fruit`, `shrub`, `bulb` categories
- `deleteBed` soft-deletes but `deletePlanting` hard-deletes — naming inconsistency (consider `archiveBed`)

## Files to Delete

Root-level:
- `PROJECT_OVERVIEW.md`
- `BUILD_PHASES.md`
- `PROJECT_INSTRUCTIONS.md`
- `TECHNICAL_ARCHITECTURE.md`
- `DATABASE_SCHEMA.md`
- `PHASE4_INSTRUCTIONS.md`
- `API_INTEGRATIONS.md`
- `UI_SPECIFICATIONS.md`
- `DEBUGGING_GUIDE.md`

Directories:
- `docs/superpowers/` (entire directory, including this spec once done). Contains: `plans/2026-03-21-dashboard-redesign.md`, `specs/2026-03-21-dashboard-redesign-design.md`, `specs/2026-03-23-codebase-cleanup-design.md` (this file).
- `.superpowers/` (entire root directory — contains brainstorm session outputs in numbered subdirs; all expired prototypes)

## Success Criteria

- CLAUDE.md is under 5KB
- No forward-looking or phase-plan language anywhere in the repo's docs
- A new Claude session has everything it needs to work effectively from CLAUDE.md alone
- Reference files exist and are accurate to current app state
