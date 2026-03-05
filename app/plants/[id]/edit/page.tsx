import { notFound } from "next/navigation";
import Link from "next/link";
import { getPlant } from "@/lib/supabase";
import { updatePlantAction } from "@/app/actions/plants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { ArrowLeft } from "lucide-react";
import type { Plant } from "@/types";

interface Props {
  params: { id: string };
}

// Reusable label+input wrapper
function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <Input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Select({
  label,
  name,
  defaultValue,
  options,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function Checkbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        value="on"
        className="w-4 h-4 rounded border-input"
      />
      {label}
    </label>
  );
}

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide pt-4 border-t">
      {children}
    </h2>
  );
}

export default async function EditPlantPage({ params }: Props) {
  let plant: Plant;
  try {
    plant = await getPlant(params.id);
  } catch {
    notFound();
  }

  const action = updatePlantAction.bind(null, plant.id);

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href={`/plants/${plant.id}`}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to {plant.name}
        </Link>
      </Button>

      <h1 className="text-2xl font-bold mb-6">Edit plant</h1>

      <form action={action} className="max-w-2xl space-y-5">
        {/* Basic info */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name *" name="name" defaultValue={plant.name} placeholder="e.g. Runner Bean" />
            <Field label="Latin name" name="latin_name" defaultValue={plant.latin_name} placeholder="e.g. Phaseolus coccineus" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              name="category"
              defaultValue={plant.category}
              options={[
                { value: "vegetable", label: "Vegetable" },
                { value: "fruit", label: "Fruit" },
                { value: "herb", label: "Herb" },
                { value: "flower", label: "Flower" },
                { value: "perennial", label: "Perennial" },
                { value: "tree", label: "Tree" },
                { value: "shrub", label: "Shrub" },
                { value: "other", label: "Other" },
              ]}
            />
            <Field label="Subcategory" name="subcategory" defaultValue={plant.subcategory} placeholder="e.g. brassica, allium" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={plant.description ?? ""}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>
          <PhotoUpload name="photo_url" defaultValue={plant.photo_url} folder="plants" label="Photo" />
        </div>

        {/* Sowing calendar */}
        <SectionTitle>Sowing & planting calendar (Kildare)</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Sow indoors — from" name="sow_indoors_start" defaultValue={plant.sow_indoors_start?.toString()} options={MONTHS} placeholder="—" />
          <Select label="Sow indoors — to" name="sow_indoors_end" defaultValue={plant.sow_indoors_end?.toString()} options={MONTHS} placeholder="—" />
          <Select label="Sow outdoors — from" name="sow_outdoors_start" defaultValue={plant.sow_outdoors_start?.toString()} options={MONTHS} placeholder="—" />
          <Select label="Sow outdoors — to" name="sow_outdoors_end" defaultValue={plant.sow_outdoors_end?.toString()} options={MONTHS} placeholder="—" />
          <Select label="Plant out — from" name="transplant_start" defaultValue={plant.transplant_start?.toString()} options={MONTHS} placeholder="—" />
          <Select label="Plant out — to" name="transplant_end" defaultValue={plant.transplant_end?.toString()} options={MONTHS} placeholder="—" />
          <Select label="Harvest — from" name="harvest_start" defaultValue={plant.harvest_start?.toString()} options={MONTHS} placeholder="—" />
          <Select label="Harvest — to" name="harvest_end" defaultValue={plant.harvest_end?.toString()} options={MONTHS} placeholder="—" />
        </div>

        {/* Spacing & growing */}
        <SectionTitle>Spacing & indoor growing</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="Plant spacing (cm)" name="spacing_cm" type="number" defaultValue={plant.spacing_cm} />
          <Field label="Row spacing (cm)" name="row_spacing_cm" type="number" defaultValue={plant.row_spacing_cm} />
          <Field label="Sowing depth (cm)" name="sowing_depth_cm" type="number" defaultValue={plant.sowing_depth_cm} />
          <Field label="Weeks indoors (min)" name="weeks_indoors_min" type="number" defaultValue={plant.weeks_indoors_min} />
          <Field label="Weeks indoors (max)" name="weeks_indoors_max" type="number" defaultValue={plant.weeks_indoors_max} />
        </div>

        {/* Conditions */}
        <SectionTitle>Growing conditions</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Sun requirement"
            name="sun_requirement"
            defaultValue={plant.sun_requirement}
            placeholder="— select —"
            options={[
              { value: "full_sun", label: "Full sun" },
              { value: "partial_shade", label: "Partial shade" },
              { value: "full_shade", label: "Full shade" },
            ]}
          />
          <Select
            label="Water needs"
            name="water_needs"
            defaultValue={plant.water_needs}
            placeholder="— select —"
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
          />
          <Select
            label="Slug risk"
            name="slug_risk"
            defaultValue={plant.slug_risk}
            placeholder="— select —"
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
          />
          <Field label="Soil preference" name="soil_preference" defaultValue={plant.soil_preference} placeholder="e.g. well-drained loam" />
        </div>
        <div className="flex flex-wrap gap-4">
          <Checkbox label="Frost tolerant" name="frost_tolerant" defaultChecked={plant.frost_tolerant} />
          <Checkbox label="Frost tender" name="frost_tender" defaultChecked={plant.frost_tender} />
          <Checkbox label="Perennial" name="is_perennial" defaultChecked={plant.is_perennial} />
          <Checkbox label="Succession sow" name="succession_sow" defaultChecked={plant.succession_sow} />
        </div>
        {plant.succession_sow && (
          <Field label="Succession interval (weeks)" name="succession_interval_weeks" type="number" defaultValue={plant.succession_interval_weeks} />
        )}

        {/* Companions & pests */}
        <SectionTitle>Companions & pests</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Companion plants" name="companion_plants" defaultValue={plant.companion_plants?.join(", ")} placeholder="comma-separated" hint="e.g. basil, marigold" />
          <Field label="Avoid near" name="avoid_near" defaultValue={plant.avoid_near?.join(", ")} placeholder="comma-separated" />
          <Field label="Common pests" name="common_pests" defaultValue={plant.common_pests?.join(", ")} placeholder="comma-separated" />
          <Field label="Common diseases" name="common_diseases" defaultValue={plant.common_diseases?.join(", ")} placeholder="comma-separated" />
        </div>

        {/* Notes */}
        <SectionTitle>Notes & tips</SectionTitle>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={plant.notes ?? ""}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Growing tips</label>
            <textarea
              name="growing_tips"
              rows={3}
              defaultValue={plant.growing_tips ?? ""}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit">Save changes</Button>
          <Button variant="outline" asChild>
            <Link href={`/plants/${plant.id}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
