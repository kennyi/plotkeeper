import Link from "next/link";
import { Plant } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { monthRange, categoryEmoji } from "@/lib/utils";

interface PlantCardProps {
  plant: Plant;
}

export function PlantCard({ plant }: PlantCardProps) {
  const sowWindow = plant.sow_indoors_start
    ? monthRange(plant.sow_indoors_start, plant.sow_indoors_end)
    : plant.sow_outdoors_start
    ? monthRange(plant.sow_outdoors_start, plant.sow_outdoors_end)
    : null;

  const harvestWindow = monthRange(plant.harvest_start, plant.harvest_end);

  return (
    <Link href={`/plants/${plant.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer hover:border-garden-300 overflow-hidden">
        {plant.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={plant.photo_url}
            alt={plant.name}
            className="w-full h-32 object-cover"
          />
        )}
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {!plant.photo_url && <span className="text-base">{categoryEmoji(plant.category)}</span>}
                <h3 className="font-semibold text-sm truncate">{plant.name}</h3>
              </div>
              {plant.latin_name && (
                <p className="text-xs text-muted-foreground italic truncate mt-0.5">
                  {plant.latin_name}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1 flex-shrink-0">
              {plant.is_user_created && (
                <Badge variant="outline" className="text-xs px-1.5 py-0 text-garden-700 border-garden-300 bg-garden-50">
                  My plant
                </Badge>
              )}
              {plant.slug_risk === "high" && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0">
                  🐌 High slug risk
                </Badge>
              )}
              {plant.frost_tender && (
                <Badge variant="outline" className="text-xs px-1.5 py-0 text-blue-700 border-blue-200">
                  ❄️ Frost tender
                </Badge>
              )}
            </div>
          </div>

          {plant.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {plant.description}
            </p>
          )}

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {sowWindow && (
              <div>
                <span className="text-muted-foreground">Sow: </span>
                <span className="font-medium">{sowWindow}</span>
              </div>
            )}
            {plant.harvest_start && (
              <div>
                <span className="text-muted-foreground">Harvest: </span>
                <span className="font-medium">{harvestWindow}</span>
              </div>
            )}
            {plant.spacing_cm && (
              <div>
                <span className="text-muted-foreground">Spacing: </span>
                <span className="font-medium">{plant.spacing_cm}cm</span>
              </div>
            )}
            {plant.sun_requirement && (
              <div>
                <span className="text-muted-foreground">Sun: </span>
                <span className="font-medium">
                  {plant.sun_requirement === "full_sun"
                    ? "Full sun"
                    : plant.sun_requirement === "partial_shade"
                    ? "Part shade"
                    : "Full shade"}
                </span>
              </div>
            )}
          </div>

          {plant.succession_sow && (
            <p className="text-xs text-garden-700 mt-2 font-medium">
              ↻ Succession sow every {plant.succession_interval_weeks ?? 3} weeks
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
