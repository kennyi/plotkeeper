import Link from "next/link";
import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { PlantSearch } from "@/components/plants/PlantSearch";
import { PlantCard } from "@/components/plants/PlantCard";
import { getPlants, getMyPlants } from "@/lib/supabase";

interface PlantLibraryPageProps {
  searchParams: {
    q?: string;
    category?: string;
    all?: string;
  };
}

async function PlantGrid({ search, category, mineOnly }: { search: string; category: string; mineOnly: boolean }) {
  let plants;
  try {
    plants = mineOnly
      ? await getMyPlants({ search: search || undefined, category: category || undefined })
      : await getPlants({ search: search || undefined, category: category || undefined });
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
        {mineOnly ? (
          <>
            <p className="text-sm mt-1">You have no plants in your beds yet.</p>
            <Button asChild size="sm" className="mt-4">
              <Link href="/beds">Go to beds</Link>
            </Button>
          </>
        ) : (search || category) ? (
          <p className="text-sm mt-1">Try adjusting your search or filter.</p>
        ) : (
          <p className="text-sm mt-1">Run the seed migrations to populate the plant library.</p>
        )}
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
        {plants.length} plant{plants.length !== 1 ? "s" : ""}
        {mineOnly && " in your beds"}
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
  // Default to "my plants"; pass ?all=1 to see the full library
  const mineOnly = searchParams.all !== "1";

  const baseParams = `${search ? `&q=${search}` : ""}${category ? `&category=${category}` : ""}`;

  return (
    <div>
      <Header
        title="Plant Library"
        description="Ireland-calibrated growing data for vegetables, flowers, and herbs"
        action={
          <Button asChild size="sm">
            <Link href="/plants/new">+ Add plant</Link>
          </Button>
        }
      />

      {/* My plants / All plants toggle */}
      <div className="flex rounded-lg border overflow-hidden text-sm mb-4 w-fit">
        <Link
          href={`/plants?${baseParams}`}
          className={`px-3 py-1.5 transition-colors ${mineOnly ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:bg-muted"}`}
        >
          My plants
        </Link>
        <Link
          href={`/plants?all=1${baseParams}`}
          className={`px-3 py-1.5 transition-colors ${!mineOnly ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:bg-muted"}`}
        >
          All plants
        </Link>
      </div>

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
        <PlantGrid search={search} category={category} mineOnly={mineOnly} />
      </Suspense>
    </div>
  );
}
