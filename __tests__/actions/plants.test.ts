import { describe, it, expect, vi, beforeEach } from "vitest";
import { updatePlantAction } from "@/app/actions/plants";

// ── Mocks ─────────────────────────────────────────────────────────────────────
// These three modules don't exist outside the Next.js runtime.

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ forkOrUpdatePlant: vi.fn(), createPlant: vi.fn(), deletePlant: vi.fn() }));

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { forkOrUpdatePlant } from "@/lib/supabase";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fd(fields: Record<string, string>): FormData {
  const form = new FormData();
  for (const [key, val] of Object.entries(fields)) form.append(key, val);
  return form;
}

const PLANT_ID = "plant-uuid-123";

beforeEach(() => {
  vi.clearAllMocks();
  // Default: in-place update (no fork created)
  (forkOrUpdatePlant as ReturnType<typeof vi.fn>).mockResolvedValue({ plant: { id: PLANT_ID }, wasForked: false });
});

// ── Core behaviour ─────────────────────────────────────────────────────────────

describe("updatePlantAction — core behaviour", () => {
  it("calls forkOrUpdatePlant with the plant id", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.any(Object));
  });

  it("revalidates /plants and /plants/:id", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato" }));
    expect(revalidatePath).toHaveBeenCalledWith("/plants");
    expect(revalidatePath).toHaveBeenCalledWith(`/plants/${PLANT_ID}`);
  });

  it("redirects to /plants/:id?saved=1", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato" }));
    expect(redirect).toHaveBeenCalledWith(`/plants/${PLANT_ID}?saved=1`);
  });
});

// ── Basic text fields ──────────────────────────────────────────────────────────

describe("updatePlantAction — text fields", () => {
  it("passes name trimmed", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "  Courgette  " }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ name: "Courgette" }));
  });

  it("passes latin_name", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Courgette", latin_name: "Cucurbita pepo" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ latin_name: "Cucurbita pepo" }));
  });

  it("passes null for empty optional text fields", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", latin_name: "" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ latin_name: null }));
  });

  it("passes description", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", description: "A fruiting vine." }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ description: "A fruiting vine." }));
  });

  it("passes soil_preference", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", soil_preference: "Well-drained" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ soil_preference: "Well-drained" }));
  });
});

// ── Numeric fields — previously present ───────────────────────────────────────

describe("updatePlantAction — numeric fields (previously present)", () => {
  it("passes sow_indoors_start and sow_indoors_end", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", sow_indoors_start: "2", sow_indoors_end: "4" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ sow_indoors_start: 2, sow_indoors_end: 4 }));
  });

  it("passes harvest_start and harvest_end", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", harvest_start: "7", harvest_end: "10" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ harvest_start: 7, harvest_end: 10 }));
  });

  it("passes spacing_cm and row_spacing_cm", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", spacing_cm: "45", row_spacing_cm: "60" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ spacing_cm: 45, row_spacing_cm: 60 }));
  });

  it("passes weeks_indoors_min and weeks_indoors_max", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", weeks_indoors_min: "6", weeks_indoors_max: "8" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ weeks_indoors_min: 6, weeks_indoors_max: 8 }));
  });

  it("passes succession_interval_weeks", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Lettuce", succession_interval_weeks: "3" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ succession_interval_weeks: 3 }));
  });
});

// ── Numeric fields — the 15 that were missing ─────────────────────────────────

