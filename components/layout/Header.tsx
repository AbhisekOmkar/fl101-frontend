"use client";
import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
}

export function Header({ title, subtitle, searchPlaceholder = "Search" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur">
      <div className="grid h-16 grid-cols-[1fr_auto] items-center gap-4 px-6 md:grid-cols-3">
        {/* Title */}
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        {/* Search */}
        <div className="relative mx-auto hidden w-full max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-lg border bg-card pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* CTA */}
        <div className="flex items-center justify-end gap-2">
          <Button asChild variant="default" size="sm">
            <Link href="/evaluate">
              <Sparkles className="h-4 w-4" /> New evaluation
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
