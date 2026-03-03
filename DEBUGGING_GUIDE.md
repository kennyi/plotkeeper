# PlotKeeper — Debugging Guide

## Quick Diagnosis

| Symptom | Likely Cause | Jump to |
|---|---|---|
| White screen / nothing loads | Build error or missing env vars | → Env vars |
| "relation does not exist" | Migration not run | → Supabase migrations |
| Plants not showing in calendar | Seed data issue or query bug | → Calendar query |
| Vercel build fails | TypeScript error or missing dep | → Vercel build |
| Supabase returns empty array | Wrong column name or filter | → Supabase queries |
| Weather not showing | Open-Meteo unreachable or bad coords | → Weather API |
| Styles not applying | Tailwind class not in build | → Tailwind |

---

## Environment Variables

**Most common issue: works locally but fails on Vercel.**

Check:
1. Vercel dashboard → Project → Settings → Environment Variables
2. Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be set
3. After adding env vars, redeploy (not just "visit site")
4. `NEXT_PUBLIC_` prefix is required — without it, variables are server-only and won't work in client components

Local `.env.local` format:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get these from: Supabase dashboard → Project Settings → API

---

## Supabase: Common Issues

### "relation does not exist"
```
ERROR: relation "plants" does not exist
```
**Fix:** The migration hasn't been run. Go to Supabase → SQL Editor → paste and run the migration file.

### Empty query results
```typescript
const { data, error } = await supabase.from('plants').select('*');
// data = []
```
**Debug steps:**
1. Open Supabase dashboard → Table Editor — is the table there? Is it empty?
2. Check the seed script ran (`008_seed_plants.sql`)
3. Check you're querying the right project (URL in .env.local)
4. Add `.limit(5)` and check if anything comes back

### "invalid input syntax for type uuid"
You're passing a string where a UUID is expected. Check that the `id` value being used is a proper UUID, not an integer or undefined.

### Supabase client not initialising
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```
If `supabaseUrl` is undefined, the `!` assertion will hide the error. Check by logging the values before passing to `createClient`.

---

## Next.js: Common Issues

### "useRouter/useSearchParams must be wrapped in Suspense"
In Next.js 14 App Router, any component that uses `useSearchParams()` must be wrapped in a `<Suspense>` boundary.

```tsx
// Correct approach
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CalendarContent />
    </Suspense>
  );
}
```

### Server vs Client component confusion
If you see "useState is not a function" or "Event handlers cannot be passed to Client Component props":
- Add `'use client'` at the top of any component that uses hooks, event handlers, or browser APIs
- Data fetching (async/await with Supabase) should happen in server components

### Hydration errors
Usually caused by date formatting differences between server and client. Always format dates client-side or use a consistent method:
```typescript
// Prefer this
const monthName = new Intl.DateTimeFormat('en-IE', { month: 'long' }).format(date);
// Over direct string methods that can differ by locale
```

---

## Vercel: Build Failures

### TypeScript errors blocking build

Vercel runs `tsc --noEmit` during build. Common issues:

```bash
# See full error list
npx tsc --noEmit
```

Fix TypeScript errors locally before pushing. Common ones:
- Missing type on function parameter → add `: string`, `: number`, etc.
- `any` type warnings → add `// eslint-disable-next-line @typescript-eslint/no-explicit-any` if unavoidable
- Missing return type → let TypeScript infer it or add explicitly

### Build takes too long / times out
If the seed SQL files are very large, don't import them at build time. Run them manually via Supabase SQL editor, not as part of the Next.js build.

### "Module not found"
Check import paths. Next.js App Router uses `@/` as the root alias:
```typescript
import { supabase } from '@/lib/supabase';  // ✓ correct
import { supabase } from '../../lib/supabase';  // ✗ fragile
```
Ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## Calendar: Query Logic Issues

The calendar query filters plants by month. Common bugs:

### Plants missing from correct month
Check the seed data. For March, a plant should show if:
- `sow_indoors_start <= 3 AND sow_indoors_end >= 3` (for "sow indoors" section)
- Or `transplant_start <= 3 AND transplant_end >= 3` (for "plant out" section)

```sql
-- Debug: check what plants have March as a sow month
SELECT name, sow_indoors_start, sow_indoors_end
FROM plants
WHERE sow_indoors_start <= 3 AND sow_indoors_end >= 3;
```

### Plants appearing in wrong months
Usually a data entry issue in the seed SQL. Check the month numbers — January = 1, December = 12.

---

## Weather API: Issues

### Open-Meteo returning 400 / bad request
Check the coordinates. Kildare: `latitude=53.1581&longitude=-6.9108`. If parameters are malformed (e.g. passing null), the API returns 400.

### Weather showing but stale
The `revalidate: 3600` cache means data is cached for 1 hour. To force refresh during development, add `cache: 'no-store'` temporarily.

### No weather alerts showing even when cold
Check the alert threshold logic. The frost warning triggers at ≤ 2°C (not 0°C) because ground frosts can occur at positive air temperatures. Also check that the API is returning `temperature_2m_min` in the daily forecast object.

---

## Tailwind: Styles Not Applying

### Dynamic class names not working
Tailwind purges unused classes at build time. Dynamic classes like `bg-${color}-500` won't work unless the full class string appears somewhere in the codebase.

```typescript
// ✗ Won't work - dynamic class
const colour = 'green';
<div className={`bg-${colour}-500`} />

// ✓ Works - full class name
const classes = { green: 'bg-green-500', red: 'bg-red-500' };
<div className={classes[colour]} />
```

### shadcn/ui components not styled correctly
Make sure the `globals.css` file is imported in the root layout and contains the shadcn CSS variables. Run `npx shadcn-ui@latest init` again if something looks off.

---

## Seed Data: Common Issues

### Running the seed script multiple times creates duplicates
Add `ON CONFLICT DO NOTHING` to your INSERT statements:
```sql
INSERT INTO plants (id, name, ...) VALUES (gen_random_uuid(), 'Tomato', ...)
ON CONFLICT (name) DO NOTHING;
```
Or better: use a stable UUID for each plant so re-running is idempotent:
```sql
INSERT INTO plants (id, name, ...) VALUES ('a1b2c3d4-...', 'Tomato', ...)
ON CONFLICT (id) DO NOTHING;
```

### Month numbers off by one
JavaScript `Date.getMonth()` returns 0–11 (Jan=0). PostgreSQL months are 1–12 (Jan=1). When building queries that compare JS dates to DB months, always add 1:
```typescript
const currentMonth = new Date().getMonth() + 1; // 1-12
```

---

## General Debugging Tips

1. **Check the browser console first** — most client-side errors are immediately visible
2. **Check Vercel function logs** — for server-side errors in API routes
3. **Check Supabase logs** — Supabase dashboard → Logs → API for query errors
4. **Isolate the problem** — comment out half the code until the error disappears, then narrow it down
5. **Check the network tab** — for API calls, verify what's actually being sent and returned
6. **When in doubt, restart** — `npm run dev` can get into weird states; kill and restart
