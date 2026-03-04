import { Header } from "@/components/layout/Header";
import { NewPlantForm } from "@/components/plants/NewPlantForm";

export default function NewPlantPage() {
  return (
    <div>
      <Header
        title="Add Plant"
        description="Look up a plant by name to auto-fill growing data, or fill it in manually"
      />
      <NewPlantForm />
    </div>
  );
}
