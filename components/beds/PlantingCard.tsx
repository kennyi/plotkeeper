"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updatePlantingStatusAction, deletePlantingAction } from "@/app/actions/plantings";
import type { BedPlanting } from "@/types";

type Status = BedPlanting["status"];

const STATUS_LABELS: Record<Status, string> = {
  planned: "Planned",
  seeds_started: "Seeds Started",
  germinating: "Germinating",
  growing: "Growing",
  ready: "Ready to Harvest",
  harvested: "Harvested",
  finished: "Finished",
  failed: "Failed",
};

const STATUS_COLORS: Record<Status, string> = {
  planned: "secondary",
  seeds_started: "secondary",
  germinating: "secondary",
  growing: "secondary",
  ready: "secondary",
  harvested: "secondary",
  finished: "secondary",
  failed: "destructive",
};

const STATUS_CLASSES: Record<Status, string> = {
  planned: "bg-slate-100 text-slate-700",
  seeds_started: "bg-blue-100 text-blue-700",
  germinating: "bg-teal-100 text-teal-700",
  growing: "bg-green-100 text-green-700",
  ready: "bg-emerald-100 text-emerald-800",
  harvested: "bg-amber-100 text-amber-700",
  finished: "bg-gray-100 text-gray-500",
  failed: "bg-red-100 text-red-700",
};

const NEXT_STATUS: Partial<Record<Status, { status: Status; label: string }>> = {
  planned: { status: "seeds_started", label: "Seeds started" },
  seeds_started: { status: "germinating", label: "Germinating" },
  germinating: { status: "growing", label: "Growing" },
  growing: { status: "ready", label: "Ready to harvest" },
  ready: { status: "harvested", label: "Harvested" },
  harvested: { status: "finished", label: "Finished" },
};

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
  const next = NEXT_STATUS[planting.status];

  const advanceStatus = async () => {
    if (!next) return;
    await updatePlantingStatusAction(bedId, planting.id, next.status);
  };

  const markFailed = async () => {
    await updatePlantingStatusAction(bedId, planting.id, "failed");
  };

  const remove = async () => {
    await deletePlantingAction(bedId, planting.id);
  };

  const dates = [
    planting.seeds_started_date && `Sown indoors ${formatDate(planting.seeds_started_date)}`,
    planting.sown_outdoors_date && `Sown outdoors ${formatDate(planting.sown_outdoors_date)}`,
    planting.planted_out_date && `Planted out ${formatDate(planting.planted_out_date)}`,
    planting.expected_harvest_date && `Harvest from ${formatDate(planting.expected_harvest_date)}`,
  ].filter(Boolean);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          {planting.plant_id ? (
            <Link
              href={`/plants/${planting.plant_id}`}
              className="font-medium hover:underline"
            >
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
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_CLASSES[planting.status]}`}
        >
          {STATUS_LABELS[planting.status]}
        </span>
      </div>

      {/* Dates */}
      {dates.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {dates.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      )}

      {/* Notes */}
      {planting.notes && (
        <p className="text-sm text-muted-foreground">{planting.notes}</p>
      )}

      {/* Actions */}
      {planting.status !== "finished" && planting.status !== "failed" && (
        <div className="flex flex-wrap gap-2 pt-1">
          {next && (
            <form action={advanceStatus}>
              <Button type="submit" size="sm" variant="outline" className="text-xs h-7">
                Mark: {next.label}
              </Button>
            </form>
          )}
          <form action={markFailed}>
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="text-xs h-7 text-destructive hover:text-destructive"
            >
              Mark failed
            </Button>
          </form>
          <form action={remove}>
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="text-xs h-7 text-muted-foreground"
            >
              Remove
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
