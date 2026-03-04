import { NextResponse } from "next/server";
import { getWeatherForecast } from "@/lib/weather";

export const revalidate = 3600; // 1 hour

export async function GET() {
  try {
    const forecast = await getWeatherForecast();
    return NextResponse.json(forecast);
  } catch (err) {
    console.error("Weather fetch failed:", err);
    return NextResponse.json({ error: "Weather unavailable" }, { status: 503 });
  }
}
