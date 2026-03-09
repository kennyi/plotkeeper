"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { PlantHealthBadge } from "@/components/beds/PlantHealthBadge";
import {
  updatePlantingStatusAction,
  deletePlantingAction,
  updatePlantingPhotoAction,
  updatePlantingAction,
} from "@/app/actions/plantings";
import { logHealthAction } from "@/app/actions/health";
import { toast } from "sonner";
import type { BedPlanting, HealthStatus } from "@/types";

type Status = BedPlanting["status"];

const STATUS_CLASSES: Record<Status, string> = {
  planned:       "bg-slate-100 text-slate-700",
  seeds_started: "bg-blue-100 text-blue-700",
  germinating:   "bg-teal-100 text-teal-700",
  growing:       "bg-green-100 text-green-700",
  ready:         "bg-emerald-100 text-emerald-800",
  harvested:     "bg-amber-100 text-amber-700",
  finished:      "bg-gray-100 text-gray-500",
  failed:        "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<Status, string> = {
  planned:       "Planned",
  seeds_started: "Seeds Started",
  germinating:   "Germinating",
  growing:       "Growing",
  ready:         "Ready to Harvest",
  harvested:     "Harvested",
  finished:      "Finished",
  failed:        "Failed",
};

const HEALTH_OPTIONS: { value: HealthStatus; label: string }[] = [
  { value: "thriving",   label: "Thriving — looking great" },
  { value: "healthy",    label: "Healthy — no concerns" },
  { value: "ok",         label: "OK — fine but not flourishing" },
  { value: "struggling", label: "Struggling — visible stress" },
  { value: "critical",   label: "Critical — needs immediate attention" },
  { value: "dormant",    label: "Dormant — expected, not a problem" },
];

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-IE", { day: "numeric", month: "short" });
}

interface PlantingCardProps {
  planting: BedPlanting;
  bedId: string;
}

