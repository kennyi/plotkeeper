"use client";

import { toggleJobDoneAction, deleteCustomJobAction } from "@/app/actions/jobs";
import type { MonthlyJob } from "@/types";

const PRIORITY_CLASSES = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-600",
};

const CATEGORY_LABELS: Record<NonNullable<MonthlyJob["category"]>, string> = {
  sow_indoors: "Sow indoors",
  sow_outdoors: "Sow outdoors",
  plant_out: "Plant out",
  harvest: "Harvest",
  prune: "Prune",
  feed: "Feed",
  water: "Water",
  protect: "Protect",
  prepare: "Prepare",
  order: "Order",
  compost: "Compost",
  maintenance: "Maintenance",
  divide: "Divide",
  deadhead: "Deadhead",
};

interface JobItemProps {
  job: MonthlyJob;
  currentYear: number;
}

export function JobItem({ job, currentYear }: JobItemProps) {
  const doneThisYear = job.is_done && job.done_year === currentYear;

  const toggle = async () => {
    await toggleJobDoneAction(job.id, !doneThisYear, job.month);
  };

  const remove = async () => {
    await deleteCustomJobAction(job.id);
  };

  return (
    <div
      className={`flex items-start gap-3 py-3 border-b last:border-b-0 group ${
        doneThisYear ? "opacity-50" : ""
      }`}
    >
      {/* Checkbox */}
      <form action={toggle} className="mt-0.5 shrink-0">
        <button
          type="submit"
          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
            doneThisYear
              ? "bg-green-500 border-green-500 text-white"
              : "border-input hover:border-green-500"
          }`}
          aria-label={doneThisYear ? "Mark undone" : "Mark done"}
        >
          {doneThisYear && (
            <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="2,6 5,9 10,3" />
            </svg>
          )}
        </button>
      </form>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${doneThisYear ? "line-through" : ""}`}>
          {job.title}
        </p>
        {job.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{job.description}</p>
        )}
        {job.notes && !job.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{job.notes}</p>
        )}
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1.5 shrink-0">
        {job.category && (
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {CATEGORY_LABELS[job.category]}
          </span>
        )}
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_CLASSES[job.priority]}`}>
          {job.priority}
        </span>
        {job.is_custom && (
          <form action={remove}>
            <button
              type="submit"
              className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity ml-1"
              aria-label="Delete custom job"
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5l.5-9" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
