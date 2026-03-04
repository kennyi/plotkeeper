// PlotKeeper TypeScript Types
// Mirrors the Supabase database schema

export interface Plant {
  id: string;
  name: string;
  latin_name: string | null;
  category: "vegetable" | "flower" | "herb" | "fruit" | "perennial" | "annual" | "bulb" | "shrub";
  subcategory: string | null;
  description: string | null;

  // Sowing & planting windows (month numbers: 1=Jan, 12=Dec)
  sow_indoors_start: number | null;
  sow_indoors_end: number | null;
  sow_outdoors_start: number | null;
  sow_outdoors_end: number | null;
  transplant_start: number | null;
  transplant_end: number | null;
  harvest_start: number | null;
  harvest_end: number | null;

  // Indoor growing timing
  weeks_indoors_min: number | null;
  weeks_indoors_max: number | null;
  hardening_off_days: number | null;

  // Germination
  germination_days_min: number | null;
  germination_days_max: number | null;
  germination_temp_min: number | null;
  germination_temp_max: number | null;

  // Spacing (centimetres)
  spacing_cm: number | null;
  row_spacing_cm: number | null;
  sowing_depth_cm: number | null;

  // Plant size
  height_cm_min: number | null;
  height_cm_max: number | null;

  // Growing requirements
  sun_requirement: "full_sun" | "partial_shade" | "full_shade" | null;
  water_needs: "low" | "medium" | "high" | null;
  soil_preference: string | null;

  // Ireland-specific
  hardiness_zone: string | null;
  frost_tolerant: boolean;
  frost_tender: boolean;
  slug_risk: "low" | "medium" | "high" | null;

  // Perennial info
  is_perennial: boolean;
  lifespan_years: number | null;
  prune_month: number | null;
  divide_month: number | null;

  // Cut flower specific
  is_cut_flower: boolean;
  vase_life_days: number | null;
  succession_sow: boolean;
  succession_interval_weeks: number | null;

  // Companion planting
  companion_plants: string[] | null;
  avoid_near: string[] | null;

  // Pests
  common_pests: string[] | null;
  common_diseases: string[] | null;

  // Notes
  notes: string | null;
  growing_tips: string | null;

  created_at: string;
}

export interface GardenBed {
  id: string;
  name: string;
  bed_type: "raised_bed" | "ground_bed" | "pot" | "planter" | "greenhouse_bed" | "window_box" | "grow_bag";
  length_m: number | null;
  width_m: number | null;
  depth_m: number | null;
  location_label: string | null;
  sun_exposure: "full_sun" | "partial_shade" | "full_shade" | "variable" | null;
  wind_exposure: "sheltered" | "moderate" | "exposed" | null;
  soil_type: string | null;
  section: string | null;
  grid_x: number | null;
  grid_y: number | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BedPlanting {
  id: string;
  bed_id: string;
  plant_id: string | null;
  custom_plant_name: string | null;
  row_number: number | null;
  row_label: string | null;
  quantity: number | null;
  area_m2: number | null;
  seeds_started_date: string | null;
  sown_outdoors_date: string | null;
  planted_out_date: string | null;
  expected_harvest_date: string | null;
  actual_harvest_date: string | null;
  removed_date: string | null;
  status: "planned" | "seeds_started" | "germinating" | "growing" | "ready" | "harvested" | "finished" | "failed";
  growing_year: number;
  plant_family: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  plant?: Plant;
}

export interface MonthlyJob {
  id: string;
  month: number;
  title: string;
  description: string | null;
  category: "sow_indoors" | "sow_outdoors" | "plant_out" | "harvest" | "prune" | "feed" | "water" | "protect" | "prepare" | "order" | "compost" | "maintenance" | "divide" | "deadhead" | null;
  plant_category: string | null;
  priority: "high" | "medium" | "low";
  is_done: boolean;
  done_year: number | null;
  is_custom: boolean;
  notes: string | null;
  created_at: string;
}

export interface GardenSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  entry_date: string;
  entry_type: "harvest" | "observation" | "problem" | "note" | "weather" | "purchase" | null;
  bed_id: string | null;
  plant_id: string | null;
  title: string | null;
  notes: string;
  quantity_value: number | null;
  quantity_unit: string | null;
  symptoms: string | null;
  diagnosis: string | null;
  treatment: string | null;
  created_at: string;
}

// Utility types for UI
export type PlantCategory = Plant["category"];
export type SunRequirement = "full_sun" | "partial_shade" | "full_shade";
export type SlugRisk = "low" | "medium" | "high";

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const PLANT_CATEGORIES: { value: PlantCategory; label: string }[] = [
  { value: "vegetable", label: "Vegetables" },
  { value: "flower", label: "Flowers" },
  { value: "herb", label: "Herbs" },
  { value: "fruit", label: "Fruit" },
  { value: "perennial", label: "Perennials" },
  { value: "annual", label: "Annuals" },
  { value: "bulb", label: "Bulbs" },
  { value: "shrub", label: "Shrubs" },
];
