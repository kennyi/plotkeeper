import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { SavedToast } from "@/components/ui/SavedToast";
import { getBed, getBedPlantings, getBedPhotos } from "@/lib/supabase";
import { deleteBedAction } from "@/app/actions/beds";
import { PlantingCard } from "@/components/beds/PlantingCard";
import { BedGridView } from "@/components/beds/BedGridView";
import { BedPhotoAvatar } from "@/components/photos/BedPhotoAvatar";
import type { GardenBed, BedPlanting } from "@/types";

// Crop history grouped by year
function CropHistory({ plantings }: { plantings: BedPlanting[] }) {
  if (plantings.length === 0) return null;

  const byYear = new Map<number, BedPlanting[]>();
  for (const p of plantings) {
    const y = p.growing_year ?? new Date(p.created_at).getFullYear();
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(p);
  }
  const years = Array.from(byYear.keys()).sort((a, b) => b - a);

  return (
    <div className="border-t pt-6 mt-6">
      <h2 className="text-lg font-semibold mb-4">Crop history</h2>
      <div className="space-y-6">
        {years.map((year) => (
          <div key={year}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">{year}</h3>
            <div>
              {byYear.get(year)!.map((p) => (
                <div key={p.id} className="flex items-center gap-3 text-sm py-2 border-b last:border-b-0">
                  <span className="flex-1 text-muted-foreground">
                    {p.plant?.name ?? p.custom_plant_name ?? "Unknown"}
                    {p.row_label && <span className="ml-1.5 text-xs">· {p.row_label}</span>}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    p.status === "failed" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                  }`}>
                    {p.status === "failed" ? "Failed" : "Harvested"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const BED_TYPE_LABELS: Record<GardenBed["bed_type"], string> = {
  raised_bed:      "Raised Bed",
  ground_bed:      "Ground Bed",
  pot:             "Pot",
  planter:         "Planter",
  greenhouse_bed:  "Greenhouse Bed",
  window_box:      "Window Box",
  grow_bag:        "Grow Bag",
};

const SUN_LABELS: Record<NonNullable<GardenBed["sun_exposure"]>, string> = {
  full_sun:      "Full Sun",
  partial_shade: "Partial Shade",
  full_shade:    "Full Shade",
  variable:      "Variable",
};

const WIND_LABELS: Record<NonNullable<GardenBed["wind_exposure"]>, string> = {
  sheltered: "Sheltered",
  moderate:  "Moderate",
  exposed:   "Exposed",
};

interface BedDetailPageProps {
  params: { id: string };
}

export default async function BedDetailPage({ params }: BedDetailPageProps) {
  const [bed, plantings, bedPhotos] = await Promise.all([
    getBed(params.id).catch(() => null),
    getBedPlantings(params.id).catch(() => []),
    getBedPhotos(params.id).catch(() => []),
  ]);

  if (!bed) notFound();

  const activePlantings = plantings.filter(
    (p) => p.status !== "finished" && p.status !== "failed"
  );
  const pastPlantings = plantings.filter(
    (p) => p.status === "finished" || p.status === "failed"
  );

  const deleteBed = deleteBedAction.bind(null, params.id);

  return (
    <div>
      <Suspense><SavedToast message="Bed saved" /></Suspense>

      {/* Photo avatar — circular profile photo with gallery */}
      <BedPhotoAvatar initialPhotos={bedPhotos} bedId={params.id} />

      <Header
        title={bed.name}
        description={BED_TYPE_LABELS[bed.bed_type]}
        action={
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/beds/${bed.id}/edit`}>Edit</Link>
            </Button>
            <form action={deleteBed}>
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
              >
                Delete
              </Button>
            </form>
          </div>
        }
      />

      {/* Bed details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 max-w-2xl">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Details</h2>
          <dl className="space-y-2 text-sm">
            {(bed.length_m || bed.width_m) && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Dimensions</dt>
                <dd>
                  {[bed.length_m && `${bed.length_m}m`, bed.width_m && `${bed.width_m}m`]
                    .filter(Boolean)
                    .join(" × ")}
                  {bed.depth_m && ` × ${bed.depth_m}m deep`}
                </dd>
              </div>
            )}
            {bed.sun_exposure && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sun</dt>
                <dd>{SUN_LABELS[bed.sun_exposure]}</dd>
              </div>
            )}
            {bed.wind_exposure && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Wind</dt>
                <dd>{WIND_LABELS[bed.wind_exposure]}</dd>
              </div>
            )}
            {bed.soil_type && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Soil</dt>
                <dd>{bed.soil_type}</dd>
              </div>
            )}
            {bed.location_label && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Location</dt>
                <dd>{bed.location_label}</dd>
              </div>
            )}
            {bed.section && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Section</dt>
                <dd>{bed.section}</dd>
              </div>
            )}
          </dl>
        </div>

        {bed.notes && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Notes</h2>
            <p className="text-sm">{bed.notes}</p>
          </div>
        )}
      </div>

      {/* ── Visual planting grid ── */}
      <BedGridView
        bed={bed}
        plantings={activePlantings}
      />

      {/* ── Active plantings list ── */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Plantings{activePlantings.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-1">
                ({activePlantings.length})
              </span>
            )}
          </h2>
          <Button asChild size="sm">
            <Link href={`/beds/${params.id}/plantings/new`}>Add planting</Link>
          </Button>
        </div>

        {activePlantings.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No active plantings. Tap a slot above or add one manually.
          </p>
        ) : (
          <div className="space-y-3">
            {activePlantings.map((p) => (
              <div key={p.id} id={`planting-${p.id}`} className="rounded-lg transition-all duration-300">
                <PlantingCard planting={p} bedId={params.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crop history grouped by year */}
      <CropHistory plantings={pastPlantings} />
    </div>
  );
}
