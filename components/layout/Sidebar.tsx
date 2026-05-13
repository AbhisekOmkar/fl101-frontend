"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  History,
  LayoutDashboard,
  ScrollText,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/evaluate", label: "Evaluate", icon: Wand2 },
  { href: "/history", label: "History", icon: History },
  { href: "/eval", label: "Quality", icon: Target },
  { href: "/rubrics", label: "Rubrics", icon: ScrollText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-card">
      {/* Workspace switcher */}
      <div className="flex h-16 items-center gap-2 px-4">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-secondary/60"
        >
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-semibold tracking-tight">fl101</span>
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-primary font-medium text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-xl border bg-secondary/40 p-3 text-xs">
          <p className="font-medium text-foreground">Proof-of-work</p>
          <p className="mt-1 text-muted-foreground">
            Calibrated feedback in seconds — the single next-best step.
          </p>
        </div>
      </div>
    </aside>
  );
}
