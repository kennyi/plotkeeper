# Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the PlotKeeper dashboard to feel calm and alive — a dynamic weather card with ambient animations, an always-visible task section with a reassuring empty state, and a new Quick Log widget that replaces the stat cards.

**Architecture:** The dashboard page remains a server component; `WeatherCard` and `QuickLogWidget` are the only new client components and receive all data as props. The weather data layer (`lib/weather.ts`) is extended to fetch `weather_code` and expose a pure `getWeatherCondition()` mapping function. A thin new `quickLogAction` server action wraps the existing `logTaskEvent()` function.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS (`linen-*`/`stone-*` tokens), shadcn/ui, Supabase, Vitest (unit tests), Open-Meteo API

**Spec:** `docs/superpowers/specs/2026-03-21-dashboard-redesign-design.md`

---

## File Map

| File | Status | Responsibility |
|------|--------|---------------|
| `lib/weather.ts` | Modify | Add `weather_code` to fetch, `weatherCode` to `WeatherDay`, `WeatherCondition` type, `getWeatherCondition()` pure function |
| `app/globals.css` | Modify | Add `@keyframes` for rain, cloud, snow, glow; gate with `prefers-reduced-motion` |
| `components/dashboard/WeatherCard.tsx` | Create | Client component: forecast strip, condition label, animated Today card, dynamic colour tint |
| `app/actions/plantings.ts` | Modify | Add `quickLogAction()` thin wrapper around `logTaskEvent()` |
| `components/dashboard/QuickLogWidget.tsx` | Create | Client component: action pills, planting picker, note field, `useTransition` submit, success/error feedback |
| `app/dashboard/page.tsx` | Modify | Use `WeatherCard`; fix dynamic frost line; add tasks empty state; remove stat card grid; add compact pill row; add `QuickLogWidget` |
| `__tests__/lib/weather.test.ts` | Create | Unit tests for `getWeatherCondition()` |
| `__tests__/actions/plantings.test.ts` | Create | Unit tests for `quickLogAction()` |

---

## Task 1: Extend `lib/weather.ts` with `weatherCode` and condition mapping

**Files:**
- Modify: `lib/weather.ts`
- Create: `__tests__/lib/weather.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/lib/weather.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getWeatherCondition } from "@/lib/weather";

describe("getWeatherCondition", () => {
  it("maps code 0 to clear", () => {
    expect(getWeatherCondition(0)).toBe("clear");
  });
  it("maps code 1 to partly-cloudy", () => {
    expect(getWeatherCondition(1)).toBe("partly-cloudy");
  });
  it("maps code 2 to partly-cloudy", () => {
    expect(getWeatherCondition(2)).toBe("partly-cloudy");
  });
  it("maps code 3 to cloudy", () => {
    expect(getWeatherCondition(3)).toBe("cloudy");
  });
  it("maps code 45 to fog", () => {
    expect(getWeatherCondition(45)).toBe("fog");
  });
  it("maps code 48 to fog", () => {
    expect(getWeatherCondition(48)).toBe("fog");
  });
  it("maps code 51 to drizzle", () => {
    expect(getWeatherCondition(51)).toBe("drizzle");
  });
  it("maps code 61 to rain", () => {
    expect(getWeatherCondition(61)).toBe("rain");
  });
  it("maps code 65 to heavy-rain", () => {
    expect(getWeatherCondition(65)).toBe("heavy-rain");
  });
  it("maps code 80 to heavy-rain", () => {
    expect(getWeatherCondition(80)).toBe("heavy-rain");
  });
  it("maps code 95 to thunderstorm", () => {
    expect(getWeatherCondition(95)).toBe("thunderstorm");
  });
  it("maps code 71 to snow", () => {
    expect(getWeatherCondition(71)).toBe("snow");
  });
  it("maps unknown code to cloudy as fallback", () => {
    expect(getWeatherCondition(999)).toBe("cloudy");
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run __tests__/lib/weather.test.ts
```
Expected: all tests fail with "getWeatherCondition is not exported from @/lib/weather"

- [ ] **Step 3: Implement the changes in `lib/weather.ts`**

Add `WeatherCondition` type and `getWeatherCondition()` before the existing `WeatherDay` interface. Add `weatherCode: number` to `WeatherDay`. Update the fetch URL and mapping in `getWeatherForecast()`.

