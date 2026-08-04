"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  ClipboardPaste,
  Crown,
  FileText,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
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

/** Dia em andamento: o painel é de ação — registrar e movimentar a operação. */
const OPERATE_ACTIONS: QuickAction[] = [
  {
    href: "/registro-dia",
    label: "Registrar o dia",
    hint: "Fechamento e resumo",
    icon: ClipboardPaste,
    primary: true,
  },
  {
    href: "/diario",
    label: "Revisar o dia",
    hint: "Diário operacional",
    icon: BookOpen,
  },
  {
    href: "/vendas",
    label: "Lançar venda",
    hint: "Nova entrada",
    icon: ShoppingCart,
  },
  {
    href: "/financeiro",
    label: "Ver financeiro",
    hint: "Fluxo e caixa",
    icon: Wallet,
  },
  {
    href: "/insights",
    label: "Ver insights",
    hint: "Oportunidades",
    icon: Sparkles,
  },
];

/** Fim de semana ou dia fora de hoje: o painel é de consulta e planejamento. */
const CONSULT_ACTIONS: QuickAction[] = [
  {
    href: "/desempenho",
    label: "Desempenho",
    hint: "Semana fechada",
    icon: TrendingUp,
    primary: true,
  },
  {
    href: "/fechamento",
    label: "Fechamento",
    hint: "Mês e tendência",
    icon: CalendarClock,
  },
  {
    href: "/relatorios",
    label: "Relatórios",
    hint: "Consolidado",
    icon: FileText,
  },
  {
    href: "/insights",
    label: "Ver insights",
    hint: "Oportunidades",
    icon: Sparkles,
  },
  {
    href: "/diario",
    label: "Diário",
    hint: "Dias registrados",
    icon: BookOpen,
  },
];

interface DashboardWelcomeBannerProps {
  className?: string;
  /** Dia em foco no filtro temporal (yyyy-MM-dd) — null na visão geral. */
  viewDate?: string | null;
  /** Faturamento da semana em foco — exibido quando o painel é de consulta. */
  weekRevenue?: number;
}

export function DashboardWelcomeBanner({
  className,
  viewDate,
  weekRevenue,
}: DashboardWelcomeBannerProps) {
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
  const showWeekRevenue = copy.isConsulting && !!weekRevenue && weekRevenue > 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative mb-5 overflow-hidden rounded-3xl border border-brand-yellow/20",
        "bg-gradient-to-br from-brand-yellow/[0.09] via-surface-card to-surface-card",
        "p-5 shadow-[0_0_40px_rgba(255,212,0,0.06)] sm:p-7",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,212,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,212,0,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <motion.div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-yellow/12 blur-3xl"
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-brand-secondary/8 blur-3xl"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-yellow/25 bg-brand-yellow/[0.07] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-yellow">
            <Crown className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
            <span>Central de comando</span>
            <Sparkles className="h-3 w-3 shrink-0 opacity-70" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-[1.65rem] font-black leading-[1.15] tracking-tight text-text-primary sm:text-3xl lg:text-[2rem]">
              {copy.greeting},{" "}
              <span className="bg-gradient-to-r from-brand-yellow via-[#FFEA70] to-brand-secondary bg-clip-text text-transparent">
                {firstName}
              </span>
              {copy.suffix}
            </h2>
            <p className="max-w-xl text-base text-text-secondary sm:text-lg">{copy.subtitle}</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {quickActions.map((action, index) => {
              const { href, label, hint, icon: Icon, primary } = action;
              return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "group flex min-w-[148px] shrink-0 flex-col gap-1 rounded-2xl border px-3.5 py-3 transition-all duration-200",
                  primary
                    ? "border-brand-yellow/40 bg-brand-yellow/15 hover:border-brand-yellow/60 hover:bg-brand-yellow/20"
                    : "border-surface-border bg-surface-base/50 hover:border-brand-yellow/30 hover:bg-brand-yellow/[0.06]",
                )}
              >
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + index * 0.04, duration: 0.35 }}
                  className="flex items-center justify-between gap-2"
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl",
                      primary ? "bg-brand-yellow/25 text-brand-yellow" : "bg-surface-hover text-text-secondary",
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <ArrowRight
                    className={cn(
                      "h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-70",
                      primary ? "text-brand-yellow" : "text-text-muted",
                    )}
                  />
                </motion.span>
                <span className={cn("text-sm font-bold leading-tight", primary ? "text-brand-yellow" : "text-text-primary")}>
                  {label}
                </span>
                <span className="text-[11px] leading-tight text-text-muted">{hint}</span>
              </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden shrink-0 sm:block">
          <div className="rounded-2xl border border-brand-yellow/15 bg-surface-base/60 px-4 py-3 text-right backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              {showWeekRevenue ? "Semana" : "Status"}
            </p>
            <p className="mt-0.5 text-sm font-bold text-brand-yellow">
              {showWeekRevenue
                ? `${formatCurrency(weekRevenue)} faturados`
                : "Operação sob seu comando"}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
