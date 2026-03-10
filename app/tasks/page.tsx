import Link from "next/link";
import { Header } from "@/components/layout/Header";
import {
  getActivePlantingsWithBeds,
  getTaskEvents,
  getCustomTasks,
  getMyPlantsForMonth,
} from "@/lib/supabase";
import { generateSmartTasks, buildLastEventMap } from "@/lib/tasks";
import { TaskItem, CustomTaskItem } from "@/components/tasks/TaskItem";
import { AddCustomTaskForm } from "@/components/tasks/AddCustomTaskForm";
import { MONTH_NAMES } from "@/lib/constants";

export default async function TasksPage() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const monthName = MONTH_NAMES[month - 1];

  const [plantings, customTasks, plantsThisMonth] = await Promise.all([
    getActivePlantingsWithBeds().catch(() => []),
    getCustomTasks().catch(() => []),
    getMyPlantsForMonth(month).catch(() => []),
  ]);

  // Scope task events to only active plantings to keep query tight
  const plantingIds = plantings.map((p) => p.id);
  const events = await getTaskEvents(plantingIds).catch(() => []);

  const lastEventMap = buildLastEventMap(events);
  const smartTasks = generateSmartTasks(plantings, lastEventMap, today);

  const dueTasks = smartTasks.filter((t) => t.urgency !== "upcoming");
  const upcomingTasks = smartTasks.filter((t) => t.urgency === "upcoming");
  const hasDue = dueTasks.length > 0 || customTasks.length > 0;

  // This Month: sowing / transplant / harvest windows from the user's collection
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
  const transplantWindow = plantsThisMonth.filter(
    (p) =>
      p.transplant_start !== null &&
      month >= p.transplant_start &&
      month <= (p.transplant_end ?? p.transplant_start)
  );
  const harvestWindow = plantsThisMonth.filter(
    (p) =>
      p.harvest_start !== null &&
      month >= p.harvest_start &&
      month <= (p.harvest_end ?? p.harvest_start)
  );
  const hasThisMonth =
    sowIndoors.length > 0 ||
    sowOutdoors.length > 0 ||
    transplantWindow.length > 0 ||
    harvestWindow.length > 0;

  const hasAnything = hasDue || upcomingTasks.length > 0 || hasThisMonth;

  return (
    <div>
      <Header
        title="Tasks"
        description="What your garden needs — based on what you're growing"
      />

      {/* Empty state when no plantings at all */}
      {!hasAnything && (
        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-6 py-16 text-center mb-8">
          <p className="text-base font-medium text-stone-600">
            Nothing to do yet
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            Add plants to your beds and the app will generate reminders
            automatically.
          </p>
          <Link
            href="/beds"
            className="inline-block mt-4 text-sm font-medium text-garden-700 hover:underline"
          >
            Go to inventory →
          </Link>
        </div>
      )}

      {/* ── Due Now ── */}
      {hasDue && (
        <div className="mb-8">
          <h2 className="text-base font-semibold mb-3">Due now</h2>
          <div className="space-y-2">
            {dueTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
            {customTasks.map((task) => (
              <CustomTaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* All caught up banner */}
      {hasAnything && !hasDue && (
        <div className="mb-8 rounded-lg border border-garden-200 bg-garden-50 px-4 py-3 text-sm text-garden-800 text-center">
          All caught up — nothing due right now.
        </div>
      )}

      {/* ── Coming up ── */}
      {upcomingTasks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold mb-3">Coming up</h2>
          <div className="space-y-2">
            {upcomingTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* ── This Month ── */}
      {hasThisMonth && (
        <div className="mb-8">
          <h2 className="text-base font-semibold mb-1">
            {monthName} — your garden calendar
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Windows for plants you&apos;re growing right now
          </p>

          <div className="space-y-4">
            {sowIndoors.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  🌡️ Sow indoors
                </p>
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
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  🌱 Sow outdoors
                </p>
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

            {transplantWindow.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  🪴 Plant out
                </p>
                <div className="flex flex-wrap gap-2">
                  {transplantWindow.map((p) => (
                    <Link
                      key={p.id}
                      href={`/plants/${p.id}`}
                      className="text-xs px-3 py-1 rounded-full bg-garden-100 text-garden-800 hover:bg-garden-200 transition-colors"
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {harvestWindow.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  🌾 Harvest
                </p>
                <div className="flex flex-wrap gap-2">
                  {harvestWindow.map((p) => (
                    <Link
                      key={p.id}
                      href={`/plants/${p.id}`}
                      className="text-xs px-3 py-1 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Add custom task ── */}
      <div className="mb-8 pt-2">
        <AddCustomTaskForm />
      </div>
    </div>
  );
}
