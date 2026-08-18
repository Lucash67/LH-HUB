"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { LabAppShell } from "../_components/lab-app-shell";
import { DonutChart, LabSectionTitle } from "../_components/lab-widgets";

const TABS = ["Resumo", "Receitas", "Despesas"] as const;

const INCOME = [
  { label: "Vendas Pix", value: "R$ 4.820", when: "Este mês" },
  { label: "Vendas Cartão", value: "R$ 2.640", when: "Este mês" },
  { label: "Vendas Dinheiro", value: "R$ 1.304", when: "Este mês" },
];

const EXPENSES = [
  { label: "Compra de insumos", value: "R$ 1.120", when: "14/08" },
  { label: "Embalagens", value: "R$ 286", when: "12/08" },
  { label: "Transporte", value: "R$ 180", when: "10/08" },
  { label: "Outros", value: "R$ 256", when: "08/08" },
];

export default function LabFinanceiroPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Resumo");

  return (
    <LabAppShell title="Financeiro" subtitle="Resumo · receitas · despesas">
      <div className="flex rounded-xl border border-[#7C3CFF]/20 bg-[#0B0D17] p-1">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              tab === t ? "omni-gradient-bg text-white shadow-[0_4px_16px_rgba(124,60,255,0.3)]" : "text-[#A0A0B0]",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Resumo" && (
        <>
          <div className="omni-glass omni-fade-up rounded-2xl p-5">
            <LabSectionTitle title="Composição do mês" subtitle="Faturamento total R$ 8.764,50" />
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
              <DonutChart
                percent={62}
                label="Receitas"
                size={160}
                colors={["#7C3CFF", "#1F2430"]}
              />
              <div className="w-full max-w-xs space-y-3">
                <Row color="#7C3CFF" label="Receitas" value="R$ 8.764,50" pct="100%" />
                <Row color="#EF4444" label="Despesas" value="R$ 1.842,35" pct="21%" />
                <Row color="#0CD4FF" label="Lucro" value="R$ 3.215,20" pct="37%" />
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Mini label="Margem" value="36,7%" good />
            <Mini label="Ticket médio" value="R$ 61,70" />
            <Mini label="Dias operados" value="18" />
          </div>
        </>
      )}

      {tab === "Receitas" && (
        <List
          items={INCOME}
          icon={<ArrowUpRight className="h-4 w-4 text-[#22C55E]" />}
          valueClass="text-[#22C55E]"
        />
      )}
      {tab === "Despesas" && (
        <List
          items={EXPENSES}
          icon={<ArrowDownLeft className="h-4 w-4 text-[#EF4444]" />}
          valueClass="text-[#EF4444]"
        />
      )}
    </LabAppShell>
  );
}

function Row({
  color,
  label,
  value,
  pct,
}: {
  color: string;
  label: string;
  value: string;
  pct: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      <span className="flex-1 text-[#A0A0B0]">{label}</span>
      <span className="text-xs text-[#A0A0B0]">{pct}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function Mini({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="omni-glass rounded-2xl p-4 text-center">
      <p className="text-[10px] uppercase tracking-wide text-[#A0A0B0]">{label}</p>
      <p className={cn("mt-1 text-xl font-bold", good && "text-[#22C55E]")}>{value}</p>
    </div>
  );
}

function List({
  items,
  icon,
  valueClass,
}: {
  items: Array<{ label: string; value: string; when: string }>;
  icon: React.ReactNode;
  valueClass: string;
}) {
  return (
    <div className="omni-glass overflow-hidden rounded-2xl">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 border-b border-white/5 px-4 py-3.5 last:border-0"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-white">{item.label}</p>
            <p className="text-xs text-[#A0A0B0]">{item.when}</p>
          </div>
          <p className={cn("font-semibold", valueClass)}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}
