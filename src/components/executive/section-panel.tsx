"use client";

import { cn } from "@/components/ui/utils";
import type { ModuleTheme } from "@/lib/module-themes";
import { MODULE_THEMES } from "@/lib/module-themes";

interface SectionPanelProps {
  theme?: ModuleTheme;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionPanel({
  theme = "dashboard",
  title,
  subtitle,
  children,
  className,
}: SectionPanelProps) {
  const t = MODULE_THEMES[theme];

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <h2 className={cn("text-sm font-semibold", t.accent)}>{title}</h2>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