describe("updatePlantAction — previously missing numeric fields", () => {
  it("passes hardening_off_days", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", hardening_off_days: "7" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ hardening_off_days: 7 }));
  });

  it("passes germination_days_min and germination_days_max", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", germination_days_min: "7", germination_days_max: "14" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ germination_days_min: 7, germination_days_max: 14 }));
  });

  it("passes germination_temp_min and germination_temp_max", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", germination_temp_min: "18", germination_temp_max: "25" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ germination_temp_min: 18, germination_temp_max: 25 }));
  });

  it("passes height_cm_min and height_cm_max", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Sunflower", height_cm_min: "150", height_cm_max: "300" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ height_cm_min: 150, height_cm_max: 300 }));
  });

  it("passes lifespan_years", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Lavender", lifespan_years: "10" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ lifespan_years: 10 }));
  });

  it("passes prune_month", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Lavender", prune_month: "3" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ prune_month: 3 }));
  });

  it("passes divide_month", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Hosta", divide_month: "9" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ divide_month: 9 }));
  });

  it("passes vase_life_days", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Sweet Pea", vase_life_days: "5" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ vase_life_days: 5 }));
  });

  it("passes feeding_frequency_days", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", feeding_frequency_days: "14" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ feeding_frequency_days: 14 }));
  });

  it("passes pruning_frequency_days", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Rose", pruning_frequency_days: "30" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ pruning_frequency_days: 30 }));
  });

  it("passes hardiness_zone", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Lavender", hardiness_zone: "H4" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ hardiness_zone: "H4" }));
  });

  it("passes null for hardiness_zone when empty", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Lavender", hardiness_zone: "" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ hardiness_zone: null }));
  });
});

// ── Boolean fields — previously missing ───────────────────────────────────────

describe("updatePlantAction — previously missing boolean field: is_cut_flower", () => {
  it("passes is_cut_flower as true when checkbox is 'on'", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Sweet Pea", is_cut_flower: "on" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ is_cut_flower: true }));
  });

  it("passes is_cut_flower as false when checkbox is absent", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Carrot" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ is_cut_flower: false }));
  });
});

// ── Boolean fields — previously present ───────────────────────────────────────

describe("updatePlantAction — boolean fields (previously present)", () => {
  it("passes frost_tolerant as true when 'on'", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Kale", frost_tolerant: "on" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ frost_tolerant: true }));
  });

  it("passes frost_tolerant as false when absent", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Basil" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ frost_tolerant: false }));
  });

  it("passes frost_tender as true when 'on'", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Basil", frost_tender: "on" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ frost_tender: true }));
  });

  it("passes is_perennial as true when 'on'", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Lavender", is_perennial: "on" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ is_perennial: true }));
  });

  it("passes succession_sow as true when 'on'", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Lettuce", succession_sow: "on" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ succession_sow: true }));
  });
});

// ── num() coercion ─────────────────────────────────────────────────────────────

describe("updatePlantAction — num() coercion", () => {
  it("coerces a valid integer string to a number", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", spacing_cm: "30" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ spacing_cm: 30 }));
  });

  it("coerces a valid decimal string to a number", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", sowing_depth_cm: "0.5" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ sowing_depth_cm: 0.5 }));
  });

  it("returns null for an empty string", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", spacing_cm: "" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ spacing_cm: null }));
  });

  it("returns null for a non-numeric string", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", spacing_cm: "abc" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ spacing_cm: null }));
  });

  it("returns null for a whitespace-only string", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", spacing_cm: "   " }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ spacing_cm: null }));
  });
});

// ── parseList() coercion ──────────────────────────────────────────────────────

describe("updatePlantAction — parseList() coercion", () => {
  it("parses a comma-separated string into an array", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", companion_plants: "Basil, Marigold, Carrot" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ companion_plants: ["Basil", "Marigold", "Carrot"] }));
  });

  it("trims whitespace from each item", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", avoid_near: "  Fennel ,  Brassica  " }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ avoid_near: ["Fennel", "Brassica"] }));
  });

  it("returns null for an empty string", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", companion_plants: "" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ companion_plants: null }));
  });

  it("returns null for a whitespace-only string", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", common_pests: "   " }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ common_pests: null }));
  });

  it("passes all four list fields: companion_plants, avoid_near, common_pests, common_diseases", async () => {
    await updatePlantAction(PLANT_ID, fd({
      name: "Tomato",
      companion_plants: "Basil",
      avoid_near: "Fennel",
      common_pests: "Aphids",
      common_diseases: "Blight",
    }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({
      companion_plants: ["Basil"],
      avoid_near: ["Fennel"],
      common_pests: ["Aphids"],
      common_diseases: ["Blight"],
    }));
  });
});

// ── Enum / select fields ───────────────────────────────────────────────────────

