"use client";

import Link from "next/link";
import { Brain, ShoppingCart, Sparkles, TrendingUp, Wallet, BarChart3 } from "lucide-react";
import { LabAppShell, StatusPill } from "../_components/lab-app-shell";
import { AreaSpark, DonutChart, LabKpi, LabSectionTitle } from "../_components/lab-widgets";

export default function LabDashboardPage() {
  return (
    <LabAppShell title="Dashboard" subtitle="Visão geral · mock das prints">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <LabKpi label="Faturamento" value="R$ 8.764,50" delta="+12,5% vs mês anterior" icon={Wallet} tone="purple" delay={0} />
        <LabKpi label="Vendas" value="142" delta="+8,2% vs mês anterior" icon={ShoppingCart} tone="blue" delay={1} />
        <LabKpi label="Lucro" value="R$ 3.215,20" delta="+15,7% vs mês anterior" icon={TrendingUp} tone="cyan" delay={2} />
        <LabKpi label="Despesas" value="R$ 1.842,35" delta="-4,3% vs mês anterior" icon={BarChart3} tone="pink" down delay={3} />
      </div>

      <div className="relative grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="omni-glass omni-fade-up omni-fade-up-d1 rounded-2xl p-4 sm:p-5">
          <LabSectionTitle title="Evolução de vendas" subtitle="01/05 — 29/05" />
          <AreaSpark id="dashAreaDeep" />
        </div>

        <div className="omni-glass omni-fade-up omni-fade-up-d2 rounded-2xl p-4 sm:p-5">
          <LabSectionTitle title="Vendas por operação" />
          <div className="flex items-center gap-5">
            <DonutChart percent={62} label="Salgados" />
            <div className="space-y-3 text-sm">
              <Legend color="#7C3CFF" label="Salgados" value="62%" />
              <Legend color="#3882F6" label="Brigadeiros" value="38%" />
              <p className="pt-1 text-[11px] leading-snug text-[#A0A0B0]">
                Salgados concentram a maior parte do volume no mês.
              </p>
            </div>
          </div>
        </div>

        {/* Floating insight cards like prints */}
        <div className="pointer-events-none absolute -right-1 -top-2 z-10 hidden max-w-[180px] rounded-xl border border-[#7C3CFF]/35 bg-[#1A1D2B]/95 p-2.5 shadow-xl lg:block">
          <div className="mb-1 flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5 text-[#7C3CFF]" />
            <p className="text-[10px] font-semibold">Insights inteligentes</p>
          </div>
          <p className="text-[9px] leading-snug text-[#A0A0B0]">
            Destaques do que realmente importa na operação.
          </p>
        </div>
      </div>

      <div className="omni-glass omni-fade-up omni-fade-up-d3 flex items-center gap-3 rounded-2xl px-4 py-3">
        <Sparkles className="h-4 w-4 shrink-0 text-[#0CD4FF]" />
        <p className="flex-1 text-xs text-[#A0A0B0] sm:text-sm">
          <span className="font-semibold text-white">Relatórios automáticos</span> — leitura visual
          clara dos resultados do período.
        </p>
        <BarChart3 className="h-4 w-4 text-[#7C3CFF]" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <OpCard name="Salgados" revenue="R$ 5.420" units="1.240 un." profit="R$ 2.110" status="Bom" good />
        <OpCard name="Brigadeiros" revenue="R$ 3.344" units="860 un." profit="R$ 1.105" status="Atenção" good={false} />
      </div>

      <p className="text-center text-xs text-[#A0A0B0]">
        Lab ·{" "}
        <Link href="/" className="text-[#7C3CFF] hover:underline">
          produção
        </Link>
      </p>
    </LabAppShell>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      <span className="text-[#A0A0B0]">{label}</span>
      <span className="ml-auto font-semibold">{value}</span>
    </div>
  );
}

function OpCard({
  name,
  revenue,
  units,
  profit,
  status,
  good,
}: {
  name: string;
  revenue: string;
  units: string;
  profit: string;
  status: string;
  good: boolean;
}) {
  return (
    <div className="omni-glass omni-glass-hover rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{name}</h3>
        <StatusPill tone={good ? "good" : "warn"}>{status}</StatusPill>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-[#A0A0B0]">Fat.</p>
          <p className="font-semibold">{revenue}</p>
        </div>
        <div>
          <p className="text-[#A0A0B0]">Un.</p>
          <p className="font-semibold">{units}</p>
        </div>
        <div>
          <p className="text-[#A0A0B0]">Lucro</p>
          <p className="font-semibold text-[#22C55E]">{profit}</p>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full omni-gradient-bg" style={{ width: good ? "78%" : "52%" }} />
      </div>
    </div>
  );
}
