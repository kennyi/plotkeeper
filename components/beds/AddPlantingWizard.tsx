"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlantTopDownIcon } from "@/components/beds/PlantTopDownIcon";
import { MONTH_NAMES } from "@/lib/constants";
import { createPlantingWizardAction } from "@/app/actions/plantings";
import type { Plant, GardenBed } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type PlantOption = Pick<
  Plant,
  | "id"
  | "name"
  | "category"
  | "subcategory"
  | "sow_indoors_start"
  | "sow_indoors_end"
  | "sow_outdoors_start"
  | "sow_outdoors_end"
  | "germination_days_min"
  | "germination_days_max"
  | "weeks_indoors_min"
  | "weeks_indoors_max"
  | "hardening_off_days"
  | "harvest_start"
  | "harvest_end"
  | "slug_risk"
  | "frost_tender"
>;

/** Plants that can't be sown from seed, or are typically bought/acquired already growing. */
function isTypicallyExisting(plant: PlantOption): boolean {
  if (plant.category === "shrub" || plant.category === "perennial") return true;
  if (!plant.sow_indoors_start && !plant.sow_outdoors_start) return true;
  return false;
}

const EXISTING_STATUS_OPTIONS = [
  { value: "growing" as const,  label: "Growing" },
  { value: "ready" as const,    label: "Ready / Flowering" },
  { value: "planned" as const,  label: "Just acquired — not yet placed" },
] satisfies { value: import("@/types").BedPlanting["status"]; label: string }[];

export type ExistingSlotPlanting = {
  row_number: number | null;
  category: Plant["category"] | null;
  name: string | null;
};

interface AddPlantingWizardProps {
  bedId: string;
  bed: GardenBed;
  plants: PlantOption[];
  existingPlantings: ExistingSlotPlanting[];
  initialPlantId?: string;
  initialSlot?: number;
}

// ── Calculation helpers ────────────────────────────────────────────────────────