export function PlantingCard({ planting, bedId }: PlantingCardProps) {
  const plantName = planting.plant?.name ?? planting.custom_plant_name ?? "Unknown plant";
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Plant link with back-navigation context
  const plantHref = planting.plant_id
    ? `/plants/${planting.plant_id}?from=/beds/${bedId}`
    : null;

  const dates = [
    planting.seeds_started_date   && `Sown indoors ${formatDate(planting.seeds_started_date)}`,
    planting.sown_outdoors_date   && `Sown outdoors ${formatDate(planting.sown_outdoors_date)}`,
    planting.planted_out_date     && `Planted out ${formatDate(planting.planted_out_date)}`,
    planting.expected_harvest_date && `Harvest from ${formatDate(planting.expected_harvest_date)}`,
  ].filter(Boolean);

  const isActive = planting.status !== "finished" && planting.status !== "failed";
  const isVegetable =
    planting.plant?.category === "vegetable" ||
    planting.plant?.category === "fruit" ||
    planting.plant?.category === "herb";

  function handleLogHealth(formData: FormData) {
    startTransition(async () => {
      await logHealthAction(bedId, planting.id, formData);
      setShowHealthForm(false);
      toast.success("Health logged");
    });
  }

  function handleEditPlanting(formData: FormData) {
    startTransition(async () => {
      await updatePlantingAction(bedId, planting.id, formData);
      setShowEdit(false);
      toast.success("Planting updated");
    });
  }

  function handleSavePhoto() {
    const input = document.querySelector<HTMLInputElement>(
      `input[name="planting_photo_${planting.id}"]`
    );
    const url = input?.value ?? "";
    if (!url) return;
    startTransition(async () => {
      await updatePlantingPhotoAction(bedId, planting.id, url);
      setShowPhotoUpload(false);
      toast.success("Photo saved");
    });
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Photo if uploaded */}
      {planting.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={planting.photo_url}
          alt={plantName}
          className="w-full h-48 object-cover object-center"
        />
      )}

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {plantHref ? (
              <Link href={plantHref} className="font-medium hover:underline">
                {plantName}
              </Link>
            ) : (
              <span className="font-medium">{plantName}</span>
            )}
            {planting.row_label && (
              <span className="text-sm text-muted-foreground ml-2">· {planting.row_label}</span>
            )}
            {planting.quantity && (
              <span className="text-sm text-muted-foreground ml-2">· {planting.quantity} plants</span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CLASSES[planting.status]}`}>
              {STATUS_LABELS[planting.status]}
            </span>
            {planting.current_health && (
              <PlantHealthBadge status={planting.current_health} />
            )}
          </div>
        </div>

        {/* Dates */}
        {dates.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {dates.map((d) => <span key={d}>{d}</span>)}
          </div>
        )}

        {/* Notes */}
        {planting.notes && (
          <p className="text-sm text-muted-foreground">{planting.notes}</p>
        )}

        {/* Action row */}
        {isActive && (
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-xs h-7"
              onClick={() => { setShowEdit((v) => !v); setShowHealthForm(false); setShowPhotoUpload(false); }}
            >
              {showEdit ? "Cancel" : "Edit"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-xs h-7"
              onClick={() => { setShowHealthForm((v) => !v); setShowPhotoUpload(false); setShowEdit(false); }}
            >
              {showHealthForm ? "Cancel" : "Log health"}
            </Button>

            {isVegetable && (
              <Button asChild size="sm" variant="outline" className="text-xs h-7">
                <Link href={`/journal/new?type=harvest&bed_id=${bedId}&planting_id=${planting.id}`}>
                  Log harvest
                </Link>
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-xs h-7 text-muted-foreground"
              onClick={() => { setShowPhotoUpload((v) => !v); setShowHealthForm(false); setShowEdit(false); }}
            >
              {showPhotoUpload ? "Cancel" : planting.photo_url ? "Edit photo" : "+ Photo"}
            </Button>

            <form action={async () => { await deletePlantingAction(bedId, planting.id); }}>
              <Button type="submit" size="sm" variant="ghost" className="text-xs h-7 text-muted-foreground">
                Remove
              </Button>
            </form>
          </div>
        )}

        {/* Edit planting inline form */}
        {showEdit && (
          <form action={handleEditPlanting} className="mt-2 p-3 rounded-lg bg-muted/40 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Edit planting</p>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Status</label>
              <select
                name="status"
                defaultValue={planting.status}
                className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {(["planned","seeds_started","germinating","growing","ready","harvested","finished","failed"] as const).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Label / row</label>
                <input
                  type="text"
                  name="row_label"
                  defaultValue={planting.row_label ?? ""}
                  placeholder="e.g. Row A"
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  defaultValue={planting.quantity ?? ""}
                  min="0"
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Seeds started</label>
                <input type="date" lang="en-IE" name="seeds_started_date"
                  defaultValue={planting.seeds_started_date?.slice(0, 10) ?? ""}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Planted out</label>
                <input type="date" lang="en-IE" name="planted_out_date"
                  defaultValue={planting.planted_out_date?.slice(0, 10) ?? ""}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Sown outdoors</label>
                <input type="date" lang="en-IE" name="sown_outdoors_date"
                  defaultValue={planting.sown_outdoors_date?.slice(0, 10) ?? ""}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Expected harvest</label>
                <input type="date" lang="en-IE" name="expected_harvest_date"
                  defaultValue={planting.expected_harvest_date?.slice(0, 10) ?? ""}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Notes</label>
              <textarea
                name="notes"
                rows={2}
                defaultValue={planting.notes ?? ""}
                placeholder="Any notes…"
                className="flex w-full rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            <Button type="submit" size="sm" className="text-xs h-7" disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </form>
        )}

        {/* Health log inline form */}
        {showHealthForm && (
          <form action={handleLogHealth} className="mt-2 p-3 rounded-lg bg-muted/40 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Log health</p>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Status</label>
              <select
                name="health_status"
                required
                className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">— select —</option>
                {HEALTH_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Notes (optional)</label>
              <textarea
                name="notes"
                rows={2}
                placeholder="What did you observe?"
                className="flex w-full rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Date</label>
              <input
                type="date"
                lang="en-IE"
                name="logged_at"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <Button type="submit" size="sm" className="text-xs h-7" disabled={isPending}>
              {isPending ? "Saving…" : "Save log"}
            </Button>
          </form>
        )}

        {/* Photo upload inline */}
        {showPhotoUpload && (
          <div className="mt-2 space-y-2">
            <PhotoUpload
              name={`planting_photo_${planting.id}`}
              folder="plantings"
              label="Planting photo"
              defaultValue={planting.photo_url ?? null}
            />
            <Button
              type="button"
              size="sm"
              className="text-xs h-7"
              disabled={isPending}
              onClick={handleSavePhoto}
            >
              {isPending ? "Saving…" : "Save photo"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