Replace the top of `lib/weather.ts` (lines 1–55) with:

```ts
import { KILDARE } from "./constants";

export type WeatherCondition =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "drizzle"
  | "rain"
  | "heavy-rain"
  | "thunderstorm"
  | "fog"
  | "snow";

/** Maps an Open-Meteo WMO weather code to a WeatherCondition. */
export function getWeatherCondition(code: number): WeatherCondition {
  if (code === 0) return "clear";
  if (code === 1 || code === 2) return "partly-cloudy";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code === 51 || code === 53 || code === 55) return "drizzle";
  if (code === 61 || code === 63) return "rain";
  if (code === 65 || code === 80 || code === 81) return "heavy-rain";
  if (code === 82 || code === 95 || code === 96 || code === 99) return "thunderstorm";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  return "cloudy"; // safe fallback
}

export interface WeatherDay {
  date: string;
  tempMin: number;
  tempMax: number;
  precipitation: number;
  weatherCode: number;
}
```

Then update the fetch URL (currently line 31) to add `weather_code`:

```ts
`&daily=temperature_2m_min,temperature_2m_max,precipitation_sum,weather_code` +
```

And update the mapping inside `getWeatherForecast()` (currently lines 43–50):

```ts
const days: WeatherDay[] = (data.daily.time as string[]).map(
  (date: string, i: number) => ({
    date,
    tempMin: data.daily.temperature_2m_min[i] as number,
    tempMax: data.daily.temperature_2m_max[i] as number,
    precipitation: data.daily.precipitation_sum[i] as number,
    weatherCode: data.daily.weather_code[i] as number,
  })
);
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run __tests__/lib/weather.test.ts
```
Expected: all 13 tests pass.

- [ ] **Step 5: Run the full test suite to check no regressions**

```bash
npx vitest run
```
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add lib/weather.ts __tests__/lib/weather.test.ts
git commit -m "feat: add weatherCode to WeatherDay and getWeatherCondition mapping"
```

---

## Task 2: Add weather animation keyframes to `app/globals.css`

**Files:**
- Modify: `app/globals.css`

No unit tests for pure CSS. Verify visually after `WeatherCard` is built in Task 3.

- [ ] **Step 1: Add `@keyframes` and animation utility classes to `app/globals.css`**

Find the end of the existing CSS in `app/globals.css` and append:

```css
/* ── Weather animations ──────────────────────────────────────────────────── */
/* All animations are gated: only active when the user has no preference for  */
/* reduced motion. Respects system accessibility settings.                    */

@media (prefers-reduced-motion: no-preference) {
  @keyframes glow-pulse {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 0.8; }
  }

  @keyframes cloud-drift {
    0%   { transform: translateX(-10px); opacity: 0.3; }
    50%  { transform: translateX(10px);  opacity: 0.5; }
    100% { transform: translateX(-10px); opacity: 0.3; }
  }

  @keyframes rain-fall {
    0%   { transform: translateY(-100%); opacity: 0; }
    10%  { opacity: 0.6; }
    90%  { opacity: 0.6; }
    100% { transform: translateY(100%); opacity: 0; }
  }

  @keyframes snow-fall {
    0%   { transform: translateY(-100%) translateX(0px); opacity: 0; }
    10%  { opacity: 0.7; }
    50%  { transform: translateY(50%) translateX(8px); }
    90%  { opacity: 0.7; }
    100% { transform: translateY(100%) translateX(-4px); opacity: 0; }
  }

  @keyframes fog-shimmer {
    0%, 100% { opacity: 0.08; }
    50%       { opacity: 0.18; }
  }

  @keyframes thunder-flash {
    0%, 90%, 100% { opacity: 0; }
    92%, 96%      { opacity: 0.12; }
  }

  .animate-glow-pulse {
    animation: glow-pulse 3s ease-in-out infinite;
  }

  .animate-cloud-drift {
    animation: cloud-drift 8s ease-in-out infinite;
  }

  .animate-rain-fall {
    animation: rain-fall linear infinite;
  }

  .animate-snow-fall {
    animation: snow-fall linear infinite;
  }

  .animate-fog-shimmer {
    animation: fog-shimmer 4s ease-in-out infinite;
  }

  .animate-thunder-flash {
    animation: thunder-flash 6s ease-in-out infinite;
  }
}
```

- [ ] **Step 2: Confirm build still compiles**

```bash
npm run build
```
Expected: build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add weather animation keyframes to globals.css"
```

