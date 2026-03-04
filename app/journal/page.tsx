import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { getJournalEntries } from "@/lib/supabase";
import { EntryCard } from "@/components/journal/EntryCard";
import type { JournalEntry } from "@/types";

// Group entries by date label
function groupByDate(entries: Awaited<ReturnType<typeof getJournalEntries>>) {
  const groups: Map<string, typeof entries> = new Map();
  for (const entry of entries) {
    const key = entry.entry_date;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(entry);
  }
  return groups;
}

function formatGroupDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" });
}

export default async function JournalPage() {
  const entries = await getJournalEntries().catch(() => []);
  const groups = groupByDate(entries);

  return (
    <div>
      <Header
        title="Garden Journal"
        description="Harvests, observations, problems, and notes"
        action={
          <Button asChild size="sm">
            <Link href="/journal/new">Add entry</Link>
          </Button>
        }
      />

      {entries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-base">No journal entries yet.</p>
          <p className="text-sm mt-1">Log your first harvest, observation, or note.</p>
          <Button asChild className="mt-4" size="sm">
            <Link href="/journal/new">Add first entry</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(groups.entries()).map(([date, dayEntries]) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {formatGroupDate(date)}
              </h2>
              <div className="space-y-3">
                {dayEntries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
