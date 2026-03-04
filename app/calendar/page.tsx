import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { MonthSelector } from "@/components/calendar/MonthSelector";
import { CalendarFilters } from "@/components/calendar/CalendarFilters";
import { CalendarPlantCard } from "@/components/calendar/CalendarPlantCard";
import { getPlantsForMonth } from "@/lib/supabase";
import { Plant } from "@/types";
import { KILDARE } from "@/lib/constants";

interface CalendarPageProps {
  searchParams: { month?: string; category?: string };
}

function getActionsForPlant(plant: Plant, month: number): string[] {
  const actions: string[] = [];

  if (
    plant.sow_indoors_start !== null &&
    plant.sow_indoors_end !== null &&
    month >= plant.sow_indoors_start &&
    month <= plant.sow_indoors_end
  ) {
    actions.push("sow_indoors");
  }

  if (
    plant.sow_outdoors_start !== null &&
    plant.sow_outdoors_end !== null &&
    month >= plant.sow_outdoors_start &&
    month <= plant.sow_outdoors_end
  ) {
    actions.push("sow_outdoors");
  }

  if (
    plant.transplant_start !== null &&
    plant.transplant_end !== null &&
    month >= plant.transplant_start &&
    month <= plant.transplant_end
  ) {
    actions.push("transplant");
  }

  if (
    plant.harvest_start !== null &&
    plant.harvest_end !== null &&
    month >= plant.harvest_start &&
    month <= plant.harvest_end
  ) {
    actions.push("harvest");
  }

  return actions;
}

type ActionGroup = {
  key: string;
  label: string;
  colour: string;
  plants: { plant: Plant; actions: string[] }[];
};

async function CalendarGrid({ month, category }: { month: number; category?: string }) {
  let plants: Plant[];
  try {
    plants = await getPlantsForMonth(month, category || undefined);
  } catch {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Could not load calendar data.</p>
        <p className="text-sm mt-1">Check your Supabase environment variables and run the migrations.</p>
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No planting activity for this month.</p>
        <p className="text-sm mt-1">Run the seed migrations to populate the plant database.</p>
      </div>
    );
  }

  // Group plants by primary action for this month
  const groups: ActionGroup[] = [
    { key: "sow_indoors", label: "🌡️ Sow Indoors", colour: "border-amber-300 bg-amber-50", plants: [] },
    { key: "sow_outdoors", label: "🌱 Sow Outdoors", colour: "border-green-300 bg-green-50", plants: [] },
    { key: "transplant", label: "🪴 Plant Out", colour: "border-blue-300 bg-blue-50", plants: [] },
    { key: "harvest", label: "🌾 Harvest", colour: "border-orange-300 bg-orange-50", plants: [] },
  ];

  // Assign each plant to groups (can appear in multiple)
  for (const plant of plants) {
    const actions = getActionsForPlant(plant, month);
    for (const group of groups) {
      if (actions.includes(group.key)) {
        group.plants.push({ plant, actions });
      }
    }
  }

  const activeGroups = groups.filter((g) => g.plants.length > 0);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {plants.length} plant{plants.length !== 1 ? "s" : ""} active this month
      </p>

      {activeGroups.map((group) => (
        <div key={group.key}>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border mb-3 ${group.colour}`}>
            <h3 className="font-semibold text-sm">{group.label}</h3>
            <span className="text-xs text-muted-foreground">({group.plants.length})</span>
          </div>
          <div className="space-y-2">
            {group.plants.map(({ plant, actions }) => (
              <CalendarPlantCard key={`${group.key}-${plant.id}`} plant={plant} actions={actions} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function IrelandTips({ month }: { month: number }) {
  const tips: string[] = [];

  if (month <= 4) tips.push("Last frost ~April 20 — keep tender plants under cover until mid-May");
  if (KILDARE.slugHighRiskMonths.includes(month)) tips.push("🐌 High slug risk this month — monitor daily after rain");
  if (month >= 10 && month <= 11) tips.push("First frost ~October 30 — lift dahlias and tender plants");
  if (month >= 6 && month <= 8) tips.push("🍅 Peak blight risk for tomatoes and potatoes in warm wet weather");

  if (tips.length === 0) return null;

  return (
    <div className="mb-6 p-3 bg-garden-50 border border-garden-200 rounded-lg">
      <p className="text-xs font-semibold text-garden-800 mb-1">Kildare notes</p>
      {tips.map((tip, i) => (
        <p key={i} className="text-xs text-garden-700">• {tip}</p>
      ))}
    </div>
  );
}

export default function CalendarPage({ searchParams }: CalendarPageProps) {
  const month = Math.min(12, Math.max(1, parseInt(searchParams.month ?? "") || new Date().getMonth() + 1));
  const category = searchParams.category ?? "";

  return (
    <div>
      <Header
        title="Planting Calendar"
        description="What to sow, plant out, and harvest — calibrated for Kildare, Ireland"
      />

      <div className="mb-4">
        <Suspense>
          <MonthSelector currentMonth={month} />
        </Suspense>
      </div>

      <Suspense>
        <CalendarFilters />
      </Suspense>

      <IrelandTips month={month} />

      <Suspense
        fallback={
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        }
      >
        <CalendarGrid month={month} category={category} />
      </Suspense>
    </div>
  );
}
