# Dashboard Redesign — Design Spec
**Date:** 2026-03-21
**Status:** Approved

---

## Problem Statement

The PlotKeeper dashboard is the first thing Ian sees when he opens the app in the garden. Currently it feels "cluttered yet sparse" — elements take up space without earning it, the stat cards give admin-dashboard energy rather than calm-garden energy, and the most common daily action (logging care) isn't surfaced at all. Weather data exists but frost dates are hardcoded. There is no quick-log flow.

**Goal:** Open the app, immediately know what matters today — weather, tasks, a fast way to log care — without digging through menus. The UI should feel calm, intentional, and alive.

---

## Out of Scope

- Plant journal / logbook (per-plant log with photos — separate spec)
- New navigation items or routes
- New database tables or columns (all Quick Log events use existing `planting_task_events`)
- New `TaskEventType` values (Quick Log uses only existing valid types)

---

## Page Layout (New Order)

```
1. Weather Card         ← hero element, animated, dynamic
2. To Do Today          ← existing, minor polish
3. Quick Log            ← new, replaces stat cards
4. Sow This Month       ← existing, unchanged
5. Your Beds            ← existing, unchanged
```

---

## Section 1 — Weather Card (Enhanced)

### Current Problems
- Frost dates are hardcoded strings (`Last frost ~20 Apr · First frost ~30 Oct`)
- No weather condition label — just temp numbers and mm rain
- No visual feedback about what kind of day it is
- Static — the same visual regardless of conditions

### Changes

**Add `weathercode` to weather fetch:** `lib/weather.ts` must add `weather_code` to the Open-Meteo daily request:
```
&daily=temperature_2m_min,temperature_2m_max,precipitation_sum,weather_code
```
The `WeatherDay` interface gains a new field:
```ts
weatherCode: number; // WMO weather interpretation code
```
The `getWeatherForecast` mapping function maps `data.daily.weather_code[i]` to this field.

**WMO-to-condition mapping:** A pure utility function `getWeatherCondition(code: number): WeatherCondition` lives in `lib/weather.ts` (not in the component). It maps WMO codes to a `WeatherCondition` type:
```ts
type WeatherCondition = "clear" | "partly-cloudy" | "cloudy" | "drizzle" | "rain" | "heavy-rain" | "thunderstorm" | "fog" | "snow";
```
WMO code ranges (from Open-Meteo docs):
- 0 → `clear`
- 1, 2 → `partly-cloudy`
- 3 → `cloudy`
- 45, 48 → `fog`
- 51, 53, 55 → `drizzle`
- 61, 63 → `rain`
- 65, 80, 81 → `heavy-rain`
- 82, 95, 96, 99 → `thunderstorm`
- 71, 73, 75, 77, 85, 86 → `snow`

**Condition label:** Show a human-readable label on the Today card derived from `getWeatherCondition()` — e.g. "Clear", "Rainy", "Heavy Rain". Sits below the temperature.

**Today card prominence:** The "Today" cell is slightly larger or more padded than the other three days.

**Dynamic frost line:** Replace the hardcoded string with values read from `garden_settings`:
```
{locationName} · RHS Zone {hardiness_zone} · Last frost ~{last_frost_approx} · First frost ~{first_frost_approx}
```
Each segment is only rendered if the settings value exists — no empty ` · ` gaps.

**Ambient weather animations:** A new `WeatherCard` client component wraps the forecast strip and renders CSS-only ambient animations behind the Today card based on `WeatherCondition`:

| Condition | Animation |
|-----------|-----------|
| `clear` | Soft warm glow pulse on Today card background; faint golden/amber tint (`linen-100`) |
| `partly-cloudy` | Slow drifting semi-transparent cloud shapes |
| `cloudy` | Muted cool stone tone; no animation — stillness IS the signal |
| `drizzle` / `rain` | Thin vertical falling-line rain particles (CSS `@keyframes`) |
| `heavy-rain` | Faster, denser rain particles; blue-grey card tint |
| `fog` | Very low opacity blur shimmer |
| `snow` | Slow falling dot particles |
| `thunderstorm` | Rain particles + occasional subtle flash pulse |

Animations are ambient — not distracting. They live in `app/globals.css` as named `@keyframes`. `prefers-reduced-motion` is respected: all animations are disabled via `@media (prefers-reduced-motion: reduce)`.

**Colour palette shift on Today card background:**
- `clear` → `bg-linen-100` (warm amber)
- `cloudy` / `fog` → `bg-stone-100` (cool grey)
- `rain` / `heavy-rain` → `bg-blue-50` (muted blue-grey)
- default → `bg-linen-100` (existing)

---

## Section 2 — To Do Today (Minor Polish)

### Current State
Already works well. Shows up to 5 overdue/due-today smart tasks + custom tasks. The section disappears entirely when there are no tasks, causing visual instability.

### Changes
- **Always render this section**, even when empty
- **Empty state:** When `dashTasks.length === 0 && customTasks.length === 0`, show:
  > *"Nothing pressing today. Enjoy the garden."*
  Soft, centred, small — not a large empty-state box, just a reassuring line of muted text

---

