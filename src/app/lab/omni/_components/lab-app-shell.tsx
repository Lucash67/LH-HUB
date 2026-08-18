"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton, LabBadge, OmniWordmark } from "./lab-ui";

export const LAB_NAV = [
  { href: "/lab/omni/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lab/omni/operacoes", label: "Operações", icon: Package },
  { href: "/lab/omni/produtos", label: "Produtos", icon: ShoppingCart },
  { href: "/lab/omni/vendas", label: "Vendas", icon: TrendingUp },
  { href: "/lab/omni/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/lab/omni/clientes", label: "Clientes", icon: Users },
  { href: "/lab/omni/estoque", label: "Estoque", icon: Warehouse },
  { href: "/lab/omni/metas", label: "Metas", icon: Target },
  { href: "/lab/omni/relatorios", label: "Relatórios", icon: FileText },
  { href: "/lab/omni/configuracoes", label: "Configurações", icon: Settings },
] as const;

const MOBILE_NAV = [
  { href: "/lab/omni/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/lab/omni/vendas", label: "Vendas", icon: ShoppingCart },
  { href: "/lab/omni/metas", label: "Metas", icon: Target },
  { href: "/lab/omni/clientes", label: "Clientes", icon: Users },
  { href: "/lab/omni/configuracoes", label: "Mais", icon: Settings },
] as const;

interface LabAppShellProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  children: React.ReactNode;
}

export function LabAppShell({ title, subtitle, actionLabel, children }: LabAppShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      {menuOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[86vw] flex-col border-r border-[#7C3CFF]/15 bg-[#0A0B14] transition-transform lg:static lg:z-auto lg:w-auto lg:max-w-none lg:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-5">
          <div>
            <OmniWordmark size={32} />
            <p className="mt-2 text-[10px] uppercase tracking-wider text-[#A0A0B0]">Business · lab</p>
          </div>
          <button
            type="button"
            className="rounded-xl p-2 text-[#A0A0B0] lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {LAB_NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-[#7C3CFF]/15 font-semibold text-[#7C3CFF] shadow-[inset_0_0_0_1px_rgba(124,60,255,0.25)]"
                    : "text-[#A0A0B0] hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 px-4 py-4">
          <p className="text-sm font-semibold">Lucas Henrique</p>
          <p className="text-xs text-[#A0A0B0]">Administrador · Pro Plan</p>
          <LabBadge className="mt-2" />
          <Link
            href="/lab/omni"
            className="mt-3 block text-xs text-[#0CD4FF] hover:underline"
            onClick={() => setMenuOpen(false)}
          >
            ← Hub do lab
          </Link>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-[#7C3CFF]/12 bg-[#05050C]/90 px-4 py-3 backdrop-blur lg:px-6">
          <button
            type="button"
            className="rounded-xl p-2 text-[#A0A0B0] lg:hidden"
            aria-label="Menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-semibold sm:text-lg">{title}</h1>
              <LabBadge />
            </div>
            <p className="text-xs text-[#A0A0B0]">
              {subtitle ?? "Mock visual · dados fictícios das prints"}
            </p>
          </div>
          {actionLabel && (
            <GradientButton className="hidden w-auto px-4 py-2.5 text-xs sm:inline-flex">
              {actionLabel}
            </GradientButton>
          )}
          <button type="button" className="rounded-xl p-2 text-[#A0A0B0]" aria-label="Notificações">
            <Bell className="h-5 w-5" />
          </button>
          <span className="hidden rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-[#A0A0B0] sm:inline">
            Este mês ▾
          </span>
        </header>

        <main className="space-y-5 p-4 pb-24 sm:p-6 lg:pb-6">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#7C3CFF]/15 bg-[#0A0B14]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          <div className="flex items-stretch">
            {MOBILE_NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-[10px]",
                    active ? "text-[#7C3CFF]" : "text-[#A0A0B0]",
                  )}
                >
                  {active && (
                    <span className="absolute top-0 h-0.5 w-8 rounded-full omni-gradient-bg" />
                  )}
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export function StatusPill({
  tone,
  children,
}: {
  tone: "good" | "warn" | "critical" | "neutral" | "active";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
        tone === "good" && "bg-[#22C55E]/15 text-[#22C55E]",
        tone === "warn" && "bg-amber-500/15 text-amber-300",
        tone === "critical" && "bg-[#EF4444]/15 text-[#EF4444]",
        tone === "neutral" && "bg-white/10 text-[#A0A0B0]",
        tone === "active" && "bg-[#7C3CFF]/15 text-[#0CD4FF]",
      )}
    >
      {children}
    </span>
  );
}

export function SearchFilterBar({ placeholder }: { placeholder: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <input
        placeholder={placeholder}
        className="h-11 min-w-0 flex-1 rounded-xl border border-[#7C3CFF]/20 bg-[#12141F] px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#7C3CFF]/50"
      />
      <span className="inline-flex h-11 items-center rounded-xl border border-white/10 px-3 text-xs text-[#A0A0B0]">
        Este mês ▾
      </span>
    </div>
  );
}
