import { Header } from "@/components/layout/Header";
import { NewPlantForm } from "@/components/plants/NewPlantForm";

export default function NewPlantPage() {
  const aiEnabled = !!process.env.OPENAI_API_KEY;
  return (
    <div>
      <Header
        title="Add Plant"
        description="Fill in growing data manually, or use AI lookup to pre-fill the form"
      />
      <NewPlantForm aiEnabled={aiEnabled} />
    </div>
  );
}
