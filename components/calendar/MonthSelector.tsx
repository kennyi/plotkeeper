"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { MONTH_NAMES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MonthSelectorProps {
  currentMonth: number;
}

export function MonthSelector({ currentMonth }: MonthSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goToMonth(month: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", month.toString());
    router.push(`/calendar?${params.toString()}`);
  }

  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

  return (
    <div className="space-y-4">
      {/* Month nav */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => goToMonth(prevMonth)}>
          <CaretLeft size={16} />
        </Button>
        <h2 className="text-xl font-bold min-w-[140px] text-center">
          {MONTH_NAMES[currentMonth - 1]}
        </h2>
        <Button variant="outline" size="icon" onClick={() => goToMonth(nextMonth)}>
          <CaretRight size={16} />
        </Button>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-6 gap-1 sm:grid-cols-12">
        {MONTH_NAMES.map((name, i) => {
          const month = i + 1;
          return (
            <button
              key={month}
              onClick={() => goToMonth(month)}
              className={cn(
                "text-xs py-1.5 px-1 rounded font-medium transition-colors",
                month === currentMonth
                  ? "bg-terracotta-500 text-white"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              {name.slice(0, 3)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
