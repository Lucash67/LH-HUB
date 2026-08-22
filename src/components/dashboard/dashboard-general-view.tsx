"use client";

import { motion } from "framer-motion";
import { DollarSign, Target, TrendingUp, Users } from "lucide-react";
import { PulseMetric } from "@/components/dashboard/pulse-metric";
import { TopProductsCard, ChartCard } from "@/components/charts/chart-card";
import { formatCurrency } from "@/lib/utils";

export interface DashboardScopeCopy {
  heroEyebrow: string;
  revenueLabel: string;
  profitLabel: string;
  goalLabel: string;
  buyersSubtext: string;
  chartsSubtitle: string;
  profitPhrase: string;
}

interface DashboardGeneralViewProps {
  revenue: number;
  profit: number;
  goalProgress: number;
  itemsSold: number;
  uniqueBuyers: number;
  flavors: Array<{ label: string; value: number }>;
  payments: Array<{ label: string; value: number }>;
  copy?: DashboardScopeCopy;
}

const DEFAULT_COPY: DashboardScopeCopy = {
  heroEyebrow: "Visão executiva · histórico completo",
  revenueLabel: "Receita total",
  profitLabel: "Lucro total",
  goalLabel: "Meta geral",
  buyersSubtext: "un. no histórico",
  chartsSubtitle: "Histórico completo",
  profitPhrase: "Lucro acumulado",
};

export function DashboardGeneralView({
  revenue,
  profit,
  goalProgress,
  itemsSold,
  uniqueBuyers,
  flavors,
  payments,
  copy = DEFAULT_COPY,
}: DashboardGeneralViewProps) {
  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-[#7C3CFF]/25 bg-gradient-to-br from-[#7C3CFF]/12 via-surface-card to-[#0CD4FF]/10 p-4 sm:p-8"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#7C3CFF]/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-[#0CD4FF]/15 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="mb-1 text-sm text-text-secondary">{copy.heroEyebrow}</p>
          <p className="text-[2rem] font-black tracking-tight text-brand-gradient sm:text-4xl lg:text-5xl">
            {formatCurrency(revenue)}
          </p>
          <p className="mt-2 text-sm text-text-secondary sm:text-base">
            {copy.profitPhrase}{" "}
            <span className="font-bold text-brand-green">{formatCurrency(profit)}</span>
            {" · "}
            {itemsSold} unidades · {uniqueBuyers} compradores
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <PulseMetric label={copy.revenueLabel} value={revenue} icon={DollarSign} variant="revenue" delay={0} />
        <PulseMetric
          label={copy.profitLabel}
          value={profit}
          icon={TrendingUp}
          variant="gain"
          delay={1}
        />
        <PulseMetric
          label={copy.goalLabel}
          value={goalProgress}
          format="percent"
          icon={Target}
          variant="meta"
          delay={2}
        />
        <PulseMetric
          label="Compradores"
          value={uniqueBuyers}
          format="number"
          icon={Users}
          variant="info"
          subtext={`${itemsSold} ${copy.buyersSubtext}`}
          delay={3}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <TopProductsCard products={flavors} subtitle={copy.chartsSubtitle} />
        <ChartCard
          data={payments.filter((p) => p.value > 0)}
          title="Como pagaram"
          subtitle={copy.chartsSubtitle}
          type="pie"
          height={220}
        />
      </div>
    </div>
  );
}
