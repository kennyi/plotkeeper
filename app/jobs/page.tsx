import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { getMonthlyJobs, getInventoryJobs } from "@/lib/supabase";
import { JobItem } from "@/components/jobs/JobItem";
import { AddJobForm } from "@/components/jobs/AddJobForm";
import { MONTH_NAMES } from "@/lib/constants";
import type { MonthlyJob } from "@/types";

const PRIORITY_ORDER: Record<MonthlyJob["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

interface JobsPageProps {
  searchParams: { month?: string; all?: string };
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-based

  const month = Math.min(12, Math.max(1, parseInt(searchParams.month ?? String(currentMonth), 10)));
  const prevMonth = month === 1 ? 12 : month - 1;
  const nextMonth = month === 12 ? 1 : month + 1;
  // Default: inventory-anchored. Pass ?all=1 to see every seeded job.
  const inventoryOnly = searchParams.all !== "1";

  const jobs = await (inventoryOnly ? getInventoryJobs(month) : getMonthlyJobs(month)).catch(() => []);

  // Sort: priority order, then built-in before custom
  const sorted = [...jobs].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority];
    const pb = PRIORITY_ORDER[b.priority];
    if (pa !== pb) return pa - pb;
    return Number(a.is_custom) - Number(b.is_custom);
  });

  const doneCount = sorted.filter(
    (j) => j.is_done && j.done_year === currentYear
  ).length;

  const isCurrentMonth = month === currentMonth;

  return (
    <div>
      <Header
        title="Monthly Jobs"
        description="Gardening tasks for each month in Kildare"
      />

      {/* Inventory / All toggle */}
      <div className="flex rounded-xl border border-linen-300 overflow-hidden text-sm mb-5 w-fit bg-linen-100">
        <Link
          href={`/jobs?month=${month}`}
          className={`px-4 py-1.5 transition-colors font-medium ${inventoryOnly ? "bg-terracotta-500 text-white" : "text-muted-foreground hover:bg-linen-200"}`}
        >
          My inventory
        </Link>
        <Link
          href={`/jobs?month=${month}&all=1`}
          className={`px-4 py-1.5 transition-colors font-medium ${!inventoryOnly ? "bg-terracotta-500 text-white" : "text-muted-foreground hover:bg-linen-200"}`}
        >
          All jobs
        </Link>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/jobs?month=${prevMonth}${!inventoryOnly ? "&all=1" : ""}`}>← {MONTH_NAMES[prevMonth - 1]}</Link>
        </Button>

        <div className="text-center">
          <h2 className="font-serif text-xl font-semibold">
            {MONTH_NAMES[month - 1]}
            {isCurrentMonth && (
              <span className="ml-2 text-xs font-normal text-muted-foreground bg-linen-200 border border-linen-300 px-2 py-0.5 rounded-full">
                current
              </span>
            )}
          </h2>
          {sorted.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {doneCount}/{sorted.length} done this year
            </p>
          )}
        </div>

        <Button asChild variant="ghost" size="sm">
          <Link href={`/jobs?month=${nextMonth}${!inventoryOnly ? "&all=1" : ""}`}>{MONTH_NAMES[nextMonth - 1]} →</Link>
        </Button>
      </div>

      {/* Quick month picker */}
      <div className="flex flex-wrap gap-1 mb-6">
        {MONTH_NAMES.map((name, i) => {
          const m = i + 1;
          return (
            <Link
              key={m}
              href={`/jobs?month=${m}${!inventoryOnly ? "&all=1" : ""}`}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                m === month
                  ? "bg-terracotta-500 text-white font-medium"
                  : m === currentMonth
                  ? "bg-linen-200 text-stone-700 font-medium border border-linen-300"
                  : "text-muted-foreground hover:text-foreground hover:bg-linen-100"
              }`}
            >
              {name.slice(0, 3)}
            </Link>
          );
        })}
      </div>

      {/* Jobs list */}
      {sorted.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-sm">
          {inventoryOnly
            ? `No jobs this month for your current inventory. `
            : `No tasks for ${MONTH_NAMES[month - 1]}.`}
          {inventoryOnly && (
            <Link href={`/jobs?month=${month}&all=1`} className="underline">
              Show all jobs
            </Link>
          )}
        </div>
      ) : (
        <div>
          {sorted.map((job) => (
            <JobItem key={job.id} job={job} currentYear={currentYear} />
          ))}
        </div>
      )}

      {/* Add custom job */}
      <div className="mt-4 pt-4 border-t">
        <AddJobForm month={month} />
      </div>
    </div>
  );
}
