"use client";

import { ChevronRight, FileBarChart, FileSpreadsheet, PieChart, TrendingUp } from "lucide-react";
import { LabAppShell } from "../_components/lab-app-shell";

const REPORTS = [
  {
    icon: TrendingUp,
    title: "Relatório de vendas",
    desc: "Evolução diária, canais e produtos mais vendidos.",
  },
  {
    icon: PieChart,
    title: "Relatório financeiro",
    desc: "Receitas, despesas, margem e lucro por período.",
  },
  {
    icon: FileBarChart,
    title: "Desempenho por operação",
    desc: "Comparativo Salgados × Brigadeiros e presença.",
  },
  {
    icon: FileSpreadsheet,
    title: "Estoque e perdas",
    desc: "Movimentação, críticos e perdas do período.",
  },
];

export default function LabRelatoriosPage() {
  return (
    <LabAppShell title="Relatórios">
      <div className="grid gap-3 sm:grid-cols-2">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          return (
            <button
              key={r.title}
              type="button"
              className="omni-glass flex items-start gap-3 rounded-2xl p-4 text-left transition hover:border-[#7C3CFF]/45"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7C3CFF]/15 text-[#7C3CFF]">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{r.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#A0A0B0]">{r.desc}</p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[#A0A0B0]" />
            </button>
          );
        })}
      </div>
    </LabAppShell>
  );
}
