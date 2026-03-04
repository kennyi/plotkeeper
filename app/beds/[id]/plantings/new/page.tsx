import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PlantingForm } from "@/components/beds/PlantingForm";
import { getBed, getPlants } from "@/lib/supabase";
import { createPlantingAction } from "@/app/actions/plantings";

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

  const plants = await getPlants();
  const action = createPlantingAction.bind(null, params.id);

  return (
    <div>
      <Header
        title="Add Planting"
        description={`Adding to: ${bed.name}`}
      />
      <div className="max-w-2xl">
        <PlantingForm bedId={params.id} plants={plants} action={action} />
      </div>
    </div>
  );
}
