"use client";

import Link from "next/link";
import { BarChart3, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { LabAppShell, StatusPill } from "../_components/lab-app-shell";

const KPIS = [
  { label: "Faturamento", value: "R$ 8.764,50", delta: "+12,5%", icon: Wallet, tone: "purple" },
  { label: "Vendas", value: "142", delta: "+8,2%", icon: ShoppingCart, tone: "blue" },
  { label: "Lucro", value: "R$ 3.215,20", delta: "+15,7%", icon: TrendingUp, tone: "cyan" },
  { label: "Despesas", value: "R$ 1.842,35", delta: "-4,3%", icon: BarChart3, tone: "pink", down: true },
];

export default function LabDashboardPage() {
  return (
    <LabAppShell title="Dashboard">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {KPIS.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="omni-glass rounded-2xl p-3.5 sm:p-4">
              <div className="mb-3 flex items-start justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#A0A0B0]">
                  {k.label}
                </p>
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl",
                    k.tone === "purple" && "bg-[#7C3CFF]/15 text-[#7C3CFF]",
                    k.tone === "blue" && "bg-[#3882F6]/15 text-[#3882F6]",
                    k.tone === "cyan" && "bg-[#0CD4FF]/15 text-[#0CD4FF]",
                    k.tone === "pink" && "bg-pink-500/15 text-pink-400",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="text-xl font-bold tracking-tight sm:text-2xl">{k.value}</p>
              <p className={cn("mt-1 text-xs font-semibold", k.down ? "text-[#EF4444]" : "text-[#22C55E]")}>
                {k.delta}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="omni-glass rounded-2xl p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Evolução de vendas</h2>
              <p className="text-xs text-[#A0A0B0]">01/05 — 29/05</p>
            </div>
          </div>
          <svg viewBox="0 0 360 160" className="h-40 w-full sm:h-48" aria-hidden>
            <defs>
              <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#7C3CFF" stopOpacity="0.4" />
                <stop offset="1" stopColor="#7C3CFF" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1="0" x2="360" y1={20 + i * 35} y2={20 + i * 35} stroke="#ffffff10" />
            ))}
            <path
              d="M0 120 C 40 110, 70 100, 100 95 S 160 70, 200 75 S 260 40, 300 35 S 340 20, 360 18 L 360 160 L 0 160 Z"
              fill="url(#dashArea)"
            />
            <path
              d="M0 120 C 40 110, 70 100, 100 95 S 160 70, 200 75 S 260 40, 300 35 S 340 20, 360 18"
              fill="none"
              stroke="#7C3CFF"
              strokeWidth="2.5"
            />
          </svg>
        </div>

        <div className="omni-glass rounded-2xl p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold">Vendas por operação</h2>
          <div className="flex items-center gap-5">
            <div
              className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full"
              style={{ background: "conic-gradient(#7C3CFF 0 62%, #3882F6 62% 100%)" }}
            >
              <div className="flex h-[78px] w-[78px] flex-col items-center justify-center rounded-full bg-[#0B0D17]">
                <span className="text-xl font-bold">62%</span>
                <span className="text-[10px] text-[#A0A0B0]">Salgados</span>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <LegendDot color="#7C3CFF" label="Salgados" value="62%" />
              <LegendDot color="#3882F6" label="Brigadeiros" value="38%" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <OpCard name="Salgados" revenue="R$ 5.420" units="1.240 un." profit="R$ 2.110" status="Bom" good />
        <OpCard name="Brigadeiros" revenue="R$ 3.344" units="860 un." profit="R$ 1.105" status="Atenção" good={false} />
      </div>

      <p className="text-center text-xs text-[#A0A0B0]">
        Ambiente de teste ·{" "}
        <Link href="/" className="text-[#7C3CFF] hover:underline">
          voltar à produção
        </Link>
      </p>
    </LabAppShell>
  );
}

function LegendDot({ color, label, value }: { color: string; label: string; value: string }) {
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
    <div className="omni-glass rounded-2xl p-4">
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
