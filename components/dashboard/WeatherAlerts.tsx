"use client";

import { useState } from "react";
import type { WeatherAlert } from "@/lib/weather";

const ALERT_CONFIG = {
  frost: {
    icon: "❄️",
    classes: "bg-blue-50 border-blue-200 text-blue-800",
    dismissKey: "frost",
  },
  slug: {
    icon: "🐌",
    classes: "bg-amber-50 border-amber-200 text-amber-800",
    dismissKey: "slug",
  },
  blight: {
    icon: "🍅",
    classes: "bg-red-50 border-red-200 text-red-800",
    dismissKey: "blight",
  },
};

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
}

export function WeatherAlerts({ alerts }: WeatherAlertsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = alerts.filter((a) => !dismissed.has(a.type));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {visible.map((alert) => {
        const config = ALERT_CONFIG[alert.type];
        return (
          <div
            key={alert.type}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm ${config.classes}`}
          >
            <span className="text-base shrink-0">{config.icon}</span>
            <p className="flex-1">{alert.message}</p>
            <button
              onClick={() => setDismissed((prev) => new Set(Array.from(prev).concat(alert.type)))}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
