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

const PLANT_COLOR_PALETTE = [
  { bg: "#D8EDDE", border: "#8BB596", text: "#2D5A27" }, // sage green
  { bg: "#EEDEC4", border: "#C4975A", text: "#5A3E1B" }, // wheat
  { bg: "#D6E8D5", border: "#7AAB78", text: "#2A4D28" }, // fern
  { bg: "#F0E6D3", border: "#C8A87A", text: "#5C3D1E" }, // sand
  { bg: "#DBE8D8", border: "#85A882", text: "#2E4D2B" }, // moss
  { bg: "#EDE3D6", border: "#BDA07A", text: "#4D3519" }, // clay
  { bg: "#D4E8E0", border: "#7AB5A0", text: "#1F4D3D" }, // teal sage
  { bg: "#EDE8D6", border: "#C4B07A", text: "#4D3E19" }, // straw
  { bg: "#E0D8ED", border: "#9B8BBF", text: "#3D2D5A" }, // lavender
  { bg: "#EDD8D8", border: "#BF8B8B", text: "#5A2D2D" }, // dusty rose
  { bg: "#D8E0ED", border: "#8B9BBF", text: "#2D3D5A" }, // cornflower
  { bg: "#E8EDD8", border: "#ABBF8B", text: "#3D4D2D" }, // chartreuse
  { bg: "#EDD8E8", border: "#BF8BB5", text: "#5A2D52" }, // heather
  { bg: "#D8EBED", border: "#8BB5BF", text: "#2D4A52" }, // slate blue
  { bg: "#EDE8D8", border: "#BFB58B", text: "#524A2D" }, // taupe
  { bg: "#D8EDE8", border: "#8BBFB5", text: "#2D524A" }, // seafoam
];

export function getPlantColor(name: string): { bg: string; border: string; text: string } {
  let hash = 5381;
  const lower = name.toLowerCase();
  for (let i = 0; i < lower.length; i++) {
    hash = ((hash << 5) + hash) + lower.charCodeAt(i);
    hash = hash & hash; // keep 32-bit
  }
  return PLANT_COLOR_PALETTE[Math.abs(hash) % PLANT_COLOR_PALETTE.length];
}
