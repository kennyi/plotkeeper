"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  SquaresFour,
  CheckSquare,
  Leaf,
  Archive,
  Bug,
  Gear,
  SignOut,
} from "@phosphor-icons/react";
import { logoutAction } from "@/app/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: SquaresFour },
  { href: "/beds", label: "Inventory", icon: Archive },
  { href: "/plants", label: "Plants", icon: Leaf },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/pests", label: "Pest Guide", icon: Bug },
  { href: "/settings", label: "Settings", icon: Gear },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-56 lg:w-64 border-r border-linen-300 bg-card min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-linen-300">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="text-2xl">🌱</span>
          <span className="font-serif font-bold text-xl text-garden-700 tracking-tight">
            PlotKeeper
          </span>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">Kildare, Ireland</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-terracotta-50 text-terracotta-600"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon
                size={16}
                weight={isActive ? "bold" : "regular"}
                className={cn(
                  "flex-shrink-0",
                  isActive ? "text-terracotta-500" : "text-muted-foreground"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-linen-300 space-y-2">
        <p className="text-xs text-muted-foreground">Last frost ~Apr 20</p>
        <p className="text-xs text-muted-foreground">First frost ~Oct 30</p>
        <form action={logoutAction} className="pt-1">
          <button
            type="submit"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <SignOut size={12} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