---

## Task 3: Build `WeatherCard` client component

**Files:**
- Create: `components/dashboard/WeatherCard.tsx`

This is a client component — no unit tests (it's pure rendering). Verify with build and visual review in the browser.

- [ ] **Step 1: Create `components/dashboard/WeatherCard.tsx`**

```tsx
"use client";

import { WeatherForecast, WeatherCondition, getWeatherCondition } from "@/lib/weather";

// ── Condition helpers ──────────────────────────────────────────────────────

const CONDITION_LABELS: Record<WeatherCondition, string> = {
  "clear":        "Clear",
  "partly-cloudy":"Partly Cloudy",
  "cloudy":       "Cloudy",
  "drizzle":      "Drizzle",
  "rain":         "Rainy",
  "heavy-rain":   "Heavy Rain",
  "thunderstorm": "Thunderstorm",
  "fog":          "Foggy",
  "snow":         "Snow",
};

/** Background tint class for the Today card based on condition. */
function todayBgClass(condition: WeatherCondition): string {
  if (condition === "clear" || condition === "partly-cloudy") return "bg-linen-100 border-linen-400";
  if (condition === "cloudy" || condition === "fog")          return "bg-stone-100 border-stone-300";
  if (condition === "rain" || condition === "heavy-rain" || condition === "thunderstorm")
                                                              return "bg-blue-50 border-blue-200";
  if (condition === "snow")                                   return "bg-stone-50 border-stone-200";
  return "bg-linen-100 border-linen-400"; // drizzle / fallback
}

// ── Rain particles ─────────────────────────────────────────────────────────

function RainParticles({ heavy = false }: { heavy?: boolean }) {
  const count = heavy ? 16 : 10;
  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 w-px bg-blue-300 rounded-full animate-rain-fall"
          style={{
            left:             `${(i / count) * 100 + (i * 37) % 6}%`,
            height:           `${heavy ? 14 : 10}px`,
            animationDuration:`${heavy ? 0.6 + (i % 4) * 0.1 : 0.9 + (i % 5) * 0.15}s`,
            animationDelay:   `${(i * 0.12) % 0.9}s`,
            opacity:          heavy ? 0.5 : 0.35,
          }}
        />
      ))}
    </div>
  );
}

// ── Cloud shapes ───────────────────────────────────────────────────────────

function CloudDrift() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none" aria-hidden>
      {[
        { top: "20%", left: "10%", w: 48, delay: "0s" },
        { top: "55%", left: "55%", w: 36, delay: "3s" },
        { top: "10%", left: "65%", w: 28, delay: "5s" },
      ].map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-stone-200 animate-cloud-drift"
          style={{
            top:              c.top,
            left:             c.left,
            width:            `${c.w}px`,
            height:           `${Math.round(c.w * 0.4)}px`,
            animationDelay:   c.delay,
            opacity:          0.4,
          }}
        />
      ))}
    </div>
  );
}

// ── Snow particles ─────────────────────────────────────────────────────────

function SnowParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 rounded-full bg-stone-300 animate-snow-fall"
          style={{
            left:             `${(i / 12) * 100}%`,
            width:            `${3 + (i % 3)}px`,
            height:           `${3 + (i % 3)}px`,
            animationDuration:`${2 + (i % 4) * 0.5}s`,
            animationDelay:   `${(i * 0.2) % 2}s`,
            opacity:          0.6,
          }}
        />
      ))}
    </div>
  );
}

// ── Glow overlay ───────────────────────────────────────────────────────────

function GlowOverlay() {
  return (
    <div
      className="absolute inset-0 rounded-xl pointer-events-none animate-glow-pulse"
      style={{ background: "radial-gradient(ellipse at 30% 40%, rgba(251,191,36,0.18) 0%, transparent 70%)" }}
      aria-hidden
    />
  );
}

// ── Animation overlay picker ───────────────────────────────────────────────

function WeatherOverlay({ condition }: { condition: WeatherCondition }) {
  switch (condition) {
    case "clear":        return <GlowOverlay />;
    case "partly-cloudy":return <CloudDrift />;
    case "drizzle":
    case "rain":         return <RainParticles />;
    case "heavy-rain":
    case "thunderstorm": return <RainParticles heavy />;
    case "snow":         return <SnowParticles />;
    case "fog":
      return (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none bg-stone-200 animate-fog-shimmer"
          aria-hidden
        />
      );
    default:             return null; // cloudy — stillness is the signal
  }
}

// ── Props ──────────────────────────────────────────────────────────────────

interface WeatherCardProps {
  weather: WeatherForecast;
  locationName: string;
  hardinessZone?: string;
  lastFrost?: string;
  firstFrost?: string;
}

// ── Component ──────────────────────────────────────────────────────────────

export function WeatherCard({
  weather,
  locationName,
  hardinessZone,
  lastFrost,
  firstFrost,
}: WeatherCardProps) {
  const todayCondition = getWeatherCondition(weather.days[0]?.weatherCode ?? 0);
  const todayBg = todayBgClass(todayCondition);

  // Build frost/zone context line — omit segments with no value
  const contextParts: string[] = [locationName];
  if (hardinessZone)  contextParts.push(`RHS Zone ${hardinessZone}`);
  if (lastFrost)      contextParts.push(`Last frost ~${lastFrost}`);
  if (firstFrost)     contextParts.push(`First frost ~${firstFrost}`);
  const contextLine = contextParts.join(" · ");

  return (
    <div className="mb-8">
      {/* Forecast strip */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
        {weather.days.slice(0, 4).map((day, i) => {
          const isToday = i === 0;
          const condition = getWeatherCondition(day.weatherCode);

          return (
            <div
              key={day.date}
              className={`relative rounded-xl border overflow-hidden ${
                isToday
                  ? `${todayBg} shadow-warm px-4 py-4`
                  : "bg-card border-linen-300 px-3 py-3"
              } text-center`}
            >
              {/* Ambient animation — Today card only */}
              {isToday && <WeatherOverlay condition={todayCondition} />}

              <p className={`relative text-xs font-medium text-muted-foreground ${isToday ? "mb-1" : ""}`}>
                {isToday
                  ? "Today"
                  : new Date(day.date).toLocaleDateString("en-IE", {
                      weekday: "short",
                      day: "numeric",
                    })}
              </p>

              {/* Condition label — Today only */}
              {isToday && (
                <p className="relative text-xs text-muted-foreground mb-1">
                  {CONDITION_LABELS[condition]}
                </p>
              )}

              <p className={`relative font-semibold mt-1 ${isToday ? "text-base" : "text-sm"}`}>
                {Math.round(day.tempMax)}°
                <span className="text-muted-foreground font-normal">
                  /{Math.round(day.tempMin)}°
                </span>
              </p>
              <p
                className={`relative text-xs mt-0.5 ${
                  day.precipitation >= 5 ? "text-blue-600 font-medium" : "text-muted-foreground"
                }`}
              >
                {day.precipitation > 0 ? `${day.precipitation.toFixed(1)}mm` : "Dry"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Context line */}
      <p className="text-xs text-muted-foreground">{contextLine}</p>
    </div>
  );
}
```

- [ ] **Step 2: Confirm TypeScript compiles**

```bash
npm run build
```
Expected: build succeeds. If TypeScript complains about `shadow-warm`, check `tailwind.config.ts` — it should already exist from the established design system.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/WeatherCard.tsx
git commit -m "feat: add WeatherCard client component with condition label and ambient animations"
```

---

## Task 4: Add `quickLogAction` server action

**Files:**
- Modify: `app/actions/plantings.ts`
- Create: `__tests__/actions/plantings.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/actions/plantings.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { quickLogAction } from "@/app/actions/plantings";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/supabase", () => ({
  createPlanting: vi.fn(),
  updatePlantingStatus: vi.fn(),
  deletePlanting: vi.fn(),
  updatePlantingPhoto: vi.fn(),
  updatePlanting: vi.fn(),
  logTaskEvent: vi.fn().mockResolvedValue(undefined),
}));

