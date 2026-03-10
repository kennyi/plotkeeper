"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Circle, CheckCircle, CaretRight } from "@phosphor-icons/react";
import { completeTaskAction, completeCustomTaskAction } from "@/app/actions/tasks";
import type { SmartTask, TaskUrgency } from "@/lib/tasks";
import type { CustomTask } from "@/types";

// ── SmartTaskItem ─────────────────────────────────────────────────────────────

const URGENCY_BORDER: Record<TaskUrgency, string> = {
  overdue:   "border-red-200 bg-red-50",
  due_today: "border-terracotta-200 bg-terracotta-50",
  due_soon:  "border-linen-300 bg-background",
  upcoming:  "border-linen-300 bg-background",
};

const URGENCY_BADGE: Record<TaskUrgency, string | null> = {
  overdue:   "text-red-700 bg-red-100",
  due_today: "text-terracotta-700 bg-terracotta-100",
  due_soon:  null,
  upcoming:  null,
};

const URGENCY_LABEL: Record<TaskUrgency, string | null> = {
  overdue:   "overdue",
  due_today: "today",
  due_soon:  null,
  upcoming:  null,
};

const TASK_ICONS: Record<string, string> = {
  watered:      "💧",
  fed:          "🌿",
  pruned:       "✂️",
  harvested:    "🌾",
  hardened_off: "🪴",
  transplanted: "🌱",
};

export function TaskItem({ task }: { task: SmartTask }) {
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleComplete(e: React.MouseEvent) {
    e.stopPropagation();
    setDone(true);
    startTransition(async () => {
      await completeTaskAction(task.plantingId, task.taskType);
    });
  }

  // Optimistically hide once completed
  if (done) return null;

  const badge = URGENCY_BADGE[task.urgency];
  const badgeLabel = URGENCY_LABEL[task.urgency];

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${URGENCY_BORDER[task.urgency]}`}
    >
      <button
        onClick={handleComplete}
        disabled={isPending}
        className="shrink-0 text-linen-400 hover:text-terracotta-500 transition-colors disabled:opacity-50"
        aria-label="Mark done"
      >
        <Circle size={20} />
      </button>

      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => router.push(`/beds/${task.bedId}`)}
      >
        <p className="text-sm font-medium">
          <span className="mr-1.5">{TASK_ICONS[task.taskType] ?? "📋"}</span>
          {task.label}
        </p>
        {task.subLabel && (
          <p className="text-xs text-muted-foreground mt-0.5">{task.subLabel}</p>
        )}
      </div>

      {badge && badgeLabel && (
        <span className={`shrink-0 text-xs font-medium px-1.5 py-0.5 rounded ${badge}`}>
          {badgeLabel}
        </span>
      )}

      <CaretRight size={14} className="text-muted-foreground shrink-0" />
    </div>
  );
}

// ── CustomTaskItem ────────────────────────────────────────────────────────────

export function CustomTaskItem({ task }: { task: CustomTask }) {
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleComplete(e: React.MouseEvent) {
    e.stopPropagation();
    setDone(true);
    startTransition(async () => {
      await completeCustomTaskAction(task.id);
    });
  }

  if (done) return null;

  const isOverdue =
    task.due_date && new Date(task.due_date) < new Date();

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        isOverdue ? "border-red-200 bg-red-50" : "border-linen-300 bg-background"
      }`}
    >
      <button
        onClick={handleComplete}
        disabled={isPending}
        className="shrink-0 text-linen-400 hover:text-terracotta-500 transition-colors disabled:opacity-50"
        aria-label="Mark done"
      >
        <Circle size={20} />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          <span className="mr-1.5">📋</span>
          {task.title}
        </p>
        {task.due_date && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Due{" "}
            {new Date(task.due_date).toLocaleDateString("en-IE", {
              day: "numeric",
              month: "short",
            })}
          </p>
        )}
      </div>

      {isOverdue && (
        <span className="shrink-0 text-xs font-medium px-1.5 py-0.5 rounded text-red-600 bg-red-100">
          overdue
        </span>
      )}
    </div>
  );
}
