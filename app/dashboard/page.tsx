import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MONTH_NAMES, KILDARE } from "@/lib/constants";
import {
  getDashboardCounts,
  getSettings,
  getMyPlantsForMonth,
  getBedsWithPlantingCount,
  getActivePlantingsWithBeds,
  getTaskEvents,
  getCustomTasks,
} from "@/lib/supabase";
import { generateSmartTasks, buildLastEventMap } from "@/lib/tasks";
import { getWeatherForecast } from "@/lib/weather";
import { WeatherAlerts } from "@/components/dashboard/WeatherAlerts";
import { BedCard } from "@/components/beds/BedCard";
import { TaskItem, CustomTaskItem } from "@/components/tasks/TaskItem";

export default async function DashboardPage() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const monthName = MONTH_NAMES[month - 1];

  const [counts, settings, plantsThisMonth, beds, plantings, customTasks] =
    await Promise.all([
      getDashboardCounts().catch(() => ({
        bedCount: 0,
        activePlantingCount: 0,
        journalCount: 0,
      })),
      getSettings().catch(() => ({} as Record<string, string>)),
      getMyPlantsForMonth(month).catch(() => []),
      getBedsWithPlantingCount().catch(() => []),
      getActivePlantingsWithBeds().catch(() => []),
      getCustomTasks().catch(() => []),
    ]);

  const plantingIds = plantings.map((p) => p.id);
  const events = await getTaskEvents(plantingIds).catch(() => []);
  const lastEventMap = buildLastEventMap(events);
  const allSmartTasks = generateSmartTasks(plantings, lastEventMap, today);
  // Dashboard shows top 5 overdue / due-today tasks with one-tap completion
  const dashTasks = allSmartTasks
    .filter((t) => t.urgency === "overdue" || t.urgency === "due_today")
    .slice(0, 5);
  const totalTaskCount =
    allSmartTasks.filter((t) => t.urgency !== "upcoming").length +
    customTasks.length;

  const ownerName = settings.owner_name || null;
  const locationName = settings.location_name || settings.location || "Kildare";
  const lat = settings.latitude ? parseFloat(settings.latitude) : KILDARE.latitude;
  const lng = settings.longitude ? parseFloat(settings.longitude) : KILDARE.longitude;
  const profileIncomplete = !settings.owner_name || !settings.latitude;

  const weather = await getWeatherForecast(lat, lng).catch(() => null);

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

      {/* ── To do today ── */}
      {(dashTasks.length > 0 || customTasks.length > 0) && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">To do today</h2>
            <Link href="/tasks" className="text-sm text-muted-foreground hover:underline">
              All tasks →
            </Link>
          </div>
          <div className="space-y-2">
            {dashTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
            {customTasks.slice(0, Math.max(0, 5 - dashTasks.length)).map((task) => (
              <CustomTaskItem key={task.id} task={task} />
            ))}
          </div>
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

        <Link href="/beds?view=plants">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active plantings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{counts.activePlantingCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">plants in the ground</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tasks">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalTaskCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">need attention</p>
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
              <BedCard key={bed.id} bed={bed} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
