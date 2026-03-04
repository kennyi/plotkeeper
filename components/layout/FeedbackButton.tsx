"use client";

import { useState, useRef, useTransition } from "react";
import { usePathname } from "next/navigation";
import { createFeedbackAction } from "@/app/actions/feedback";
import { MessageSquarePlus, X } from "lucide-react";

const TYPES = [
  { value: "bug", label: "Bug" },
  { value: "suggestion", label: "Suggestion" },
  { value: "observation", label: "Observation" },
  { value: "question", label: "Question" },
] as const;

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);

  if (pathname.startsWith("/auth")) return null;

  function handleSubmit(formData: FormData) {
    formData.set("page_context", pathname);
    startTransition(async () => {
      await createFeedbackAction(formData);
      setSubmitted(true);
      formRef.current?.reset();
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
      }, 1500);
    });
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Floating button — bottom-right, above mobile nav on small screens */}
      <div className="fixed bottom-[4.5rem] right-4 md:bottom-6 md:right-6 z-50">
        {open ? (
          <div className="bg-background border rounded-xl shadow-lg w-72 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Leave feedback</p>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {submitted ? (
              <p className="text-sm text-center py-4 text-garden-700 font-medium">
                Thanks! Feedback saved.
              </p>
            ) : (
              <form ref={formRef} action={handleSubmit} className="space-y-3">
                <div className="flex gap-1.5 flex-wrap">
                  {TYPES.map((t) => (
                    <label key={t.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="feedback_type"
                        value={t.value}
                        defaultChecked={t.value === "observation"}
                        className="sr-only peer"
                      />
                      <span className="text-xs px-2.5 py-1 rounded-full border peer-checked:bg-garden-100 peer-checked:border-garden-400 peer-checked:text-garden-800 text-muted-foreground transition-colors">
                        {t.label}
                      </span>
                    </label>
                  ))}
                </div>

                <textarea
                  name="message"
                  required
                  rows={3}
                  placeholder="What's on your mind?"
                  className="w-full text-sm border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-garden-400 placeholder:text-muted-foreground"
                />

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full text-sm bg-garden-700 text-white rounded-md py-2 font-medium hover:bg-garden-800 disabled:opacity-50 transition-colors"
                >
                  {isPending ? "Saving…" : "Send feedback"}
                </button>
              </form>
            )}
          </div>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-garden-700 text-white text-xs font-medium px-3 py-2 rounded-full shadow-md hover:bg-garden-800 transition-colors"
            aria-label="Leave feedback"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span className="hidden sm:inline">Feedback</span>
          </button>
        )}
      </div>
    </>
  );
}
