"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createPlantAction } from "@/app/actions/plants";
import type { Plant } from "@/types";

// ── Partial AI-populated plant data ─────────────────────────────────────────

type AiData = Partial<Omit<Plant, "id" | "is_user_created" | "created_by" | "created_at">>;

// ── Small field wrappers ─────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function MonthPair({
  startName, endName, label,
  startVal, endVal,
  onChange,
}: {
  startName: string; endName: string; label: string;
  startVal?: number | null; endVal?: number | null;
  onChange?: (name: string, val: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2 items-center">
        <Input
          name={startName}
          type="number" min="1" max="12"
          placeholder="From"
          defaultValue={startVal ?? ""}
          key={`${startName}-${startVal}`}
          onChange={onChange ? (e) => onChange(startName, e.target.value) : undefined}
          className="w-24"
        />
        <span className="text-muted-foreground text-sm">–</span>
        <Input
          name={endName}
          type="number" min="1" max="12"
          placeholder="To"
          defaultValue={endVal ?? ""}
          key={`${endName}-${endVal}`}
          onChange={onChange ? (e) => onChange(endName, e.target.value) : undefined}
          className="w-24"
        />
        <span className="text-xs text-muted-foreground">(month numbers)</span>
      </div>
    </div>
  );
}

const CATEGORIES: Plant["category"][] = [
  "vegetable", "flower", "herb", "fruit", "perennial", "annual", "bulb", "shrub", "biennial",
];

// ── Main form ────────────────────────────────────────────────────────────────

