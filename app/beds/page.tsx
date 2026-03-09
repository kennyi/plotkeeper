import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { BedCard, deriveNextAction } from "@/components/beds/BedCard";
import { Button } from "@/components/ui/button";
import { getBedsOverview, getAllPlantings } from "@/lib/supabase";
import { PlantTopDownIcon } from "@/components/beds/PlantTopDownIcon";

const STATUS_LABELS: Record<string, string> = {
  planned:       "Planned",
  seeds_started: "Seeds Started",
  germinating:   "Germinating",
  growing:       "Growing",
  ready:         "Ready",
  harvested:     "Harvested",
  finished:      "Finished",
  failed:        "Failed",
};

const STATUS_CLASSES: Record<string, string> = {
  planned:       "bg-slate-100 text-slate-700",
  seeds_started: "bg-blue-100 text-blue-700",
  germinating:   "bg-teal-100 text-teal-700",
  growing:       "bg-green-100 text-green-700",
  ready:         "bg-emerald-100 text-emerald-800",
  harvested:     "bg-amber-100 text-amber-700",
  finished:      "bg-gray-100 text-gray-500",
  failed:        "bg-red-100 text-red-600",
};

async function BedList() {
  let beds;
  try {
    beds = await getBedsOverview();
  } catch {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">Could not load beds.</p>
        <p className="text-sm mt-1">Check your Supabase environment variables.</p>
      </div>
    );
  }

  if (beds.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">No beds yet</p>
        <p className="text-sm mt-1 mb-6">Add your first bed to start tracking plantings.</p>
        <Button asChild>
          <Link href="/beds/new">Add a bed</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
        {beds.length} bed{beds.length !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {beds.map((bed) => (
          <BedCard
            key={bed.id}
            bed={bed}
            nextAction={deriveNextAction(bed.planting_statuses)}
          />
        ))}
      </div>
    </>
  );
}

async function PlantView() {
  let plantings;
  try {
    plantings = await getAllPlantings();
  } catch {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">Could not load plantings.</p>
      </div>
    );
  }

  if (plantings.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">No plants in your garden yet</p>
        <p className="text-sm mt-1 mb-6">Add plants to your beds to see them here.</p>
        <Button asChild>
          <Link href="/beds">Go to beds</Link>
        </Button>
      </div>
    );
  }

  const sorted = [...plantings].sort((a, b) => {
    const nameA = a.plant?.name ?? a.custom_plant_name ?? "";
    const nameB = b.plant?.name ?? b.custom_plant_name ?? "";
    return nameA.localeCompare(nameB);
  });

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
        {plantings.length} planting{plantings.length !== 1 ? "s" : ""}
      </p>
      <div className="space-y-2">
        {sorted.map((p) => {
          const name = p.plant?.name ?? p.custom_plant_name ?? "Unknown plant";
          return (
            <Link
              key={p.id}
              href={`/plantings/${p.id}?from=${encodeURIComponent("/beds?view=plants")}`}
              className="flex items-center gap-3 py-2.5 px-3 border rounded-lg text-sm hover:bg-stone-50 transition-colors"
            >
              <PlantTopDownIcon category={p.plant?.category ?? null} size={28} />
              <div className="flex-1 min-w-0">
                <span className="font-medium">{name}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_CLASSES[p.status] ?? "bg-gray-100 text-gray-500"}`}>
                {STATUS_LABELS[p.status] ?? p.status}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

interface BedsPageProps {
  searchParams: { view?: string };
}

export default function BedsPage({ searchParams }: BedsPageProps) {
  const view = searchParams.view === "plants" ? "plants" : "beds";

  return (
    <div>
      <Header
        title="Inventory"
        description="Beds, pots, and everything growing"
        action={
          view === "plants" ? (
            <Button asChild size="sm">
              <Link href="/plants/new">Add plant</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/beds/new">Add bed</Link>
            </Button>
          )
        }
      />

      {/* View toggle */}
      <div className="flex rounded-lg border overflow-hidden text-sm mb-6 w-fit">
        <Link
          href="/beds"
          className={`px-3 py-1.5 transition-colors ${view === "beds" ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:bg-muted"}`}
        >
          Beds
        </Link>
        <Link
          href="/beds?view=plants"
          className={`px-3 py-1.5 transition-colors ${view === "plants" ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:bg-muted"}`}
        >
          Plants
        </Link>
      </div>

      {view === "plants" ? <PlantView /> : <BedList />}
    </div>
  );
}
