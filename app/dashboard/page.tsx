import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MONTH_NAMES, KILDARE } from "@/lib/constants";
import {
  getDashboardCounts,
  getMonthlyJobs,
  getSettings,
  getMyPlantsForMonth,
  getBedsWithPlantingCount,
  getActivePlantings,
} from "@/lib/supabase";
import { getWeatherForecast } from "@/lib/weather";
import { WeatherAlerts } from "@/components/dashboard/WeatherAlerts";
import { BedCard } from "@/components/beds/BedCard";

export default async function DashboardPage() {
  const month = new Date().getMonth() + 1;
  const monthName = MONTH_NAMES[month - 1];
  const year = new Date().getFullYear();

  const [counts, jobs, settings, plantsThisMonth, beds, activePlantings] = await Promise.all([
    getDashboardCounts().catch(() => ({ bedCount: 0, activePlantingCount: 0, journalCount: 0 })),
    getMonthlyJobs(month).catch(() => []),
    getSettings().catch(() => ({} as Record<string, string>)),
    getMyPlantsForMonth(month).catch(() => []),
    getBedsWithPlantingCount().catch(() => []),
    getActivePlantings().catch(() => []),
  ]);

  const ownerName = settings.owner_name || null;
  const locationName = settings.location_name || settings.location || "Kildare";
  const lat = settings.latitude ? parseFloat(settings.latitude) : KILDARE.latitude;
  const lng = settings.longitude ? parseFloat(settings.longitude) : KILDARE.longitude;
  const profileIncomplete = !settings.owner_name || !settings.latitude;

  const weather = await getWeatherForecast(lat, lng).catch(() => null);

  const jobsDoneThisMonth = jobs.filter((j) => j.is_done && j.done_year === year).length;
  const jobsRemaining = jobs.length - jobsDoneThisMonth;
  const highPriorityJobs = jobs.filter(
    (j) => j.priority === "high" && !(j.is_done && j.done_year === year)
  );

  // Sow-this-month split — only user's plants
  const sowIndoors = plantsThisMonth.filter(
    (p) =>
      p.sow_indoors_start !== null &&
      month >= p.sow_indoors_start &&
      month <= (p.sow_indoors_end ?? p.sow_indoors_start)
  );
  const sowOutdoors = plantsThisMonth.filter(
    (p) =>
      p.sow_outdoors_start !== null &&
      month >= p.sow_outdoors_start &&
      month <= (p.sow_outdoors_end ?? p.sow_outdoors_start)
  );

  // Garden action reminders from active plantings + jobs
  const reminders: { text: string; href: string; icon: string }[] = [];

  // From active plantings
  for (const p of activePlantings) {
    const name = p.plant?.name ?? p.custom_plant_name ?? "plant";
    if (
      p.status === "seeds_started" &&
      p.plant?.transplant_start &&
      month >= p.plant.transplant_start &&
      month <= (p.plant.transplant_end ?? p.plant.transplant_start)
    ) {
      reminders.push({ text: `Harden off your ${name} before planting out`, href: `/beds/${p.bed_id}`, icon: "🪴" });
    }
    if (p.status === "growing" && p.plant?.harvest_start === month) {
      reminders.push({ text: `${name} may be ready to harvest`, href: `/beds/${p.bed_id}`, icon: "🌾" });
    }
    if (p.current_health === "critical") {
      reminders.push({ text: `${name} is marked critical — needs attention`, href: `/beds/${p.bed_id}`, icon: "⚠️" });
    }
  }

  // From high-priority jobs by category
  const jobReminders = highPriorityJobs.slice(0, 3);

  // Today's weather summary
  const today = weather?.days[0] ?? null;

  return (
    <div>
      <Header
        title={ownerName ? `Good day, ${ownerName}` : "Good day"}
        description={`${monthName} in ${locationName} — here's what's happening in your garden`}
      />

      {/* Setup prompt */}
      {profileIncomplete && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-garden-200 bg-garden-50 px-4 py-3 text-sm text-garden-800">
          <p>Set your name and location in Settings to personalise your dashboard and weather.</p>
          <Link href="/settings" className="shrink-0 font-medium underline underline-offset-2 hover:text-garden-900">
            Go to Settings →
          </Link>
        </div>
      )}

      {/* ── Weather — always at top ── */}
      {weather && (
        <div className="mb-8">
          {/* Forecast strip */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
            {weather.days.slice(0, 4).map((day, i) => {
              const isToday = i === 0;
              return (
                <div
                  key={day.date}
                  className={`rounded-lg p-3 text-center border ${
                    isToday ? "bg-garden-50 border-garden-200" : "bg-background"
                  }`}
                >
                  <p className="text-xs text-muted-foreground font-medium">
                    {isToday
                      ? "Today"
                      : new Date(day.date).toLocaleDateString("en-IE", {
                          weekday: "short",
                          day: "numeric",
                        })}
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    {Math.round(day.tempMax)}°<span className="text-muted-foreground font-normal">/{Math.round(day.tempMin)}°</span>
                  </p>
                  <p className={`text-xs mt-0.5 ${day.precipitation >= 5 ? "text-blue-600 font-medium" : "text-muted-foreground"}`}>
                    {day.precipitation > 0 ? `${day.precipitation.toFixed(1)}mm` : "Dry"}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Garden alerts */}
          {weather.alerts.length > 0 && <WeatherAlerts alerts={weather.alerts} />}

          {/* Zone + context */}
          <p className="text-xs text-muted-foreground">
            {locationName} · RHS Zone {settings.hardiness_zone || "H4"} · Last frost ~20 Apr · First frost ~30 Oct
          </p>
        </div>
      )}

      {/* ── Reminders ── */}
      {(reminders.length > 0 || jobReminders.length > 0) && (
        <div className="mb-8 space-y-2">
          <h2 className="text-base font-semibold mb-3">To do now</h2>
          {reminders.map((r, i) => (
            <Link
              key={i}
              href={r.href}
              className="flex items-center gap-3 p-3 rounded-lg border hover:shadow-sm transition-shadow"
            >
              <span className="text-base shrink-0">{r.icon}</span>
              <p className="text-sm flex-1">{r.text}</p>
              <span className="text-xs text-muted-foreground shrink-0">→</span>
            </Link>
          ))}
          {jobReminders.map((job) => (
            <Link
              key={job.id}
              href={`/jobs?month=${month}`}
              className="flex items-center gap-3 p-3 rounded-lg border hover:shadow-sm transition-shadow"
            >
              <span className="w-2 h-2 rounded-full bg-red-400 shrink-0 mt-0.5" />
              <p className="text-sm flex-1">{job.title}</p>
              {job.category && (
                <span className="text-xs text-muted-foreground shrink-0 capitalize hidden sm:block">
                  {job.category.replace(/_/g, " ")}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Link href="/beds">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active beds</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{counts.bedCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">garden beds tracked</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active plantings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{counts.activePlantingCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">plants in the ground</p>
          </CardContent>
        </Card>

        <Link href={`/jobs?month=${month}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{monthName} jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{jobsRemaining}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                remaining · {jobsDoneThisMonth} done
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/journal">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Journal entries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{counts.journalCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">logs recorded</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ── Sow this month (user's beds only) ── */}
      {(sowIndoors.length > 0 || sowOutdoors.length > 0) && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Sow in {monthName}</h2>
            <Link href={`/calendar?month=${month}`} className="text-sm text-muted-foreground hover:underline">
              Full calendar →
            </Link>
          </div>
          {sowIndoors.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">🌡️ Indoors</p>
              <div className="flex flex-wrap gap-2">
                {sowIndoors.map((p) => (
                  <Link
                    key={p.id}
                    href={`/plants/${p.id}`}
                    className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {sowOutdoors.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">🌱 Outdoors</p>
              <div className="flex flex-wrap gap-2">
                {sowOutdoors.map((p) => (
                  <Link
                    key={p.id}
                    href={`/plants/${p.id}`}
                    className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Beds snapshot ── */}
      {beds.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Your beds</h2>
            <Link href="/beds" className="text-sm text-muted-foreground hover:underline">
              All beds →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {beds.slice(0, 3).map((bed) => (
              <BedCard key={bed.id} bed={bed} activePlantingCount={bed.active_planting_count} />
            ))}
          </div>
        </div>
      )}

      {/* ── All jobs this month ── */}
      {highPriorityJobs.length > 3 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">More jobs this month</h2>
            <Link href={`/jobs?month=${month}`} className="text-sm text-muted-foreground hover:underline">
              All {monthName} jobs →
            </Link>
          </div>
          <div className="space-y-2">
            {highPriorityJobs.slice(3, 8).map((job) => (
              <div key={job.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                <p className="text-sm flex-1">{job.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
