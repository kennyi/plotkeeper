import Link from "next/link";
import { Plant } from "@/types";
import { Badge } from "@/components/ui/badge";
import { categoryEmoji } from "@/lib/utils";

interface CalendarPlantCardProps {
  plant: Plant;
  actions: string[]; // which actions are active this month
}

const ACTION_COLOURS: Record<string, string> = {
  sow_indoors: "bg-amber-100 text-amber-800 border-amber-200",
  sow_outdoors: "bg-green-100 text-green-800 border-green-200",
  transplant: "bg-blue-100 text-blue-800 border-blue-200",
  harvest: "bg-orange-100 text-orange-800 border-orange-200",
};

const ACTION_LABELS: Record<string, string> = {
  sow_indoors: "Sow indoors",
  sow_outdoors: "Sow outdoors",
  transplant: "Plant out",
  harvest: "Harvest",
};

export function CalendarPlantCard({ plant, actions }: CalendarPlantCardProps) {
  return (
    <Link
      href={`/plants/${plant.id}`}
      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm hover:border-garden-300 transition-all"
    >
      <span className="text-xl flex-shrink-0">{categoryEmoji(plant.category)}</span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{plant.name}</p>
        {plant.latin_name && (
          <p className="text-xs text-muted-foreground italic truncate">{plant.latin_name}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-1 flex-shrink-0">
        {actions.map((action) => (
          <span
            key={action}
            className={`text-xs px-1.5 py-0.5 rounded border font-medium ${ACTION_COLOURS[action] ?? "bg-muted text-muted-foreground"}`}
          >
            {ACTION_LABELS[action] ?? action}
          </span>
        ))}
        {plant.slug_risk === "high" && (
          <span className="text-xs" title="High slug risk">🐌</span>
        )}
        {plant.succession_sow && (
          <span className="text-xs text-garden-700 font-medium" title="Succession sow">↻</span>
        )}
      </div>
    </Link>
  );
}
