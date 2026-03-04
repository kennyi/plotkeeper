import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { BedCard } from "@/components/beds/BedCard";
import { Button } from "@/components/ui/button";
import { getBedsWithPlantingCount } from "@/lib/supabase";

async function BedList() {
  let beds;
  try {
    beds = await getBedsWithPlantingCount();
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {beds.map((bed) => (
          <BedCard key={bed.id} bed={bed} activePlantingCount={bed.active_planting_count} />
        ))}
      </div>
    </>
  );
}

export default function BedsPage() {
  return (
    <div>
      <Header
        title="Garden Beds"
        description="Manage your beds, pots, and planters"
        action={
          <Button asChild size="sm">
            <Link href="/beds/new">Add bed</Link>
          </Button>
        }
      />
      <BedList />
    </div>
  );
}
