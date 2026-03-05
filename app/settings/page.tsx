import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SavedToast } from "@/components/ui/SavedToast";
import { getSettings } from "@/lib/supabase";
import { saveSettingsAction } from "@/app/actions/settings";

function Field({
  label,
  name,
  value,
  placeholder,
  hint,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  hint?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={value}
        placeholder={placeholder}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const HARDINESS_ZONES = [
  "H1a", "H1b", "H1c", "H2", "H3", "H4", "H5", "H6", "H7",
];

export default async function SettingsPage() {
  const settings = await getSettings().catch(() => ({} as Record<string, string>));
  const s = (key: string) => settings[key] ?? "";

  return (
    <div>
      <Suspense><SavedToast message="Settings saved" /></Suspense>
      <Header title="Settings" description="Garden profile and app configuration" />

      <form action={saveSettingsAction} className="max-w-xl space-y-8">
        {/* Garden identity */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Garden profile
          </h2>
          <Field
            label="Garden name"
            name="garden_name"
            value={s("garden_name")}
            placeholder="e.g. The Kildare Plot"
          />
          <Field
            label="Your name"
            name="owner_name"
            value={s("owner_name")}
            placeholder="e.g. Ian"
          />
          <Field
            label="Location"
            name="location_name"
            value={s("location_name") || s("location")}
            placeholder="e.g. Kildare, Ireland"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Latitude"
              name="latitude"
              value={s("latitude")}
              placeholder="53.1588"
              hint="Used for live weather — leave blank for Kildare default"
              type="number"
            />
            <Field
              label="Longitude"
              name="longitude"
              value={s("longitude")}
              placeholder="-6.9087"
              type="number"
            />
          </div>
        </section>

        {/* Climate — just hardiness zone, frost dates are auto from weather API */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Climate
          </h2>
          <div className="space-y-1.5">
            <label htmlFor="hardiness_zone" className="text-sm font-medium">
              Hardiness zone (RHS)
            </label>
            <select
              id="hardiness_zone"
              name="hardiness_zone"
              defaultValue={s("hardiness_zone") || "H4"}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {HARDINESS_ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                  {z === "H4" ? " — most of Ireland" : ""}
                  {z === "H5" ? " — mild coastal areas" : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Frost risk dates are shown on the dashboard via the live weather feed.
            </p>
          </div>
        </section>

        {/* Notes */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Garden notes
          </h2>
          <div className="space-y-1.5">
            <label htmlFor="notes" className="text-sm font-medium">Notes</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={s("notes")}
              placeholder="Soil type, microclimate, anything worth remembering…"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>
        </section>

        <Button type="submit">Save settings</Button>
      </form>
    </div>
  );
}
