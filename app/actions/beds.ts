"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createBed, updateBed, deleteBed } from "@/lib/supabase";
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
    notes: raw("notes") || null,
    photo_url: raw("photo_url") || null,
  };
}

export async function createBedAction(formData: FormData) {
  const values = parseBedForm(formData);
  const bed = await createBed(values);
  revalidatePath("/beds");
  redirect(`/beds/${bed.id}`);
}

export async function updateBedAction(id: string, formData: FormData) {
  const values = parseBedForm(formData);
  await updateBed(id, values);
  revalidatePath("/beds");
  revalidatePath(`/beds/${id}`);
  redirect(`/beds/${id}`);
}

export async function deleteBedAction(id: string) {
  await deleteBed(id);
  revalidatePath("/beds");
  redirect("/beds");
}
