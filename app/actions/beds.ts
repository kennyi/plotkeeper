"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createBed, updateBed, deleteBed, getBedPlantings } from "@/lib/supabase";
import type { GardenBed } from "@/types";

type BedFormValues = Omit<GardenBed, "id" | "user_id" | "created_at" | "updated_at">;

function parseBedForm(formData: FormData): BedFormValues {
  const raw = (key: string) => formData.get(key) as string | null;
  const num = (key: string) => {
    const v = raw(key);
    return v && v !== "" ? parseFloat(v) : null;
  };

  return {
    name: (raw("name") ?? "").trim(),
    bed_type: (raw("bed_type") ?? "raised_bed") as GardenBed["bed_type"],
    length_m: num("length_m"),
    width_m: num("width_m"),
    depth_m: num("depth_m"),
    location_label: raw("location_label") || null,
    sun_exposure: (raw("sun_exposure") || null) as GardenBed["sun_exposure"],
    wind_exposure: (raw("wind_exposure") || null) as GardenBed["wind_exposure"],
    soil_type: raw("soil_type") || null,
    section: raw("section") || null,
    grid_x: null,
    grid_y: null,
    is_active: true,
    is_indoor: raw("is_indoor") === "true",
    notes: raw("notes") || null,
    photo_url: raw("photo_url") || null,
  };
}

export async function createBedAction(formData: FormData) {
  const values = parseBedForm(formData);
  const bed = await createBed(values);
  revalidatePath("/beds");
  redirect(`/beds/${bed.id}?saved=1`);
}

export async function updateBedAction(id: string, formData: FormData) {
  const { length_m: _l, width_m: _w, depth_m: _d, ...values } = parseBedForm(formData);
  await updateBed(id, values);
  revalidatePath("/beds");
  revalidatePath(`/beds/${id}`);
  redirect(`/beds/${id}?saved=1`);
}

export async function deleteBedAction(id: string) {
  await deleteBed(id);
  revalidatePath("/beds");
  redirect("/beds");
}

export async function getBedPlantingsForSheetAction(bedId: string) {
  const plantings = await getBedPlantings(bedId);
  return plantings.map((p) => ({
    id: p.id,
    slot_number: p.row_number,
    custom_plant_name: p.custom_plant_name,
    status: p.status,
    plant: p.plant ? { id: p.plant.id, name: p.plant.name } : null,
  }));
}
