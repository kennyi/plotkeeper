import Link from "next/link";
import { Header } from "@/components/layout/Header";
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
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { WeatherAlerts } from "@/components/dashboard/WeatherAlerts";
import { QuickLogWidget } from "@/components/dashboard/QuickLogWidget";
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

  const ownerName    = settings.owner_name || null;
  const locationName = settings.location_name || settings.location || "Kildare";
  const lat = settings.latitude  ? parseFloat(settings.latitude)  : KILDARE.latitude;
  const lng = settings.longitude ? parseFloat(settings.longitude) : KILDARE.longitude;
  const profileIncomplete = !settings.owner_name || !settings.latitude;

  const hardinessZone = settings.hardiness_zone || undefined;
  const lastFrost     = settings.last_frost_approx  || undefined;
  const firstFrost    = settings.first_frost_approx || undefined;

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
        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-linen-300 bg-linen-100 px-4 py-3 text-sm text-foreground">
          <p>Set your name and location in Settings to personalise your dashboard and weather.</p>
          <Link href="/settings" className="shrink-0 font-medium underline underline-offset-2 hover:text-terracotta-600">
            Go to Settings →
          </Link>
        </div>
      )}

      {/* ── 1. Weather ── */}
      {weather && (
        <>
          <WeatherCard
            weather={weather}
            locationName={locationName}
            hardinessZone={hardinessZone}
            lastFrost={lastFrost}
            firstFrost={firstFrost}
          />
          {weather.alerts.length > 0 && (
            <div className="mb-8 -mt-4">
              <WeatherAlerts alerts={weather.alerts} />
            </div>
          )}
        </>
      )}

      {/* ── 2. To do today ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-base font-semibold">To do today</h2>
          <Link href="/tasks" className="text-sm text-muted-foreground hover:underline">
            All tasks →
          </Link>
        </div>
        {dashTasks.length === 0 && customTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-3">
            Nothing pressing today. Enjoy the garden.
          </p>
        ) : (
          <div className="space-y-2">
            {dashTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
            {customTasks.slice(0, Math.max(0, 5 - dashTasks.length)).map((task) => (
              <CustomTaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* ── 3. Quick log + compact stat pills ── */}
      <div className="mb-8">
        {/* Compact stat pills — replaces the old 4-card grid */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href="/beds"
            className="text-xs px-3 py-1 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-garden-300 transition-colors"
          >
            {counts.bedCount} beds
          </Link>
          <Link
            href="/beds?view=plants"
            className="text-xs px-3 py-1 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-garden-300 transition-colors"
          >
            {counts.activePlantingCount} plantings
          </Link>
          <Link
            href="/tasks"
            className="text-xs px-3 py-1 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-garden-300 transition-colors"
          >
            {totalTaskCount} tasks
          </Link>
          <Link
            href="/journal"
            className="text-xs px-3 py-1 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-garden-300 transition-colors"
          >
            {counts.journalCount} journal entries
          </Link>
        </div>

        <QuickLogWidget plantings={plantings} lastEventMap={lastEventMap} />
      </div>

      {/* ── 4. Sow this month ── */}
      {(sowIndoors.length > 0 || sowOutdoors.length > 0) && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-base font-semibold">Sow in {monthName}</h2>
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
                    className="text-xs px-3 py-1 rounded-full bg-terracotta-100 text-terracotta-700 hover:bg-terracotta-200 transition-colors"
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
                    className="text-xs px-3 py-1 rounded-full bg-garden-100 text-garden-700 hover:bg-garden-200 transition-colors"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 5. Beds snapshot ── */}
      {beds.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-base font-semibold">Your beds</h2>
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
