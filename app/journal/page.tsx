import { Header } from "@/components/layout/Header";

export default function JournalPage() {
  return (
    <div>
      <Header title="Garden Journal" description="Log harvests, observations, and notes" />
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">Coming in Phase 3</p>
        <p className="text-sm mt-1">Harvest logging, problem diary, and garden observations.</p>
      </div>
    </div>
  );
}
