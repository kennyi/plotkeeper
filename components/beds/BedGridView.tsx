"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getPlantColor } from "@/lib/utils";
import type { GardenBed, BedPlanting } from "@/types";

interface BedGridViewProps {
  bed: GardenBed;
  plantings: BedPlanting[];
}

const SLOT_PX = 56;

export function BedGridView({ bed, plantings }: BedGridViewProps) {
  const router = useRouter();
  const lengthM = bed.length_m;
  const widthM  = bed.width_m;

  const defaultSlotSize: 25 | 50 = (lengthM ?? 0) > 2 || (widthM ?? 0) > 1.5 ? 50 : 25;
  const [slotSize, setSlotSize] = useState<25 | 50>(defaultSlotSize);

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
    if (p.row_number != null && p.row_number >= 1 && p.row_number <= totalSlots) {
      slotMap.set(p.row_number, p);
    }
  }

  function handleSlotTap(slotIndex: number) {
    const existing = slotMap.get(slotIndex);
    if (existing) {
      router.push(`/plantings/${existing.id}`);
    } else {
      router.push(`/beds/${bed.id}/plantings/new?slot=${slotIndex}`);
    }
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
        {cols} × {rows} grid &middot; {slotSize} cm slots &middot; Tap a slot to plant or view
      </p>

      {/* Scrollable grid */}
      <div className="overflow-x-auto rounded-xl border border-stone-200">
        <div
          className="bg-stone-50"
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

            const color = plantName ? getPlantColor(plantName) : null;

            return (
              <button
                key={slotIndex}
                onClick={() => handleSlotTap(slotIndex)}
                style={{
                  width: SLOT_PX,
                  height: SLOT_PX,
                  backgroundColor: color?.bg,
                  borderColor: color?.border ?? undefined,
                }}
                className={[
                  "flex items-center justify-center",
                  "border transition-colors",
                  planting
                    ? "hover:brightness-95"
                    : "border-stone-200 hover:bg-stone-100",
                ].join(" ")}
                title={plantName ?? `Empty slot ${slotIndex}`}
                aria-label={plantName ? `${plantName} — tap to view` : `Empty slot — tap to plant`}
              >
                {plantName && (
                  <span
                    className="text-[9px] font-semibold leading-tight text-center px-0.5 line-clamp-3"
                    style={{ color: color?.text }}
                  >
                    {plantName}
                  </span>
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
          Planted — tap to open
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-stone-100 border border-stone-300" />
          Empty — tap to add
        </span>
        <span className="ml-auto">
          {slotMap.size}/{totalSlots} slots used
        </span>
      </div>
    </div>
  );
}
