"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCHEDULE_COPY, SCHEDULE_NAV } from "@/constants/schedule-brand";

export function ScheduleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0b0c14] text-[#F5F6FA]">
      <header className="sticky top-0 z-30 border-b border-[#7C3CFF]/15 bg-[#0b0c14]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/schedule" className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3CFF] to-[#0CD4FF] text-white shadow-[0_0_20px_rgba(124,60,255,0.35)]">
              <CalendarDays className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-tight">
                {SCHEDULE_COPY.productName}
              </span>
              <span className="block truncate text-[11px] text-[#A0A0A0]">
                {SCHEDULE_COPY.productTagline} · {SCHEDULE_COPY.holdingName}
              </span>
            </span>
          </Link>
          <Link
            href="/"
            className="shrink-0 text-xs font-medium text-[#0CD4FF] hover:underline"
          >
            OMNI Business
          </Link>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-2 scrollbar-none">
          {SCHEDULE_NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-[#7C3CFF]/20 text-white"
                    : "text-[#A0A0A0] hover:bg-white/5 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5 pb-24 sm:py-6">{children}</main>
    </div>
  );
}
