"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { PlantTopDownIcon } from "./PlantTopDownIcon";
import { createSlotPlantingAction } from "@/app/actions/plantings";
import type { GardenBed, BedPlanting, Plant } from "@/types";

type PlantSummary = Pick<Plant, "id" | "name" | "category">;

interface BedGridViewProps {
  bed: GardenBed;
  plantings: BedPlanting[];
  allPlants: PlantSummary[];
}

const SLOT_PX = 56; // fixed px per slot — good touch target

export function BedGridView({ bed, plantings, allPlants }: BedGridViewProps) {
  const lengthM = bed.length_m;
  const widthM  = bed.width_m;

  // Default slot size: 50 cm for beds longer than 2 m, else 25 cm
  const defaultSlotSize: 25 | 50 = (lengthM ?? 0) > 2 || (widthM ?? 0) > 1.5 ? 50 : 25;
  const [slotSize, setSlotSize] = useState<25 | 50>(defaultSlotSize);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [search, setSearch]         = useState("");
  const [isPending, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);

  // Focus search input when the slot picker opens
  useEffect(() => {
    if (activeSlot !== null) {
      setTimeout(() => searchRef.current?.focus(), 80);
    }
  }, [activeSlot]);

  if (!lengthM || !widthM) {
    return (
      <div className="mb-8 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          Add bed dimensions to see the planting grid.
        </p>
      </div>
    );
  }

  const cols = Math.max(1, Math.round((lengthM * 100) / slotSize));
  const rows = Math.max(1, Math.round((widthM  * 100) / slotSize));
  const totalSlots = cols * rows;

  // Build a map of slot index (1-based) → planting
  const slotMap = new Map<number, BedPlanting>();
  for (const p of plantings) {
    if (
      p.row_number != null &&
      p.row_number >= 1 &&
      p.row_number <= totalSlots
    ) {
      // If two plantings share a row_number, last one wins
      slotMap.set(p.row_number, p);
    }
  }

  const filteredPlants = allPlants
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 30);

  function handleSlotTap(slotIndex: number) {
    const existing = slotMap.get(slotIndex);
    if (existing) {
      // Scroll down to the planting card in the list below
      const el = document.getElementById(`planting-${existing.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        // Brief highlight
        el.classList.add("ring-2", "ring-garden-400", "ring-offset-2");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-garden-400", "ring-offset-2");
        }, 1800);
      }
    } else {
      setActiveSlot(slotIndex);
      setSearch("");
    }
  }

  function handleSelectPlant(plant: PlantSummary) {
    if (activeSlot === null) return;
    startTransition(async () => {
      await createSlotPlantingAction(bed.id, activeSlot, plant.id);
      setActiveSlot(null);
    });
  }

  return (
    <div className="mb-8">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Planting grid</h2>
        <div className="flex text-xs border border-stone-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setSlotSize(25)}
            className={`px-2.5 py-1.5 transition-colors ${
              slotSize === 25
                ? "bg-stone-800 text-white"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            25 cm
          </button>
          <button
            onClick={() => setSlotSize(50)}
            className={`px-2.5 py-1.5 transition-colors ${
              slotSize === 50
                ? "bg-stone-800 text-white"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            50 cm
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        {cols} × {rows} grid &middot; {slotSize} cm slots &middot; Tap an empty slot to plant
      </p>

      {/* Scrollable grid */}
      <div className="overflow-x-auto rounded-xl border border-amber-200">
        <div
          className="bg-amber-50"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, ${SLOT_PX}px)`,
            width: cols * SLOT_PX,
          }}
        >
          {Array.from({ length: totalSlots }, (_, i) => {
            const slotIndex = i + 1;
            const planting  = slotMap.get(slotIndex);
            const plantName = planting
              ? (planting.plant?.name ?? planting.custom_plant_name ?? "Planted")
              : null;

            return (
              <button
                key={slotIndex}
                onClick={() => handleSlotTap(slotIndex)}
                style={{ width: SLOT_PX, height: SLOT_PX }}
                className={[
                  "flex items-center justify-center",
                  "border border-amber-200/60 transition-colors",
                  planting
                    ? "bg-garden-50 hover:bg-garden-100"
                    : "hover:bg-amber-100",
                ].join(" ")}
                title={plantName ?? `Empty slot ${slotIndex}`}
                aria-label={plantName ? `${plantName} — tap to view` : `Empty slot — tap to plant`}
              >
                {planting && (
                  <PlantTopDownIcon
                    category={planting.plant?.category ?? null}
                    size={Math.round(SLOT_PX * 0.62)}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-garden-100 border border-garden-300" />
          Planted
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-amber-100 border border-amber-300" />
          Empty
        </span>
        <span className="ml-auto">
          {slotMap.size}/{totalSlots} slots used
        </span>
      </div>

      {/* ── Slot search bottom-sheet ── */}
      {activeSlot !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/30"
          onClick={() => setActiveSlot(null)}
        >
          <div
            className="bg-white rounded-t-2xl shadow-2xl flex flex-col"
            style={{ maxHeight: "72vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet header */}
            <div className="p-4 border-b shrink-0">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-sm text-stone-800">
                  Add plant to slot {activeSlot}
                </p>
                <button
                  onClick={() => setActiveSlot(null)}
                  className="text-sm text-muted-foreground hover:text-stone-700 px-1"
                >
                  Cancel
                </button>
              </div>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search plants…"
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
              />
            </div>

            {/* Plant list */}
            <div className="overflow-y-auto flex-1">
              {isPending ? (
                <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                  Planting…
                </div>
              ) : filteredPlants.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                  No plants found
                </div>
              ) : (
                filteredPlants.map((plant) => (
                  <button
                    key={plant.id}
                    onClick={() => handleSelectPlant(plant)}
                    disabled={isPending}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 active:bg-stone-100 border-b last:border-b-0 disabled:opacity-50 transition-colors"
                  >
                    <div className="shrink-0">
                      <PlantTopDownIcon category={plant.category} size={36} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{plant.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{plant.category}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
