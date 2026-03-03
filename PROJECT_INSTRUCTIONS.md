# PlotKeeper — Project Instructions

> **This is the master guide for Claude.** Read this at the start of every session before touching any code.

---

## What This Project Is

PlotKeeper is a personal garden management web app for Ian in Kildare, Ireland. It's a solo-use, no-auth app deployed on Vercel with a Supabase PostgreSQL database. The core value is Ireland-specific gardening data (planting calendars, frost dates, slug risk, monthly jobs) combined with a personal bed/planting tracker.

**GitHub repo:** `plotkeeper`
**Live URL:** (set once deployed to Vercel)
**Supabase project:** (add URL once created)

---

## Build Rules

1. **Check the GitHub tracker first** — every session starts by reviewing the project board. What's In Progress? What was last committed?
2. **Follow the feedback loop** — Discuss → Build → Deploy → Check → Troubleshoot → Repeat
3. **Update the tracker at session end** — mark issues done, note blockers, create next issues
4. **Test before marking complete** — verify in the deployed Vercel app, not just locally
5. **Mobile matters** — check every UI change on a small screen before marking done
6. **Don't touch the schema without a migration file** — all DB changes go in `/supabase/migrations/`
7. **Seed data is sacred** — the plant database is the backbone of the app; changes to it need care

---

## Current Phase

**Phase 1: Foundation**

Priority: Get the plant library and planting calendar deployed and working. Prove the stack works end-to-end before adding beds or jobs.

See `BUILD_PHASES.md` for the full issue list.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | None |
| Hosting | Vercel |
| Weather | Open-Meteo (Phase 3, free, no key) |

---

## Key Files

| File | Purpose |
|---|---|
| `PROJECT_OVERVIEW.md` | What, who, why, vision |
| `TECHNICAL_ARCHITECTURE.md` | Stack, file structure, data flows |
| `DATABASE_SCHEMA.md` | Full SQL schema + seed data guidance |
| `API_INTEGRATIONS.md` | Open-Meteo weather API details |
| `UI_SPECIFICATIONS.md` | Page layouts, components, design system |
| `BUILD_PHASES.md` | 46 issues across 4 phases |
| `DEBUGGING_GUIDE.md` | Common issues and fixes |

---

## Session Start Checklist

- [ ] Check GitHub Project board — review "In Progress" and "Sprint" columns
- [ ] Read recent commits (`git log --oneline -10`)
- [ ] Check Vercel deployment status
- [ ] Review any open GitHub issues with "blocked" label
- [ ] Confirm which Phase we're in and what the current priority is

---

## Session End Checklist

- [ ] Mark completed GitHub issues as Done
- [ ] Push all commits with clear messages
- [ ] Verify Vercel build succeeded
- [ ] Note any blockers in relevant GitHub issues
- [ ] Create issues for next session's priorities
- [ ] Update this file's "Current Phase" section if phase changed

---

## Common Commands

```bash
# Start dev server
npm run dev

# Type check (catches build errors before pushing)
npx tsc --noEmit

# Install new shadcn component
npx shadcn-ui@latest add [component-name]

# Run Supabase locally (optional, can use hosted instead)
npx supabase start

# Format code
npx prettier --write .
```

---

## Environment Variables

```env
# .env.local (never commit this file)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get from: Supabase dashboard → Project Settings → API → Project URL + anon public key

Also add both to Vercel: Project → Settings → Environment Variables

---

## Deployment

1. Push to `main` branch on GitHub
2. Vercel auto-deploys within ~1 minute
3. Check Vercel dashboard for build status and function logs
4. If build fails, check TypeScript errors first: `npx tsc --noEmit`

---

## Ireland / Kildare Specifics

Always bear these in mind when writing plant data or calendar logic:

- **Last frost:** ~April 10–20 (varies year to year; be conservative — April 20 is safer)
- **First frost:** ~October 20–November 5
- **Growing season:** May–October for tender crops outdoors
- **Slug season:** March–May and September–October, worst after warm rain
- **Hardiness scale:** Use RHS H-scale (H1–H7), not USDA zones
- **Month numbers:** January = 1, December = 12 (for DB queries)
- **Irish climate:** Mild and wet. Most plants need "well-drained" soil. Wind exposure is a real factor. Polytunnels/greenhouses extend the season significantly.

---

## Key Decisions Made

| Decision | Reason |
|---|---|
| No auth in Phase 1–2 | Personal use only — adds complexity with no benefit |
| Supabase over local Postgres | Hosted, free tier sufficient, easy to query via dashboard |
| Structured data (not visual grid) first | Visual grid deferred to Phase 4 — gets core functionality working faster |
| Pre-seeded plant data | The plant library is the heart of the app; hand-curating Ireland-specific data is worth the effort |
| Open-Meteo for weather | Free, no key, good Ireland coverage |
| Month numbers as integers (1–12) | Simpler to query than storing month names or dates |

---

## What NOT To Do

- Don't add auth until there's a reason (planned for Phase 4+ if ever)
- Don't use the multi-tenant schema patterns from the framework — this is a personal app, no `organization_id` needed
- Don't store sensitive env vars in code — use `.env.local` locally and Vercel env vars in production
- Don't skip the phase checklists — they exist to catch issues before they compound
- Don't add visual grid designer before Phase 4 — it's complex and blocks faster progress
