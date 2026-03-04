"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createJournalEntry, deleteJournalEntry } from "@/lib/supabase";
import type { JournalEntry } from "@/types";

export async function createJournalEntryAction(formData: FormData) {
  const raw = (key: string) => (formData.get(key) as string | null)?.trim() || null;
  const num = (key: string) => {
    const v = formData.get(key) as string | null;
    return v && v !== "" ? parseFloat(v) : null;
  };

  await createJournalEntry({
    entry_date: (raw("entry_date") ?? new Date().toISOString().slice(0, 10))!,
    entry_type: (raw("entry_type") as JournalEntry["entry_type"]) ?? null,
    bed_id: raw("bed_id"),
    plant_id: raw("plant_id"),
    title: raw("title"),
    notes: (raw("notes") ?? "")!,
    quantity_value: num("quantity_value"),
    quantity_unit: raw("quantity_unit"),
    symptoms: raw("symptoms"),
    diagnosis: raw("diagnosis"),
    treatment: raw("treatment"),
  });

  revalidatePath("/journal");
  revalidatePath("/dashboard");
  redirect("/journal");
}

export async function deleteJournalEntryAction(id: string) {
  await deleteJournalEntry(id);
  revalidatePath("/journal");
  revalidatePath("/dashboard");
}
