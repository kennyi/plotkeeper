import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AddPlantingWizard } from "@/components/beds/AddPlantingWizard";
import { getBed, getPlants, getBedPlantings } from "@/lib/supabase";

interface NewPlantingPageProps {
  params: { id: string };
}

export default async function NewPlantingPage({ params }: NewPlantingPageProps) {
  let bed;
  try {
    bed = await getBed(params.id);
  } catch {
    notFound();
  }

  if (!bed) notFound();

  const [plants, plantings] = await Promise.all([
    getPlants().catch(() => []),
    getBedPlantings(params.id).catch(() => []),
  ]);

  // Slim down existing plantings for the grid — only active ones need slots
  const existingSlotPlantings = plantings
    .filter((p) => p.status !== "finished" && p.status !== "failed")
    .map((p) => ({
      row_number: p.row_number,
      category: p.plant?.category ?? null,
      name: p.plant?.name ?? p.custom_plant_name ?? null,
    }));

  return (
    <div>
      <Header
        title="Add planting"
        description={bed.name}
      />
      <div className="max-w-lg">
        <AddPlantingWizard
          bedId={params.id}
          bed={bed}
          plants={plants}
          existingPlantings={existingSlotPlantings}
        />
      </div>
    </div>
  );
}
