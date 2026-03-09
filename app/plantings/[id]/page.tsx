import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PlantTopDownIcon } from "@/components/beds/PlantTopDownIcon";
import { PlantHealthBadge } from "@/components/beds/PlantHealthBadge";
import { PlantingDetailClient } from "@/components/beds/PlantingDetailClient";
import { PlantLibraryInfo } from "@/components/plants/PlantLibraryInfo";
import { PlantingPhotoGallery } from "@/components/photos/PlantingPhotoGallery";
import { getPlanting, getHealthLogs, getPlantingPhotos } from "@/lib/supabase";
import { MONTH_NAMES, PLANTING_STATUS_LABELS, PLANTING_STATUS_CLASSES } from "@/lib/constants";
import { formatDate, categoryEmoji } from "@/lib/utils";
import type { Plant } from "@/types";
import type { PlantingStatus } from "@/lib/constants";

interface PageProps {
  params: { id: string };
  searchParams: { from?: string };
}

// ── Calculation helpers (mirrors AddPlantingWizard logic) ──────────────────

function calcGermination(plant: Plant, sowDate: string): string | null {
  if (!plant.germination_days_min) return null;
  const days =
    plant.germination_days_max && plant.germination_days_max !== plant.germination_days_min
      ? Math.round((plant.germination_days_min + plant.germination_days_max) / 2)
      : plant.germination_days_min;
  const d = new Date(sowDate + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
}

function calcHardenOffStart(plant: Plant, plantedOutDate: string): string | null {
  if (!plant.hardening_off_days) return null;
  const d = new Date(plantedOutDate + "T00:00:00");
  d.setDate(d.getDate() - plant.hardening_off_days);
  return d.toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
}

function harvestWindowText(plant: Plant): string | null {
  if (!plant.harvest_start) return null;
  if (!plant.harvest_end || plant.harvest_end === plant.harvest_start) {
    return MONTH_NAMES[plant.harvest_start - 1];
  }
  return `${MONTH_NAMES[plant.harvest_start - 1]} – ${MONTH_NAMES[plant.harvest_end - 1]}`;
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function PlantingDetailPage({ params, searchParams }: PageProps) {
  let planting;
  try {
    planting = await getPlanting(params.id);
  } catch {
    notFound();
  }

  if (!planting) notFound();

  const [healthLogs, plantingPhotos] = await Promise.all([
    getHealthLogs(params.id).catch(() => []),
    getPlantingPhotos(params.id).catch(() => []),
  ]);

  const plant = planting.plant;
  const bed = planting.bed;
  const plantName = plant?.name ?? planting.custom_plant_name ?? "Unknown plant";
  const bedName = bed?.name ?? "Unknown bed";
  const bedId = planting.bed_id;

  // Back navigation: use the ?from= param if provided and valid, else default to the bed page
  const rawFrom = searchParams.from;
  const from = rawFrom && rawFrom.startsWith("/") ? rawFrom : `/beds/${bedId}`;

  // Key dates
  const sowDate = formatDate(planting.seeds_started_date);
  const plantedOut = formatDate(planting.planted_out_date);
  const harvestFrom = formatDate(planting.expected_harvest_date);

  // Calculated milestones (only when plant data exists)
  const germination =
    plant && planting.seeds_started_date
      ? calcGermination(plant, planting.seeds_started_date)
      : null;
  const hardenOff =
    plant && planting.planted_out_date
      ? calcHardenOffStart(plant, planting.planted_out_date)
      : null;
  const harvestWindow = plant ? harvestWindowText(plant) : null;

  const hasMilestones = germination || hardenOff || harvestWindow;

  return (
    <div>
      <Link
        href={from}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        ← Back
      </Link>
      <Header
        title={plantName}
        description={
          <Link href={`/beds/${bedId}`} className="hover:underline text-muted-foreground">
            {bedName}
            {planting.row_number ? ` · Slot ${planting.row_number}` : ""}
          </Link>
        }
      />

      {/* Photo gallery hero — tappable, shows full gallery behind it */}
      <PlantingPhotoGallery
        initialPhotos={plantingPhotos}
        plantingId={params.id}
        currentStatus={planting.status}
        fallbackEmoji={categoryEmoji(plant?.category ?? "vegetable")}
      />

      {/* Plant icon + status badge row */}
      <div className="flex items-center gap-3 mb-6">
        <PlantTopDownIcon category={plant?.category ?? null} size={44} />
        <div className="space-y-1">
          <span className={`inline-flex items-center text-sm font-medium px-2.5 py-0.5 rounded-full ${PLANTING_STATUS_CLASSES[planting.status as PlantingStatus] ?? "bg-gray-100 text-gray-500"}`}>
            {PLANTING_STATUS_LABELS[planting.status as PlantingStatus] ?? planting.status}
          </span>
          {planting.current_health && (
            <div>
              <PlantHealthBadge status={planting.current_health} />
            </div>
          )}
        </div>
      </div>

      {/* Key info grid */}
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 mb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Details</p>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {planting.quantity && (
            <>
              <dt className="text-muted-foreground">Quantity</dt>
              <dd className="font-medium">{planting.quantity} plant{planting.quantity !== 1 ? "s" : ""}</dd>
            </>
          )}
          {sowDate && (
            <>
              <dt className="text-muted-foreground">Sown indoors</dt>
              <dd className="font-medium">{sowDate}</dd>
            </>
          )}
          {planting.sown_outdoors_date && (
            <>
              <dt className="text-muted-foreground">Sown outdoors</dt>
              <dd className="font-medium">{formatDate(planting.sown_outdoors_date)}</dd>
            </>
          )}
          {plantedOut && (
            <>
              <dt className="text-muted-foreground">Planted out</dt>
              <dd className="font-medium">{plantedOut}</dd>
            </>
          )}
          {harvestFrom && (
            <>
              <dt className="text-muted-foreground">Harvest from</dt>
              <dd className="font-medium">{harvestFrom}</dd>
            </>
          )}
          {planting.growing_year && (
            <>
              <dt className="text-muted-foreground">Year</dt>
              <dd className="font-medium">{planting.growing_year}</dd>
            </>
          )}
        </dl>
      </div>

      {/* Calculated milestones */}
      {hasMilestones && (
        <div className="rounded-xl border border-garden-200 bg-garden-50 p-4 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Milestones</p>
          <dl className="space-y-2 text-sm">
            {germination && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Expected germination</dt>
                <dd className="font-medium text-stone-800">{germination}</dd>
              </div>
            )}
            {hardenOff && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Start hardening off</dt>
                <dd className="font-medium text-stone-800">{hardenOff}</dd>
              </div>
            )}
            {harvestWindow && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Harvest window</dt>
                <dd className="font-medium text-stone-800">{harvestWindow}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Notes */}
      {planting.notes && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notes</p>
          <p className="text-sm text-stone-700">{planting.notes}</p>
        </div>
      )}

      {/* Interactive client section — status stepper, health log, history, delete */}
      <PlantingDetailClient
        planting={planting}
        bedId={bedId}
        plantingId={params.id}
        healthLogs={healthLogs}
        from={from}
      />

      {/* About This Plant — library reference info (library plants only) */}
      {plant && (
        <>
          <div className="border-t my-8" />
          <h2 className="text-base font-semibold mb-4">About {plant.name}</h2>
          <PlantLibraryInfo plant={plant} />
        </>
      )}
    </div>
  );
}
