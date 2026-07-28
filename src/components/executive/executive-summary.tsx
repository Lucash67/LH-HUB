"use client";

import { cn } from "@/components/ui/utils";
import type { ModuleTheme } from "@/lib/module-themes";
import { MODULE_THEMES } from "@/lib/module-themes";

interface ExecutiveSummaryProps {
  theme?: ModuleTheme;
  title?: string;
  conclusion?: string;
  items: Array<{ label: string; value: string; highlight?: boolean }>;
}

export function ExecutiveSummary({
  theme = "reports",
  title = "Resumo Executivo",
  conclusion,
  items,
}: ExecutiveSummaryProps) {
  const t = MODULE_THEMES[theme];

  return (
    <div className={cn("rounded-2xl border bg-surface-card p-5 shadow-card", t.border)}>
      <div className="mb-4 flex items-center gap-2">
        <div className={cn("h-2 w-2 rounded-full", t.accentDim.replace("/10", ""))} />
        <h3 className={cn("text-sm font-semibold uppercase tracking-wide", t.accent)}>{title}</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className={cn(
              "rounded-xl p-3 transition-colors",
              item.highlight ? t.accentDim : "bg-surface-elevated",
            )}
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">{item.label}</p>
            <p className={cn("mt-1 text-lg font-bold", item.highlight ? t.accent : "text-text-primary")}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
      {conclusion && (
        <p className="mt-4 rounded-xl bg-surface-elevated px-4 py-3 text-sm leading-relaxed text-text-secondary">
          {conclusion}
        </p>
      )}
    </div>
  );
}
