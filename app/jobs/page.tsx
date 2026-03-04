import { Header } from "@/components/layout/Header";

export default function JobsPage() {
  return (
    <div>
      <Header title="Monthly Jobs" description="Gardening tasks for each month in Kildare" />
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">Coming in Phase 2</p>
        <p className="text-sm mt-1">Month-by-month task list with priority and completion tracking.</p>
      </div>
    </div>
  );
}
