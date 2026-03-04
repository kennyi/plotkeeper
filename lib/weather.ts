import { KILDARE } from "./constants";

export interface WeatherDay {
  date: string;
  tempMin: number;
  tempMax: number;
  precipitation: number;
}

export interface WeatherAlert {
  type: "frost" | "slug" | "blight";
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
    `&daily=temperature_2m_min,temperature_2m_max,precipitation_sum` +
    `&timezone=Europe%2FDublin` +
    `&forecast_days=4`;

  const res = await fetch(url, {
    next: { revalidate: 3600 }, // cache 1 hour
  });

  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

  const data = await res.json();

  const days: WeatherDay[] = (data.daily.time as string[]).map(
    (date: string, i: number) => ({
      date,
      tempMin: data.daily.temperature_2m_min[i] as number,
      tempMax: data.daily.temperature_2m_max[i] as number,
      precipitation: data.daily.precipitation_sum[i] as number,
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

  return alerts;
}
