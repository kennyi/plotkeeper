import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { BedCard, deriveNextAction } from "@/components/beds/BedCard";
import { Button } from "@/components/ui/button";
import { getBedsOverview, getAllPlantings } from "@/lib/supabase";
import { PlantTopDownIcon } from "@/components/beds/PlantTopDownIcon";
import { PLANTING_STATUS_LABELS, PLANTING_STATUS_CLASSES } from "@/lib/constants";
import type { PlantingStatus } from "@/lib/constants";

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
              className="flex items-center gap-3 py-2.5 px-3 border border-linen-300 rounded-xl text-sm bg-card hover:bg-accent transition-colors"
            >
              {p.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photo_url} alt={name} className="w-7 h-7 rounded-full object-cover object-center flex-shrink-0" />
              ) : (
                <PlantTopDownIcon category={p.plant?.category ?? null} size={28} />
              )}
              <div className="flex-1 min-w-0">
                <span className="font-medium">{name}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${PLANTING_STATUS_CLASSES[p.status as PlantingStatus] ?? "bg-gray-100 text-gray-500"}`}>
                {PLANTING_STATUS_LABELS[p.status as PlantingStatus] ?? p.status}
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
      <div className="flex rounded-xl border border-linen-300 overflow-hidden text-sm mb-6 w-fit bg-linen-100">
        <Link
          href="/beds"
          className={`px-4 py-1.5 transition-colors font-medium ${view === "beds" ? "bg-terracotta-500 text-white" : "text-muted-foreground hover:bg-linen-200"}`}
        >
          Beds
        </Link>
        <Link
          href="/beds?view=plants"
          className={`px-4 py-1.5 transition-colors font-medium ${view === "plants" ? "bg-terracotta-500 text-white" : "text-muted-foreground hover:bg-linen-200"}`}
        >
          Plants
        </Link>
      </div>

      {view === "plants" ? <PlantView /> : <BedList />}
    </div>
  );
}
