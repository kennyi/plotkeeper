"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlantHealthBadge } from "@/components/beds/PlantHealthBadge";
import {
  updatePlantingStatusAction,
  deletePlantingAndRedirectAction,
} from "@/app/actions/plantings";
import { logHealthAction } from "@/app/actions/health";
import { toast } from "sonner";
import type { BedPlanting, HealthStatus, PlantingHealthLog } from "@/types";

type Status = BedPlanting["status"];

const STATUS_FLOW: Status[] = [
  "planned",
  "seeds_started",
  "germinating",
  "growing",
  "ready",
  "harvested",
];

const STATUS_LABELS: Record<Status, string> = {
  planned:       "Planned",
  seeds_started: "Seeds Started",
  germinating:   "Germinating",
  growing:       "Growing",
  ready:         "Ready",
  harvested:     "Harvested",
  finished:      "Finished",
  failed:        "Failed",
};

const STATUS_COLORS: Record<Status, string> = {
  planned:       "bg-slate-100 text-slate-700 border-slate-200",
  seeds_started: "bg-blue-100 text-blue-700 border-blue-200",
  germinating:   "bg-teal-100 text-teal-700 border-teal-200",
  growing:       "bg-green-100 text-green-700 border-green-200",
  ready:         "bg-emerald-100 text-emerald-800 border-emerald-200",
  harvested:     "bg-amber-100 text-amber-700 border-amber-200",
  finished:      "bg-gray-100 text-gray-500 border-gray-200",
  failed:        "bg-red-100 text-red-600 border-red-200",
};

const HEALTH_OPTIONS: { value: HealthStatus; label: string; color: string }[] = [
  { value: "thriving",   label: "Thriving",   color: "bg-emerald-500" },
  { value: "healthy",    label: "Healthy",    color: "bg-green-500" },
  { value: "ok",         label: "OK",         color: "bg-lime-500" },
  { value: "struggling", label: "Struggling", color: "bg-amber-500" },
  { value: "critical",   label: "Critical",   color: "bg-red-500" },
  { value: "dormant",    label: "Dormant",    color: "bg-stone-400" },
];

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface PlantingDetailClientProps {
  planting: BedPlanting;
  bedId: string;
  plantingId: string;
  healthLogs: PlantingHealthLog[];
  from: string;
}

export function PlantingDetailClient({
  planting,
  bedId,
  plantingId,
  healthLogs,
  from,
}: PlantingDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [selectedHealth, setSelectedHealth] = useState<HealthStatus | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentStatusIndex = STATUS_FLOW.indexOf(planting.status);
  const isEdgeStatus = planting.status === "finished" || planting.status === "failed";

  function handleStatusChange(status: Status) {
    startTransition(async () => {
      await updatePlantingStatusAction(bedId, plantingId, status);
      toast.success(`Marked as ${STATUS_LABELS[status]}`);
      router.refresh();
    });
  }

  function handleLogHealth(formData: FormData) {
    if (!selectedHealth) return;
    formData.set("health_status", selectedHealth);
    startTransition(async () => {
      await logHealthAction(bedId, plantingId, formData);
      setShowHealthForm(false);
      setSelectedHealth(null);
      toast.success("Health logged");
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deletePlantingAndRedirectAction(plantingId, bedId, from);
    });
  }

  return (
    <div className="space-y-8">
      {/* ── Status stepper ──────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Status
        </h2>
        {isEdgeStatus ? (
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${STATUS_COLORS[planting.status]}`}>
            {STATUS_LABELS[planting.status]}
          </span>
        ) : (
          <div className="flex overflow-x-auto gap-1 pb-1">
            {STATUS_FLOW.map((s, i) => {
              const isCurrent = s === planting.status;
              const isPast = i < currentStatusIndex;
              return (
                <button
                  key={s}
                  onClick={() => !isCurrent && handleStatusChange(s)}
                  disabled={isPending || isCurrent}
                  className={[
                    "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    isCurrent
                      ? `${STATUS_COLORS[s]} cursor-default`
                      : isPast
                      ? "bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200"
                      : "bg-white text-stone-500 border-stone-200 hover:border-garden-400 hover:text-garden-700",
                  ].join(" ")}
                >
                  {isCurrent && <span className="mr-1">●</span>}
                  {STATUS_LABELS[s]}
                </button>
              );
            })}
            <button
              onClick={() => handleStatusChange("failed")}
              disabled={isPending}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-stone-200 text-stone-400 hover:border-red-300 hover:text-red-600 transition-colors"
            >
              Mark failed
            </button>
          </div>
        )}
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Actions
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowHealthForm((v) => !v)}
          >
            {showHealthForm ? "Cancel" : "Log health"}
          </Button>

          <Button asChild size="sm" variant="outline">
            <a href={`/journal/new?type=harvest&bed_id=${bedId}&plant_id=${planting.plant_id ?? ""}`}>
              Log harvest
            </a>
          </Button>

          <Button asChild size="sm" variant="outline">
            <a href={`/journal/new?type=observation&bed_id=${bedId}&plant_id=${planting.plant_id ?? ""}`}>
              Add observation
            </a>
          </Button>
        </div>

        {/* Health log inline form */}
        {showHealthForm && (
          <form action={handleLogHealth} className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-4">
            <p className="text-sm font-semibold">How is it looking?</p>

            <div className="flex flex-wrap gap-2">
              {HEALTH_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setSelectedHealth(o.value)}
                  className={[
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-colors",
                    selectedHealth === o.value
                      ? "bg-stone-800 text-white border-stone-800"
                      : "border-stone-300 text-stone-600 hover:border-stone-500",
                  ].join(" ")}
                >
                  <span className={`w-2 h-2 rounded-full ${o.color}`} />
                  {o.label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Notes (optional)</label>
              <textarea
                name="notes"
                rows={2}
                placeholder="What did you observe?"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                lang="en-IE"
                name="logged_at"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={!selectedHealth || isPending}
            >
              {isPending ? "Saving…" : "Save health log"}
            </Button>
          </form>
        )}
      </div>

      {/* ── Health timeline ──────────────────────────────────────────────── */}
      {healthLogs.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Health history
          </h2>
          <div className="space-y-3">
            {healthLogs.map((log) => (
              <div key={log.id} className="flex gap-3 text-sm">
                <div className="shrink-0 pt-0.5">
                  <PlantHealthBadge status={log.health_status} />
                </div>
                <div className="flex-1 min-w-0">
                  {log.notes && (
                    <p className="text-stone-700">{log.notes}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(log.logged_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Delete zone ──────────────────────────────────────────────────── */}
      <div className="border-t pt-6 mt-8">
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm text-muted-foreground hover:text-red-600 transition-colors"
          >
            Remove this planting…
          </button>
        ) : (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
            <p className="text-sm font-medium text-red-800">
              Remove this planting?
            </p>
            <p className="text-xs text-red-700">
              This can&apos;t be undone. The planting record and its health logs will be deleted.
            </p>
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Keep it
              </Button>
              <Button
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700 text-white border-0"
              >
                {isPending ? "Removing…" : "Yes, remove"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