## Section 3 — Quick Log (New, Replaces Stat Cards)

### Current State
Four large stat cards (Active beds, Active plantings, Open tasks, Journal entries). They occupy significant vertical space but convey numbers rarely consulted.

### Changes

**Stat cards → compact pills:** Replace the 4-card grid with a single inline row of small tappable pills:
```
[3 beds]  [12 plantings]  [5 tasks]  [28 journal entries]
```
Each pill links to the same destination as the old card. Minimal vertical footprint — sits as a soft sub-row below the Quick Log heading.

**Quick Log widget:** New `QuickLogWidget` client component.

**Data passed as props from the server page** (following the established pattern of server-fetches-client-receives):
- `plantings: PlantingWithBed[]` — already fetched by `getActivePlantingsWithBeds()` in `DashboardPage` (type defined in `types/index.ts`)
- `lastEventMap: Map<string, Date>` — already computed by `buildLastEventMap()` in `DashboardPage` (return type of `buildLastEventMap` in `lib/tasks.ts`)

Widget layout:
1. **Section heading:** "Log care" with today's date as a soft subtitle
2. **Action row:** Four pill-shaped buttons:
   - `Watered` → event type `"watered"`
   - `Fed` → event type `"fed"`
   - `Pruned` → event type `"pruned"`
   - `Harvested` → event type `"harvested"`
   *(All four are valid existing `TaskEventType` values — no schema changes needed)*
3. **Planting picker:** A `<select>` populated with `plantings` (showing `plant name — bed name`). Default selection is the planting with the oldest last event timestamp in `lastEventMap` (most overdue)
4. **Note field:** Single-line optional text input. Placeholder: *"Any notes? (optional)"*
5. **Log it button:** Submits via `quickLogAction`

**Submission and UI feedback:**
- Use `useTransition` to track pending state; show a loading indicator on the "Log it" button while the server action runs
- On success (no error thrown): show a brief checkmark on the selected action pill using local `useState` success flag, then reset after 1.5 seconds. Planting picker and note field reset to defaults
- On error: show an inline error message below the button; do not reset the form

**After submit:** `revalidatePath("/dashboard")` in the server action causes the task list to refresh — if the logged event clears a smart task, it disappears from "To Do Today" naturally on next render.

**Empty state (no active plantings):**
> *"Add a planting to start logging care."* with a link to `/beds`

### Data Flow

```
QuickLogWidget (client)
  ← receives plantings, lastEventMap as props from DashboardPage (server)
  → quickLogAction(plantingId, eventType, notes) — new action in app/actions/plantings.ts
    → logTaskEvent(plantingId, eventType, notes) — existing function in lib/supabase.ts
      → INSERT INTO planting_task_events
    → revalidatePath("/dashboard")
```

`quickLogAction` is a thin new server action in `app/actions/plantings.ts`. It calls the existing `logTaskEvent()` from `lib/supabase.ts` — no new DB logic needed.

---

## Section 4 — Sow This Month (Unchanged)

Keep as-is. The section already disappears when there is nothing to sow — this is intentional. It is a contextual section, not a permanent fixture.

---

## Section 5 — Your Beds (Unchanged)

Keep as-is. Position: bottom.

---

## Components Affected

| Component / File | Change |
|---|---|
| `app/dashboard/page.tsx` | Reorder sections; remove stat card grid; add compact pill row; pass `plantings` + `lastEventMap` props to `QuickLogWidget`; add empty task state |
| `lib/weather.ts` | Add `weather_code` to daily fetch URL; add `weatherCode: number` to `WeatherDay` interface; add `WeatherCondition` type; add `getWeatherCondition(code)` mapping function |
| `components/dashboard/WeatherCard.tsx` | **New** — wraps forecast strip; renders condition label, ambient CSS animations, and dynamic colour tint on Today card |
| `components/dashboard/WeatherAlerts.tsx` | No change |
| `components/dashboard/QuickLogWidget.tsx` | **New** — action pills, planting picker, note field, `useTransition` submit, success/error feedback |
| `app/actions/plantings.ts` | Add `quickLogAction(plantingId, eventType, notes)` — thin wrapper around `logTaskEvent()` |
| `app/globals.css` | Add `@keyframes` for: `rain-fall`, `cloud-drift`, `snow-fall`, `glow-pulse`; gate all with `@media (prefers-reduced-motion: no-preference)` |

---

## Design Principles Upheld

- **Mobile-first:** Quick Log uses large tap targets and minimal typing; designed for one-hand use in the garden
- **Server components by default:** `DashboardPage` remains a server component; only `WeatherCard` and `QuickLogWidget` are client components, receiving data as props
- **Earthy, calm palette:** Animations are ambient tints, not loud effects; `linen-*` and `stone-*` tokens used throughout (both confirmed in `tailwind.config.ts`)
- **Graceful degradation:** Weather fetch failure → no weather card (existing behaviour). No plantings → Quick Log shows empty state. Missing settings values → frost/zone line segments omit gracefully
- **`prefers-reduced-motion`:** All CSS animations gated with `@media (prefers-reduced-motion: no-preference)` — users who prefer reduced motion see no animation
