"use client";

import Link from "next/link";
import {
  BarChart3,
  Bell,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LabBadge, OmniWordmark } from "../_components/lab-ui";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Package, label: "Operações" },
  { icon: ShoppingCart, label: "Produtos" },
  { icon: TrendingUp, label: "Vendas" },
  { icon: Wallet, label: "Financeiro" },
  { icon: Users, label: "Clientes" },
  { icon: Warehouse, label: "Estoque" },
  { icon: Target, label: "Metas" },
  { icon: FileText, label: "Relatórios" },
  { icon: Settings, label: "Configurações" },
];

const KPIS = [
  { label: "Faturamento", value: "R$ 8.764,50", delta: "+12,5%", icon: Wallet, tone: "purple" },
  { label: "Vendas", value: "142", delta: "+8,2%", icon: ShoppingCart, tone: "blue" },
  { label: "Lucro", value: "R$ 3.215,20", delta: "+15,7%", icon: TrendingUp, tone: "cyan" },
  { label: "Despesas", value: "R$ 1.842,35", delta: "-4,3%", icon: BarChart3, tone: "pink", down: true },
];

/**
 * Clone visual do dashboard das referências.
 * Dados estáticos de mock — não lê produção.
 */
export default function LabDashboardPage() {
  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-[#7C3CFF]/15 bg-[#0A0B14] lg:flex lg:flex-col">
        <div className="border-b border-white/5 px-5 py-5">
          <OmniWordmark size={32} />
          <p className="mt-2 text-[10px] uppercase tracking-wider text-[#A0A0B0]">Business · lab</p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
                  item.active
                    ? "bg-[#7C3CFF]/15 font-semibold text-[#7C3CFF] shadow-[inset_0_0_0_1px_rgba(124,60,255,0.25)]"
                    : "text-[#A0A0B0]",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {item.label}
              </div>
            );
          })}
        </nav>
        <div className="border-t border-white/5 px-4 py-4">
          <p className="text-sm font-semibold">Lucas Henrique</p>
          <p className="text-xs text-[#A0A0B0]">Administrador</p>
          <LabBadge className="mt-2" />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#7C3CFF]/12 bg-[#05050C]/90 px-4 py-3 backdrop-blur lg:px-6">
          <button type="button" className="rounded-xl p-2 text-[#A0A0B0] lg:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold sm:text-lg">Dashboard</h1>
              <LabBadge />
            </div>
            <p className="text-xs text-[#A0A0B0]">Mock visual · dados fictícios das prints</p>
          </div>
          <button type="button" className="rounded-xl p-2 text-[#A0A0B0]" aria-label="Notificações">
            <Bell className="h-5 w-5" />
          </button>
          <Link href="/lab/omni" className="hidden text-xs text-[#7C3CFF] sm:inline">
            Hub lab
          </Link>
        </header>

        <main className="space-y-5 p-4 pb-24 sm:p-6 lg:pb-6">
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
                  <p
                    className={cn(
                      "mt-1 text-xs font-semibold",
                      k.down ? "text-[#EF4444]" : "text-[#22C55E]",
                    )}
                  >
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
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-[#A0A0B0]">
                  Este mês ▾
                </span>
              </div>
              <svg viewBox="0 0 360 160" className="h-40 w-full sm:h-48" aria-hidden>
                <defs>
                  <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="#7C3CFF" stopOpacity="0.4" />
                    <stop offset="1" stopColor="#7C3CFF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3].map((i) => (
                  <line
                    key={i}
                    x1="0"
                    x2="360"
                    y1={20 + i * 35}
                    y2={20 + i * 35}
                    stroke="#ffffff10"
                  />
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
            <OpCard
              name="Salgados"
              revenue="R$ 5.420"
              units="1.240 un."
              profit="R$ 2.110"
              status="Bom"
              statusTone="good"
            />
            <OpCard
              name="Brigadeiros"
              revenue="R$ 3.344"
              units="860 un."
              profit="R$ 1.105"
              status="Atenção"
              statusTone="warn"
            />
          </div>

          <p className="text-center text-xs text-[#A0A0B0]">
            Ambiente de teste ·{" "}
            <Link href="/" className="text-[#7C3CFF] hover:underline">
              voltar à produção
            </Link>
          </p>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#7C3CFF]/15 bg-[#0A0B14]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          <div className="flex items-stretch">
            {[
              { icon: LayoutDashboard, label: "Home", active: true },
              { icon: ShoppingCart, label: "Vendas" },
              { icon: TrendingUp, label: "Metas" },
              { icon: Users, label: "Clientes" },
              { icon: Settings, label: "Mais" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={cn(
                    "relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-[10px]",
                    item.active ? "text-[#7C3CFF]" : "text-[#A0A0B0]",
                  )}
                >
                  {item.active && (
                    <span className="absolute top-0 h-0.5 w-8 rounded-full omni-gradient-bg" />
                  )}
                  <Icon className="h-5 w-5" strokeWidth={item.active ? 2.25 : 1.75} />
                  {item.label}
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
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
  statusTone,
}: {
  name: string;
  revenue: string;
  units: string;
  profit: string;
  status: string;
  statusTone: "good" | "warn";
}) {
  return (
    <div className="omni-glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{name}</h3>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
            statusTone === "good" && "bg-[#22C55E]/15 text-[#22C55E]",
            statusTone === "warn" && "bg-amber-500/15 text-amber-300",
          )}
        >
          {status}
        </span>
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
        <div
          className="h-full rounded-full omni-gradient-bg"
          style={{ width: statusTone === "good" ? "78%" : "52%" }}
        />
      </div>
    </div>
  );
}
