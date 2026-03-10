import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { getPlant, getBeds, getActivePlantingCountByPlant } from "@/lib/supabase";
import { SavedToast } from "@/components/ui/SavedToast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryEmoji } from "@/lib/utils";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { AddToBedSheet } from "@/components/beds/AddToBedSheet";
import { PlantLibraryInfo } from "@/components/plants/PlantLibraryInfo";
import { DeletePlantButton } from "@/components/plants/DeletePlantButton";

interface PlantDetailPageProps {
  params: { id: string };
  searchParams: { from?: string };
}

export default async function PlantDetailPage({ params, searchParams }: PlantDetailPageProps) {
  const [plant, beds, activePlantingCount] = await Promise.all([
    getPlant(params.id).catch(() => null),
    getBeds().catch(() => []),
    getActivePlantingCountByPlant(params.id).catch(() => 0),
  ]);

  if (!plant) notFound();

  const bedSummaries = beds.map((b) => ({
    id:       b.id,
    name:     b.name,
    bed_type: b.bed_type,
    length_m: b.length_m,
    width_m:  b.width_m,
  }));

  // Back link — if coming from a bed, show "Back to [bed]" instead of "Plant Library"
  const from = searchParams.from;
  const backHref = from ?? "/plants";
  const backLabel = from?.startsWith("/beds/") ? "Back to bed" : "Plant Library";

  return (
    <div>
      <Suspense><SavedToast message="Plant saved" /></Suspense>

      {/* Back link + actions */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={backHref}>
            <ArrowLeft size={16} className="mr-1" />
            {backLabel}
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <AddToBedSheet plantId={plant.id} plantName={plant.name} beds={bedSummaries} />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/plants/${plant.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>

      {/* Hero image or emoji placeholder */}
      <div className="w-full h-48 rounded-2xl overflow-hidden mb-6 bg-stone-100 flex items-center justify-center">
        {plant.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={plant.photo_url}
            alt={plant.name}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <span className="text-7xl">{categoryEmoji(plant.category)}</span>
        )}
      </div>

      {/* Plant name + badges */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{plant.name}</h1>
        {plant.latin_name && (
          <p className="text-muted-foreground italic">{plant.latin_name}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="garden" className="capitalize">{plant.category}</Badge>
          {plant.subcategory && (
            <Badge variant="outline" className="capitalize">{plant.subcategory.replace("_", " ")}</Badge>
          )}
          {plant.is_cut_flower && <Badge variant="outline">✂️ Cut flower</Badge>}
          {plant.is_perennial && <Badge variant="outline">♾️ Perennial</Badge>}
          {plant.frost_tender && (
            <Badge variant="outline" className="text-blue-700 border-blue-200">❄️ Frost tender</Badge>
          )}
          {plant.frost_tolerant && (
            <Badge variant="outline" className="text-green-700 border-green-200">🌡️ Frost tolerant</Badge>
          )}
          {plant.slug_risk === "high" && (
            <Badge variant="destructive">🐌 High slug risk</Badge>
          )}
        </div>
        {plant.description && (
          <p className="mt-3 text-muted-foreground">{plant.description}</p>
        )}
      </div>

      {/* About This Plant — library reference info */}
      <PlantLibraryInfo plant={plant} />

      {/* Delete — tucked away at the bottom */}
      <DeletePlantButton
        plantId={plant.id}
        plantName={plant.name}
        activePlantingCount={activePlantingCount}
      />
    </div>
  );
}
