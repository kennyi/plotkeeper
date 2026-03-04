import { createClient } from "@supabase/supabase-js";
import type { Plant, GardenBed, BedPlanting, MonthlyJob, GardenSetting, JournalEntry } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Plants ──────────────────────────────────────────────────────────────────

export async function getPlants(options?: {
  category?: string;
  search?: string;
  isCutFlower?: boolean;
}) {
  let query = supabase.from("plants").select("*").order("name");

  if (options?.category) {
    query = query.eq("category", options.category);
  }
  if (options?.isCutFlower) {
    query = query.eq("is_cut_flower", true);
  }
  if (options?.search) {
    query = query.ilike("name", `%${options.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Plant[];
}

export async function getPlant(id: string) {
  const { data, error } = await supabase
    .from("plants")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Plant;
}

export async function getPlantsForMonth(month: number) {
  // Returns plants active in this month across sow/transplant/harvest windows
  const { data, error } = await supabase
    .from("plants")
    .select("*")
    .or(
      `and(sow_indoors_start.lte.${month},sow_indoors_end.gte.${month}),` +
      `and(sow_outdoors_start.lte.${month},sow_outdoors_end.gte.${month}),` +
      `and(transplant_start.lte.${month},transplant_end.gte.${month}),` +
      `and(harvest_start.lte.${month},harvest_end.gte.${month})`
    )
    .order("name");

  if (error) throw error;
  return data as Plant[];
}

// ── Garden Beds ─────────────────────────────────────────────────────────────

export async function getBeds() {
  const { data, error } = await supabase
    .from("garden_beds")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data as GardenBed[];
}

export async function getBed(id: string) {
  const { data, error } = await supabase
    .from("garden_beds")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as GardenBed;
}

export async function createBed(values: Omit<GardenBed, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("garden_beds")
    .insert(values)
    .select()
    .single();

  if (error) throw error;
  return data as GardenBed;
}

export async function updateBed(id: string, values: Partial<Omit<GardenBed, "id" | "created_at" | "updated_at">>) {
  const { data, error } = await supabase
    .from("garden_beds")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as GardenBed;
}

export async function deleteBed(id: string) {
  const { error } = await supabase
    .from("garden_beds")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

// ── Bed Plantings ────────────────────────────────────────────────────────────

export async function getBedPlantings(bedId: string) {
  const { data, error } = await supabase
    .from("bed_plantings")
    .select("*, plant:plants(*)")
    .eq("bed_id", bedId)
    .order("row_number");

  if (error) throw error;
  return data as BedPlanting[];
}

export async function createPlanting(values: Omit<BedPlanting, "id" | "created_at" | "updated_at" | "plant">) {
  const { data, error } = await supabase
    .from("bed_plantings")
    .insert(values)
    .select()
    .single();

  if (error) throw error;
  return data as BedPlanting;
}

export async function updatePlantingStatus(id: string, status: BedPlanting["status"]) {
  const { error } = await supabase
    .from("bed_plantings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function deletePlanting(id: string) {
  const { error } = await supabase
    .from("bed_plantings")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ── Monthly Jobs ─────────────────────────────────────────────────────────────

export async function getMonthlyJobs(month: number) {
  const { data, error } = await supabase
    .from("monthly_jobs")
    .select("*")
    .eq("month", month)
    .order("priority");

  if (error) throw error;
  return data as MonthlyJob[];
}

// ── Garden Settings ───────────────────────────────────────────────────────────

export async function getSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from("garden_settings")
    .select("setting_key, setting_value");

  if (error) throw error;

  return Object.fromEntries(
    (data as Pick<GardenSetting, "setting_key" | "setting_value">[]).map((s) => [
      s.setting_key,
      s.setting_value ?? "",
    ])
  );
}
