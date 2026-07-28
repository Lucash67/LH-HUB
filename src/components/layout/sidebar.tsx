"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Store, Sun, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, SIDEBAR_WIDTH, APP_NAME, APP_TAGLINE } from "@/constants/navigation";
import { BusinessContextSelector } from "@/components/dashboard/business-context-selector";
import { useEffect, useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <aside
      style={{ width: SIDEBAR_WIDTH }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-surface-border bg-surface-base"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange">
          <Store className="h-4 w-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary leading-tight">{APP_NAME}</p>
          <p className="text-[11px] text-text-muted leading-tight">{APP_TAGLINE}</p>
        </div>
      </div>

      <div className="border-b border-surface-border">
        <BusinessContextSelector variant="sidebar" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.filter((item) => !item.paused).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors duration-150",
                isActive
                  ? "bg-brand-orange/10 text-brand-orange"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-0.5 border-t border-surface-border px-3 py-3">
        <button
          type="button"
          onClick={() => mounted && setTheme(theme === "dark" ? "light" : "dark")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} />
          Claro
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
          Sair
        </button>
      </div>
    </aside>
  );
}
