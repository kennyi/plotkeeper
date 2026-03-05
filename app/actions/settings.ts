"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { upsertSettings } from "@/lib/supabase";

export async function saveSettingsAction(formData: FormData) {
  const keys = [
    "garden_name",
    "owner_name",
    "location_name",
    "latitude",
    "longitude",
    "hardiness_zone",
    "notes",
  ];

  const settings: Record<string, string> = {};
  for (const key of keys) {
    const val = (formData.get(key) as string | null)?.trim();
    if (val !== undefined && val !== null) {
      settings[key] = val;
    }
  }

  await upsertSettings(settings);
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  redirect("/settings?saved=1");
}
