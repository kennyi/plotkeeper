"use client";

import { WeatherForecast, WeatherCondition, getWeatherCondition } from "@/lib/weather";

// ── Condition helpers ──────────────────────────────────────────────────────

const CONDITION_LABELS: Record<WeatherCondition, string> = {
  "clear":        "Clear",
  "partly-cloudy":"Partly Cloudy",
  "cloudy":       "Cloudy",
  "drizzle":      "Drizzle",
  "rain":         "Rainy",
  "heavy-rain":   "Heavy Rain",
  "thunderstorm": "Thunderstorm",
  "fog":          "Foggy",
  "snow":         "Snow",
};

/** Background tint class for the Today card based on condition. */
function todayBgClass(condition: WeatherCondition): string {
  if (condition === "clear" || condition === "partly-cloudy") return "bg-linen-100 border-linen-400";
  if (condition === "cloudy" || condition === "fog")          return "bg-stone-100 border-stone-300";
  if (condition === "rain" || condition === "heavy-rain" || condition === "thunderstorm")
                                                              return "bg-blue-50 border-blue-200";
  if (condition === "snow")                                   return "bg-stone-50 border-stone-200";
  return "bg-linen-100 border-linen-400"; // drizzle / fallback
}

// ── Rain particles ─────────────────────────────────────────────────────────

function RainParticles({ heavy = false }: { heavy?: boolean }) {
  const count = heavy ? 16 : 10;
  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 w-px bg-blue-300 rounded-full animate-rain-fall"
          style={{
            left:             `${(i / count) * 100 + (i * 37) % 6}%`,
            height:           `${heavy ? 14 : 10}px`,
            animationDuration:`${heavy ? 0.6 + (i % 4) * 0.1 : 0.9 + (i % 5) * 0.15}s`,
            animationDelay:   `${(i * 0.12) % 0.9}s`,
            opacity:          heavy ? 0.5 : 0.35,
          }}
        />
      ))}
    </div>
  );
}

// ── Cloud shapes ───────────────────────────────────────────────────────────

function CloudDrift() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none" aria-hidden>
      {[
        { top: "20%", left: "10%", w: 48, delay: "0s" },
        { top: "55%", left: "55%", w: 36, delay: "3s" },
        { top: "10%", left: "65%", w: 28, delay: "5s" },
      ].map((c, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-stone-200 animate-cloud-drift"
          style={{
            top:              c.top,
            left:             c.left,
            width:            `${c.w}px`,
            height:           `${Math.round(c.w * 0.4)}px`,
            animationDelay:   c.delay,
            opacity:          0.4,
          }}
        />
      ))}
    </div>
  );
}

// ── Snow particles ─────────────────────────────────────────────────────────

function SnowParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 rounded-full bg-stone-300 animate-snow-fall"
          style={{
            left:             `${(i / 12) * 100}%`,
            width:            `${3 + (i % 3)}px`,
            height:           `${3 + (i % 3)}px`,
            animationDuration:`${2 + (i % 4) * 0.5}s`,
            animationDelay:   `${(i * 0.2) % 2}s`,
            opacity:          0.6,
          }}
        />
      ))}
    </div>
  );
}

// ── Glow overlay ───────────────────────────────────────────────────────────

function GlowOverlay() {
  return (
    <div
      className="absolute inset-0 rounded-xl pointer-events-none animate-glow-pulse"
      style={{ background: "radial-gradient(ellipse at 30% 40%, rgba(251,191,36,0.18) 0%, transparent 70%)" }}
      aria-hidden
    />
  );
}

// ── Animation overlay picker ───────────────────────────────────────────────

function WeatherOverlay({ condition }: { condition: WeatherCondition }) {
  switch (condition) {
    case "clear":        return <GlowOverlay />;
    case "partly-cloudy":return <CloudDrift />;
    case "drizzle":
    case "rain":         return <RainParticles />;
    case "heavy-rain":
    case "thunderstorm": return <RainParticles heavy />;
    case "snow":         return <SnowParticles />;
    case "fog":
      return (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none bg-stone-200 animate-fog-shimmer"
          aria-hidden
        />
      );
    default:             return null; // cloudy — stillness is the signal
  }
}

// ── Props ──────────────────────────────────────────────────────────────────

interface WeatherCardProps {
  weather: WeatherForecast;
  locationName: string;
  hardinessZone?: string;
  lastFrost?: string;
  firstFrost?: string;
}

// ── Component ──────────────────────────────────────────────────────────────

export function WeatherCard({
  weather,
  locationName,
  hardinessZone,
  lastFrost,
  firstFrost,
}: WeatherCardProps) {
  const todayCondition = getWeatherCondition(weather.days[0]?.weatherCode ?? 0);
  const todayBg = todayBgClass(todayCondition);

  // Build frost/zone context line — omit segments with no value
  const contextParts: string[] = [locationName];
  if (hardinessZone)  contextParts.push(`RHS Zone ${hardinessZone}`);
  if (lastFrost)      contextParts.push(`Last frost ~${lastFrost}`);
  if (firstFrost)     contextParts.push(`First frost ~${firstFrost}`);
  const contextLine = contextParts.join(" · ");

  return (
    <div className="mb-8">
      {/* Forecast strip */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
        {weather.days.slice(0, 4).map((day, i) => {
          const isToday = i === 0;
          const condition = getWeatherCondition(day.weatherCode);

          return (
            <div
              key={day.date}
              className={`relative rounded-xl border overflow-hidden ${
                isToday
                  ? `${todayBg} shadow-warm px-4 py-4`
                  : "bg-card border-linen-300 px-3 py-3"
              } text-center`}
            >
              {/* Ambient animation — Today card only */}
              {isToday && <WeatherOverlay condition={todayCondition} />}

              <p className={`relative text-xs font-medium text-muted-foreground ${isToday ? "mb-1" : ""}`}>
                {isToday
                  ? "Today"
                  : new Date(day.date).toLocaleDateString("en-IE", {
                      weekday: "short",
                      day: "numeric",
                    })}
              </p>

              {/* Condition label — Today only */}
              {isToday && (
                <p className="relative text-xs text-muted-foreground mb-1">
                  {CONDITION_LABELS[condition]}
                </p>
              )}

              <p className={`relative font-semibold mt-1 ${isToday ? "text-base" : "text-sm"}`}>
                {Math.round(day.tempMax)}°
                <span className="text-muted-foreground font-normal">
                  /{Math.round(day.tempMin)}°
                </span>
              </p>
              <p
                className={`relative text-xs mt-0.5 ${
                  day.precipitation >= 5 ? "text-blue-600 font-medium" : "text-muted-foreground"
                }`}
              >
                {day.precipitation > 0 ? `${day.precipitation.toFixed(1)}mm` : "Dry"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Context line */}
      <p className="text-xs text-muted-foreground">{contextLine}</p>
    </div>
  );
}
