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
        setTimeout(() => {
          setSuccess(false);
          setSelectedPlanting(defaultPlantingId(plantings, lastEventMap));
        }, 1500);
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
        aria-label="Select planting"
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
        aria-label="Care note (optional)"
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
