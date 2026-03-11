import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { getPlant } from "@/lib/supabase";
import { EditPlantForm } from "@/components/plants/EditPlantForm";

interface EditPlantPageProps {
  params: { id: string };
}

export default async function EditPlantPage({ params }: EditPlantPageProps) {
  let plant;
  try {
    plant = await getPlant(params.id);
  } catch {
    notFound();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={`/plants/${plant.id}`}>
            <ArrowLeft size={16} className="mr-1" />
            Back to plant
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit {plant.name}</h1>
        {plant.latin_name && (
          <p className="text-muted-foreground italic mt-0.5">{plant.latin_name}</p>
        )}
      </div>

      <EditPlantForm plant={plant} />
    </div>
  );
}
