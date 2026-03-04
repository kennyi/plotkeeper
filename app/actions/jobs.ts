"use server";

import { revalidatePath } from "next/cache";
import { toggleJobDone, createCustomJob, deleteCustomJob } from "@/lib/supabase";
import type { MonthlyJob } from "@/types";

export async function toggleJobDoneAction(
  id: string,
  isDone: boolean,
  month: number
) {
  const year = new Date().getFullYear();
  await toggleJobDone(id, isDone, year);
  revalidatePath(`/jobs`);
}

export async function createCustomJobAction(month: number, formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  if (!title) return;

  await createCustomJob({
    month,
    title,
    category: (formData.get("category") as MonthlyJob["category"]) || null,
    priority: (formData.get("priority") as MonthlyJob["priority"]) || "medium",
    notes: (formData.get("notes") as string)?.trim() || null,
  });

  revalidatePath(`/jobs`);
}

export async function deleteCustomJobAction(id: string) {
  await deleteCustomJob(id);
  revalidatePath(`/jobs`);
}