function formatDateDisplay(d: Date): string {
  return d.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function shiftDate(dateStr: string, days: number): Date {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d;
}

function calcGermination(plant: PlantOption, sowDate: string): string | null {
  if (!sowDate || !plant.germination_days_min) return null;
  const days =
    plant.germination_days_max && plant.germination_days_max !== plant.germination_days_min
      ? Math.round((plant.germination_days_min + plant.germination_days_max) / 2)
      : plant.germination_days_min;
  return formatDateDisplay(shiftDate(sowDate, days));
}

function calcHardenOffStart(plant: PlantOption, plantedOutDate: string): string | null {
  if (!plantedOutDate || !plant.hardening_off_days) return null;
  return formatDateDisplay(shiftDate(plantedOutDate, -plant.hardening_off_days));
}

function harvestWindowText(plant: PlantOption): string | null {
  if (!plant.harvest_start) return null;
  if (!plant.harvest_end || plant.harvest_end === plant.harvest_start) {
    return MONTH_NAMES[plant.harvest_start - 1];
  }
  return `${MONTH_NAMES[plant.harvest_start - 1]} – ${MONTH_NAMES[plant.harvest_end - 1]}`;
}

/** ISO date for the expected_harvest_date field — 1st of harvest_start month. */
function calcHarvestDateISO(plant: PlantOption, sowDate: string): string | null {
  if (!plant.harvest_start) return null;
  const ref = sowDate ? new Date(sowDate + "T00:00:00") : new Date();
  const sowMonth = ref.getMonth() + 1;
  let year = ref.getFullYear();
  if (plant.harvest_start < sowMonth) year++;
  return `${year}-${String(plant.harvest_start).padStart(2, "0")}-01`;
}

function getSowingWarning(plant: PlantOption, sowDate: string): string | null {
  if (!sowDate) return null;
  const month = new Date(sowDate + "T00:00:00").getMonth() + 1;
  const inIndoors =
    plant.sow_indoors_start &&
    plant.sow_indoors_end &&
    month >= plant.sow_indoors_start &&
    month <= plant.sow_indoors_end;
  const inOutdoors =
    plant.sow_outdoors_start &&
    plant.sow_outdoors_end &&
    month >= plant.sow_outdoors_start &&
    month <= plant.sow_outdoors_end;
  if (inIndoors || inOutdoors) return null;

  const windows: string[] = [];
  if (plant.sow_indoors_start && plant.sow_indoors_end) {
    windows.push(
      `${MONTH_NAMES[plant.sow_indoors_start - 1]}–${MONTH_NAMES[plant.sow_indoors_end - 1]} indoors`
    );
  }
  if (plant.sow_outdoors_start && plant.sow_outdoors_end) {
    windows.push(
      `${MONTH_NAMES[plant.sow_outdoors_start - 1]}–${MONTH_NAMES[plant.sow_outdoors_end - 1]} outdoors`
    );
  }
  if (!windows.length) return null;
  return `${plant.name}s are usually sown ${windows.join(" or ")}.`;
}

// ── Step indicator ─────────────────────────────────────────────────────────────

function StepDots({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {([1, 2, 3] as const).map((s) => (
        <div
          key={s}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            s === current
              ? "w-6 bg-garden-600"
              : s < current
              ? "w-3 bg-garden-300"
              : "w-3 bg-stone-200"
          }`}
        />
      ))}
      <span className="ml-2 text-xs text-muted-foreground">Step {current} of 3</span>
    </div>
  );
}

// ── Mini bed grid ──────────────────────────────────────────────────────────────

const GRID_SLOT_PX = 48;

function MiniGrid({
  bed,
  existingPlantings,
  selectedSlot,
  onSelectSlot,
}: {
  bed: GardenBed;
  existingPlantings: ExistingSlotPlanting[];
  selectedSlot: number | null;
  onSelectSlot: (slot: number | null) => void;
}) {
  const lengthM = bed.length_m;
  const widthM = bed.width_m;

  if (!lengthM || !widthM) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-6 py-8 text-center text-sm text-muted-foreground">
        No grid available — add dimensions to{" "}
        <a href={`/beds/${bed.id}/edit`} className="underline hover:text-stone-700">
          this bed
        </a>{" "}
        to enable slot picking.
      </div>
    );
  }

  // Use 25 cm slots for small beds, 50 cm for larger ones
  const slotCm = lengthM > 2 || widthM > 1.5 ? 50 : 25;
  const cols = Math.max(1, Math.round((lengthM * 100) / slotCm));
  const rows = Math.max(1, Math.round((widthM * 100) / slotCm));
  const total = cols * rows;

  const slotMap = new Map<number, ExistingSlotPlanting>();
  for (const p of existingPlantings) {
    if (p.row_number && p.row_number >= 1 && p.row_number <= total) {
      slotMap.set(p.row_number, p);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {cols} × {rows} grid · {slotCm} cm slots · Tap an empty slot
      </p>
      <div className="overflow-x-auto rounded-xl border border-amber-200">
        <div
          className="bg-amber-50"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, ${GRID_SLOT_PX}px)`,
            width: cols * GRID_SLOT_PX,
          }}
        >
          {Array.from({ length: total }, (_, i) => {
            const slot = i + 1;
            const existing = slotMap.get(slot);
            const isOccupied = !!existing;
            const isSelected = selectedSlot === slot;

            return (
              <button
                key={slot}
                onClick={() => {
                  if (!isOccupied) {
                    onSelectSlot(isSelected ? null : slot);
                  }
                }}
                style={{ width: GRID_SLOT_PX, height: GRID_SLOT_PX }}
                title={
                  existing?.name ??
                  (isSelected ? `Slot ${slot} — selected` : `Slot ${slot} — empty`)
                }
                className={[
                  "flex items-center justify-center border border-amber-200/60 transition-colors",
                  isOccupied
                    ? "cursor-default bg-garden-50"
                    : isSelected
                    ? "bg-garden-100 ring-2 ring-garden-500 ring-inset"
                    : "hover:bg-amber-100 cursor-pointer",
                ].join(" ")}
              >
                {isOccupied && (
                  <PlantTopDownIcon
                    category={existing!.category}
                    size={Math.round(GRID_SLOT_PX * 0.6)}
                  />
                )}
                {isSelected && !isOccupied && (
                  <span className="text-garden-700 text-xs font-bold">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-garden-100 border border-garden-300" />
          Planted
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-amber-100 border border-amber-300" />
          Empty
        </span>
        {selectedSlot && (
          <span className="ml-auto text-garden-700 font-medium">Slot {selectedSlot} selected</span>
        )}
      </div>
    </div>
  );
}

// ── Plant preview card ────────────────────────────────────────────────────────

function PlantPreviewCard({ plant }: { plant: PlantOption }) {
  const harvest = harvestWindowText(plant);

  const sowWindow = (() => {
    const parts: string[] = [];
    if (plant.sow_indoors_start && plant.sow_indoors_end) {
      parts.push(
        `${MONTH_NAMES[plant.sow_indoors_start - 1].slice(0, 3)}–${MONTH_NAMES[plant.sow_indoors_end - 1].slice(0, 3)} indoors`
      );
    }
    if (plant.sow_outdoors_start && plant.sow_outdoors_end) {
      parts.push(
        `${MONTH_NAMES[plant.sow_outdoors_start - 1].slice(0, 3)}–${MONTH_NAMES[plant.sow_outdoors_end - 1].slice(0, 3)} outdoors`
      );
    }
    return parts.join("  ·  ") || null;
  })();

  const weeksIndoors =
    plant.weeks_indoors_min
      ? plant.weeks_indoors_max && plant.weeks_indoors_max !== plant.weeks_indoors_min
        ? `${plant.weeks_indoors_min}–${plant.weeks_indoors_max} weeks`
        : `${plant.weeks_indoors_min} weeks`
      : null;

  const germDays =
    plant.germination_days_min
      ? plant.germination_days_max && plant.germination_days_max !== plant.germination_days_min
        ? `${plant.germination_days_min}–${plant.germination_days_max} days`
        : `${plant.germination_days_min} days`
      : null;

  return (
    <div className="rounded-xl border border-garden-200 bg-garden-50 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <PlantTopDownIcon category={plant.category} size={36} />
        <div>
          <p className="font-semibold text-stone-800">{plant.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{plant.category}</p>
        </div>
      </div>

      <dl className="space-y-1.5 text-sm">
        {sowWindow && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground shrink-0">Sow window</dt>
            <dd className="text-stone-800 text-right">{sowWindow}</dd>
          </div>
        )}
        {germDays && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground shrink-0">Germination</dt>
            <dd className="text-stone-800">{germDays}</dd>
          </div>
        )}
        {weeksIndoors && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground shrink-0">Weeks indoors</dt>
            <dd className="text-stone-800">{weeksIndoors}</dd>
          </div>
        )}
        {plant.hardening_off_days && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground shrink-0">Hardening off</dt>
            <dd className="text-stone-800">{plant.hardening_off_days} days</dd>
          </div>
        )}
        {harvest && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground shrink-0">Harvest window</dt>
            <dd className="text-stone-800">{harvest}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────────────

export function AddPlantingWizard({
  bedId,
  bed,
  plants,
  existingPlantings,
  initialPlantId,
  initialSlot,
}: AddPlantingWizardProps) {
  const preselectedPlant = initialPlantId
    ? (plants.find((p) => p.id === initialPlantId) ?? null)
    : null;
  const initialStep: 1 | 2 | 3 = preselectedPlant && initialSlot ? 3 : preselectedPlant ? 2 : 1;

  const [step, setStep] = useState<1 | 2 | 3>(initialStep);
  const [search, setSearch] = useState("");
  const [selectedPlant, setSelectedPlant] = useState<PlantOption | null>(preselectedPlant);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(initialSlot ?? null);
  const [sowDate, setSowDate] = useState("");
  const [plantedOutDate, setPlantedOutDate] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [mode, setMode] = useState<"sowing" | "existing">(
    preselectedPlant && isTypicallyExisting(preselectedPlant) ? "existing" : "sowing"
  );
  const [existingStatus, setExistingStatus] = useState<"growing" | "ready" | "planned">("growing");
  const [isPending, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);

  // Focus search on step 1 mount
  useEffect(() => {
    if (step === 1) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [step]);

  const filtered = plants
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 50);

  const warning = selectedPlant && sowDate ? getSowingWarning(selectedPlant, sowDate) : null;
  const germination = selectedPlant ? calcGermination(selectedPlant, sowDate) : null;
  const hardenOff = selectedPlant ? calcHardenOffStart(selectedPlant, plantedOutDate) : null;
  const harvestWindow = selectedPlant ? harvestWindowText(selectedPlant) : null;
  const hasCalculated = germination || hardenOff || harvestWindow;

  function handleConfirm() {
    if (!selectedPlant) return;
    const fd = new FormData();
    fd.append("plant_id", selectedPlant.id);
    if (selectedSlot !== null) fd.append("slot_number", String(selectedSlot));

    if (mode === "existing") {
      fd.append("explicit_status", existingStatus);
      if (plantedOutDate) fd.append("planted_out_date", plantedOutDate);
    } else {
      if (sowDate) fd.append("sow_date", sowDate);
      if (plantedOutDate) fd.append("planted_out_date", plantedOutDate);
      const hDate = calcHarvestDateISO(selectedPlant, sowDate);
      if (hDate) fd.append("expected_harvest_date", hDate);
    }

    fd.append("quantity", quantity || "1");
    startTransition(async () => {
      await createPlantingWizardAction(bedId, fd);
    });
  }

  // ── Step 1: Choose plant ──

  if (step === 1) {
    return (
      <div>
        <StepDots current={1} />
        <h2 className="text-lg font-semibold mb-1">Choose a plant</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Search the library — we&apos;ll work out the dates from there.
        </p>

        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search plants…"
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-transparent"
        />

        <div
          className="rounded-xl border border-stone-200 overflow-hidden mb-4"
          style={{ maxHeight: 280, overflowY: "auto" }}
        >
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No plants found</div>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPlant(p);
                  setSearch("");
                  setMode(isTypicallyExisting(p) ? "existing" : "sowing");
                }}
                className={[
                  "w-full flex items-center gap-3 px-4 py-3 text-left border-b last:border-b-0 transition-colors",
                  selectedPlant?.id === p.id
                    ? "bg-garden-50"
                    : "hover:bg-stone-50",
                ].join(" ")}
              >
                <PlantTopDownIcon category={p.category} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-stone-800 truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{p.category}</p>
                </div>
                {selectedPlant?.id === p.id && (
                  <span className="text-garden-600 text-sm font-medium shrink-0">Selected</span>
                )}
              </button>
            ))
          )}
        </div>

        {selectedPlant && <PlantPreviewCard plant={selectedPlant} />}

        <div className="flex gap-3 mt-4">
          <Button
            onClick={() => setStep(2)}
            disabled={!selectedPlant}
            className={selectedPlant ? "flex-1" : "flex-1 opacity-50"}
          >
            Continue
          </Button>
        </div>

        {!selectedPlant && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            Can&apos;t find your plant?{" "}
            <a href="/plants/new" className="underline hover:text-foreground">
              Add it to the library →
            </a>
          </p>
        )}
      </div>
    );
  }

  // ── Step 2: Pick slot ──

  if (step === 2) {
    return (
      <div>
        <StepDots current={2} />
        <h2 className="text-lg font-semibold mb-1">Pick a slot</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Tap an empty slot in{" "}
          <span className="font-medium text-stone-800">{bed.name}</span> to place your{" "}
          {selectedPlant!.name.toLowerCase()}.
        </p>

        <MiniGrid
          bed={bed}
          existingPlantings={existingPlantings}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
        />

        {!selectedSlot && bed.length_m && bed.width_m && (
          <p className="mt-2 text-xs text-muted-foreground">
            No slot needed? Continue without selecting one.
          </p>
        )}

        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={() => setStep(1)}>
            Back
          </Button>
          <Button onClick={() => setStep(3)} className="flex-1">
            {selectedSlot ? `Continue with slot ${selectedSlot}` : "Continue without a slot"}
          </Button>
        </div>
      </div>
    );
  }

  // ── Step 3: Confirm ──

  const canSow = !!(selectedPlant?.sow_indoors_start || selectedPlant?.sow_outdoors_start);

  return (
    <div>
      <StepDots current={3} />
      <h2 className="text-lg font-semibold mb-1">Confirm planting</h2>

      {/* Summary pill */}
      <div className="flex items-center gap-2 mb-4 bg-stone-100 rounded-lg px-3 py-2 text-sm flex-wrap">
        <PlantTopDownIcon category={selectedPlant!.category} size={22} />
        <span className="font-medium">{selectedPlant!.name}</span>
        <span className="text-stone-300">·</span>
        <span className="text-muted-foreground">{bed.name}</span>
        {selectedSlot && (
          <>
            <span className="text-stone-300">·</span>
            <span className="text-muted-foreground">Slot {selectedSlot}</span>
          </>
        )}
      </div>

      {/* Mode toggle — only shown when the plant could go either way */}
      <div className="flex rounded-lg border border-stone-200 overflow-hidden mb-5 text-sm">
        <button
          onClick={() => setMode("sowing")}
          className={`flex-1 py-2 px-3 font-medium transition-colors ${
            mode === "sowing"
              ? "bg-garden-600 text-white"
              : "bg-background text-muted-foreground hover:bg-stone-50"
          }`}
        >
          Sowing from seed
        </button>
        <button
          onClick={() => setMode("existing")}
          className={`flex-1 py-2 px-3 font-medium transition-colors border-l border-stone-200 ${
            mode === "existing"
              ? "bg-garden-600 text-white"
              : "bg-background text-muted-foreground hover:bg-stone-50"
          }`}
        >
          Already growing
        </button>
      </div>

      <div className="space-y-4 mb-5">
        {mode === "sowing" ? (
          <>
            {/* Sow date — only relevant when sowing mode */}
            {canSow && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Sow date{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input
                  type="date"
                  value={sowDate}
                  onChange={(e) => setSowDate(e.target.value)}
                  lang="en-IE"
                />
                {warning && (
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    {warning}
                  </p>
                )}
              </div>
            )}

            {/* Planted out date */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Planted out date{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Input
                type="date"
                value={plantedOutDate}
                onChange={(e) => setPlantedOutDate(e.target.value)}
                lang="en-IE"
              />
            </div>
          </>
        ) : (
          <>
            {/* Current status — existing plant */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Current status</label>
              <select
                value={existingStatus}
                onChange={(e) => setExistingStatus(e.target.value as typeof existingStatus)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {EXISTING_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Date placed/planted */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Date placed / planted{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Input
                type="date"
                value={plantedOutDate}
                onChange={(e) => setPlantedOutDate(e.target.value)}
                lang="en-IE"
              />
            </div>
          </>
        )}

        {/* Quantity — always shown */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Quantity</label>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 3"
            className="max-w-36"
          />
        </div>
      </div>

      {/* Calculated preview — sowing mode only */}
      {mode === "sowing" && hasCalculated && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Calculated from plant data
          </p>
          <dl className="space-y-2 text-sm">
            {germination ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Expected germination</dt>
                <dd className="font-medium text-stone-800">{germination}</dd>
              </div>
            ) : selectedPlant?.germination_days_min ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Expected germination</dt>
                <dd className="text-muted-foreground italic">enter sow date</dd>
              </div>
            ) : null}

            {hardenOff ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Start hardening off</dt>
                <dd className="font-medium text-stone-800">{hardenOff}</dd>
              </div>
            ) : selectedPlant?.hardening_off_days ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Start hardening off</dt>
                <dd className="text-muted-foreground italic">enter planted out date</dd>
              </div>
            ) : null}

            {harvestWindow && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Harvest window</dt>
                <dd className="font-medium text-stone-800">{harvestWindow}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Status note */}
      <p className="text-xs text-muted-foreground mb-4">
        {mode === "sowing" ? (
          <>
            Status will be set to{" "}
            <span className="font-medium text-stone-700">
              {sowDate ? "Seeds started" : "Planned"}
            </span>
            {sowDate ? " — update once germinated." : " — add a sow date to mark it started."}
          </>
        ) : (
          <>
            Status will be set to{" "}
            <span className="font-medium text-stone-700">
              {EXISTING_STATUS_OPTIONS.find((o) => o.value === existingStatus)?.label}
            </span>
            {" — "}update health and status as you go.
          </>
        )}
      </p>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button onClick={handleConfirm} disabled={isPending} className="flex-1">
          {isPending ? "Saving…" : "Confirm planting"}
        </Button>
      </div>
    </div>
  );
}
