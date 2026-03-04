"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Plant } from "@/types";

interface PlantingFormProps {
  bedId: string;
  plants: Pick<Plant, "id" | "name" | "category">[];
  action: (formData: FormData) => Promise<void>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: "planned", label: "Planned" },
  { value: "seeds_started", label: "Seeds Started" },
  { value: "germinating", label: "Germinating" },
  { value: "growing", label: "Growing" },
  { value: "ready", label: "Ready to Harvest" },
  { value: "harvested", label: "Harvested" },
];

// Group plants by category for the select
function groupPlants(plants: PlantingFormProps["plants"]) {
  const groups: Record<string, PlantingFormProps["plants"]> = {};
  for (const p of plants) {
    const cat = p.category ?? "other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(p);
  }
  return groups;
}

export function PlantingForm({ bedId, plants, action }: PlantingFormProps) {
  const router = useRouter();
  const [isCustom, setIsCustom] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<PlantingFormProps["plants"][0] | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const groups = groupPlants(plants);

  function handlePlantSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (val === "__custom__") {
      setIsCustom(true);
      setSelectedPlant(null);
    } else {
      setIsCustom(false);
      setSelectedPlant(plants.find((p) => p.id === val) ?? null);
    }
  }

  return (
    <form ref={formRef} action={action} className="space-y-6">
      {/* Plant selection */}
      <div className="space-y-3">
        <Field label="Plant">
          <select
            name="plant_select"
            defaultValue=""
            onChange={handlePlantSelect}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="" disabled>— choose from library —</option>
            {Object.entries(groups).map(([cat, ps]) => (
              <optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
                {ps.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            ))}
            <optgroup label="Other">
              <option value="__custom__">Custom / not in library…</option>
            </optgroup>
          </select>
        </Field>

        {/* Hidden plant_id — populated when a library plant is chosen */}
        <input type="hidden" name="plant_id" value={selectedPlant?.id ?? ""} />

        {isCustom && (
          <Field label="Plant name">
            <Input
              name="custom_plant_name"
              required
              placeholder="e.g. Rainbow chard"
            />
          </Field>
        )}
      </div>

      {/* Row & quantity */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Row number">
          <Input name="row_number" type="number" min="1" placeholder="e.g. 1" />
        </Field>
        <Field label="Row label">
          <Input name="row_label" placeholder="e.g. Row A" />
        </Field>
        <Field label="Quantity">
          <Input name="quantity" type="number" min="1" placeholder="e.g. 6" />
        </Field>
        <Field label="Status">
          <select
            name="status"
            defaultValue="planned"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Key dates */}
      <div>
        <p className="text-sm font-medium mb-3">Key dates (optional)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Seeds started indoors">
            <Input name="seeds_started_date" type="date" />
          </Field>
          <Field label="Sown outdoors">
            <Input name="sown_outdoors_date" type="date" />
          </Field>
          <Field label="Planted out">
            <Input name="planted_out_date" type="date" />
          </Field>
          <Field label="Expected harvest">
            <Input name="expected_harvest_date" type="date" />
          </Field>
        </div>
      </div>

      {/* Notes */}
      <Field label="Notes">
        <textarea
          name="notes"
          rows={2}
          placeholder="Variety, source, any observations…"
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </Field>

      <div className="flex gap-3 pt-2">
        <Button type="submit">Add planting</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
