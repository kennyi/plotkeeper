import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MONTH_NAMES, KILDARE } from "@/lib/constants";
import { getDashboardCounts, getMonthlyJobs, getSettings } from "@/lib/supabase";
import { getWeatherForecast } from "@/lib/weather";
import { WeatherAlerts } from "@/components/dashboard/WeatherAlerts";

export default async function DashboardPage() {
  const month = new Date().getMonth() + 1;
  const monthName = MONTH_NAMES[month - 1];
  const year = new Date().getFullYear();

  const [counts, jobs, settings] = await Promise.all([
    getDashboardCounts().catch(() => ({ bedCount: 0, activePlantingCount: 0, journalCount: 0 })),
    getMonthlyJobs(month).catch(() => []),
    getSettings().catch(() => ({} as Record<string, string>)),
  ]);

  const ownerName = settings.owner_name || null;
  const locationName = settings.location_name || settings.location || "Kildare";
  const lat = settings.latitude ? parseFloat(settings.latitude) : KILDARE.latitude;
  const lng = settings.longitude ? parseFloat(settings.longitude) : KILDARE.longitude;
  const profileIncomplete = !settings.owner_name || !settings.latitude;

  const weather = await getWeatherForecast(lat, lng).catch(() => null);

  const jobsDoneThisMonth = jobs.filter((j) => j.is_done && j.done_year === year).length;
  const jobsRemaining = jobs.length - jobsDoneThisMonth;
  const highPriorityJobs = jobs.filter((j) => j.priority === "high" && !(j.is_done && j.done_year === year));

  return (
    <div>
      <Header
        title={ownerName ? `Good day, ${ownerName}` : "Good day"}
        description={`${monthName} in ${locationName} — here's what's happening in your garden`}
      />

      {/* Setup prompt for new users */}
      {profileIncomplete && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-garden-200 bg-garden-50 px-4 py-3 text-sm text-garden-800">
          <p>Set your name and location in Settings to personalise your dashboard and weather.</p>
          <Link href="/settings" className="shrink-0 font-medium underline underline-offset-2 hover:text-garden-900">
            Go to Settings →
          </Link>
        </div>
      )}

      {/* Weather alerts */}
      {weather && weather.alerts.length > 0 && (
        <WeatherAlerts alerts={weather.alerts} />
      )}

      {/* Stat cards */}
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

      {/* High priority jobs this month */}
      {highPriorityJobs.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">High priority this month</h2>
            <Link href={`/jobs?month=${month}`} className="text-sm text-muted-foreground hover:underline">
              All {monthName} jobs →
            </Link>
          </div>
          <div className="space-y-2">
            {highPriorityJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                <p className="text-sm flex-1">{job.title}</p>
                {job.category && (
                  <span className="text-xs text-muted-foreground hidden sm:block">{job.category.replace(/_/g, " ")}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-day forecast strip */}
      {weather && (
        <div className="mb-8">
          <h2 className="text-base font-semibold mb-3">3-day forecast</h2>
          <div className="grid grid-cols-3 gap-3">
            {weather.days.slice(0, 3).map((day) => (
              <div key={day.date} className="border rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  {new Date(day.date).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}
                </p>
                <p className="text-sm font-medium mt-1">
                  {Math.round(day.tempMax)}° / {Math.round(day.tempMin)}°
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {day.precipitation > 0 ? `${day.precipitation.toFixed(1)}mm` : "Dry"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Local conditions */}
      <div className="p-4 rounded-lg bg-garden-50 border border-garden-200">
        <p className="text-garden-800 font-medium text-sm mb-2">{locationName} conditions</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-garden-700">
          <p>Last frost: ~{settings.last_frost_date || "April 20"}</p>
          <p>First frost: ~{settings.first_frost_date || "October 30"}</p>
          <p>Zone: {settings.hardiness_zone || "H4–H5"} (RHS)</p>
        </div>
      </div>
    </div>
  );
}
