import { Header } from "@/components/layout/Header";
import { EntryForm } from "@/components/journal/EntryForm";
import { getBeds, getPlants } from "@/lib/supabase";
import { createJournalEntryAction } from "@/app/actions/journal";

export default async function NewJournalEntryPage() {
  const [beds, plants] = await Promise.all([
    getBeds().catch(() => []),
    getPlants().catch(() => []),
  ]);

  return (
    <div>
      <Header title="New Journal Entry" description="Record a harvest, observation, or note" />
      <div className="max-w-2xl">
        <EntryForm beds={beds} plants={plants} action={createJournalEntryAction} />
      </div>
    </div>
  );
}
