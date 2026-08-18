"use client";

import { useState } from "react";
import {
  ChevronRight,
  Download,
  FileBarChart,
  FileSpreadsheet,
  PieChart,
  TrendingUp,
} from "lucide-react";
import { LabAppShell } from "../_components/lab-app-shell";
import { AreaSpark, DonutChart, LabFilterChips, LabKpi, LabSectionTitle } from "../_components/lab-widgets";

const REPORTS = [
  {
    icon: TrendingUp,
    title: "Relatório de vendas",
    desc: "Evolução diária, canais e produtos mais vendidos.",
    meta: "Última geração · hoje 18:40",
  },
  {
    icon: PieChart,
    title: "Relatório financeiro",
    desc: "Receitas, despesas, margem e lucro por período.",
    meta: "Última geração · ontem",
  },
  {
    icon: FileBarChart,
    title: "Desempenho por operação",
    desc: "Comparativo Salgados × Brigadeiros e presença.",
    meta: "Semanal · seg–sex",
  },
  {
    icon: FileSpreadsheet,
    title: "Estoque e perdas",
    desc: "Movimentação, críticos e perdas do período.",
    meta: "Atualizado · há 2h",
  },
];

export default function LabRelatoriosPage() {
  const [period, setPeriod] = useState("Este mês");

  return (
    <LabAppShell title="Relatórios" actionLabel="Exportar">
      <LabFilterChips
        options={["Hoje", "Esta semana", "Este mês", "Trimestre"]}
        value={period}
        onChange={setPeriod}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <LabKpi label="Vendas" value="R$ 8.764" delta="+12,5%" icon={TrendingUp} tone="purple" />
        <LabKpi label="Pedidos" value="142" delta="+8,2%" icon={FileBarChart} tone="blue" delay={1} />
        <LabKpi label="Margem" value="36,8%" delta="+1,4pp" icon={PieChart} tone="cyan" delay={2} />
        <LabKpi label="Perdas" value="2,1%" delta="-0,4pp" icon={FileSpreadsheet} tone="green" delay={3} />
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.4fr_0.85fr]">
        <div className="omni-glass omni-fade-up rounded-2xl p-4">
          <LabSectionTitle title="Evolução" subtitle={period} />
          <AreaSpark id="labRelSpark" />
          <div className="mt-3 flex justify-between text-[10px] text-[#A0A0B0]">
            <span>Sem 1</span>
            <span>Sem 2</span>
            <span>Sem 3</span>
            <span>Sem 4</span>
          </div>
        </div>
        <div className="omni-glass omni-fade-up omni-fade-up-d1 flex flex-col items-center justify-center rounded-2xl p-4">
          <LabSectionTitle title="Mix por canal" subtitle="Participação" />
          <DonutChart percent={62} label="Loja" size={130} colors={["#7C3CFF", "#1F2430"]} />
          <div className="mt-3 flex flex-wrap justify-center gap-3 text-[11px] text-[#A0A0B0]">
            <span className="inline-flex items-center gap-1.5">
              <i className="h-2 w-2 rounded-full bg-[#7C3CFF]" /> Loja 62%
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="h-2 w-2 rounded-full bg-[#3882F6]" /> Delivery 28%
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="h-2 w-2 rounded-full bg-[#0CD4FF]" /> Eventos 10%
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          return (
            <button
              key={r.title}
              type="button"
              className="omni-glass omni-glass-hover flex items-start gap-3 rounded-2xl p-4 text-left"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7C3CFF]/15 text-[#7C3CFF]">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{r.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#A0A0B0]">{r.desc}</p>
                <p className="mt-2 flex items-center gap-1.5 text-[10px] text-[#0CD4FF]/90">
                  <Download className="h-3 w-3" />
                  {r.meta}
                </p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[#A0A0B0]" />
            </button>
          );
        })}
      </div>
    </LabAppShell>
  );
}
