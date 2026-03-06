"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Leaf,
  Archive,
  ClipboardList,
  Bug,
  Settings,
  LogOut,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/beds", label: "Inventory", icon: Archive },
  { href: "/plants", label: "Plants", icon: Leaf },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/jobs", label: "Jobs", icon: ClipboardList },
  { href: "/pests", label: "Pest Guide", icon: Bug },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-56 lg:w-64 border-r bg-background min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className="font-bold text-lg text-garden-700">PlotKeeper</span>
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">Kildare, Ireland</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-garden-100 text-garden-800"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t space-y-2">
        <p className="text-xs text-muted-foreground">Last frost ~Apr 20</p>
        <p className="text-xs text-muted-foreground">First frost ~Oct 30</p>
        <form action={logoutAction} className="pt-1">
          <button
            type="submit"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-3 w-3" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
