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
      <div className="h-full bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden transition-all duration-150 group-hover:shadow-md group-hover:border-stone-300">
        {/* Icon area */}
        <div className="flex items-center justify-center pt-8 pb-3 px-6">
          <BedTypeIcon bedType={bed.bed_type} size={72} />
        </div>

        {/* Name + section */}
        <div className="px-4 pb-5 text-center">
          <p className="font-semibold text-stone-800 text-base leading-tight">{bed.name}</p>
          {bed.section && (
            <p className="text-xs text-stone-500 mt-0.5">{bed.section}</p>
          )}

          {/* Next action badge */}
          {nextAction ? (
            <div className="mt-3">
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${nextAction.colorClass}`}>
                {nextAction.label}
              </span>
            </div>
          ) : (
            <div className="mt-3 h-6" /> /* spacer to keep card heights consistent */
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
    return { label: "Harvest ready",      colorClass: "bg-emerald-100 text-emerald-800" };
  if (statuses.includes("germinating"))
    return { label: "Ready to plant out", colorClass: "bg-teal-100 text-teal-700" };
  if (statuses.includes("seeds_started"))
    return { label: "Harden off soon",    colorClass: "bg-blue-100 text-blue-700" };
  if (statuses.includes("growing"))
    return { label: "Growing well",       colorClass: "bg-garden-100 text-garden-700" };
  if (statuses.includes("planned"))
    return { label: "Awaiting sowing",    colorClass: "bg-stone-100 text-stone-600" };
  return null;
}
