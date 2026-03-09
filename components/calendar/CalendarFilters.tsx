"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PLANT_CATEGORIES } from "@/lib/constants";

const CALENDAR_CATEGORY_VALUES = new Set(["vegetable", "flower", "herb", "fruit", "perennial"]);

const CATEGORIES = [
  { value: "", label: "All" },
  ...PLANT_CATEGORIES
    .filter((c) => CALENDAR_CATEGORY_VALUES.has(c.value))
    .map(({ value, label }) => ({ value, label })),
];

export function CalendarFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const currentCategory = params.get("category") ?? "";
  const currentMonth = params.get("month") ?? "";

  function setCategory(cat: string) {
    const next = new URLSearchParams();
    if (currentMonth) next.set("month", currentMonth);
    if (cat) next.set("category", cat);
    router.push(`/calendar?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {CATEGORIES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setCategory(value)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            currentCategory === value
              ? "bg-garden-700 text-white"
              : "bg-muted text-muted-foreground hover:bg-garden-100 hover:text-garden-800"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
