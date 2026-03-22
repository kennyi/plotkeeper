import { KILDARE } from "./constants";

export type WeatherCondition =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "drizzle"
  | "rain"
  | "heavy-rain"
  | "thunderstorm"
  | "fog"
  | "snow";

/** Maps an Open-Meteo WMO weather code to a WeatherCondition. */
export function getWeatherCondition(code: number): WeatherCondition {
  if (code === 0) return "clear";
  if (code === 1 || code === 2) return "partly-cloudy";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "drizzle";
  if ([61, 63, 66, 67].includes(code)) return "rain";
  if (code === 65 || code === 80 || code === 81) return "heavy-rain";
  if (code === 82 || code === 95 || code === 96 || code === 99) return "thunderstorm";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  return "cloudy"; // safe fallback
}

export interface WeatherDay {
  date: string;
  tempMin: number;
  tempMax: number;
  precipitation: number;
  weatherCode: number;
}

export interface WeatherAlert {
  type: "frost" | "slug" | "blight" | "rain";
  severity: "warning" | "watch";
  message: string;
  date?: string;
}

export interface WeatherForecast {
  days: WeatherDay[];
  alerts: WeatherAlert[];
  fetchedAt: string;
}

export async function getWeatherForecast(
  lat: number = KILDARE.latitude,
  lng: number = KILDARE.longitude
): Promise<WeatherForecast> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}` +
    `&longitude=${lng}` +
    `&daily=temperature_2m_min,temperature_2m_max,precipitation_sum,weather_code` +
    `&timezone=Europe%2FDublin` +
    `&forecast_days=4`;

  const res = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

  const data = await res.json();

  if (!data?.daily?.time) throw new Error("Open-Meteo returned unexpected shape");

  const days: WeatherDay[] = (data.daily.time as string[]).map(
    (date: string, i: number) => ({
      date,
      tempMin: (data.daily.temperature_2m_min[i] as number | null) ?? 99,
      tempMax: (data.daily.temperature_2m_max[i] as number | null) ?? 99,
      precipitation: (data.daily.precipitation_sum[i] as number | null) ?? 0,
      weatherCode: (data.daily.weather_code[i] as number | null) ?? 3,
    })
  );

  const alerts = computeAlerts(days);

  return { days, alerts, fetchedAt: new Date().toISOString() };
}

function computeAlerts(days: WeatherDay[]): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const next3 = days.slice(0, 3);

  // Frost warning: min temp < 2°C in next 3 days
  const frostDays = next3.filter((d) => d.tempMin < 2);
  if (frostDays.length > 0) {
    const dates = frostDays
      .map((d) =>
        new Date(d.date).toLocaleDateString("en-IE", {
          weekday: "short",
          day: "numeric",
          month: "short",
        })
      )
      .join(", ");
    alerts.push({
      type: "frost",
      severity: frostDays.some((d) => d.tempMin < 0) ? "warning" : "watch",
      message: `Frost risk ${dates} — protect tender plants and seedlings`,
      date: frostDays[0].date,
    });
  }

  // Slug alert: rain > 3mm AND min temp > 5°C
  const slugDays = next3.filter(
    (d) => d.precipitation > 3 && d.tempMin > 5
  );
  if (slugDays.length >= 2) {
    alerts.push({
      type: "slug",
      severity: "watch",
      message: `High slug activity likely — wet and mild conditions forecast. Check traps and protect seedlings`,
    });
  }

  // Blight risk: temp 10–25°C and rain (June–September)
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 9) {
    const blightDays = next3.filter(
      (d) => d.tempMin > 10 && d.tempMax < 25 && d.precipitation > 2
    );
    if (blightDays.length >= 2) {
      alerts.push({
        type: "blight",
        severity: "watch",
        message: `Blight conditions possible — check tomatoes and potatoes for early signs`,
      });
    }
  }

  // Heavy rain warning: any day with >15mm
  const heavyRainDays = next3.filter((d) => d.precipitation >= 15);
  if (heavyRainDays.length > 0) {
    const dates = heavyRainDays
      .map((d) =>
        new Date(d.date).toLocaleDateString("en-IE", { weekday: "short", day: "numeric" })
      )
      .join(", ");
    alerts.push({
      type: "rain",
      severity: heavyRainDays.some((d) => d.precipitation >= 25) ? "warning" : "watch",
      message: `Heavy rain forecast ${dates} — delay sowing, check drainage`,
      date: heavyRainDays[0].date,
    });
  }

  return alerts;
}
