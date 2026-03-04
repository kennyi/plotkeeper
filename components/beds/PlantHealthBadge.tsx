import type { HealthStatus } from "@/types";

const CONFIG: Record<HealthStatus, { label: string; dot: string; text: string }> = {
  thriving:   { label: "Thriving",   dot: "bg-green-600",  text: "text-green-700" },
  healthy:    { label: "Healthy",    dot: "bg-green-400",  text: "text-green-600" },
  ok:         { label: "OK",         dot: "bg-stone-400",  text: "text-stone-500" },
  struggling: { label: "Struggling", dot: "bg-amber-500",  text: "text-amber-600" },
  critical:   { label: "Critical",   dot: "bg-red-500",    text: "text-red-600"   },
  dormant:    { label: "Dormant",    dot: "bg-blue-300",   text: "text-blue-500"  },
};

interface PlantHealthBadgeProps {
  status: HealthStatus;
  showLabel?: boolean;
}

export function PlantHealthBadge({ status, showLabel = true }: PlantHealthBadgeProps) {
  const { label, dot, text } = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${text}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
      {showLabel && label}
    </span>
  );
}
