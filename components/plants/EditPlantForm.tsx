"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { updatePlantAction } from "@/app/actions/plants";
import type { Plant } from "@/types";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SelectInput({ name, defaultValue, children }: { name: string; defaultValue?: string; children: React.ReactNode }) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? ""}
      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {children}
    </select>
  );
}

function MonthPair({ startName, endName, label, startVal, endVal }: {
  startName: string; endName: string; label: string;
  startVal?: number | null; endVal?: number | null;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2 items-center">
        <Input name={startName} type="number" min="1" max="12" placeholder="From"
          defaultValue={startVal ?? ""} className="w-24" />
        <span className="text-muted-foreground text-sm">–</span>
        <Input name={endName} type="number" min="1" max="12" placeholder="To"
          defaultValue={endVal ?? ""} className="w-24" />
        <span className="text-xs text-muted-foreground">(month numbers)</span>
      </div>
    </div>
  );
}

const CATEGORIES: Plant["category"][] = [
  "vegetable", "flower", "herb", "fruit", "perennial", "annual", "bulb", "shrub", "biennial",
];

export function EditPlantForm({ plant }: { plant: Plant }) {
  const [isSaving, startSave] = useTransition();

  function handleSubmit(formData: FormData) {
    startSave(async () => {
      await updatePlantAction(plant.id, formData);
    });
  }

  return (
    <form action={handleSubmit} className="max-w-2xl space-y-8">

      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic info</h2>

        <Field label="Common name *">
          <Input name="name" required defaultValue={plant.name} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Latin name">
            <Input name="latin_name" defaultValue={plant.latin_name ?? ""} placeholder="e.g. Solanum lycopersicum" />
          </Field>
          <Field label="Category">
            <SelectInput name="category" defaultValue={plant.category}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </SelectInput>
          </Field>
        </div>

        <Field label="Subcategory">
          <Input name="subcategory" defaultValue={plant.subcategory ?? ""} placeholder="e.g. Brassica, Allium" />
        </Field>

        <Field label="Description">
          <textarea name="description" rows={3} defaultValue={plant.description ?? ""}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
        </Field>

        <PhotoUpload name="photo_url" defaultValue={plant.photo_url} folder="plants" label="Photo (optional)" />
      </section>

      {/* Sowing & timing */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Sowing &amp; timing</h2>

        <MonthPair startName="sow_indoors_start" endName="sow_indoors_end" label="Sow indoors"
          startVal={plant.sow_indoors_start} endVal={plant.sow_indoors_end} />
        <MonthPair startName="sow_outdoors_start" endName="sow_outdoors_end" label="Sow outdoors"
          startVal={plant.sow_outdoors_start} endVal={plant.sow_outdoors_end} />
        <MonthPair startName="transplant_start" endName="transplant_end" label="Plant out / transplant"
          startVal={plant.transplant_start} endVal={plant.transplant_end} />
        <MonthPair startName="harvest_start" endName="harvest_end" label="Harvest window"
          startVal={plant.harvest_start} endVal={plant.harvest_end} />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Weeks indoors (min / max)">
            <div className="flex gap-2">
              <Input name="weeks_indoors_min" type="number" min="0" placeholder="Min" defaultValue={plant.weeks_indoors_min ?? ""} />
              <Input name="weeks_indoors_max" type="number" min="0" placeholder="Max" defaultValue={plant.weeks_indoors_max ?? ""} />
            </div>
          </Field>
          <Field label="Hardening off (days)">
            <Input name="hardening_off_days" type="number" min="0" placeholder="e.g. 7" defaultValue={plant.hardening_off_days ?? ""} />
          </Field>
          <Field label="Germination days (min / max)">
            <div className="flex gap-2">
              <Input name="germination_days_min" type="number" min="0" placeholder="Min" defaultValue={plant.germination_days_min ?? ""} />
              <Input name="germination_days_max" type="number" min="0" placeholder="Max" defaultValue={plant.germination_days_max ?? ""} />
            </div>
          </Field>
          <Field label="Germination temp °C (min / max)">
            <div className="flex gap-2">
              <Input name="germination_temp_min" type="number" placeholder="Min" defaultValue={plant.germination_temp_min ?? ""} />
              <Input name="germination_temp_max" type="number" placeholder="Max" defaultValue={plant.germination_temp_max ?? ""} />
            </div>
          </Field>
        </div>
      </section>

      {/* Growing conditions */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Growing conditions</h2>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Spacing (cm)">
            <Input name="spacing_cm" type="number" min="0" defaultValue={plant.spacing_cm ?? ""} placeholder="e.g. 30" />
          </Field>
          <Field label="Row spacing (cm)">
            <Input name="row_spacing_cm" type="number" min="0" defaultValue={plant.row_spacing_cm ?? ""} placeholder="e.g. 45" />
          </Field>
          <Field label="Sowing depth (cm)">
            <Input name="sowing_depth_cm" type="number" min="0" defaultValue={plant.sowing_depth_cm ?? ""} placeholder="e.g. 1" />
          </Field>
          <Field label="Height (cm min / max)">
            <div className="flex gap-1">
              <Input name="height_cm_min" type="number" min="0" placeholder="Min" defaultValue={plant.height_cm_min ?? ""} />
              <Input name="height_cm_max" type="number" min="0" placeholder="Max" defaultValue={plant.height_cm_max ?? ""} />
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Sun requirement">
            <SelectInput name="sun_requirement" defaultValue={plant.sun_requirement ?? ""}>
              <option value="">— not specified —</option>
              <option value="full_sun">Full sun</option>
              <option value="partial_shade">Partial shade</option>
              <option value="full_shade">Full shade</option>
            </SelectInput>
          </Field>
          <Field label="Water needs">
            <SelectInput name="water_needs" defaultValue={plant.water_needs ?? ""}>
              <option value="">— not specified —</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </SelectInput>
          </Field>
        </div>

        <Field label="Soil preference">
          <Input name="soil_preference" defaultValue={plant.soil_preference ?? ""} placeholder="e.g. Well-drained, fertile" />
        </Field>
      </section>

      {/* Ireland notes */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Ireland notes</h2>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Hardiness zone (RHS)">
            <Input name="hardiness_zone" defaultValue={plant.hardiness_zone ?? ""} placeholder="e.g. H4" />
          </Field>
          <Field label="Slug risk">
            <SelectInput name="slug_risk" defaultValue={plant.slug_risk ?? ""}>
              <option value="">— not specified —</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </SelectInput>
          </Field>
        </div>

        <div className="flex flex-wrap gap-6">
          {([
            ["frost_tolerant", "Frost tolerant", plant.frost_tolerant],
            ["frost_tender", "Frost tender", plant.frost_tender],
            ["is_perennial", "Perennial", plant.is_perennial],
            ["is_cut_flower", "Cut flower", plant.is_cut_flower],
            ["succession_sow", "Succession sow", plant.succession_sow],
          ] as [string, string, boolean][]).map(([name, label, checked]) => (
            <label key={name} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name={name} defaultChecked={checked}
                className="h-4 w-4 rounded border-input" />
              {label}
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Vase life (days)" hint="For cut flowers">
            <Input name="vase_life_days" type="number" min="0" defaultValue={plant.vase_life_days ?? ""} placeholder="e.g. 7" />
          </Field>
          <Field label="Succession interval (weeks)">
            <Input name="succession_interval_weeks" type="number" min="0" defaultValue={plant.succession_interval_weeks ?? ""} placeholder="e.g. 3" />
          </Field>
          <Field label="Lifespan (years)" hint="For perennials">
            <Input name="lifespan_years" type="number" min="0" defaultValue={plant.lifespan_years ?? ""} placeholder="e.g. 5" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Prune month" hint="Month number, 1–12">
            <Input name="prune_month" type="number" min="1" max="12" defaultValue={plant.prune_month ?? ""} placeholder="e.g. 3" />
          </Field>
          <Field label="Divide month" hint="Month number, 1–12">
            <Input name="divide_month" type="number" min="1" max="12" defaultValue={plant.divide_month ?? ""} placeholder="e.g. 9" />
          </Field>
          <Field label="Feeding frequency (days)">
            <Input name="feeding_frequency_days" type="number" min="0" defaultValue={plant.feeding_frequency_days ?? ""} placeholder="e.g. 14" />
          </Field>
          <Field label="Pruning frequency (days)">
            <Input name="pruning_frequency_days" type="number" min="0" defaultValue={plant.pruning_frequency_days ?? ""} placeholder="e.g. 30" />
          </Field>
        </div>
      </section>

      {/* Companions & pests */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Companions &amp; pests</h2>

        <Field label="Companion plants" hint="Comma-separated, e.g. Basil, Marigold">
          <Input name="companion_plants" defaultValue={plant.companion_plants?.join(", ") ?? ""} />
        </Field>
        <Field label="Avoid near" hint="Comma-separated">
          <Input name="avoid_near" defaultValue={plant.avoid_near?.join(", ") ?? ""} />
        </Field>
        <Field label="Common pests" hint="Comma-separated">
          <Input name="common_pests" defaultValue={plant.common_pests?.join(", ") ?? ""} />
        </Field>
        <Field label="Common diseases" hint="Comma-separated">
          <Input name="common_diseases" defaultValue={plant.common_diseases?.join(", ") ?? ""} />
        </Field>
      </section>

      {/* Notes */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Notes</h2>

        <Field label="Growing tips">
          <textarea name="growing_tips" rows={3} defaultValue={plant.growing_tips ?? ""}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
        </Field>
        <Field label="Notes">
          <textarea name="notes" rows={2} defaultValue={plant.notes ?? ""}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
        </Field>
      </section>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