import { revalidatePath } from "next/cache";
import { logTaskEvent } from "@/lib/supabase";

const PLANTING_ID = "planting-uuid-456";

beforeEach(() => {
  vi.clearAllMocks();
  (logTaskEvent as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
});

describe("quickLogAction", () => {
  it("calls logTaskEvent with the correct plantingId and eventType", async () => {
    await quickLogAction(PLANTING_ID, "watered", null);
    expect(logTaskEvent).toHaveBeenCalledWith({
      planting_id: PLANTING_ID,
      event_type: "watered",
      notes: null,
    });
  });

  it("passes notes through to logTaskEvent", async () => {
    await quickLogAction(PLANTING_ID, "fed", "used liquid seaweed");
    expect(logTaskEvent).toHaveBeenCalledWith({
      planting_id: PLANTING_ID,
      event_type: "fed",
      notes: "used liquid seaweed",
    });
  });

  it("revalidates /dashboard after logging", async () => {
    await quickLogAction(PLANTING_ID, "pruned", null);
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("revalidates /tasks after logging", async () => {
    await quickLogAction(PLANTING_ID, "harvested", null);
    expect(revalidatePath).toHaveBeenCalledWith("/tasks");
  });

  it("throws if logTaskEvent throws", async () => {
    (logTaskEvent as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("DB error"));
    await expect(quickLogAction(PLANTING_ID, "watered", null)).rejects.toThrow("DB error");
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run __tests__/actions/plantings.test.ts
```
Expected: all tests fail with "quickLogAction is not exported from @/app/actions/plantings"

- [ ] **Step 3: Add `quickLogAction` to `app/actions/plantings.ts`**

Append to the end of `app/actions/plantings.ts`:

```ts
/**
 * Quick Log — logs a care event for a planting directly from the dashboard.
 * Thin wrapper around logTaskEvent(); revalidates dashboard and tasks pages.
 */
export async function quickLogAction(
  plantingId: string,
  eventType: TaskEventType,
  notes: string | null
): Promise<void> {
  await logTaskEvent({ planting_id: plantingId, event_type: eventType, notes });
  revalidatePath("/dashboard");
  revalidatePath("/tasks");
}
```

Also add the missing imports at the top of `app/actions/plantings.ts`. Add `logTaskEvent` to the existing `lib/supabase` import, and add the `TaskEventType` type import:

```ts
import { createPlanting, updatePlantingStatus, deletePlanting, updatePlantingPhoto, updatePlanting, logTaskEvent } from "@/lib/supabase";
import type { BedPlanting, TaskEventType } from "@/types";
```

(Replace the existing two import lines at the top of the file.)

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx vitest run __tests__/actions/plantings.test.ts
```
Expected: all 5 tests pass.

- [ ] **Step 5: Run the full test suite**

```bash
npx vitest run
```
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add app/actions/plantings.ts __tests__/actions/plantings.test.ts
git commit -m "feat: add quickLogAction server action for dashboard quick log"
```

---

## Task 5: Build `QuickLogWidget` client component

**Files:**
- Create: `components/dashboard/QuickLogWidget.tsx`

Client component — no unit tests. Verify with build and visual review.

- [ ] **Step 1: Create `components/dashboard/QuickLogWidget.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { quickLogAction } from "@/app/actions/plantings";
import type { PlantingWithBed, TaskEventType } from "@/types";

const ACTIONS: { label: string; type: TaskEventType }[] = [
  { label: "Watered",   type: "watered" },
  { label: "Fed",       type: "fed" },
  { label: "Pruned",    type: "pruned" },
  { label: "Harvested", type: "harvested" },
];

interface QuickLogWidgetProps {
  plantings: PlantingWithBed[];
  /** Map<"plantingId:eventType", Date> — used to find the most-overdue planting */
  lastEventMap: Map<string, Date>;
}

const EVENT_TYPES = ["watered", "fed", "pruned", "harvested", "hardened_off", "transplanted"] as const;

/**
 * Returns the planting id with the oldest most-recent event across all event types.
 * Falls back to the first planting if no events have been logged for any planting.
 */
function defaultPlantingId(
  plantings: PlantingWithBed[],
  lastEventMap: Map<string, Date>
): string {
  if (plantings.length === 0) return "";
  let oldest = plantings[0];
  let oldestDate = latestEventForPlanting(plantings[0].id, lastEventMap);
  for (const p of plantings.slice(1)) {
    const d = latestEventForPlanting(p.id, lastEventMap);
    if (d < oldestDate) { oldest = p; oldestDate = d; }
  }
  return oldest.id;
}

/** Returns the most recent event date for a planting across all event types (epoch if none). */
function latestEventForPlanting(plantingId: string, lastEventMap: Map<string, Date>): Date {
  let latest = new Date(0);
  for (const type of EVENT_TYPES) {
    const d = lastEventMap.get(`${plantingId}:${type}`);
    if (d && d > latest) latest = d;
  }
  return latest;
}

export function QuickLogWidget({ plantings, lastEventMap }: QuickLogWidgetProps) {
  const [selectedAction, setSelectedAction] = useState<TaskEventType>("watered");
  const [selectedPlanting, setSelectedPlanting] = useState(() =>
    defaultPlantingId(plantings, lastEventMap)
  );
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const today = new Date().toLocaleDateString("en-IE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  function handleSubmit() {
    if (!selectedPlanting) return;
    setError(null);

    startTransition(async () => {
      try {
        await quickLogAction(selectedPlanting, selectedAction, note.trim() || null);
        setSuccess(true);
        setNote("");
        setSelectedPlanting(defaultPlantingId(plantings, lastEventMap));
        setTimeout(() => setSuccess(false), 1500);
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  // Empty state
  if (plantings.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="font-serif text-base font-semibold mb-1">Log care</h2>
        <p className="text-xs text-muted-foreground mb-3">{today}</p>
        <p className="text-sm text-muted-foreground">
          <Link href="/beds" className="underline underline-offset-2 hover:text-foreground">
            Add a planting
          </Link>{" "}
          to start logging care.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="font-serif text-base font-semibold mb-1">Log care</h2>
      <p className="text-xs text-muted-foreground mb-4">{today}</p>

      {/* Action pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {ACTIONS.map((action) => {
          const isSelected = selectedAction === action.type;
          const isSuccessAction = success && isSelected;
          return (
            <button
              key={action.type}
              type="button"
              onClick={() => setSelectedAction(action.type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isSuccessAction
                  ? "bg-garden-600 text-white"
                  : isSelected
                  ? "bg-garden-100 text-garden-800 border border-garden-400"
                  : "bg-card text-muted-foreground border border-border hover:border-garden-300 hover:text-foreground"
              }`}
            >
              {isSuccessAction ? "✓ Done" : action.label}
            </button>
          );
        })}
      </div>

      {/* Planting picker */}
      <select
        value={selectedPlanting}
        onChange={(e) => setSelectedPlanting(e.target.value)}
        className="w-full mb-3 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-garden-400"
      >
        {plantings.map((p) => (
          <option key={p.id} value={p.id}>
            {p.plant?.name ?? p.custom_plant_name ?? "Unknown plant"}
            {p.bed ? ` — ${p.bed.name}` : ""}
          </option>
        ))}
      </select>

      {/* Note field */}
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Any notes? (optional)"
        className="w-full mb-4 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-garden-400"
        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
      />

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending || !selectedPlanting}
        className="rounded-lg bg-garden-700 px-5 py-2 text-sm font-medium text-white hover:bg-garden-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Logging…" : "Log it"}
      </button>

      {/* Error */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Check TypeScript compiles**

```bash
npm run build
```
Expected: build succeeds. If `PlantingWithBed` is missing `plant` or `bed` fields, check the type definition in `types/index.ts` — it extends `BedPlanting` with `bed: { id: string; name: string } | null`.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/QuickLogWidget.tsx
git commit -m "feat: add QuickLogWidget client component for dashboard quick log"
```

---

## Task 6: Update `app/dashboard/page.tsx`

**Files:**
- Modify: `app/dashboard/page.tsx`

This task wires everything together. No new unit tests — integration is verified by build and visual review.

- [ ] **Step 1: Replace the full content of `app/dashboard/page.tsx`**

```tsx
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { MONTH_NAMES, KILDARE } from "@/lib/constants";
import {
  getDashboardCounts,
  getSettings,
  getMyPlantsForMonth,
  getBedsWithPlantingCount,
  getActivePlantingsWithBeds,
  getTaskEvents,
  getCustomTasks,
} from "@/lib/supabase";
import { generateSmartTasks, buildLastEventMap } from "@/lib/tasks";
import { getWeatherForecast } from "@/lib/weather";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { WeatherAlerts } from "@/components/dashboard/WeatherAlerts";
import { QuickLogWidget } from "@/components/dashboard/QuickLogWidget";
import { BedCard } from "@/components/beds/BedCard";
import { TaskItem, CustomTaskItem } from "@/components/tasks/TaskItem";

export default async function DashboardPage() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const monthName = MONTH_NAMES[month - 1];

  const [counts, settings, plantsThisMonth, beds, plantings, customTasks] =
    await Promise.all([
      getDashboardCounts().catch(() => ({
        bedCount: 0,
        activePlantingCount: 0,
        journalCount: 0,
      })),
      getSettings().catch(() => ({} as Record<string, string>)),
      getMyPlantsForMonth(month).catch(() => []),
      getBedsWithPlantingCount().catch(() => []),
      getActivePlantingsWithBeds().catch(() => []),
      getCustomTasks().catch(() => []),
    ]);

  const plantingIds = plantings.map((p) => p.id);
  const events = await getTaskEvents(plantingIds).catch(() => []);
  const lastEventMap = buildLastEventMap(events);
  const allSmartTasks = generateSmartTasks(plantings, lastEventMap, today);
  const dashTasks = allSmartTasks
    .filter((t) => t.urgency === "overdue" || t.urgency === "due_today")
    .slice(0, 5);
  const totalTaskCount =
    allSmartTasks.filter((t) => t.urgency !== "upcoming").length +
    customTasks.length;

  const ownerName    = settings.owner_name || null;
  const locationName = settings.location_name || settings.location || "Kildare";
  const lat = settings.latitude  ? parseFloat(settings.latitude)  : KILDARE.latitude;
  const lng = settings.longitude ? parseFloat(settings.longitude) : KILDARE.longitude;
  const profileIncomplete = !settings.owner_name || !settings.latitude;

  const hardinessZone = settings.hardiness_zone || undefined;
  const lastFrost     = settings.last_frost_approx  || undefined;
  const firstFrost    = settings.first_frost_approx || undefined;

  const weather = await getWeatherForecast(lat, lng).catch(() => null);

  // Sow-this-month split — only user's plants
  const sowIndoors = plantsThisMonth.filter(
    (p) =>
      p.sow_indoors_start !== null &&
      month >= p.sow_indoors_start &&
      month <= (p.sow_indoors_end ?? p.sow_indoors_start)
  );
  const sowOutdoors = plantsThisMonth.filter(
    (p) =>
      p.sow_outdoors_start !== null &&
      month >= p.sow_outdoors_start &&
      month <= (p.sow_outdoors_end ?? p.sow_outdoors_start)
  );

  return (
    <div>
      <Header
        title={ownerName ? `Good day, ${ownerName}` : "Good day"}
        description={`${monthName} in ${locationName} — here's what's happening in your garden`}
      />

      {/* Setup prompt */}
      {profileIncomplete && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-linen-300 bg-linen-100 px-4 py-3 text-sm text-foreground">
          <p>Set your name and location in Settings to personalise your dashboard and weather.</p>
          <Link
            href="/settings"
            className="shrink-0 font-medium underline underline-offset-2 hover:text-terracotta-600"
          >
            Go to Settings →
          </Link>
        </div>
      )}

      {/* ── 1. Weather ── */}
      {weather && (
        <>
          <WeatherCard
            weather={weather}
            locationName={locationName}
            hardinessZone={hardinessZone}
            lastFrost={lastFrost}
            firstFrost={firstFrost}
          />
          {weather.alerts.length > 0 && (
            <div className="mb-8 -mt-4">
              <WeatherAlerts alerts={weather.alerts} />
            </div>
          )}
        </>
      )}

      {/* ── 2. To do today ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-base font-semibold">To do today</h2>
          <Link href="/tasks" className="text-sm text-muted-foreground hover:underline">
            All tasks →
          </Link>
        </div>
        {dashTasks.length === 0 && customTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-3">
            Nothing pressing today. Enjoy the garden.
          </p>
        ) : (
          <div className="space-y-2">
            {dashTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
            {customTasks.slice(0, Math.max(0, 5 - dashTasks.length)).map((task) => (
              <CustomTaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* ── 3. Quick log + compact stat pills ── */}
      <div className="mb-8">
        {/* Compact stat pills — replaces the old 4-card grid */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href="/beds"
            className="text-xs px-3 py-1 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-garden-300 transition-colors"
          >
            {counts.bedCount} beds
          </Link>
          <Link
            href="/beds?view=plants"
            className="text-xs px-3 py-1 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-garden-300 transition-colors"
          >
            {counts.activePlantingCount} plantings
          </Link>
          <Link
            href="/tasks"
            className="text-xs px-3 py-1 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-garden-300 transition-colors"
          >
            {totalTaskCount} tasks
          </Link>
          <Link
            href="/journal"
            className="text-xs px-3 py-1 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-garden-300 transition-colors"
          >
            {counts.journalCount} journal entries
          </Link>
        </div>

        <QuickLogWidget plantings={plantings} lastEventMap={lastEventMap} />
      </div>

      {/* ── 4. Sow this month ── */}
      {(sowIndoors.length > 0 || sowOutdoors.length > 0) && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-base font-semibold">Sow in {monthName}</h2>
            <Link href={`/calendar?month=${month}`} className="text-sm text-muted-foreground hover:underline">
              Full calendar →
            </Link>
          </div>
          {sowIndoors.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">🌡️ Indoors</p>
              <div className="flex flex-wrap gap-2">
                {sowIndoors.map((p) => (
                  <Link
                    key={p.id}
                    href={`/plants/${p.id}`}
                    className="text-xs px-3 py-1 rounded-full bg-terracotta-100 text-terracotta-700 hover:bg-terracotta-200 transition-colors"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {sowOutdoors.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">🌱 Outdoors</p>
              <div className="flex flex-wrap gap-2">
                {sowOutdoors.map((p) => (
                  <Link
                    key={p.id}
                    href={`/plants/${p.id}`}
                    className="text-xs px-3 py-1 rounded-full bg-garden-100 text-garden-700 hover:bg-garden-200 transition-colors"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 5. Beds snapshot ── */}
      {beds.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-base font-semibold">Your beds</h2>
            <Link href="/beds" className="text-sm text-muted-foreground hover:underline">
              All beds →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {beds.slice(0, 3).map((bed) => (
              <BedCard key={bed.id} bed={bed} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Run the full test suite**

```bash
npx vitest run
```
Expected: all tests pass.

- [ ] **Step 3: Run a production build**

```bash
npm run build
```
Expected: build succeeds with no TypeScript errors. If `PlantingWithBed` type errors appear in `QuickLogWidget`, check that the `plant` field is available on the type in `types/index.ts`.

- [ ] **Step 4: Start dev server and visually verify the dashboard**

```bash
npm run dev
```

Open http://localhost:3000/dashboard and verify:
- Weather card shows 4-day forecast with Today more prominent
- Today card shows condition label (e.g. "Cloudy") and an ambient animation or tint
- Context line below weather uses real values from settings (not hardcoded frost dates)
- "To do today" always renders — shows "Nothing pressing today. Enjoy the garden." if empty
- Compact stat pills row appears (beds / plantings / tasks / journal entries)
- Quick Log shows action pills, planting picker, note field, and "Log it" button
- Logging a care event marks the action pill with "✓ Done" briefly, then resets
- "Sow in March" section only shows if relevant
- "Your beds" appears at the bottom

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: dashboard redesign — WeatherCard, tasks empty state, QuickLogWidget, compact stat pills"
```

---

## Task 7: Final checks

- [ ] **Step 1: Run full test suite one final time**

```bash
npx vitest run
```
Expected: all tests pass.

- [ ] **Step 2: Run production build**

```bash
npm run build
```
Expected: clean build, no errors.

- [ ] **Step 3: Run linter**

```bash
npm run lint
```
Expected: no errors or warnings.

- [ ] **Step 4: Check the fix/rls-security branch is ready**

```bash
git log --oneline -8
```
Confirm all commits from Tasks 1–6 are present.
