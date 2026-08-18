"use client";

import { LabAppShell } from "../_components/lab-app-shell";
import { DonutChart, LabSectionTitle } from "../_components/lab-widgets";

const BARS = [
  { label: "Vendas (unidades)", value: 72, target: "1.800 / 2.500" },
  { label: "Novos clientes", value: 54, target: "27 / 50" },
  { label: "Ticket médio", value: 81, target: "R$ 61 / R$ 75" },
  { label: "Presença operacional", value: 90, target: "18 / 20 dias" },
];

const MILESTONES = [
  { title: "Meta semanal batida", when: "Semana 11–15/08", done: true },
  { title: "Reduzir perdas < 3%", when: "Em andamento", done: false },
  { title: "Ativar 10 clientes inativos", when: "Próxima semana", done: false },
];

export default function LabMetasPage() {
  return (
    <LabAppShell title="Metas" subtitle="Progresso do mês · mock">
      <div className="omni-glass omni-fade-up rounded-2xl p-5">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <LabSectionTitle title="Meta de faturamento" subtitle="Este mês" />
            <p className="text-2xl font-bold sm:text-3xl">R$ 8.764 / R$ 11.200</p>
            <p className="mt-2 text-sm font-semibold text-[#22C55E]">+12,5% vs mês anterior</p>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#A0A0B0]">
              Faltam R$ 2.436 para bater a meta. Ritmo atual sugere ~82% até o fechamento.
            </p>
          </div>
          <DonutChart percent={78} label="Meta" size={150} colors={["#7C3CFF", "#1F2430"]} />
        </div>
      </div>

      <div className="omni-glass omni-fade-up omni-fade-up-d1 space-y-4 rounded-2xl p-5">
        <h2 className="text-sm font-semibold">Outras metas</h2>
        {BARS.map((b) => (
          <div key={b.label}>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
              <span className="text-[#A0A0B0]">{b.label}</span>
              <span className="text-xs text-white/70">{b.target}</span>
              <span className="font-semibold text-white">{b.value}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full omni-gradient-bg transition-all duration-700"
                style={{ width: `${b.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="omni-glass omni-fade-up omni-fade-up-d2 rounded-2xl p-5">
        <h2 className="mb-3 text-sm font-semibold">Marcos</h2>
        <div className="space-y-3">
          {MILESTONES.map((m) => (
            <div key={m.title} className="flex items-start gap-3">
              <span
                className={
                  m.done
                    ? "mt-1 h-2.5 w-2.5 rounded-full bg-[#22C55E]"
                    : "mt-1 h-2.5 w-2.5 rounded-full bg-[#7C3CFF] omni-pulse-dot"
                }
              />
              <div>
                <p className="text-sm font-medium text-white">{m.title}</p>
                <p className="text-xs text-[#A0A0B0]">{m.when}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LabAppShell>
  );
}
