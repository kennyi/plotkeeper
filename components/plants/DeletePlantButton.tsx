"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deletePlantAction } from "@/app/actions/plants";

interface DeletePlantButtonProps {
  plantId: string;
  plantName: string;
  activePlantingCount: number;
}

export function DeletePlantButton({ plantId, plantName, activePlantingCount }: DeletePlantButtonProps) {
  const [step, setStep] = useState<"idle" | "warn" | "confirm">("idle");
  const [isPending, startTransition] = useTransition();

  const hasInventory = activePlantingCount > 0;

  function handleFirstTap() {
    setStep(hasInventory ? "warn" : "confirm");
  }

  function handleConfirm() {
    startTransition(async () => {
      await deletePlantAction(plantId);
    });
  }

  if (step === "idle") {
    return (
      <div className="border-t pt-6 mt-8">
        <button
          onClick={handleFirstTap}
          className="text-sm text-muted-foreground hover:text-red-600 transition-colors"
        >
          Delete from library…
        </button>
      </div>
    );
  }

  if (step === "warn") {
    return (
      <div className="border-t pt-6 mt-8">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <p className="text-sm font-medium text-amber-900">
            {plantName} is currently in your inventory
          </p>
          <p className="text-xs text-amber-800">
            You have {activePlantingCount} active planting{activePlantingCount !== 1 ? "s" : ""} of this plant.
            Deleting it from the library will also remove those plantings and their health history.
          </p>
          <div className="flex gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStep("idle")}
            >
              Keep it
            </Button>
            <Button
              size="sm"
              onClick={() => setStep("confirm")}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              I understand — continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-6 mt-8">
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
        <p className="text-sm font-medium text-red-900">
          Delete {plantName} from the library?
        </p>
        <p className="text-xs text-red-800">
          {hasInventory
            ? "This will permanently delete the plant and all associated plantings and health logs."
            : "This can't be undone."}
        </p>
        <div className="flex gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setStep("idle")}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white border-0"
          >
            {isPending ? "Deleting…" : "Yes, delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
