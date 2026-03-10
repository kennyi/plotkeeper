/**
 * lib/tasks.ts — Pure task-generation logic.
 *
 * No async, no Supabase calls. Takes plantings + event history and returns a
 * sorted list of SmartTasks. Keeping this pure makes it easy to reuse on both
 * the /tasks page and the dashboard, and simple to unit-test later.
 */

import type { PlantingWithBed, PlantingTaskEvent, TaskEventType } from "@/types";

// ── Public types ─────────────────────────────────────────────────────────────

export type TaskUrgency = "overdue" | "due_today" | "due_soon" | "upcoming";

export interface SmartTask {
  /** Stable synthetic key: `${plantingId}:${taskType}` */
  id: string;
  plantingId: string;
  plantName: string;
  bedId: string;
  bedName: string;
  taskType: TaskEventType;
  label: string;
  subLabel: string | null;
  urgency: TaskUrgency;
  /**
   * Positive  → overdue by N days.
   * Zero      → due today.
   * Negative  → due in N days (upcoming).
   */
  daysOverdue: number;
  lastCompletedAt: string | null;
}

// ── Internal constants ────────────────────────────────────────────────────────

/** How many days between watering reminders per water_needs level. */
const WATER_THRESHOLD: Record<string, number> = { high: 2, medium: 4, low: 7 };

const URGENCY_ORDER: Record<TaskUrgency, number> = {
  overdue: 0,
  due_today: 1,
  due_soon: 2,
  upcoming: 3,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000);
}

function urgencyFromDaysOverdue(daysOverdue: number): TaskUrgency {
  if (daysOverdue > 0) return "overdue";
  if (daysOverdue === 0) return "due_today";
  if (daysOverdue >= -2) return "due_soon";
  return "upcoming";
}

function pluralDays(n: number): string {
  return `${n} day${n !== 1 ? "s" : ""}`;
}

// ── Main exports ──────────────────────────────────────────────────────────────

/**
 * Builds a Map of `"${plantingId}:${eventType}"` → most-recent completion Date.
 * Call once per page load, then pass the result to generateSmartTasks.
 */
export function buildLastEventMap(
  events: PlantingTaskEvent[]
): Map<string, Date> {
  const map = new Map<string, Date>();
  for (const e of events) {
    const key = `${e.planting_id}:${e.event_type}`;
    const at = new Date(e.completed_at);
    const existing = map.get(key);
    if (!existing || at > existing) map.set(key, at);
  }
  return map;
}

/**
 * Generates smart tasks from the user's active plantings.
 * Returns tasks sorted by urgency (overdue first) then by most-days-overdue.
 */
