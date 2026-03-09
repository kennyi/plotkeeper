"use server";

import { revalidatePath } from "next/cache";
import {
  addPlantingPhoto,
  deletePlantingPhoto,
  updatePlantingProfilePhoto,
  addBedPhoto,
  deleteBedPhoto,
  updateBedProfilePhoto,
  uploadToStorage,
} from "@/lib/supabase";

const BUCKET = "plant-images";

// ── Planting photos ───────────────────────────────────────────────────────────

export async function uploadPlantingPhotoAction(formData: FormData): Promise<void> {
  const file = formData.get("file") as File | null;
  const plantingId = formData.get("planting_id") as string;
  const takenAt = (formData.get("taken_at") as string) || new Date().toISOString().split("T")[0];
  const plantStatus = (formData.get("plant_status") as string) || null;

  if (!file || file.size === 0) throw new Error("No file provided");
  if (!plantingId) throw new Error("No planting ID");

  const ext = file.name.split(".").pop() ?? "jpg";
  const storagePath = `plantings/${plantingId}/${Date.now()}.${ext}`;

  const photoUrl = await uploadToStorage(BUCKET, storagePath, file);

  await addPlantingPhoto({
    planting_id: plantingId,
    photo_url: photoUrl,
    storage_path: storagePath,
    taken_at: takenAt,
    plant_status: plantStatus,
  });

  await updatePlantingProfilePhoto(plantingId, photoUrl);
  revalidatePath(`/plantings/${plantingId}`);
}

export async function deletePlantingPhotoAction(
  photoId: string,
  plantingId: string,
  newProfileUrl: string | null
): Promise<void> {
  const storagePath = await deletePlantingPhoto(photoId);

  // Best-effort storage deletion — don't throw if it fails
  if (storagePath) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = createClient();
      await supabase.storage.from(BUCKET).remove([storagePath]);
    } catch {
      // Storage cleanup failure shouldn't block the response
    }
  }

  await updatePlantingProfilePhoto(plantingId, newProfileUrl);
  revalidatePath(`/plantings/${plantingId}`);
}

// ── Bed photos ────────────────────────────────────────────────────────────────

export async function uploadBedPhotoAction(formData: FormData): Promise<void> {
  const file = formData.get("file") as File | null;
  const bedId = formData.get("bed_id") as string;
  const takenAt = (formData.get("taken_at") as string) || new Date().toISOString().split("T")[0];

  if (!file || file.size === 0) throw new Error("No file provided");
  if (!bedId) throw new Error("No bed ID");

  const ext = file.name.split(".").pop() ?? "jpg";
  const storagePath = `beds/${bedId}/${Date.now()}.${ext}`;

  const photoUrl = await uploadToStorage(BUCKET, storagePath, file);

  await addBedPhoto({
    bed_id: bedId,
    photo_url: photoUrl,
    storage_path: storagePath,
    taken_at: takenAt,
  });

  await updateBedProfilePhoto(bedId, photoUrl);
  revalidatePath(`/beds/${bedId}`);
}

export async function deleteBedPhotoAction(
  photoId: string,
  bedId: string,
  newProfileUrl: string | null
): Promise<void> {
  const storagePath = await deleteBedPhoto(photoId);

  if (storagePath) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = createClient();
      await supabase.storage.from(BUCKET).remove([storagePath]);
    } catch {
      // Storage cleanup failure shouldn't block the response
    }
  }

  await updateBedProfilePhoto(bedId, newProfileUrl);
  revalidatePath(`/beds/${bedId}`);
}
