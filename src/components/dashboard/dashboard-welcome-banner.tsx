"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  ClipboardPaste,
  NotebookPen,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFirstName, resolveUserTimeZone } from "@/lib/time-greeting";
import { resolveDashboardGreeting } from "@/lib/dashboard-greeting";
import { useSessionUser } from "@/hooks/use-session-user";

interface QuickAction {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  primary?: boolean;
}

const OPERATE_ACTIONS: QuickAction[] = [
  {
    href: "/registro-dia",
    label: "Registrar o dia",
    hint: "Colar rascunho e fechar",
    icon: ClipboardPaste,
    primary: true,
  },
  {
    href: "/notas",
    label: "Notas",
    hint: "Bloco do dia",
    icon: NotebookPen,
  },
];

const CONSULT_ACTIONS: QuickAction[] = [
  {
    href: "/desempenho",
    label: "Semana",
    hint: "Fat e lucro",
    icon: TrendingUp,
    primary: true,
  },
  {
    href: "/fechamento",
    label: "Mês",
    hint: "Fechamento",
    icon: CalendarClock,
  },
];

interface DashboardWelcomeBannerProps {
  className?: string;
  viewDate?: string | null;
}

export function DashboardWelcomeBanner({ className, viewDate }: DashboardWelcomeBannerProps) {
  const { data: user } = useSessionUser();
  const [copy, setCopy] = useState(() => resolveDashboardGreeting({ viewDate }));

  useEffect(() => {
    const timeZone = resolveUserTimeZone();
    const apply = () => setCopy(resolveDashboardGreeting({ viewDate, timeZone }));
    apply();
    const interval = window.setInterval(apply, 60_000);
    return () => window.clearInterval(interval);
  }, [viewDate]);

  const firstName = getFirstName(user?.name ?? "Lucas");
  const quickActions = copy.isConsulting ? CONSULT_ACTIONS : OPERATE_ACTIONS;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "relative mb-4 overflow-hidden rounded-2xl border border-surface-border bg-surface-card p-4 sm:p-5",
        className,
      )}
    >
      <div className="space-y-3">
        <div>
          <p className="text-sm text-text-secondary">
            {copy.greeting}, <span className="font-semibold text-text-primary">{firstName}</span>
          </p>
          <p className="mt-1 text-base font-semibold text-text-primary sm:text-lg">{copy.headline}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
                  action.primary
                    ? "border-brand-yellow/40 bg-brand-yellow/15 text-brand-yellow hover:bg-brand-yellow/20"
                    : "border-surface-border bg-surface-base/50 text-text-primary hover:border-brand-yellow/30",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {action.label}
                <ArrowRight className="h-3.5 w-3.5 opacity-50 transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