export function generateSmartTasks(
  plantings: PlantingWithBed[],
  lastEventMap: Map<string, Date>,
  today: Date
): SmartTask[] {
  const tasks: SmartTask[] = [];
  const currentMonth = today.getMonth() + 1;

  const activeStatuses = new Set([
    "planned",
    "seeds_started",
    "germinating",
    "growing",
    "ready",
  ]);

  for (const p of plantings) {
    if (!activeStatuses.has(p.status)) continue;
    if (!p.bed) continue; // bed was soft-deleted — skip

    const plantName = p.plant?.name ?? p.custom_plant_name ?? "plant";
    const { id: bedId, name: bedName } = p.bed;
    const plantingAge = daysBetween(new Date(p.created_at), today);

    // ── Watering ──────────────────────────────────────────────────────────────
    const waterNeeds = p.plant?.water_needs;
    if (waterNeeds) {
      const threshold = WATER_THRESHOLD[waterNeeds] ?? 4;
      // Don't nag until the planting is old enough to have needed watering once
      if (plantingAge >= threshold) {
        const lastWatered = lastEventMap.get(`${p.id}:watered`);
        const daysSince = lastWatered
          ? daysBetween(lastWatered, today)
          : plantingAge; // treat never-watered as: overdue since planting day
        const daysOverdue = daysSince - threshold;

        // Surface when 1 day away from threshold (daysOverdue >= -1)
        if (daysOverdue >= -1) {
          tasks.push({
            id: `${p.id}:watered`,
            plantingId: p.id,
            plantName,
            bedId,
            bedName,
            taskType: "watered",
            label: `Water your ${plantName} in ${bedName}`,
            subLabel: lastWatered
              ? `Last watered ${pluralDays(daysBetween(lastWatered, today))} ago`
              : "No watering logged yet",
            urgency: urgencyFromDaysOverdue(daysOverdue),
            daysOverdue,
            lastCompletedAt: lastWatered?.toISOString() ?? null,
          });
        }
      }
    }

    // ── Feeding ───────────────────────────────────────────────────────────────
    const feedDays = p.plant?.feeding_frequency_days;
    if (feedDays) {
      if (plantingAge >= feedDays) {
        const lastFed = lastEventMap.get(`${p.id}:fed`);
        const daysSince = lastFed ? daysBetween(lastFed, today) : plantingAge;
        const daysOverdue = daysSince - feedDays;

        if (daysOverdue >= -1) {
          tasks.push({
            id: `${p.id}:fed`,
            plantingId: p.id,
            plantName,
            bedId,
            bedName,
            taskType: "fed",
            label: `Feed your ${plantName} in ${bedName}`,
            subLabel: lastFed
              ? `Last fed ${pluralDays(daysBetween(lastFed, today))} ago`
              : "No feeding logged yet",
            urgency: urgencyFromDaysOverdue(daysOverdue),
            daysOverdue,
            lastCompletedAt: lastFed?.toISOString() ?? null,
          });
        }
      }
    }

    // ── Harvest ───────────────────────────────────────────────────────────────
    const isHarvestable = p.status === "growing" || p.status === "ready";
    if (isHarvestable) {
      if (p.expected_harvest_date) {
        // Use the explicit date set on the planting
        const harvestDate = new Date(p.expected_harvest_date);
        harvestDate.setHours(0, 0, 0, 0);
        const todayMidnight = new Date(today);
        todayMidnight.setHours(0, 0, 0, 0);
        const daysUntil = daysBetween(todayMidnight, harvestDate);

        if (daysUntil <= 14) {
          // positive daysUntil = in the future; negate for daysOverdue convention
          const daysOverdue = -daysUntil;
          tasks.push({
            id: `${p.id}:harvested`,
            plantingId: p.id,
            plantName,
            bedId,
            bedName,
            taskType: "harvested",
            label: `Harvest your ${plantName} in ${bedName}`,
            subLabel:
              daysUntil > 0
                ? `Expected harvest in ${pluralDays(daysUntil)}`
                : daysUntil === 0
                ? "Expected harvest today"
                : `Expected harvest was ${pluralDays(-daysUntil)} ago`,
            urgency: urgencyFromDaysOverdue(daysOverdue),
            daysOverdue,
            lastCompletedAt:
              lastEventMap.get(`${p.id}:harvested`)?.toISOString() ?? null,
          });
        }
      } else if (
        p.plant?.harvest_start &&
        p.plant?.harvest_end &&
        currentMonth >= p.plant.harvest_start &&
        currentMonth <= p.plant.harvest_end
      ) {
        // Harvest window open per plant library — don't spam if recently harvested
        const lastHarvest = lastEventMap.get(`${p.id}:harvested`);
        const daysSinceHarvest = lastHarvest
          ? daysBetween(lastHarvest, today)
          : 999;
        if (daysSinceHarvest > 3) {
          tasks.push({
            id: `${p.id}:harvested`,
            plantingId: p.id,
            plantName,
            bedId,
            bedName,
            taskType: "harvested",
            label: `Check for harvest: ${plantName} in ${bedName}`,
            subLabel: "Harvest window is open this month",
            urgency: "upcoming",
            daysOverdue: -1,
            lastCompletedAt: lastHarvest?.toISOString() ?? null,
          });
        }
      }
    }

    // ── Harden off ────────────────────────────────────────────────────────────
    // Surface when the transplant window is this month or next (give time to harden off)
    if (p.status === "seeds_started" && p.plant?.transplant_start) {
      const monthsUntilTransplant = p.plant.transplant_start - currentMonth;
      if (monthsUntilTransplant >= 0 && monthsUntilTransplant <= 1) {
        const alreadyHardened = lastEventMap.has(`${p.id}:hardened_off`);
        if (!alreadyHardened) {
          tasks.push({
            id: `${p.id}:hardened_off`,
            plantingId: p.id,
            plantName,
            bedId,
            bedName,
            taskType: "hardened_off",
            label: `Harden off your ${plantName}`,
            subLabel:
              monthsUntilTransplant === 0
                ? "Transplant window is open — start hardening off now"
                : "Transplant time is next month — begin hardening off",
            urgency: monthsUntilTransplant === 0 ? "due_today" : "due_soon",
            daysOverdue: monthsUntilTransplant === 0 ? 0 : -14,
            lastCompletedAt: null,
          });
        }
      }
    }

    // ── Transplant outdoors ───────────────────────────────────────────────────
    if (
      (p.status === "seeds_started" || p.status === "germinating") &&
      p.plant?.transplant_start &&
      p.plant?.transplant_end &&
      currentMonth >= p.plant.transplant_start &&
      currentMonth <= p.plant.transplant_end
    ) {
      const alreadyTransplanted = lastEventMap.has(`${p.id}:transplanted`);
      if (!alreadyTransplanted) {
        const hardenedOff = lastEventMap.has(`${p.id}:hardened_off`);
        tasks.push({
          id: `${p.id}:transplanted`,
          plantingId: p.id,
          plantName,
          bedId,
          bedName,
          taskType: "transplanted",
          label: `Plant out your ${plantName}`,
          subLabel: hardenedOff
            ? "Hardened off — transplant window is open"
            : "Transplant window is open — remember to harden off first",
          urgency: "due_today",
          daysOverdue: 0,
          lastCompletedAt: null,
        });
      }
    }
  }

  // Sort: urgency bucket first, then within "overdue" by most-overdue first
  tasks.sort((a, b) => {
    const uDiff = URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency];
    if (uDiff !== 0) return uDiff;
    return b.daysOverdue - a.daysOverdue;
  });

  return tasks;
}
