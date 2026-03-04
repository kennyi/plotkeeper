import { Header } from "@/components/layout/Header";

export default function BedsPage() {
  return (
    <div>
      <Header title="Garden Beds" description="Manage your beds, pots, and planters" />
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">Coming in Phase 2</p>
        <p className="text-sm mt-1">Bed management, planting tracker, and crop history.</p>
      </div>
    </div>
  );
}
