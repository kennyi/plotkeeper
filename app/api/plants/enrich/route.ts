import { NextResponse } from "next/server";
import type { Plant } from "@/types";

const SYSTEM_PROMPT = `You are a horticultural expert specialising in temperate Atlantic climates (Ireland, UK, western Europe).

Given a plant name, return growing information as a JSON object. Calibrate all timing for Ireland/Kildare:
- Last frost approximately April 20
- First frost approximately October 30
- Growing season May–October for tender crops outdoors
- Mild, wet climate; high slug pressure

Fields to populate where known (omit fields you are not confident about):
- latin_name (string)
- category: one of "vegetable" | "flower" | "herb" | "fruit" | "perennial" | "annual" | "bulb" | "shrub" | "biennial"
- subcategory (string, e.g. "brassica", "allium", "rose")
- description (1–2 sentence description)
- sow_indoors_start, sow_indoors_end (month numbers 1–12, or omit if not applicable)
- sow_outdoors_start, sow_outdoors_end (month numbers 1–12, or omit if not applicable)
- transplant_start, transplant_end (month numbers 1–12, or omit if not applicable)
- harvest_start, harvest_end (month numbers 1–12, or omit if not applicable)
- weeks_indoors_min, weeks_indoors_max (integer weeks)
- germination_days_min, germination_days_max (integer days)
- germination_temp_min, germination_temp_max (°C)
- spacing_cm (integer)
- row_spacing_cm (integer)
- height_cm_min, height_cm_max (integer)
- sun_requirement: "full_sun" | "partial_shade" | "full_shade"
- water_needs: "low" | "medium" | "high"
- soil_preference (string, e.g. "well-drained, fertile")
- hardiness_zone: RHS H-scale e.g. "H4" or "H5"
- frost_tolerant (boolean)
- frost_tender (boolean)
- slug_risk: "low" | "medium" | "high"
- is_perennial (boolean)
- is_cut_flower (boolean)
- succession_sow (boolean — true if staggered sowing is recommended)
- succession_interval_weeks (integer, if succession_sow is true)
- companion_plants (array of common names, e.g. ["Basil", "Marigold"])
- avoid_near (array of common names)
- common_pests (array, e.g. ["Aphids", "Slugs"])
- common_diseases (array, e.g. ["Powdery mildew"])
- growing_tips (1–3 sentences of practical advice for an Irish gardener)
- notes (any additional Ireland-specific notes)

Return ONLY the JSON object. No markdown, no explanation, no code fences.`;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 503 }
    );
  }

  let name: string;
  try {
    const body = await request.json();
    name = (body.name ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!name) {
    return NextResponse.json({ error: "Plant name is required" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Plant name: ${name}` },
        ],
        temperature: 0.2,
        max_tokens: 1200,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI error:", err);
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 502 }
      );
    }

    const json = await res.json();
    const content: string = json.choices?.[0]?.message?.content ?? "{}";

    let plantData: Partial<Plant>;
    try {
      plantData = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      return NextResponse.json(
        { error: "Could not parse AI response" },
        { status: 502 }
      );
    }

    // Always set the name from the user's input (AI may reformat it)
    plantData.name = name;

    return NextResponse.json(plantData);
  } catch (err) {
    console.error("Enrich route error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
