"use client";

import { useRef, useState, useTransition } from "react";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCustomTaskAction } from "@/app/actions/tasks";

export function AddCustomTaskForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createCustomTaskAction(formData);
      formRef.current?.reset();
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
      >
        <Plus size={16} />
        Add a one-off task
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="space-y-3 rounded-xl border border-linen-300 p-4 bg-linen-100"
    >
      <Input
        name="title"
        placeholder="What needs doing?"
        required
        autoFocus
        className="bg-white"
      />
      <div className="flex gap-2 items-center">
        <Input
          name="due_date"
          type="date"
          className="bg-white w-auto flex-none text-sm"
          title="Optional due date"
        />
        <span className="text-xs text-muted-foreground">optional due date</span>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Adding…" : "Add task"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
