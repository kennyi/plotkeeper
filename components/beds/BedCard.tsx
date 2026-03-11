import Link from "next/link";
import { BedTypeIcon } from "./BedTypeIcon";
import type { GardenBed } from "@/types";

export interface NextAction {
  label: string;
  colorClass: string;
}

interface BedCardProps {
  bed: GardenBed;
  nextAction?: NextAction | null;
}

export function BedCard({ bed, nextAction }: BedCardProps) {
  return (
    <Link href={`/beds/${bed.id}`} className="block group">
      <div className="h-full bg-card border border-linen-300 rounded-2xl overflow-hidden shadow-warm transition-all duration-150 group-hover:shadow-warm-lg group-hover:border-linen-400">
        {/* Photo or icon */}
        <div className="flex items-center justify-center pt-8 pb-3 px-6">
          {bed.photo_url ? (
            <div className="w-20 h-20 rounded-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bed.photo_url}
                alt={bed.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ) : (
            <BedTypeIcon bedType={bed.bed_type} size={72} />
          )}
        </div>

        {/* Name + section */}
        <div className="px-4 pb-5 text-center">
          <p className="font-semibold text-foreground text-base leading-tight">{bed.name}</p>
          {bed.section && (
            <p className="text-xs text-muted-foreground mt-0.5">{bed.section}</p>
          )}

          {/* Next action badge */}
          {nextAction ? (
            <div className="mt-3">
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${nextAction.colorClass}`}>
                {nextAction.label}
              </span>
            </div>
          ) : (
            <div className="mt-3 h-6" /> /* spacer */
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * Derives the single most-urgent next action from a bed's active planting statuses.
 * Priority: ready > germinating > seeds_started > growing > planned
 */
export function deriveNextAction(statuses: string[]): NextAction | null {
  if (statuses.includes("ready"))
    return { label: "Harvest ready",      colorClass: "bg-garden-200 text-garden-800" };
  if (statuses.includes("germinating"))
    return { label: "Ready to plant out", colorClass: "bg-garden-100 text-garden-700" };
  if (statuses.includes("seeds_started"))
    return { label: "Harden off soon",    colorClass: "bg-terracotta-50 text-terracotta-700" };
  if (statuses.includes("growing"))
    return { label: "Growing well",       colorClass: "bg-garden-50 text-garden-600" };
  if (statuses.includes("planned"))
    return { label: "Awaiting sowing",    colorClass: "bg-linen-200 text-muted-foreground" };
  return null;
}
