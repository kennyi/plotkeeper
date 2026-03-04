import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Leaf,
  Bed,
  ClipboardList,
  BookOpen,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/plants", label: "Plants", icon: Leaf },
  { href: "/beds", label: "Beds", icon: Bed },
  { href: "/jobs", label: "Monthly Jobs", icon: ClipboardList },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  currentPath?: string;
}

export function Sidebar({ currentPath }: SidebarProps) {
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
          const isActive = currentPath === item.href || currentPath?.startsWith(item.href + "/");
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

      <div className="px-6 py-4 border-t">
        <p className="text-xs text-muted-foreground">Last frost ~Apr 20</p>
        <p className="text-xs text-muted-foreground">First frost ~Oct 30</p>
      </div>
    </aside>
  );
}
