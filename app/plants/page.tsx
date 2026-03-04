import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { PlantSearch } from "@/components/plants/PlantSearch";
import { PlantCard } from "@/components/plants/PlantCard";
import { getPlants } from "@/lib/supabase";

interface PlantLibraryPageProps {
  searchParams: {
    q?: string;
    category?: string;
  };
}

async function PlantGrid({ search, category }: { search: string; category: string }) {
  let plants;
  try {
    plants = await getPlants({
      search: search || undefined,
      category: category || undefined,
    });
  } catch {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">Could not load plants.</p>
        <p className="text-sm mt-1">Check your Supabase environment variables and run the migrations.</p>
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">No plants found.</p>
        {(search || category) && (
          <p className="text-sm mt-1">Try adjusting your search or filter.</p>
        )}
        {!search && !category && (
          <p className="text-sm mt-1">Run the seed migrations to populate the plant library.</p>
        )}
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
        {plants.length} plant{plants.length !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plants.map((plant) => (
          <PlantCard key={plant.id} plant={plant} />
        ))}
      </div>
    </>
  );
}

export default function PlantLibraryPage({ searchParams }: PlantLibraryPageProps) {
  const search = searchParams.q ?? "";
  const category = searchParams.category ?? "";

  return (
    <div>
      <Header
        title="Plant Library"
        description="Ireland-calibrated growing data for vegetables, flowers, and herbs"
      />

      <div className="mb-6">
        <Suspense>
          <PlantSearch />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        }
      >
        <PlantGrid search={search} category={category} />
      </Suspense>
    </div>
  );
}
