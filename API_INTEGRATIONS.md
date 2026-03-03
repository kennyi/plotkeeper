# PlotKeeper — API Integrations

## Phase 1–2: No External APIs Required

The app in Phase 1–2 is entirely self-contained. All plant data and calendar logic is pre-seeded into the Supabase database. No external API calls are needed to ship a useful, working app.

---

## Phase 3: Open-Meteo Weather API

### Why Open-Meteo?
- Completely free, no API key required
- Excellent coverage of Ireland
- Provides hourly and daily forecasts
- Returns frost risk, rainfall, and temperature data
- No rate limits for reasonable personal use

### Base URL
```
https://api.open-meteo.com/v1/forecast
```

### Kildare Coordinates
```
Latitude:  53.1581
Longitude: -6.9108
```

### Recommended API Call (daily forecast)

```typescript
// lib/weather.ts
const KILDARE_LAT = 53.1581;
const KILDARE_LNG = -6.9108;

export async function getWeatherForecast() {
  const params = new URLSearchParams({
    latitude: KILDARE_LAT.toString(),
    longitude: KILDARE_LNG.toString(),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'precipitation_probability_max',
      'weathercode'
    ].join(','),
    timezone: 'Europe/Dublin',
    forecast_days: '7'
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    { next: { revalidate: 3600 } }  // Cache for 1 hour
  );

  return response.json();
}
```

### Alert Logic

**Frost Warning:**
```typescript
// Trigger if min temperature forecast is below 2°C within next 3 days
// (2°C buffer because ground frosts can occur above 0°C air temperature)
const frostWarning = forecast.daily.temperature_2m_min
  .slice(0, 3)
  .some((temp: number) => temp <= 2);
```

**Slug Activity Alert:**
```typescript
// Slugs are most active after warm rain (>2mm) when temp is above 5°C
const slugAlert = forecast.daily.precipitation_sum
  .slice(0, 2)
  .some((rain: number, i: number) =>
    rain >= 2 && forecast.daily.temperature_2m_min[i] > 5
  );
```

### API Route

Create a server-side proxy route to avoid CORS issues and cache responses:

```typescript
// app/api/weather/route.ts
import { getWeatherForecast } from '@/lib/weather';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await getWeatherForecast();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Weather unavailable' }, { status: 500 });
  }
}
```

### Weather Code Reference (WMO codes)

Key codes for garden context:
| Code | Meaning | Garden relevance |
|---|---|---|
| 0 | Clear sky | Good planting day |
| 1–3 | Mainly clear to overcast | Normal |
| 51–67 | Drizzle/Rain | Slug risk |
| 71–77 | Snow/sleet | Frost protect |
| 80–82 | Rain showers | Slug risk |
| 95–99 | Thunderstorm | Stay inside |

---

## Phase 4: Google Calendar Sync

### Overview
Allow the monthly jobs and planting reminders to be exported to Google Calendar.

### Approach: iCal Export (simpler, no OAuth needed)
Rather than the full Google Calendar API (which requires OAuth), consider generating an `.ics` file that the user can import into Google Calendar manually or subscribe to via URL.

```typescript
// Generate iCal file from monthly jobs
// app/api/calendar/export/route.ts
// Returns an .ics file with all upcoming jobs as calendar events
```

### If Full Google Calendar API Is Needed Later

**OAuth flow required:**
- Scopes: `https://www.googleapis.com/auth/calendar`
- Credentials: Google Cloud Console → Create OAuth 2.0 client
- Redirect URI: `https://your-vercel-url.com/api/auth/google/callback`

Note: Since there's no auth in the app, Google OAuth would be a standalone flow just for calendar access. This adds complexity — the iCal export approach is recommended first.

---

## Future Integrations (Not Planned Yet)

| Integration | Purpose | Notes |
|---|---|---|
| Metéireann (Met Éireann) API | Irish national weather service | More Ireland-specific, but complex to use |
| RHS Plant Finder | Extended plant database | Could supplement seed data |
| Seed company APIs | Order reminders | Very niche, probably manual links |
