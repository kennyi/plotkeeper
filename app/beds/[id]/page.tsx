import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBed } from "@/lib/supabase";
import { deleteBedAction } from "@/app/actions/beds";
import type { GardenBed } from "@/types";

const BED_TYPE_LABELS: Record<GardenBed["bed_type"], string> = {
  raised_bed: "Raised Bed",
  ground_bed: "Ground Bed",
  pot: "Pot",
  planter: "Planter",
  greenhouse_bed: "Greenhouse Bed",
  window_box: "Window Box",
  grow_bag: "Grow Bag",
};

const SUN_LABELS: Record<NonNullable<GardenBed["sun_exposure"]>, string> = {
  full_sun: "Full Sun",
  partial_shade: "Partial Shade",
  full_shade: "Full Shade",
  variable: "Variable",
};

const WIND_LABELS: Record<NonNullable<GardenBed["wind_exposure"]>, string> = {
  sheltered: "Sheltered",
  moderate: "Moderate",
  exposed: "Exposed",
};

interface BedDetailPageProps {
  params: { id: string };
}

export default async function BedDetailPage({ params }: BedDetailPageProps) {
  let bed;
  try {
    bed = await getBed(params.id);
  } catch {
    notFound();
  }

  const deleteBed = deleteBedAction.bind(null, params.id);

  return (
    <div>
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

      {/* Plantings — Phase 2 #17 & #18 */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Plantings</h2>
          <Badge variant="secondary">Coming soon</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Planting tracking and status lifecycle will be added in the next step.
        </p>
      </div>
    </div>
  );
}
