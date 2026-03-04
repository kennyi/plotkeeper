import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BedForm } from "@/components/beds/BedForm";
import { getBed } from "@/lib/supabase";
import { updateBedAction } from "@/app/actions/beds";

interface EditBedPageProps {
  params: { id: string };
}

export default async function EditBedPage({ params }: EditBedPageProps) {
  let bed;
  try {
    bed = await getBed(params.id);
  } catch {
    notFound();
  }

  const action = updateBedAction.bind(null, params.id);

  return (
    <div>
      <Header title={`Edit: ${bed.name}`} description="Update bed details" />
      <div className="max-w-2xl">
        <BedForm action={action} defaultValues={bed} submitLabel="Save changes" />
      </div>
    </div>
  );
}
