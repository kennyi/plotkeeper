"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GardenBed, Plant, JournalEntry } from "@/types";

const ENTRY_TYPES: { value: NonNullable<JournalEntry["entry_type"]>; label: string }[] = [
  { value: "harvest", label: "Harvest" },
  { value: "observation", label: "Observation" },
  { value: "problem", label: "Problem / pest" },
  { value: "note", label: "General note" },
  { value: "weather", label: "Weather" },
  { value: "purchase", label: "Purchase" },
];

const QUANTITY_UNITS = ["kg", "g", "items", "bunches", "heads", "bags", "jars"];

interface EntryFormProps {
  beds: Pick<GardenBed, "id" | "name">[];
  plants: Pick<Plant, "id" | "name">[];
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

function SelectField({ name, children, defaultValue }: { name: string; children: React.ReactNode; defaultValue?: string }) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {children}
    </select>
  );
}

export function EntryForm({ beds, plants, action }: EntryFormProps) {
  const router = useRouter();
  const [entryType, setEntryType] = useState<string>("note");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="space-y-5">
      {/* Date */}
      <Field label="Date">
        <Input name="entry_date" type="date" defaultValue={today} required />
      </Field>

      {/* Type — pill buttons only */}
      <div>
        <label className="text-sm font-medium block mb-2">Type</label>
        <div className="flex flex-wrap gap-2">
          {ENTRY_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setEntryType(t.value)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                entryType === t.value
                  ? "bg-foreground text-background border-foreground"
                  : "border-input text-muted-foreground hover:border-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hidden entry_type driven by pill selection */}
      <input type="hidden" name="entry_type" value={entryType} />

      {/* Title */}
      <Field label="Title (optional)">
        <Input name="title" placeholder="e.g. First courgette harvest" />
      </Field>

      {/* Bed + Plant */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Bed (optional)">
          <SelectField name="bed_id">
            <option value="">— none —</option>
            {beds.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </SelectField>
        </Field>
        <Field label="Plant (optional)">
          <SelectField name="plant_id">
            <option value="">— none —</option>
            {plants.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </SelectField>
        </Field>
      </div>

      {/* Notes */}
      <Field label="Notes">
        <textarea
          name="notes"
          rows={3}
          placeholder="What did you observe, do, or record?"
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      </Field>

      {/* Observation-specific: pests/issues */}
      {entryType === "observation" && (
        <Field label="Pests / issues observed (optional)">
          <Input name="symptoms" placeholder="e.g. Aphids on underside of leaves, slug damage" />
        </Field>
      )}

      {/* Harvest-specific */}
      {entryType === "harvest" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Quantity">
            <Input name="quantity_value" type="number" step="0.01" min="0" placeholder="e.g. 1.5" />
          </Field>
          <Field label="Unit">
            <SelectField name="quantity_unit" defaultValue="kg">
              {QUANTITY_UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </SelectField>
          </Field>
        </div>
      )}

      {/* Problem-specific */}
      {entryType === "problem" && (
        <div className="space-y-3">
          <Field label="Symptoms">
            <Input name="symptoms" placeholder="e.g. Yellow leaves, white spots" />
          </Field>
          <Field label="Diagnosis">
            <Input name="diagnosis" placeholder="e.g. Powdery mildew" />
          </Field>
          <Field label="Treatment">
            <Input name="treatment" placeholder="e.g. Removed affected leaves, sprayed with…" />
          </Field>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit">Save entry</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
