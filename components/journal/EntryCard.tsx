"use client";

import Link from "next/link";
import { deleteJournalEntryAction } from "@/app/actions/journal";
import type { JournalEntry } from "@/types";

type EntryWithRefs = JournalEntry & {
  bed?: { id: string; name: string } | null;
  plant?: { id: string; name: string } | null;
};

const TYPE_CONFIG: Record<
  NonNullable<JournalEntry["entry_type"]>,
  { label: string; classes: string }
> = {
  harvest: { label: "Harvest", classes: "bg-amber-100 text-amber-700" },
  observation: { label: "Observation", classes: "bg-blue-100 text-blue-700" },
  problem: { label: "Problem", classes: "bg-red-100 text-red-700" },
  note: { label: "Note", classes: "bg-slate-100 text-slate-600" },
  weather: { label: "Weather", classes: "bg-sky-100 text-sky-700" },
  purchase: { label: "Purchase", classes: "bg-purple-100 text-purple-700" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface EntryCardProps {
  entry: EntryWithRefs;
}

export function EntryCard({ entry }: EntryCardProps) {
  const typeConfig = entry.entry_type ? TYPE_CONFIG[entry.entry_type] : null;

  const remove = async () => {
    await deleteJournalEntryAction(entry.id);
  };

  return (
    <div className="border rounded-lg p-4 space-y-2 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">{formatDate(entry.entry_date)}</span>
          {typeConfig && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeConfig.classes}`}>
              {typeConfig.label}
            </span>
          )}
          {entry.bed && (
            <Link
              href={`/beds/${entry.bed.id}`}
              className="text-xs text-muted-foreground hover:underline"
            >
              {entry.bed.name}
            </Link>
          )}
          {entry.plant && (
            <Link
              href={`/plants/${entry.plant.id}`}
              className="text-xs text-muted-foreground hover:underline"
            >
              {entry.plant.name}
            </Link>
          )}
        </div>
        <form action={remove}>
          <button
            type="submit"
            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            aria-label="Delete entry"
          >
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5l.5-9" />
            </svg>
          </button>
        </form>
      </div>

      {/* Title */}
      {entry.title && <p className="font-medium text-sm">{entry.title}</p>}

      {/* Harvest quantity */}
      {entry.entry_type === "harvest" && entry.quantity_value && (
        <p className="text-sm text-amber-700 font-medium">
          {entry.quantity_value} {entry.quantity_unit ?? ""}
        </p>
      )}

      {/* Main notes */}
      {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}

      {/* Problem fields */}
      {entry.entry_type === "problem" && (entry.symptoms || entry.diagnosis || entry.treatment) && (
        <div className="text-xs space-y-1 pt-1 border-t">
          {entry.symptoms && <p><span className="font-medium">Symptoms:</span> {entry.symptoms}</p>}
          {entry.diagnosis && <p><span className="font-medium">Diagnosis:</span> {entry.diagnosis}</p>}
          {entry.treatment && <p><span className="font-medium">Treatment:</span> {entry.treatment}</p>}
        </div>
      )}
    </div>
  );
}
