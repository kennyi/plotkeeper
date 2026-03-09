"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import type { GardenBed } from "@/types";

// Pot size presets — Small / Medium / Large (dimensions in metres)
const POT_SIZES = [
  { label: "Small",  length_m: 0.30, width_m: 0.30, depth_m: 0.30 },
  { label: "Medium", length_m: 0.45, width_m: 0.45, depth_m: 0.40 },
  { label: "Large",  length_m: 0.60, width_m: 0.60, depth_m: 0.50 },
];

interface BedFormProps {
  defaultValues?: Partial<GardenBed>;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

function Select({
  name,
  defaultValue,
  options,
  placeholder,
  onChange,
}: {
  name: string;
  defaultValue?: string | null;
  options: { value: string; label: string }[];
  placeholder?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? ""}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

const BED_TYPES = [
  { value: "raised_bed", label: "Raised Bed" },
  { value: "ground_bed", label: "Ground Bed" },
  { value: "pot", label: "Pot" },
  { value: "planter", label: "Planter" },
  { value: "greenhouse_bed", label: "Greenhouse Bed" },
  { value: "window_box", label: "Window Box" },
  { value: "grow_bag", label: "Grow Bag" },
];

const SUN_OPTIONS = [
  { value: "full_sun", label: "Full Sun" },
  { value: "partial_shade", label: "Partial Shade" },
  { value: "full_shade", label: "Full Shade" },
  { value: "variable", label: "Variable" },
];

const WIND_OPTIONS = [
  { value: "sheltered", label: "Sheltered" },
  { value: "moderate", label: "Moderate" },
  { value: "exposed", label: "Exposed" },
];

export function BedForm({ defaultValues, action, submitLabel }: BedFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [bedType, setBedType] = useState<string>(defaultValues?.bed_type ?? "raised_bed");

  // If editing a pot, infer closest preset from existing dimensions
  const inferredPotSize = defaultValues?.bed_type === "pot" && defaultValues?.length_m
    ? POT_SIZES.reduce((best, s) =>
        Math.abs(s.length_m - (defaultValues.length_m ?? 0)) <
        Math.abs(best.length_m - (defaultValues.length_m ?? 0))
          ? s : best
      )
    : POT_SIZES[1]; // default Medium
  const [potSize, setPotSize] = useState(inferredPotSize);

  const isPot = bedType === "pot";

  return (
    <form ref={formRef} action={action} className="space-y-6">
      {/* Name & Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Bed Name *">
          <Input
            name="name"
            required
            defaultValue={defaultValues?.name ?? ""}
            placeholder="e.g. Main Veg Bed"
          />
        </Field>
        <Field label="Type *">
          <Select
            name="bed_type"
            defaultValue={defaultValues?.bed_type ?? "raised_bed"}
            options={BED_TYPES}
            onChange={setBedType}
          />
        </Field>
      </div>

      {/* Indoor / Outdoor */}
      <Field label="Growing environment">
        <div className="flex rounded-lg border overflow-hidden text-sm w-fit">
          {[
            { value: "false", label: "Outdoors" },
            { value: "true", label: "Indoors / undercover" },
          ].map(({ value, label }) => (
            <label
              key={value}
              className="relative flex items-center cursor-pointer"
            >
              <input
                type="radio"
                name="is_indoor"
                value={value}
                defaultChecked={value === String(defaultValues?.is_indoor ?? false)}
                className="sr-only peer"
              />
              <span className="px-3 py-1.5 transition-colors text-muted-foreground hover:bg-muted peer-checked:bg-foreground peer-checked:text-background peer-checked:font-medium">
                {label}
              </span>
            </label>
          ))}
        </div>
      </Field>

      {/* Dimensions — pots get S/M/L picker; everything else gets free-text */}
      {isPot ? (
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Pot size</p>
          <div className="flex gap-3">
            {POT_SIZES.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setPotSize(s)}
                className={[
                  "flex-1 py-3 rounded-xl border text-sm font-medium transition-colors",
                  potSize.label === s.label
                    ? "bg-garden-600 text-white border-garden-600"
                    : "border-stone-300 text-stone-600 hover:border-garden-400 hover:text-garden-700",
                ].join(" ")}
              >
                {s.label}
              </button>
            ))}
          </div>
          {/* Hidden fields carry the dimensions to the server action */}
          <input type="hidden" name="length_m" value={potSize.length_m} />
          <input type="hidden" name="width_m" value={potSize.width_m} />
          <input type="hidden" name="depth_m" value={potSize.depth_m} />
        </div>
      ) : (
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Dimensions (metres, optional)</p>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Length">
              <Input
                name="length_m"
                type="number"
                step="0.01"
                min="0"
                defaultValue={defaultValues?.length_m ?? ""}
                placeholder="e.g. 2.4"
              />
            </Field>
            <Field label="Width">
              <Input
                name="width_m"
                type="number"
                step="0.01"
                min="0"
                defaultValue={defaultValues?.width_m ?? ""}
                placeholder="e.g. 1.2"
              />
            </Field>
            <Field label="Depth">
              <Input
                name="depth_m"
                type="number"
                step="0.01"
                min="0"
                defaultValue={defaultValues?.depth_m ?? ""}
                placeholder="e.g. 0.3"
              />
            </Field>
          </div>
        </div>
      )}

      {/* Location & Conditions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Location">
          <Input
            name="location_label"
            defaultValue={defaultValues?.location_label ?? ""}
            placeholder="e.g. South-facing wall"
          />
        </Field>
        <Field label="Section">
          <Input
            name="section"
            defaultValue={defaultValues?.section ?? ""}
            placeholder="e.g. Kitchen garden"
          />
        </Field>
        <Field label="Sun Exposure">
          <Select
            name="sun_exposure"
            defaultValue={defaultValues?.sun_exposure}
            options={SUN_OPTIONS}
            placeholder="— select —"
          />
        </Field>
        <Field label="Wind Exposure">
          <Select
            name="wind_exposure"
            defaultValue={defaultValues?.wind_exposure}
            options={WIND_OPTIONS}
            placeholder="— select —"
          />
        </Field>
      </div>

      {/* Soil */}
      <Field label="Soil Type">
        <Input
          name="soil_type"
          defaultValue={defaultValues?.soil_type ?? ""}
          placeholder="e.g. Loam, raised bed compost mix"
        />
      </Field>

      {/* Notes */}
      <Field label="Notes">
        <textarea
          name="notes"
          defaultValue={defaultValues?.notes ?? ""}
          rows={3}
          placeholder="Anything useful to remember about this bed…"
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </Field>

      {/* Photo */}
      <PhotoUpload
        name="photo_url"
        defaultValue={defaultValues?.photo_url}
        folder="beds"
        label="Bed photo (optional)"
      />

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit">{submitLabel}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
