"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  History,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  ScrollText,
  Settings,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { SparkLogo } from "@/components/brand/SparkLogo";
import type { EvaluationListItem } from "@/lib/types";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/evaluate", label: "Evaluate", icon: MessageSquare },
  { href: "/history", label: "History", icon: History },
  { href: "/eval", label: "Quality", icon: Target },
  { href: "/rubrics", label: "Rubrics", icon: ScrollText },
];

export function Sidebar() {
  const pathname = usePathname();
  const [recents, setRecents] = useState<EvaluationListItem[]>([]);
  const onLoginPage = !!pathname?.startsWith("/login");

  // All hooks must run on every render — keep this useEffect unconditional and
  // gate the side-effect inside it. The conditional return comes AFTER.
  useEffect(() => {
    if (onLoginPage) return;
    let alive = true;
    api.listEvaluations(10).then(
      (r) => alive && setRecents(r.items),
      () => undefined,
    );
    return () => {
      alive = false;
    };
  }, [pathname, onLoginPage]);

  // The login page renders a full-bleed splash, no sidebar.
  if (onLoginPage) return null;

  return (
    <aside className="sticky top-0 hidden h-screen md:flex md:w-64 md:flex-col md:border-r md:bg-card">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center gap-2 px-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border bg-card text-foreground shadow-sm">
          <SparkLogo size={14} />
        </span>
        <span className="text-sm font-semibold tracking-tight">fl101 Critic</span>
      </div>

      {/* Nav */}
      <nav className="shrink-0 space-y-0.5 px-3">
        {nav.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-secondary font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Recents — scrolls internally if it overflows */}
      <div className="mt-6 flex min-h-0 flex-1 flex-col px-3">
        <p className="shrink-0 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Recents
        </p>
        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
          {recents.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              Your recent evaluations will appear here.
            </p>
          ) : (
            recents.map((r) => (
              <Link
                key={r.evaluation_id}
                href={`/history?id=${r.evaluation_id}`}
                className="block rounded-lg px-3 py-2 text-xs transition-colors hover:bg-secondary/60"
              >
                <p className="truncate font-medium text-foreground">
                  {r.title || "Untitled artifact"}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {r.artifact_type} · score {r.overall_score.toFixed(1)}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Settings + sign-out */}
      <div className="shrink-0 space-y-0.5 px-3 py-1">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          onClick={() => alert("Settings coming soon. For the demo this is a placeholder.")}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </button>
        <Link
          href="/login"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </Link>
      </div>

      {/* Profile footer */}
      <div className="shrink-0 border-t p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
            AP
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-xs font-semibold">Abhisek Prasad</p>
            <p className="truncate text-[11px] text-muted-foreground">
              applied-ai assessment
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