describe("updatePlantAction — enum fields", () => {
  it("passes sun_requirement", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", sun_requirement: "full_sun" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ sun_requirement: "full_sun" }));
  });

  it("passes null for empty sun_requirement", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", sun_requirement: "" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ sun_requirement: null }));
  });

  it("passes water_needs", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Tomato", water_needs: "medium" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ water_needs: "medium" }));
  });

  it("passes slug_risk", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Hosta", slug_risk: "high" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ slug_risk: "high" }));
  });

  it("passes category", async () => {
    await updatePlantAction(PLANT_ID, fd({ name: "Lavender", category: "perennial" }));
    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, expect.objectContaining({ category: "perennial" }));
  });
});

// ── Full round-trip — all fields together ─────────────────────────────────────

describe("updatePlantAction — full field set", () => {
  it("passes all fields correctly in a single call", async () => {
    await updatePlantAction(PLANT_ID, fd({
      name: "Tomato",
      latin_name: "Solanum lycopersicum",
      category: "vegetable",
      subcategory: "Solanaceae",
      description: "Classic summer crop.",
      photo_url: "https://example.com/tomato.jpg",
      sow_indoors_start: "2", sow_indoors_end: "3",
      sow_outdoors_start: "5", sow_outdoors_end: "5",
      transplant_start: "5",  transplant_end: "6",
      harvest_start: "7",     harvest_end: "10",
      weeks_indoors_min: "6", weeks_indoors_max: "8",
      hardening_off_days: "7",
      germination_days_min: "7",  germination_days_max: "14",
      germination_temp_min: "18", germination_temp_max: "25",
      spacing_cm: "45",
      row_spacing_cm: "60",
      sowing_depth_cm: "0.5",
      height_cm_min: "60", height_cm_max: "180",
      sun_requirement: "full_sun",
      water_needs: "medium",
      soil_preference: "Well-drained, fertile",
      hardiness_zone: "H3",
      slug_risk: "medium",
      frost_tolerant: "on",
      frost_tender: "on",
      is_perennial: "",
      lifespan_years: "2",
      prune_month: "3",
      divide_month: "9",
      is_cut_flower: "on",
      vase_life_days: "7",
      succession_sow: "on",
      succession_interval_weeks: "3",
      companion_plants: "Basil, Marigold",
      avoid_near: "Fennel",
      common_pests: "Aphids, Whitefly",
      common_diseases: "Blight, Mildew",
      feeding_frequency_days: "14",
      pruning_frequency_days: "21",
      notes: "Pinch out side shoots.",
      growing_tips: "Water consistently to avoid blossom end rot.",
    }));

    expect(forkOrUpdatePlant).toHaveBeenCalledWith(PLANT_ID, {
      name: "Tomato",
      latin_name: "Solanum lycopersicum",
      category: "vegetable",
      subcategory: "Solanaceae",
      description: "Classic summer crop.",
      photo_url: "https://example.com/tomato.jpg",
      sow_indoors_start: 2,  sow_indoors_end: 3,
      sow_outdoors_start: 5, sow_outdoors_end: 5,
      transplant_start: 5,   transplant_end: 6,
      harvest_start: 7,      harvest_end: 10,
      weeks_indoors_min: 6,  weeks_indoors_max: 8,
      hardening_off_days: 7,
      germination_days_min: 7,  germination_days_max: 14,
      germination_temp_min: 18, germination_temp_max: 25,
      spacing_cm: 45,
      row_spacing_cm: 60,
      sowing_depth_cm: 0.5,
      height_cm_min: 60, height_cm_max: 180,
      sun_requirement: "full_sun",
      water_needs: "medium",
      soil_preference: "Well-drained, fertile",
      hardiness_zone: "H3",
      slug_risk: "medium",
      frost_tolerant: true,
      frost_tender: true,
      is_perennial: false,
      lifespan_years: 2,
      prune_month: 3,
      divide_month: 9,
      is_cut_flower: true,
      vase_life_days: 7,
      succession_sow: true,
      succession_interval_weeks: 3,
      companion_plants: ["Basil", "Marigold"],
      avoid_near: ["Fennel"],
      common_pests: ["Aphids", "Whitefly"],
      common_diseases: ["Blight", "Mildew"],
      feeding_frequency_days: 14,
      pruning_frequency_days: 21,
      notes: "Pinch out side shoots.",
      growing_tips: "Water consistently to avoid blossom end rot.",
    });
  });
});
