import { describe, it, expect, vi, beforeEach } from "vitest";
import { quickLogAction } from "@/app/actions/plantings";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/supabase", () => ({
  createPlanting: vi.fn(),
  updatePlantingStatus: vi.fn(),
  deletePlanting: vi.fn(),
  updatePlantingPhoto: vi.fn(),
  updatePlanting: vi.fn(),
  logTaskEvent: vi.fn().mockResolvedValue(undefined),
}));

import { revalidatePath } from "next/cache";
import { logTaskEvent } from "@/lib/supabase";

const PLANTING_ID = "planting-uuid-456";

beforeEach(() => {
  vi.clearAllMocks();
  (logTaskEvent as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
});

describe("quickLogAction", () => {
  it("calls logTaskEvent with the correct plantingId and eventType", async () => {
    await quickLogAction(PLANTING_ID, "watered", null);
    expect(logTaskEvent).toHaveBeenCalledWith({
      planting_id: PLANTING_ID,
      event_type: "watered",
      notes: null,
    });
  });

  it("passes notes through to logTaskEvent", async () => {
    await quickLogAction(PLANTING_ID, "fed", "used liquid seaweed");
    expect(logTaskEvent).toHaveBeenCalledWith({
      planting_id: PLANTING_ID,
      event_type: "fed",
      notes: "used liquid seaweed",
    });
  });

  it("revalidates /dashboard after logging", async () => {
    await quickLogAction(PLANTING_ID, "pruned", null);
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("revalidates /tasks after logging", async () => {
    await quickLogAction(PLANTING_ID, "harvested", null);
    expect(revalidatePath).toHaveBeenCalledWith("/tasks");
  });

  it("throws if logTaskEvent throws", async () => {
    (logTaskEvent as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("DB error")
    );
    await expect(
      quickLogAction(PLANTING_ID, "watered", null)
    ).rejects.toThrow("DB error");
  });
});
