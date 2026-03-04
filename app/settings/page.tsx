import { Header } from "@/components/layout/Header";

export default function SettingsPage() {
  return (
    <div>
      <Header title="Settings" description="Garden profile and app configuration" />
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">Coming in Phase 2</p>
        <p className="text-sm mt-1">Location, frost dates, hardiness zone, and garden name.</p>
      </div>
    </div>
  );
}
