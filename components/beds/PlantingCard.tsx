import Link from "next/link";
import { PlantHealthBadge } from "@/components/beds/PlantHealthBadge";
import type { BedPlanting } from "@/types";

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

  const dates = [
    planting.seeds_started_date    && `Sown indoors ${formatDate(planting.seeds_started_date)}`,
    planting.sown_outdoors_date    && `Sown outdoors ${formatDate(planting.sown_outdoors_date)}`,
    planting.planted_out_date      && `Planted out ${formatDate(planting.planted_out_date)}`,
    planting.expected_harvest_date && `Harvest from ${formatDate(planting.expected_harvest_date)}`,
  ].filter(Boolean);

  return (
    <Link
      href={`/plantings/${planting.id}?from=${encodeURIComponent(`/beds/${bedId}`)}`}
      className="block border rounded-lg overflow-hidden hover:bg-stone-50 transition-colors"
    >
      {planting.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={planting.photo_url}
          alt={plantName}
          className="w-full h-32 object-cover object-center"
        />
      )}

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="font-medium">{plantName}</span>
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

        {dates.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {dates.map((d) => <span key={d}>{d}</span>)}
          </div>
        )}

        {planting.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">{planting.notes}</p>
        )}
      </div>
    </Link>
  );
}
