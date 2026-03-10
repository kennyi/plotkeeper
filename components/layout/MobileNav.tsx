"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  Leaf,
  Archive,
  Settings,
} from "lucide-react";

const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/beds", label: "Inventory", icon: Archive },
  { href: "/plants", label: "Plants", icon: Leaf },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-linen-300"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="grid grid-cols-5 h-16">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors"
            >
              {/* Terracotta pill indicator above icon */}
              <div className="relative flex flex-col items-center gap-1">
                {isActive && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-terracotta-500" />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-terracotta-500" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isActive ? "text-terracotta-600" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
