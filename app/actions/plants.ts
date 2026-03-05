"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPlant, updatePlant } from "@/lib/supabase";
import type { Plant } from "@/types";

// Parse a comma-separated string into a trimmed string array, dropping empties.
function parseList(raw: string | null): string[] | null {
  if (!raw || raw.trim() === "") return null;
  const items = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return items.length > 0 ? items : null;
}

function num(raw: string | null): number | null {
  if (!raw || raw.trim() === "") return null;
  const n = parseFloat(raw);
  return isNaN(n) ? null : n;
}

function bool(raw: string | null): boolean {
  return raw === "on" || raw === "true" || raw === "1";
}

export async function createPlantAction(formData: FormData): Promise<void> {
  const get = (key: string) => formData.get(key) as string | null;

  const values: Omit<Plant, "id" | "is_user_created" | "created_by" | "created_at"> = {
    name: (get("name") ?? "").trim(),
    latin_name: get("latin_name") || null,
    category: (get("category") ?? "vegetable") as Plant["category"],
    subcategory: get("subcategory") || null,
    description: get("description") || null,

    sow_indoors_start: num(get("sow_indoors_start")),
    sow_indoors_end: num(get("sow_indoors_end")),
    sow_outdoors_start: num(get("sow_outdoors_start")),
    sow_outdoors_end: num(get("sow_outdoors_end")),
    transplant_start: num(get("transplant_start")),
    transplant_end: num(get("transplant_end")),
    harvest_start: num(get("harvest_start")),
    harvest_end: num(get("harvest_end")),

    weeks_indoors_min: num(get("weeks_indoors_min")),
    weeks_indoors_max: num(get("weeks_indoors_max")),
    hardening_off_days: num(get("hardening_off_days")),

    germination_days_min: num(get("germination_days_min")),
    germination_days_max: num(get("germination_days_max")),
    germination_temp_min: num(get("germination_temp_min")),
    germination_temp_max: num(get("germination_temp_max")),

    spacing_cm: num(get("spacing_cm")),
    row_spacing_cm: num(get("row_spacing_cm")),
    sowing_depth_cm: num(get("sowing_depth_cm")),
    height_cm_min: num(get("height_cm_min")),
    height_cm_max: num(get("height_cm_max")),

    sun_requirement: (get("sun_requirement") || null) as Plant["sun_requirement"],
    water_needs: (get("water_needs") || null) as Plant["water_needs"],
    soil_preference: get("soil_preference") || null,

    hardiness_zone: get("hardiness_zone") || null,
    frost_tolerant: bool(get("frost_tolerant")),
    frost_tender: bool(get("frost_tender")),
    slug_risk: (get("slug_risk") || null) as Plant["slug_risk"],

    is_perennial: bool(get("is_perennial")),
    lifespan_years: num(get("lifespan_years")),
    prune_month: num(get("prune_month")),
    divide_month: num(get("divide_month")),

    is_cut_flower: bool(get("is_cut_flower")),
    vase_life_days: num(get("vase_life_days")),
    succession_sow: bool(get("succession_sow")),
    succession_interval_weeks: num(get("succession_interval_weeks")),

    companion_plants: parseList(get("companion_plants")),
    avoid_near: parseList(get("avoid_near")),
    common_pests: parseList(get("common_pests")),
    common_diseases: parseList(get("common_diseases")),

    notes: get("notes") || null,
    growing_tips: get("growing_tips") || null,
    photo_url: get("photo_url") || null,
  };

  let plant;
  try {
    plant = await createPlant(values);
  } catch (err) {
    console.error("createPlant failed:", err);
    throw new Error("Could not save plant. Make sure you are signed in and try again.");
  }
  revalidatePath("/plants");
  redirect(`/plants/${plant.id}?saved=1`);
}

export async function updatePlantAction(id: string, formData: FormData): Promise<void> {
  const get = (key: string) => formData.get(key) as string | null;

  const values: Partial<Plant> = {
    name: (get("name") ?? "").trim() || undefined,
    latin_name: get("latin_name") || null,
    category: (get("category") || undefined) as Plant["category"] | undefined,
    subcategory: get("subcategory") || null,
    description: get("description") || null,
    photo_url: get("photo_url") || null,

    sow_indoors_start: num(get("sow_indoors_start")),
    sow_indoors_end: num(get("sow_indoors_end")),
    sow_outdoors_start: num(get("sow_outdoors_start")),
    sow_outdoors_end: num(get("sow_outdoors_end")),
    transplant_start: num(get("transplant_start")),
    transplant_end: num(get("transplant_end")),
    harvest_start: num(get("harvest_start")),
    harvest_end: num(get("harvest_end")),

    weeks_indoors_min: num(get("weeks_indoors_min")),
    weeks_indoors_max: num(get("weeks_indoors_max")),
    spacing_cm: num(get("spacing_cm")),
    row_spacing_cm: num(get("row_spacing_cm")),
    sowing_depth_cm: num(get("sowing_depth_cm")),

    sun_requirement: (get("sun_requirement") || null) as Plant["sun_requirement"],
    water_needs: (get("water_needs") || null) as Plant["water_needs"],
    soil_preference: get("soil_preference") || null,
    slug_risk: (get("slug_risk") || null) as Plant["slug_risk"],
    frost_tolerant: bool(get("frost_tolerant")),
    frost_tender: bool(get("frost_tender")),

    is_perennial: bool(get("is_perennial")),
    succession_sow: bool(get("succession_sow")),
    succession_interval_weeks: num(get("succession_interval_weeks")),

    companion_plants: parseList(get("companion_plants")),
    avoid_near: parseList(get("avoid_near")),
    common_pests: parseList(get("common_pests")),
    common_diseases: parseList(get("common_diseases")),

    notes: get("notes") || null,
    growing_tips: get("growing_tips") || null,
  };

  await updatePlant(id, values);
  revalidatePath("/plants");
  revalidatePath(`/plants/${id}`);
  redirect(`/plants/${id}?saved=1`);
}
