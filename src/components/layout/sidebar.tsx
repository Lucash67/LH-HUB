"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, SIDEBAR_WIDTH, APP_TAGLINE } from "@/constants/navigation";
import { BusinessContextSelector } from "@/components/dashboard/business-context-selector";
import { LhHoldingIcon } from "@/components/hub/lh-hub-logo";
import { resolveTheme, THEME_META } from "@/lib/theme-config";
import { clearHubSession } from "@/lib/hub-session";
import { useEffect, useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => setMounted(true), []);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      clearHubSession();
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const current = resolveTheme(theme);
  const themeMeta = THEME_META[current];
  const ThemeIcon = themeMeta.icon;
  const isBrand = current === "brand";

  return (
    <aside
      style={{ width: SIDEBAR_WIDTH }}
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-surface-border bg-surface-base",
        isBrand && "brand-sidebar",
      )}
    >
      <div className="flex items-center gap-3 px-4 py-4">
        <LhHoldingIcon height={36} className="shrink-0" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight text-text-primary">
            LH <span className="text-brand-yellow">Hub</span>
          </p>
          <p className="truncate text-[10px] uppercase tracking-wider text-text-muted">{APP_TAGLINE}</p>
        </div>
      </div>

      <div className="border-b border-surface-border">
        <BusinessContextSelector variant="sidebar" />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.filter((item) => !item.paused).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                isActive &&
                  "bg-brand-yellow/10 text-brand-yellow shadow-[inset_0_0_0_1px_rgba(255,212,0,0.18),0_0_20px_rgba(255,212,0,0.06)]",
                !isActive && "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-yellow shadow-[0_0_8px_rgba(255,212,0,0.7)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-0.5 border-t border-surface-border px-3 py-3">
        <button
          type="button"
          onClick={() => mounted && setTheme(themeMeta.next)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <ThemeIcon className="h-[18px] w-[18px]" strokeWidth={1.75} />
          {themeMeta.label}
        </button>
        <button
          type="button"
          disabled={loggingOut}
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary disabled:opacity-50"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
          Sair
        </button>
      </div>
    </aside>
  );
}
