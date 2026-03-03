# PlotKeeper — Technical Architecture

## Stack Overview

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | File-based routing, server components, API routes built in |
| Language | TypeScript | Type safety across DB, API, and UI |
| Styling | Tailwind CSS | Fast, consistent utility-first styling |
| Components | shadcn/ui | Accessible, well-designed component library |
| Database | Supabase (PostgreSQL) | Hosted Postgres, good free tier, easy querying |
| ORM | Supabase JS Client | Direct querying, no ORM complexity needed at this scale |
| Auth | None (Phase 1–2) | Personal app, no login required |
| Hosting | Vercel | Seamless Next.js deployment, free tier covers personal use |
| Weather | Open-Meteo API (Phase 3) | Free, no API key, excellent Ireland coverage |

---

## Project Structure

```
plotkeeper/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (nav, sidebar)
│   ├── page.tsx                  # Dashboard (redirects to /dashboard)
│   ├── dashboard/
│   │   └── page.tsx              # Main dashboard: current month overview
│   ├── calendar/
│   │   └── page.tsx              # Planting calendar: month-by-month view
│   ├── beds/
│   │   ├── page.tsx              # All beds overview
│   │   └── [id]/page.tsx         # Individual bed detail
│   ├── plants/
│   │   ├── page.tsx              # Plant library (searchable)
│   │   └── [id]/page.tsx         # Individual plant detail
│   ├── jobs/
│   │   └── page.tsx              # Monthly jobs list
│   ├── journal/                  # Phase 3
│   │   └── page.tsx
│   └── api/
│       ├── beds/route.ts
│       ├── plantings/route.ts
│       ├── jobs/route.ts
│       └── weather/route.ts      # Phase 3: proxy to Open-Meteo
│
├── components/
│   ├── ui/                       # shadcn/ui components (auto-generated)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileNav.tsx
│   ├── dashboard/
│   │   ├── MonthSummary.tsx
│   │   ├── CurrentJobs.tsx
│   │   └── BedSnapshot.tsx
│   ├── calendar/
│   │   ├── CalendarGrid.tsx
│   │   ├── PlantCard.tsx
│   │   └── MonthSelector.tsx
│   ├── beds/
│   │   ├── BedCard.tsx
│   │   ├── BedForm.tsx
│   │   └── PlantingRow.tsx
│   └── plants/
│       ├── PlantCard.tsx
│       └── PlantSearch.tsx
│
├── lib/
│   ├── supabase.ts               # Supabase client setup
│   ├── constants.ts              # Month names, categories, Irish growing data
│   └── utils.ts                 # Helper functions
│
├── types/
│   └── index.ts                 # TypeScript interfaces for all DB tables
│
├── scripts/
│   └── seed.ts                  # Seed script for plant database + monthly jobs
│
├── .env.local                   # Supabase URL + anon key
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## Data Flow

### Dashboard Load
```
User visits / → Next.js server component
→ Supabase: fetch current month's jobs
→ Supabase: fetch all beds with active plantings
→ Supabase: fetch plants with harvest/action due this month
→ Render dashboard with month summary
```

### Planting Calendar
```
User selects month → client component
→ Supabase: fetch all plants WHERE sow_indoors_start <= month <= sow_indoors_end
→ Supabase: fetch all plants WHERE transplant_start = month
→ Supabase: fetch all plants WHERE harvest_start <= month <= harvest_end
→ Render grouped by action type (sow indoor / sow outdoor / plant out / harvest)
```

### Add Planting to Bed
```
User picks bed → picks plant from library (or types custom)
→ Input: row number, quantity, date sown
→ POST /api/plantings
→ Supabase: INSERT into bed_plantings
→ Revalidate bed detail page
```

### Weather (Phase 3)
```
Dashboard loads → fetch /api/weather (server-side)
→ Open-Meteo API: Kildare lat/lng
→ Parse: min temp (frost warning), precipitation (slug alert)
→ Display contextual warnings on dashboard
```

---

## Ireland-Specific Data Layer

The app ships with a comprehensive seed dataset pre-loaded into Supabase. This is the core value of the app and should be treated as carefully maintained reference data.

### Irish Planting Calendar Logic

All plant timing is calibrated for **Kildare, Ireland**:
- Last frost: ~April 10–20 (varies year to year)
- First frost: ~October 20–November 5
- Growing season: May–October outdoors
- Indoor sowing season: January–April (heated) / February–May (unheated)
- Slug high-risk months: March–May, September–October (after rain)

### Hardiness Scale

Uses RHS H-scale (more appropriate for Ireland/UK than USDA zones):
- H4: Hardy through most of UK/Ireland (survives -5 to -10°C)
- H5: Hardy in most places (survives -10 to -15°C)
- H6: Very hardy (survives -15 to -20°C)

Kildare is generally H4–H5 depending on microclimate.

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

No other API keys required for Phase 1–2. Open-Meteo (Phase 3) requires no key.

---

## Deployment Architecture

```
GitHub repo (plotkeeper)
    ↓ push to main
Vercel (auto-deploy)
    ↓
Next.js app served globally
    ↓ DB queries
Supabase (hosted PostgreSQL in eu-west region)
```

Vercel environment variables: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel project settings.

---

## Key Architectural Decisions

**No auth in Phase 1–2:** The app is personal use. The Supabase anon key with no Row Level Security is acceptable. If the app is ever shared or made public, auth + RLS should be added before that.

**Server components by default:** Use Next.js server components for all data fetching. Only use `'use client'` when interactivity is needed (forms, search filters, month selector).

**Pre-seeded plant data:** The plants table is the backbone of the app. It should be seeded via a script (not manually) so it can be re-run and version controlled.

**Structured data over visual first:** The visual grid designer is deferred to Phase 4. For now, beds are managed as structured records (name, dimensions, contents). This keeps Phase 1–2 achievable.
