"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import type { GardenBed } from "@/types";

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
}: {
  name: string;
  defaultValue?: string | null;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? ""}
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

      {/* Dimensions */}
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
