"use client";

import Link from "next/link";
import { ArrowRight, LayoutGrid, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { LhHoldingLogo } from "@/components/hub/lh-hub-logo";
import { useSessionUser } from "@/hooks/use-session-user";
import { listAvailableProducts, type OmniProduct } from "@/constants/omni-products";
import { cn } from "@/lib/utils";
import { clearHubSession } from "@/lib/hub-session";
import { useBusinessContextStore } from "@/stores/business-context-store";
import { useQueryClient } from "@tanstack/react-query";

const ACCENT = {
  purple: {
    border: "border-[#7C3CFF]/30 hover:border-[#7C3CFF]/55",
    glow: "from-[#7C3CFF]/15 via-transparent to-[#0CD4FF]/5",
    icon: "bg-[#7C3CFF]/15 text-[#B794FF] ring-[#7C3CFF]/25",
    chip: "bg-[#7C3CFF]/12 text-[#C4B5FD]",
    cta: "bg-gradient-to-r from-[#7C3CFF] to-[#3882F6] text-white",
  },
  cyan: {
    border: "border-[#0CD4FF]/25 hover:border-[#0CD4FF]/50",
    glow: "from-[#0CD4FF]/12 via-transparent to-[#7C3CFF]/8",
    icon: "bg-[#0CD4FF]/12 text-[#0CD4FF] ring-[#0CD4FF]/25",
    chip: "bg-[#0CD4FF]/10 text-[#67E8F9]",
    cta: "bg-gradient-to-r from-[#0CD4FF]/90 to-[#3882F6] text-[#0b0c14]",
  },
} as const;

function ProductCard({ product }: { product: OmniProduct }) {
  const styles = ACCENT[product.accent];
  const Icon = product.icon;

  return (
    <Link
      href={product.href}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border bg-[#12141c]/90 p-5 transition duration-300 sm:p-6",
        "shadow-[0_8px_40px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(124,60,255,0.18)]",
        styles.border,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90",
          styles.glow,
        )}
        aria-hidden
      />
      <div className="relative flex items-start gap-4">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1",
            styles.icon,
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#737373]">
            Produto OMNI
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
            {product.name}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#A3A3A3]">{product.description}</p>
        </div>
      </div>

      <div className="relative mt-5 flex flex-wrap gap-1.5">
        {product.highlights.map((h) => (
          <span
            key={h}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-medium",
              styles.chip,
            )}
          >
            {h}
          </span>
        ))}
      </div>

      <div
        className={cn(
          "relative mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition group-hover:brightness-110",
          styles.cta,
        )}
      >
        {product.cta}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export function OmniHub() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const resetBusinessContext = useBusinessContextStore((s) => s.resetBusinessContext);
  const { data: user } = useSessionUser();
  const products = listAvailableProducts();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      /* ignore */
    }
    clearHubSession();
    resetBusinessContext(null);
    queryClient.clear();
    router.replace("/login");
  }

  const firstName = user?.name?.split(/\s+/)[0] ?? "você";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05060c] text-[#F5F6FA]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,60,255,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(12,212,255,0.1),_transparent_45%)]"
        aria-hidden
      />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <LhHoldingLogo height={44} className="max-w-[160px] sm:max-w-[200px]" />
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-white">{user?.name ?? "…"}</p>
            <p className="text-[11px] text-[#737373]">{user?.email}</p>
          </div>
          <Link
            href="/configuracoes"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#A3A3A3] transition hover:border-[#7C3CFF]/40 hover:text-white"
            aria-label="Configurações"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-medium text-[#A3A3A3] transition hover:border-[#7C3CFF]/40 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <div className="mb-8 flex items-start gap-3 sm:mb-10">
          <span className="mt-1 hidden h-10 w-10 items-center justify-center rounded-2xl bg-[#7C3CFF]/15 text-[#B794FF] ring-1 ring-[#7C3CFF]/25 sm:flex">
            <LayoutGrid className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7C3CFF]">
              OMNI Hub
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Bem-vindo{firstName !== "você" ? `, ${firstName}` : ""} à OMNI
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#A3A3A3] sm:text-[15px]">
              Escolha onde deseja continuar. Uma conta, vários produtos do ecossistema.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}
