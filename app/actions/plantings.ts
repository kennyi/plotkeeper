"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPlanting, updatePlantingStatus, deletePlanting, updatePlantingPhoto, updatePlanting } from "@/lib/supabase";
import type { BedPlanting } from "@/types";

export async function createPlantingAction(bedId: string, formData: FormData) {
  const raw = (key: string) => formData.get(key) as string | null;
  const num = (key: string) => {
    const v = raw(key);
    return v && v !== "" ? parseInt(v, 10) : null;
  };
  const date = (key: string) => raw(key) || null;

  const plantId = raw("plant_id") || null;
  const customName = raw("custom_plant_name") || null;

  await createPlanting({
    bed_id: bedId,
    plant_id: plantId,
    custom_plant_name: plantId ? null : customName,
    row_number: num("row_number"),
    row_label: raw("row_label") || null,
    quantity: num("quantity"),
    area_m2: null,
    seeds_started_date: date("seeds_started_date"),
    sown_outdoors_date: date("sown_outdoors_date"),
    planted_out_date: date("planted_out_date"),
    expected_harvest_date: date("expected_harvest_date"),
    actual_harvest_date: null,
    removed_date: null,
    status: (raw("status") ?? "planned") as BedPlanting["status"],
    growing_year: new Date().getFullYear(),
    plant_family: raw("plant_family") || null,
    notes: raw("notes") || null,
    photo_url: null,
    current_health: null,
  });

  revalidatePath(`/beds/${bedId}`);
  redirect(`/beds/${bedId}`);
}

export async function updatePlantingStatusAction(
  bedId: string,
  plantingId: string,
  status: BedPlanting["status"]
) {
  await updatePlantingStatus(plantingId, status);
  revalidatePath(`/beds/${bedId}`);
}

export async function deletePlantingAction(bedId: string, plantingId: string) {
  await deletePlanting(plantingId);
  revalidatePath(`/beds/${bedId}`);
}

export async function updatePlantingPhotoAction(
  bedId: string,
  plantingId: string,
  photoUrl: string
) {
  await updatePlantingPhoto(plantingId, photoUrl);
  revalidatePath(`/beds/${bedId}`);
}

export async function updatePlantingAction(
  bedId: string,
  plantingId: string,
  formData: FormData
) {
  const raw = (key: string) => formData.get(key) as string | null;
  const num = (key: string) => {
    const v = raw(key);
    return v && v !== "" ? parseInt(v, 10) : null;
  };

  await updatePlanting(plantingId, {
    status: (raw("status") ?? "planned") as BedPlanting["status"],
    notes: raw("notes") || null,
    quantity: num("quantity"),
    row_label: raw("row_label") || null,
    seeds_started_date: raw("seeds_started_date") || null,
    sown_outdoors_date: raw("sown_outdoors_date") || null,
    planted_out_date: raw("planted_out_date") || null,
    expected_harvest_date: raw("expected_harvest_date") || null,
  });

  revalidatePath(`/beds/${bedId}`);
}
