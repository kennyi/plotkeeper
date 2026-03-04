"use server";

import { createFeedback } from "@/lib/supabase";

export async function createFeedbackAction(formData: FormData) {
  const message = (formData.get("message") as string | null)?.trim();
  if (!message) return;

  const feedback_type = formData.get("feedback_type") as
    | "bug"
    | "suggestion"
    | "question"
    | "observation"
    | null;
  const page_context = formData.get("page_context") as string | null;

  try {
    await createFeedback({ feedback_type, page_context, message });
  } catch (err) {
    console.error("Failed to save feedback:", err);
    // Silently fail — don't break the app for a feedback submission
  }
}
