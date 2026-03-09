import Link from "next/link";
import { PlantHealthBadge } from "@/components/beds/PlantHealthBadge";
import { PLANTING_STATUS_LABELS, PLANTING_STATUS_CLASSES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { BedPlanting } from "@/types";

interface PlantingCardProps {
  planting: BedPlanting;
  bedId: string;
}

export function PlantingCard({ planting, bedId }: PlantingCardProps) {
  const plantName = planting.plant?.name ?? planting.custom_plant_name ?? "Unknown plant";

  const dates = [
    planting.seeds_started_date    && `Sown indoors ${formatDate(planting.seeds_started_date, false)}`,
    planting.sown_outdoors_date    && `Sown outdoors ${formatDate(planting.sown_outdoors_date, false)}`,
    planting.planted_out_date      && `Planted out ${formatDate(planting.planted_out_date, false)}`,
    planting.expected_harvest_date && `Harvest from ${formatDate(planting.expected_harvest_date, false)}`,
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
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PLANTING_STATUS_CLASSES[planting.status]}`}>
              {PLANTING_STATUS_LABELS[planting.status]}
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
