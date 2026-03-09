// PlotKeeper constants — Ireland/Kildare specific

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Kildare, Ireland specifics
export const KILDARE = {
  latitude: 53.1581,
  longitude: -6.9108,
  lastFrostApprox: "April 20",       // be conservative
  firstFrostApprox: "October 30",
  hardinessZone: "H4-H5",            // RHS scale
  growingSeasonStart: 5,             // May
  growingSeasonEnd: 10,              // October
  slugHighRiskMonths: [3, 4, 5, 9, 10], // March–May, September–October
};

// Calendar action types
export const CALENDAR_ACTIONS = [
  { key: "sow_indoors", label: "Sow Indoors", colour: "bg-amber-100 text-amber-800 border-amber-200" },
  { key: "sow_outdoors", label: "Sow Outdoors", colour: "bg-green-100 text-green-800 border-green-200" },
  { key: "transplant", label: "Plant Out", colour: "bg-blue-100 text-blue-800 border-blue-200" },
  { key: "harvest", label: "Harvest", colour: "bg-orange-100 text-orange-800 border-orange-200" },
] as const;

// Plant categories with display info
export const PLANT_CATEGORIES = [
  { value: "vegetable", label: "Vegetables", emoji: "🥦" },
  { value: "flower", label: "Flowers", emoji: "🌸" },
  { value: "herb", label: "Herbs", emoji: "🌿" },
  { value: "fruit", label: "Fruit", emoji: "🍓" },
  { value: "perennial", label: "Perennials", emoji: "🌱" },
  { value: "annual", label: "Annuals", emoji: "🌼" },
  { value: "bulb", label: "Bulbs", emoji: "🧅" },
  { value: "shrub", label: "Shrubs", emoji: "🌳" },
] as const;

export const SUN_REQUIREMENTS = [
  { value: "full_sun", label: "Full Sun" },
  { value: "partial_shade", label: "Partial Shade" },
  { value: "full_shade", label: "Full Shade" },
] as const;

export const SLUG_RISK_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
} as const;

export const JOB_CATEGORIES = [
  { value: "sow_indoors", label: "Sow Indoors" },
  { value: "sow_outdoors", label: "Sow Outdoors" },
  { value: "plant_out", label: "Plant Out" },
  { value: "harvest", label: "Harvest" },
  { value: "prune", label: "Prune" },
  { value: "feed", label: "Feed" },
  { value: "water", label: "Water" },
  { value: "protect", label: "Protect" },
  { value: "prepare", label: "Prepare" },
  { value: "order", label: "Order" },
  { value: "compost", label: "Compost" },
  { value: "maintenance", label: "Maintenance" },
  { value: "divide", label: "Divide" },
  { value: "deadhead", label: "Deadhead" },
] as const;

export type PlantingStatus =
  | "planned"
  | "seeds_started"
  | "germinating"
  | "growing"
  | "ready"
  | "harvested"
  | "finished"
  | "failed";

export const PLANTING_STATUS_LABELS: Record<PlantingStatus, string> = {
  planned:       "Planned",
  seeds_started: "Seeds Started",
  germinating:   "Germinating",
  growing:       "Growing",
  ready:         "Ready to Harvest",
  harvested:     "Harvested",
  finished:      "Finished",
  failed:        "Failed",
};

export const PLANTING_STATUS_CLASSES: Record<PlantingStatus, string> = {
  planned:       "bg-slate-100 text-slate-700",
  seeds_started: "bg-blue-100 text-blue-700",
  germinating:   "bg-teal-100 text-teal-700",
  growing:       "bg-green-100 text-green-700",
  ready:         "bg-emerald-100 text-emerald-800",
  harvested:     "bg-amber-100 text-amber-700",
  finished:      "bg-gray-100 text-gray-500",
  failed:        "bg-red-100 text-red-600",
};
