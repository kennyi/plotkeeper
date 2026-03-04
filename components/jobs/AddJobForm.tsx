"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCustomJobAction } from "@/app/actions/jobs";
import type { MonthlyJob } from "@/types";

const CATEGORY_OPTIONS: { value: NonNullable<MonthlyJob["category"]>; label: string }[] = [
  { value: "sow_indoors", label: "Sow indoors" },
  { value: "sow_outdoors", label: "Sow outdoors" },
  { value: "plant_out", label: "Plant out" },
  { value: "harvest", label: "Harvest" },
  { value: "prune", label: "Prune" },
  { value: "feed", label: "Feed" },
  { value: "water", label: "Water" },
  { value: "protect", label: "Protect" },
  { value: "prepare", label: "Prepare" },
  { value: "maintenance", label: "Maintenance" },
  { value: "order", label: "Order" },
  { value: "compost", label: "Compost" },
  { value: "divide", label: "Divide" },
  { value: "deadhead", label: "Deadhead" },
];

interface AddJobFormProps {
  month: number;
}

export function AddJobForm({ month }: AddJobFormProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const action = async (formData: FormData) => {
    await createCustomJobAction(month, formData);
    formRef.current?.reset();
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
      >
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 3v10M3 8h10" strokeLinecap="round" />
        </svg>
        Add custom task
      </button>
    );
  }

  return (
    <form ref={formRef} action={action} className="border rounded-lg p-4 space-y-3 mt-2">
      <p className="text-sm font-medium">Add custom task</p>

      <Input name="title" required placeholder="Task description" autoFocus />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Category</label>
          <select
            name="category"
            className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">— none —</option>
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Priority</label>
          <select
            name="priority"
            defaultValue="medium"
            className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm">Add task</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
