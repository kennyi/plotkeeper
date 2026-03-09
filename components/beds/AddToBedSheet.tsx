"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getPlantColor } from "@/lib/utils";
import { getBedPlantingsForSheetAction } from "@/app/actions/beds";
import type { GardenBed } from "@/types";

type SlimBed = Pick<GardenBed, "id" | "name" | "bed_type" | "length_m" | "width_m">;

type SlimPlanting = {
  id: string;
  slot_number: number | null;
  custom_plant_name: string | null;
  status: string;
  plant: { id: string; name: string } | null;
};

interface AddToBedSheetProps {
  plantId: string;
  plantName: string;
  beds: SlimBed[];
}

const SLOT_PX = 44;

const BED_TYPE_LABELS: Record<string, string> = {
  raised_bed:     "Raised Bed",
  ground_bed:     "Ground Bed",
  pot:            "Pot",
  planter:        "Planter",
  greenhouse_bed: "Greenhouse Bed",
  window_box:     "Window Box",
  grow_bag:       "Grow Bag",
};

export function AddToBedSheet({ plantId, plantName, beds }: AddToBedSheetProps) {
  const router = useRouter();
  const [open, setOpen]               = useState(false);
  const [selectedBed, setSelectedBed] = useState<SlimBed | null>(null);
  const [bedPlantings, setBedPlantings] = useState<SlimPlanting[]>([]);
  const [slotSize, setSlotSize]       = useState<25 | 50>(25);
  const [isPending, startTransition]  = useTransition();

  function handleOpen() {
    setOpen(true);
    setSelectedBed(null);
    setBedPlantings([]);
  }

  function handleClose() {
    setOpen(false);
    setSelectedBed(null);
    setBedPlantings([]);
  }

  function handleSelectBed(bed: SlimBed) {
    setSelectedBed(bed);
    const defaultSize: 25 | 50 = (bed.length_m ?? 0) > 2 || (bed.width_m ?? 0) > 1.5 ? 50 : 25;
    setSlotSize(defaultSize);
    startTransition(async () => {
      const plantings = await getBedPlantingsForSheetAction(bed.id);
      setBedPlantings(plantings);
    });
  }

  function handleSlotTap(slotIndex: number, isOccupied: boolean) {
    if (isOccupied || !selectedBed) return;
    router.push(`/beds/${selectedBed.id}/plantings/new?plant_id=${plantId}&slot=${slotIndex}`);
    handleClose();
  }

  function renderMiniGrid() {
    if (!selectedBed) return null;
    const { length_m, width_m } = selectedBed;
    if (!length_m || !width_m) {
      return (
        <div className="text-center py-6 text-sm text-muted-foreground">
          This bed has no dimensions set. You can still{" "}
          <button
            className="underline text-garden-700"
            onClick={() => {
              router.push(`/beds/${selectedBed.id}/plantings/new?plant_id=${plantId}`);
              handleClose();
            }}
          >
            add a planting without a slot
          </button>.
        </div>
      );
    }

    const cols = Math.max(1, Math.round((length_m * 100) / slotSize));
    const rows = Math.max(1, Math.round((width_m  * 100) / slotSize));
    const totalSlots = cols * rows;

    const slotMap = new Map<number, SlimPlanting>();
    for (const p of bedPlantings) {
      if (p.slot_number != null && p.slot_number >= 1 && p.slot_number <= totalSlots) {
        slotMap.set(p.slot_number, p);
      }
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {cols} × {rows} · {slotSize} cm slots · tap empty slot
          </p>
          <div className="flex text-xs border border-stone-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setSlotSize(25)}
              className={`px-2 py-1 transition-colors ${slotSize === 25 ? "bg-stone-800 text-white" : "text-stone-600"}`}
            >
              25 cm
            </button>
            <button
              onClick={() => setSlotSize(50)}
              className={`px-2 py-1 transition-colors ${slotSize === 50 ? "bg-stone-800 text-white" : "text-stone-600"}`}
            >
              50 cm
            </button>
          </div>
        </div>

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
              const name      = planting?.plant?.name ?? planting?.custom_plant_name ?? null;
              const color     = name ? getPlantColor(name) : null;
              const occupied  = !!planting;

              return (
                <button
                  key={slotIndex}
                  onClick={() => handleSlotTap(slotIndex, occupied)}
                  disabled={occupied}
                  style={{
                    width: SLOT_PX,
                    height: SLOT_PX,
                    backgroundColor: color?.bg,
                    borderColor: color?.border ?? undefined,
                  }}
                  className={[
                    "flex items-center justify-center border transition-colors text-[8px] font-semibold leading-tight px-0.5",
                    occupied
                      ? "cursor-default"
                      : "border-stone-200 hover:bg-garden-50 hover:border-garden-300",
                  ].join(" ")}
                  title={name ?? `Slot ${slotIndex}`}
                >
                  {name && (
                    <span className="line-clamp-3 text-center" style={{ color: color?.text }}>
                      {name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button
          className="text-xs text-muted-foreground hover:text-garden-700 underline"
          onClick={() => {
            router.push(`/beds/${selectedBed.id}/plantings/new?plant_id=${plantId}`);
            handleClose();
          }}
        >
          Add without selecting a slot →
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 rounded-lg border border-garden-300 bg-garden-50 px-4 py-2 text-sm font-medium text-garden-800 hover:bg-garden-100 transition-colors"
      >
        + Add to bed
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-t-2xl shadow-2xl flex flex-col"
            style={{ maxHeight: "80vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <p className="font-semibold text-sm text-stone-800">
                {selectedBed
                  ? `Place in ${selectedBed.name}`
                  : `Add ${plantName} to a bed`}
              </p>
              <div className="flex items-center gap-3">
                {selectedBed && (
                  <button
                    onClick={() => { setSelectedBed(null); setBedPlantings([]); }}
                    className="text-xs text-muted-foreground hover:text-stone-700"
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="text-sm text-muted-foreground hover:text-stone-700"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Sheet body */}
            <div className="overflow-y-auto flex-1 p-4">
              {!selectedBed ? (
                /* Bed list */
                beds.length === 0 ? (
                  <div className="text-center py-10 text-sm text-muted-foreground">
                    No beds yet. Create a bed first.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {beds.map((bed) => (
                      <button
                        key={bed.id}
                        onClick={() => handleSelectBed(bed)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-stone-200 text-left hover:border-garden-300 hover:bg-garden-50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-stone-800">{bed.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {BED_TYPE_LABELS[bed.bed_type] ?? bed.bed_type}
                          </p>
                        </div>
                        <span className="text-muted-foreground text-sm">→</span>
                      </button>
                    ))}
                  </div>
                )
              ) : isPending ? (
                <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                  Loading grid…
                </div>
              ) : (
                renderMiniGrid()
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