export function NewPlantForm() {
  const [lookupName, setLookupName] = useState("");
  const [aiData, setAiData] = useState<AiData | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isLooking, startLookup] = useTransition();
  const [isSaving, startSave] = useTransition();

  // AI lookup
  function handleLookup() {
    if (!lookupName.trim()) return;
    setAiError(null);
    startLookup(async () => {
      try {
        const res = await fetch("/api/plants/enrich", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: lookupName.trim() }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setAiError(err.error ?? "AI lookup failed — fill the form manually.");
          return;
        }
        const data: AiData = await res.json();
        setAiData(data);
      } catch {
        setAiError("Could not reach the AI service — fill the form manually.");
      }
    });
  }

  // Form submission via server action
  function handleSubmit(formData: FormData) {
    startSave(async () => {
      await createPlantAction(formData);
    });
  }

  const v = aiData ?? {};

  return (
    <div className="max-w-2xl space-y-8">

      {/* ── AI lookup strip ── */}
      <div className="p-4 rounded-lg border bg-garden-50 border-garden-200 space-y-3">
        <p className="text-sm font-medium text-garden-800">AI-assisted lookup</p>
        <p className="text-xs text-muted-foreground">
          Type the plant name and click Look up — the form fields below will be pre-filled with growing information calibrated for Ireland. Review and adjust before saving.
        </p>
        <div className="flex gap-2">
          <Input
            value={lookupName}
            onChange={(e) => setLookupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleLookup())}
            placeholder="e.g. Dracaena Fragrans"
            className="max-w-xs"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleLookup}
            disabled={isLooking || !lookupName.trim()}
          >
            {isLooking ? "Looking up…" : "Look up"}
          </Button>
        </div>
        {aiData && (
          <p className="text-xs text-garden-700 font-medium">
            ✓ Fields pre-filled — review below and save when ready.
          </p>
        )}
        {aiError && (
          <p className="text-xs text-red-600">{aiError}</p>
        )}
      </div>

      {/* ── Plant form ── */}
      <form action={handleSubmit} className="space-y-8">

        {/* Basic info */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic info</h2>

          <Field label="Common name *">
            <Input
              name="name"
              required
              defaultValue={v.name ?? lookupName}
              key={`name-${v.name}`}
              placeholder="e.g. Dracaena Fragrans"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Latin name">
              <Input
                name="latin_name"
                defaultValue={v.latin_name ?? ""}
                key={`latin-${v.latin_name}`}
                placeholder="e.g. Dracaena fragrans"
              />
            </Field>

            <Field label="Category">
              <select
                name="category"
                key={`cat-${v.category}`}
                defaultValue={v.category ?? "vegetable"}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Subcategory">
            <Input
              name="subcategory"
              defaultValue={v.subcategory ?? ""}
              key={`sub-${v.subcategory}`}
              placeholder="e.g. Brassica, Allium, Tropical houseplant"
            />
          </Field>

          <Field label="Description">
            <textarea
              name="description"
              rows={3}
              defaultValue={v.description ?? ""}
              key={`desc-${v.description}`}
              placeholder="Brief description"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </Field>
        </section>

        {/* Sowing & timing */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Sowing &amp; timing</h2>

          <MonthPair startName="sow_indoors_start" endName="sow_indoors_end" label="Sow indoors"
            startVal={v.sow_indoors_start} endVal={v.sow_indoors_end} />
          <MonthPair startName="sow_outdoors_start" endName="sow_outdoors_end" label="Sow outdoors"
            startVal={v.sow_outdoors_start} endVal={v.sow_outdoors_end} />
          <MonthPair startName="transplant_start" endName="transplant_end" label="Plant out / transplant"
            startVal={v.transplant_start} endVal={v.transplant_end} />
          <MonthPair startName="harvest_start" endName="harvest_end" label="Harvest window"
            startVal={v.harvest_start} endVal={v.harvest_end} />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Weeks indoors (min / max)">
              <div className="flex gap-2">
                <Input name="weeks_indoors_min" type="number" min="0" placeholder="Min"
                  defaultValue={v.weeks_indoors_min ?? ""} key={`wmin-${v.weeks_indoors_min}`} />
                <Input name="weeks_indoors_max" type="number" min="0" placeholder="Max"
                  defaultValue={v.weeks_indoors_max ?? ""} key={`wmax-${v.weeks_indoors_max}`} />
              </div>
            </Field>
            <Field label="Germination days (min / max)">
              <div className="flex gap-2">
                <Input name="germination_days_min" type="number" min="0" placeholder="Min"
                  defaultValue={v.germination_days_min ?? ""} key={`gmin-${v.germination_days_min}`} />
                <Input name="germination_days_max" type="number" min="0" placeholder="Max"
                  defaultValue={v.germination_days_max ?? ""} key={`gmax-${v.germination_days_max}`} />
              </div>
            </Field>
            <Field label="Germination temp °C (min / max)">
              <div className="flex gap-2">
                <Input name="germination_temp_min" type="number" placeholder="Min"
                  defaultValue={v.germination_temp_min ?? ""} key={`tmin-${v.germination_temp_min}`} />
                <Input name="germination_temp_max" type="number" placeholder="Max"
                  defaultValue={v.germination_temp_max ?? ""} key={`tmax-${v.germination_temp_max}`} />
              </div>
            </Field>
          </div>
        </section>

        {/* Growing conditions */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Growing conditions</h2>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Spacing (cm)">
              <Input name="spacing_cm" type="number" min="0"
                defaultValue={v.spacing_cm ?? ""} key={`sp-${v.spacing_cm}`} placeholder="e.g. 30" />
            </Field>
            <Field label="Row spacing (cm)">
              <Input name="row_spacing_cm" type="number" min="0"
                defaultValue={v.row_spacing_cm ?? ""} key={`rsp-${v.row_spacing_cm}`} placeholder="e.g. 45" />
            </Field>
            <Field label="Height (cm min / max)">
              <div className="flex gap-1">
                <Input name="height_cm_min" type="number" min="0" placeholder="Min"
                  defaultValue={v.height_cm_min ?? ""} key={`hmin-${v.height_cm_min}`} />
                <Input name="height_cm_max" type="number" min="0" placeholder="Max"
                  defaultValue={v.height_cm_max ?? ""} key={`hmax-${v.height_cm_max}`} />
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Sun requirement">
              <select name="sun_requirement" key={`sun-${v.sun_requirement}`}
                defaultValue={v.sun_requirement ?? ""}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">— not specified —</option>
                <option value="full_sun">Full sun</option>
                <option value="partial_shade">Partial shade</option>
                <option value="full_shade">Full shade</option>
              </select>
            </Field>
            <Field label="Water needs">
              <select name="water_needs" key={`water-${v.water_needs}`}
                defaultValue={v.water_needs ?? ""}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">— not specified —</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </Field>
          </div>

          <Field label="Soil preference">
            <Input name="soil_preference"
              defaultValue={v.soil_preference ?? ""} key={`soil-${v.soil_preference}`}
              placeholder="e.g. Well-drained, fertile" />
          </Field>
        </section>

        {/* Ireland-specific */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Ireland notes</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Hardiness zone (RHS)">
              <Input name="hardiness_zone"
                defaultValue={v.hardiness_zone ?? ""} key={`hz-${v.hardiness_zone}`}
                placeholder="e.g. H4" />
            </Field>
            <Field label="Slug risk">
              <select name="slug_risk" key={`slug-${v.slug_risk}`}
                defaultValue={v.slug_risk ?? ""}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">— not specified —</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </Field>
          </div>

          <div className="flex flex-wrap gap-6">
            {([
              ["frost_tolerant", "Frost tolerant", v.frost_tolerant],
              ["frost_tender", "Frost tender", v.frost_tender],
              ["is_perennial", "Perennial", v.is_perennial],
              ["is_cut_flower", "Cut flower", v.is_cut_flower],
              ["succession_sow", "Succession sow", v.succession_sow],
            ] as [string, string, boolean | undefined][]).map(([name, label, checked]) => (
              <label key={name} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  name={name}
                  defaultChecked={checked ?? false}
                  key={`${name}-${checked}`}
                  className="h-4 w-4 rounded border-input"
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        {/* Companion planting */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Companions &amp; pests</h2>

          <Field label="Companion plants" hint="Comma-separated, e.g. Basil, Marigold">
            <Input name="companion_plants"
              defaultValue={v.companion_plants?.join(", ") ?? ""} key={`comp-${v.companion_plants}`}
              placeholder="e.g. Basil, Marigold" />
          </Field>
          <Field label="Avoid near" hint="Comma-separated">
            <Input name="avoid_near"
              defaultValue={v.avoid_near?.join(", ") ?? ""} key={`avoid-${v.avoid_near}`}
              placeholder="e.g. Fennel, Onion" />
          </Field>
          <Field label="Common pests" hint="Comma-separated">
            <Input name="common_pests"
              defaultValue={v.common_pests?.join(", ") ?? ""} key={`pests-${v.common_pests}`}
              placeholder="e.g. Aphids, Slugs" />
          </Field>
          <Field label="Common diseases" hint="Comma-separated">
            <Input name="common_diseases"
              defaultValue={v.common_diseases?.join(", ") ?? ""} key={`diseases-${v.common_diseases}`}
              placeholder="e.g. Powdery mildew" />
          </Field>
        </section>

        {/* Notes */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Notes</h2>

          <Field label="Growing tips">
            <textarea name="growing_tips" rows={3}
              defaultValue={v.growing_tips ?? ""} key={`tips-${v.growing_tips}`}
              placeholder="Practical advice for an Irish gardener…"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
          </Field>
          <Field label="Notes">
            <textarea name="notes" rows={2}
              defaultValue={v.notes ?? ""} key={`notes-${v.notes}`}
              placeholder="Anything else worth recording…"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
          </Field>
        </section>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save plant"}
          </Button>
          <Button type="button" variant="outline" onClick={() => history.back()}>
            Cancel
          </Button>
        </div>

        {aiData && (
          <p className="text-xs text-muted-foreground">
            <Badge variant="outline" className="mr-1.5">AI-assisted</Badge>
            Fields pre-filled by AI. Review carefully before saving — AI data can be imprecise.
          </p>
        )}
      </form>
    </div>
  );
}
