"use server";

import { revalidatePath } from "next/cache";
import {
  logTaskEvent,
  createCustomTask as dbCreateCustomTask,
  completeCustomTask as dbCompleteCustomTask,
  deleteCustomTask as dbDeleteCustomTask,
} from "@/lib/supabase";
import type { TaskEventType } from "@/types";

/** Called when the user taps the complete button on a smart task. */
export async function completeTaskAction(
  plantingId: string,
  eventType: TaskEventType,
  notes?: string
): Promise<void> {
  await logTaskEvent({
    planting_id: plantingId,
    event_type: eventType,
    notes: notes ?? null,
  });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function createCustomTaskAction(
  formData: FormData
): Promise<void> {
  const title = (formData.get("title") as string | null)?.trim();
  if (!title) return;
  const due_date = (formData.get("due_date") as string | null) || null;
  const notes = (formData.get("notes") as string | null) || null;
  await dbCreateCustomTask({ title, due_date, notes });
  revalidatePath("/tasks");
}

export async function completeCustomTaskAction(id: string): Promise<void> {
  await dbCompleteCustomTask(id);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteCustomTaskAction(id: string): Promise<void> {
  await dbDeleteCustomTask(id);
  revalidatePath("/tasks");
}
