import { Header } from "@/components/layout/Header";
import { BedForm } from "@/components/beds/BedForm";
import { createBedAction } from "@/app/actions/beds";

export default function NewBedPage() {
  return (
    <div>
      <Header title="Add a Bed" description="Describe your new bed, pot, or planter" />
      <div className="max-w-2xl">
        <BedForm action={createBedAction} submitLabel="Create bed" />
      </div>
    </div>
  );
}
