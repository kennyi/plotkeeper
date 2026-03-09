"use server";

import { revalidatePath } from "next/cache";
import { logPlantingHealth } from "@/lib/supabase";
import type { HealthStatus } from "@/types";

export async function logHealthAction(
  bedId: string,
  plantingId: string,
  formData: FormData
) {
  const health_status = formData.get("health_status") as HealthStatus;
  const notes = (formData.get("notes") as string) || null;
  const photo_url = (formData.get("photo_url") as string) || null;
  const logged_at = (formData.get("logged_at") as string) || undefined;

  if (!health_status) throw new Error("health_status is required");

  await logPlantingHealth({ planting_id: plantingId, health_status, notes, photo_url, logged_at });
  revalidatePath(`/beds/${bedId}`);
  revalidatePath(`/plantings/${plantingId}`);
}
