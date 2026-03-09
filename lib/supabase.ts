import { createClient } from "@/lib/supabase/server";
import type {
  Plant,
  GardenBed,
  BedPlanting,
  MonthlyJob,
  GardenSetting,
  JournalEntry,
  AppFeedback,
  PlantingHealthLog,
  HealthStatus,
} from "@/types";

// ── Auth helper ──────────────────────────────────────────────────────────────

async function getUserId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

// ── Plants ───────────────────────────────────────────────────────────────────

export async function getPlants(options?: {
  category?: string;
  search?: string;
  isCutFlower?: boolean;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? null;

  // Show pre-seeded plants (is_user_created=false) + only this user's own additions
  let query = supabase
    .from("plants")
    .select("*")
    .or(userId
      ? `is_user_created.eq.false,created_by.eq.${userId}`
      : `is_user_created.eq.false`
    )
    .order("name");

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
  const supabase = createClient();
  const { data, error } = await supabase
    .from("plants")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Plant;
}

export async function createPlant(
  values: Omit<Plant, "id" | "is_user_created" | "created_by" | "created_at">
): Promise<Plant> {
  const supabase = createClient();
  const user_id = await getUserId();
  const { data, error } = await supabase
    .from("plants")
    .insert({ ...values, is_user_created: true, created_by: user_id })
    .select()
    .single();
  if (error) throw error;
  return data as Plant;
}

export async function updatePlant(
  id: string,
  values: Partial<Omit<Plant, "id" | "created_at">>
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("plants").update(values).eq("id", id);
  if (error) throw error;
}

/**
 * Returns plants active this month that the user actually has in their beds.
 * Used on the dashboard so we don't show every plant in the library.
 */
/**
 * Returns plants the user has in their beds (any active status).
 * Used on the plant library "My plants" tab.
 */
export async function getMyPlants(options?: { search?: string; category?: string }): Promise<Plant[]> {
  const supabase = createClient();

  const { data: plantings, error: pErr } = await supabase
    .from("bed_plantings")
    .select("plant_id")
    .not("plant_id", "is", null)
    .neq("status", "failed");
  if (pErr) throw pErr;

  const allIds = (plantings ?? []).map((p: { plant_id: string }) => p.plant_id);
  const plantIds = allIds.filter((id, i) => allIds.indexOf(id) === i);
  if (plantIds.length === 0) return [];

  let query = supabase.from("plants").select("*").in("id", plantIds).order("name");
  if (options?.category) query = query.eq("category", options.category);
  if (options?.search) query = query.ilike("name", `%${options.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data as Plant[];
}

export async function getMyPlantsForMonth(month: number): Promise<Plant[]> {
  const supabase = createClient();

  // Get plant_ids from user's active plantings
  const { data: plantings, error: pErr } = await supabase
    .from("bed_plantings")
    .select("plant_id")
    .in("status", ["planned", "seeds_started", "germinating", "growing", "ready"])
    .not("plant_id", "is", null);
  if (pErr) throw pErr;

  const allIds = (plantings ?? []).map((p: { plant_id: string }) => p.plant_id);
  const plantIds = allIds.filter((id, i) => allIds.indexOf(id) === i);
  if (plantIds.length === 0) return [];

  const { data, error } = await supabase
    .from("plants")
    .select("*")
    .in("id", plantIds)
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

export async function getPlantsForMonth(month: number, category?: string) {
  const supabase = createClient();
  let query = supabase
    .from("plants")
    .select("*")
    .or(
      `and(sow_indoors_start.lte.${month},sow_indoors_end.gte.${month}),` +
        `and(sow_outdoors_start.lte.${month},sow_outdoors_end.gte.${month}),` +
        `and(transplant_start.lte.${month},transplant_end.gte.${month}),` +
        `and(harvest_start.lte.${month},harvest_end.gte.${month})`
    )
    .order("name");

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Plant[];
}

// ── Garden Beds ──────────────────────────────────────────────────────────────

export async function getBeds() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("garden_beds")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data as GardenBed[];
}

/**
 * Returns ALL active beds with planting count + statuses array.
 * Used on the /beds overview page. No row limit.
 */
export async function getBedsOverview(): Promise<
  (GardenBed & { active_planting_count: number; planting_statuses: string[] })[]
> {
  const supabase = createClient();
  const { data: beds, error: bedError } = await supabase
    .from("garden_beds")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (bedError) throw bedError;

  const { data: plantings, error: pError } = await supabase
    .from("bed_plantings")
    .select("bed_id, status")
    .in("status", ["planned", "seeds_started", "germinating", "growing", "ready"]);
  if (pError) throw pError;

  const countByBed: Record<string, number> = {};
  const statusesByBed: Record<string, string[]> = {};
  for (const p of plantings ?? []) {
    countByBed[p.bed_id] = (countByBed[p.bed_id] ?? 0) + 1;
    if (!statusesByBed[p.bed_id]) statusesByBed[p.bed_id] = [];
    statusesByBed[p.bed_id].push(p.status);
  }

  return (beds as GardenBed[]).map((b) => ({
    ...b,
    active_planting_count: countByBed[b.id] ?? 0,
    planting_statuses: statusesByBed[b.id] ?? [],
  }));
}

/** Returns active beds with a count of their active plantings, for the dashboard snapshot. */
export async function getBedsWithPlantingCount(): Promise<(GardenBed & { active_planting_count: number })[]> {
  const supabase = createClient();
  const { data: beds, error: bedError } = await supabase
    .from("garden_beds")
    .select("*")
    .eq("is_active", true)
    .order("name")
    .limit(6);
  if (bedError) throw bedError;

  const { data: plantings, error: pError } = await supabase
    .from("bed_plantings")
    .select("bed_id, status")
    .in("status", ["planned", "seeds_started", "germinating", "growing", "ready"]);
  if (pError) throw pError;

  const countByBed: Record<string, number> = {};
  for (const p of plantings ?? []) {
    countByBed[p.bed_id] = (countByBed[p.bed_id] ?? 0) + 1;
  }

  return (beds as GardenBed[]).map((b) => ({
    ...b,
    active_planting_count: countByBed[b.id] ?? 0,
  }));
}

/** Returns active plantings (with plant join) for reminder logic. */
export async function getActivePlantings(): Promise<BedPlanting[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bed_plantings")
    .select("*, plant:plants(*)")
    .in("status", ["seeds_started", "growing", "ready"])
    .order("created_at");
  if (error) throw error;
  return data as BedPlanting[];
}

/** Returns ALL plantings regardless of status — for the inventory plants view. */
export async function getAllPlantings(): Promise<BedPlanting[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bed_plantings")
    .select("*, plant:plants(*)")
    .order("created_at");
  if (error) throw error;
  return data as BedPlanting[];
}

/** Fetches a single planting with plant and bed joins. */
export async function getPlanting(id: string): Promise<BedPlanting & { bed: GardenBed | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bed_plantings")
    .select("*, plant:plants(*), bed:garden_beds(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as BedPlanting & { bed: GardenBed | null };
}

export async function getBed(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("garden_beds")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as GardenBed;
}

export async function createBed(
  values: Omit<GardenBed, "id" | "user_id" | "created_at" | "updated_at">
) {
  const supabase = createClient();
  const user_id = await getUserId();
  const { data, error } = await supabase
    .from("garden_beds")
    .insert({ ...values, user_id })
    .select()
    .single();

  if (error) throw error;
  return data as GardenBed;
}

export async function updateBed(
  id: string,
  values: Partial<Omit<GardenBed, "id" | "created_at" | "updated_at">>
) {
  const supabase = createClient();
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
  const supabase = createClient();
  const { error } = await supabase
    .from("garden_beds")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

// ── Bed Plantings ────────────────────────────────────────────────────────────

export async function getBedPlantings(bedId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bed_plantings")
    .select("*, plant:plants(*)")
    .eq("bed_id", bedId)
    .order("row_number");

  if (error) throw error;
  return data as BedPlanting[];
}

export async function createPlanting(
  values: Omit<BedPlanting, "id" | "created_at" | "updated_at" | "plant">
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bed_plantings")
    .insert(values)
    .select()
    .single();

  if (error) throw error;
  return data as BedPlanting;
}

export async function updatePlantingStatus(
  id: string,
  status: BedPlanting["status"]
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("bed_plantings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function deletePlanting(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("bed_plantings")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function updatePlanting(
  id: string,
  values: Partial<Pick<BedPlanting,
    "status" | "notes" | "quantity" | "row_label" |
    "seeds_started_date" | "sown_outdoors_date" | "planted_out_date" | "expected_harvest_date"
  >>
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("bed_plantings")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function updatePlantingPhoto(id: string, photoUrl: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("bed_plantings")
    .update({ photo_url: photoUrl || null, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

// ── Monthly Jobs ─────────────────────────────────────────────────────────────

export async function getMonthlyJobs(month: number) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("monthly_jobs")
    .select("*")
    .eq("month", month)
    .order("priority");

  if (error) throw error;
  return data as MonthlyJob[];
}

export async function toggleJobDone(
  id: string,
  isDone: boolean,
  year: number
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("monthly_jobs")
    .update({
      is_done: isDone,
      done_year: isDone ? year : null,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function createCustomJob(
  values: Pick<MonthlyJob, "month" | "title" | "category" | "priority" | "notes">
) {
  const supabase = createClient();
  const user_id = await getUserId();
  const { data, error } = await supabase
    .from("monthly_jobs")
    .insert({ ...values, user_id, is_done: false, is_custom: true })
    .select()
    .single();

  if (error) throw error;
  return data as MonthlyJob;
}

export async function deleteCustomJob(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("monthly_jobs")
    .delete()
    .eq("id", id)
    .eq("is_custom", true); // safety: only delete custom jobs

  if (error) throw error;
}

/** Deletes any job (custom or built-in) by id. */
export async function deleteJob(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("monthly_jobs").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Returns jobs for a given month filtered to categories relevant to the
 * user's current inventory (plant_category matches a category of plants in
 * user's beds), plus jobs with no plant_category and custom jobs.
 */
export async function getInventoryJobs(month: number): Promise<MonthlyJob[]> {
  const supabase = createClient();

  // Get distinct plant categories from active bed plantings
  const { data: plantings } = await supabase
    .from("bed_plantings")
    .select("plant_id, plants(category)")
    .neq("status", "failed")
    .neq("status", "finished");

  const rawCategories = (plantings ?? []).map((p: { plants: { category: string }[] | { category: string } | null }) => {
    const plant = Array.isArray(p.plants) ? p.plants[0] : p.plants;
    return plant?.category as string | undefined;
  });
  const seen = new Set<string>();
  rawCategories.forEach((c) => { if (c) seen.add(c); });
  const categories = Array.from(seen);

  // Fetch jobs for the month
  const { data, error } = await supabase
    .from("monthly_jobs")
    .select("*")
    .eq("month", month)
    .order("priority");

  if (error) throw error;
  const all = data as MonthlyJob[];

  if (categories.length === 0) return all;

  // Keep: null plant_category | matching plant_category | custom jobs
  return all.filter(
    (j) => j.is_custom || j.plant_category === null || categories.includes(j.plant_category)
  );
}

export async function updateCustomJob(
  id: string,
  values: Partial<Pick<MonthlyJob, "title" | "category" | "priority" | "notes">>
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("monthly_jobs")
    .update(values)
    .eq("id", id)
    .eq("is_custom", true); // safety: only update custom jobs

  if (error) throw error;
}

// ── Journal ──────────────────────────────────────────────────────────────────

export async function getJournalEntries(limit = 50) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*, bed:garden_beds(id, name), plant:plants(id, name)")
    .order("entry_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as (JournalEntry & {
    bed?: { id: string; name: string } | null;
    plant?: { id: string; name: string } | null;
  })[];
}

export async function createJournalEntry(
  values: Omit<JournalEntry, "id" | "user_id" | "created_at">
) {
  const supabase = createClient();
  const user_id = await getUserId();
  const { data, error } = await supabase
    .from("journal_entries")
    .insert({ ...values, user_id })
    .select()
    .single();

  if (error) throw error;
  return data as JournalEntry;
}

export async function deleteJournalEntry(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ── Dashboard counts ─────────────────────────────────────────────────────────

export async function getDashboardCounts() {
  const supabase = createClient();
  const [beds, plantings, journalEntries] = await Promise.all([
    supabase
      .from("garden_beds")
      .select("id", { count: "exact" })
      .eq("is_active", true),
    supabase
      .from("bed_plantings")
      .select("id, status", { count: "exact" })
      .not("status", "in", '("finished","failed")'),
    supabase.from("journal_entries").select("id", { count: "exact" }),
  ]);

  return {
    bedCount: beds.count ?? 0,
    activePlantingCount: plantings.count ?? 0,
    journalCount: journalEntries.count ?? 0,
  };
}

// ── Garden Settings ───────────────────────────────────────────────────────────

export async function getSettings(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("garden_settings")
    .select("setting_key, setting_value");

  if (error) throw error;

  return Object.fromEntries(
    (
      data as Pick<GardenSetting, "setting_key" | "setting_value">[]
    ).map((s) => [s.setting_key, s.setting_value ?? ""])
  );
}

export async function upsertSettings(settings: Record<string, string>) {
  const supabase = createClient();
  const user_id = await getUserId();
  const rows = Object.entries(settings).map(([setting_key, setting_value]) => ({
    user_id,
    setting_key,
    setting_value,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("garden_settings")
    .upsert(rows, { onConflict: "user_id,setting_key" });

  if (error) throw error;
}

// ── App Feedback ──────────────────────────────────────────────────────────────

export async function createFeedback(
  values: Pick<AppFeedback, "feedback_type" | "page_context" | "message">
) {
  const supabase = createClient();
  const user_id = await getUserId();
  const { error } = await supabase.from("app_feedback").insert({ ...values, user_id });

  if (error) throw error;
}

// ── Health Logs ───────────────────────────────────────────────────────────────

export async function logPlantingHealth(values: {
  planting_id: string;
  health_status: HealthStatus;
  notes?: string | null;
  photo_url?: string | null;
  logged_at?: string;
}) {
  const supabase = createClient();
  const user_id = await getUserId();

  // Log entry
  const { error: logError } = await supabase
    .from("planting_health_logs")
    .insert({ ...values, user_id });
  if (logError) throw logError;

  // Update snapshot on the planting row
  const { error: snapError } = await supabase
    .from("bed_plantings")
    .update({ current_health: values.health_status, updated_at: new Date().toISOString() })
    .eq("id", values.planting_id);
  if (snapError) throw snapError;
}

export async function getHealthLogs(plantingId: string): Promise<PlantingHealthLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("planting_health_logs")
    .select("*")
    .eq("planting_id", plantingId)
    .order("logged_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data as PlantingHealthLog[];
}
