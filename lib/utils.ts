import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function monthName(month: number): string {
  const names = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return names[month - 1] ?? "";
}

export function monthRange(start: number | null, end: number | null): string {
  if (!start) return "–";
  if (!end || start === end) return monthName(start);
  return `${monthName(start)} – ${monthName(end)}`;
}

export function formatSpacing(spacingCm: number | null, rowSpacingCm: number | null): string {
  if (!spacingCm) return "–";
  if (!rowSpacingCm) return `${spacingCm}cm`;
  return `${spacingCm}cm × ${rowSpacingCm}cm`;
}

export function formatGermination(min: number | null, max: number | null): string {
  if (!min) return "–";
  if (!max || min === max) return `${min} days`;
  return `${min}–${max} days`;
}

export function formatWeeksIndoors(min: number | null, max: number | null): string {
  if (!min) return "–";
  if (!max || min === max) return `${min} weeks`;
  return `${min}–${max} weeks`;
}

export function currentMonth(): number {
  return new Date().getMonth() + 1; // 1-indexed
}

export function slugRiskColour(risk: string | null): string {
  switch (risk) {
    case "high": return "text-red-600";
    case "medium": return "text-amber-600";
    case "low": return "text-green-600";
    default: return "text-muted-foreground";
  }
}

export function categoryEmoji(category: string): string {
  switch (category) {
    case "vegetable": return "🥦";
    case "flower": return "🌸";
    case "herb": return "🌿";
    case "fruit": return "🍓";
    case "perennial": return "🌱";
    case "annual": return "🌼";
    case "bulb": return "🧅";
    case "shrub": return "🌳";
    default: return "🌿";
  }
}
