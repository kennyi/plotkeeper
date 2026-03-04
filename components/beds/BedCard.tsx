import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GardenBed } from "@/types";

const BED_TYPE_LABELS: Record<GardenBed["bed_type"], string> = {
  raised_bed: "Raised Bed",
  ground_bed: "Ground Bed",
  pot: "Pot",
  planter: "Planter",
  greenhouse_bed: "Greenhouse",
  window_box: "Window Box",
  grow_bag: "Grow Bag",
};

const SUN_LABELS: Record<NonNullable<GardenBed["sun_exposure"]>, string> = {
  full_sun: "Full Sun",
  partial_shade: "Part Shade",
  full_shade: "Full Shade",
  variable: "Variable",
};

function dimensionLabel(bed: GardenBed) {
  if (bed.length_m && bed.width_m) {
    return `${bed.length_m}m × ${bed.width_m}m`;
  }
  return null;
}

interface BedCardProps {
  bed: GardenBed;
  activePlantingCount?: number;
}

export function BedCard({ bed, activePlantingCount }: BedCardProps) {
  const dim = dimensionLabel(bed);

  return (
    <Link href={`/beds/${bed.id}`} className="block group">
      <Card className="h-full transition-shadow group-hover:shadow-md overflow-hidden">
        {bed.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bed.photo_url}
            alt={bed.name}
            className="w-full h-32 object-cover"
          />
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-tight">{bed.name}</CardTitle>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {BED_TYPE_LABELS[bed.bed_type]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          {bed.section && <p>{bed.section}</p>}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {dim && <span>{dim}</span>}
            {bed.sun_exposure && <span>{SUN_LABELS[bed.sun_exposure]}</span>}
            {bed.location_label && <span>{bed.location_label}</span>}
          </div>
          {bed.soil_type && <p className="truncate">{bed.soil_type}</p>}
          {activePlantingCount !== undefined && (
            <p className="text-xs font-medium text-garden-700 pt-1">
              {activePlantingCount} active planting{activePlantingCount !== 1 ? "s" : ""}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
