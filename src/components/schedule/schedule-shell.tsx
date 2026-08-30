"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, MoreHorizontal, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SCHEDULE_COPY,
  SCHEDULE_MOBILE_MORE,
  SCHEDULE_MOBILE_PRIMARY,
  SCHEDULE_NAV,
  isScheduleNavActive,
  schedulePageMeta,
} from "@/constants/schedule-brand";
import { ProductSwitcher } from "@/components/hub/product-switcher";
import { useSessionUser } from "@/hooks/use-session-user";

export type ScheduleShellOrg = {
  name: string;
  address: string | null;
  slug: string;
  logoUrl: string | null;
  publicPageReady: boolean;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase() || "?";
}

function ScheduleLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/schedule" className="flex min-w-0 items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3CFF] to-[#0CD4FF] text-white">
        <CalendarDays className="h-4 w-4" />
      </span>
      {!compact && (
        <span className="min-w-0 leading-tight">
          <span className="block text-[11px] font-semibold tracking-[0.18em] text-white">
            OMNI
          </span>
          <span className="block text-[11px] font-semibold tracking-[0.14em] text-[#0CD4FF]">
            SCHEDULE
          </span>
        </span>
      )}
    </Link>
  );
}

function NavList({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <nav className={cn("flex flex-col gap-0.5", className)} aria-label="OMNI Schedule">
      {SCHEDULE_NAV.map((item) => {
        const active = isScheduleNavActive(pathname, item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-[#7C3CFF]/18 text-white"
                : "text-[#A0A0A0] hover:bg-white/5 hover:text-white",
            )}
          >
            {active && (
              <span
                className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[#7C3CFF]"
                aria-hidden
              />
            )}
            <Icon className={cn("h-4 w-4 shrink-0", active && "text-[#C4B5FD]")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function OrgCard({ organization }: { organization: ScheduleShellOrg | null }) {
  if (!organization) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#151922] p-3">
        <p className="text-sm font-semibold text-white">Seu estabelecimento</p>
        <p className="mt-0.5 text-[11px] text-[#A0A0A0]">Configure na próxima etapa.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#151922] p-3">
      <div className="flex items-center gap-2.5">
        {organization.logoUrl ? (
          <span
            className="h-9 w-9 shrink-0 rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url(${organization.logoUrl})` }}
            aria-hidden
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C3CFF]/25 text-xs font-bold text-[#C4B5FD]">
            {initials(organization.name)}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{organization.name}</p>
          <p className="truncate text-[11px] text-[#A0A0A0]">
            {organization.address || "Endereço ainda não informado"}
          </p>
        </div>
      </div>
      {organization.publicPageReady && (
        <Link
          href={`/agendar/${organization.slug}`}
          className="mt-2 inline-flex text-[11px] font-medium text-[#0CD4FF] hover:underline"
        >
          Ver página pública
        </Link>
      )}
    </div>
  );
}

export function ScheduleShell({
  children,
  organization,
}: {
  children: React.ReactNode;
  organization: ScheduleShellOrg | null;
}) {
  const pathname = usePathname();
  const { data: user } = useSessionUser();
  const [moreOpen, setMoreOpen] = useState(false);
  const meta = schedulePageMeta(pathname);
  const displayName = user?.id === "local" ? null : user?.name;

  const closeMore = useCallback(() => setMoreOpen(false), []);
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F6FA]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/[0.06] bg-[#0B0F14] lg:flex">
        <div className="px-4 py-4">
          <ScheduleLogo />
          <p className="mt-1 truncate pl-12 text-[10px] text-[#6B7280]">
            {SCHEDULE_COPY.holdingName}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <NavList />
        </div>
        <div className="px-3 pb-4">
          <OrgCard organization={organization} />
        </div>
      </aside>

      {moreOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={closeMore}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {moreOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-white/10 bg-[#12151f] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:hidden">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#A0A0A0]">
            Mais
          </p>
          <NavList
            onNavigate={closeMore}
            className="max-h-[50vh] overflow-y-auto"
          />
          <div className="mt-3">
            <OrgCard organization={organization} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0B0F14]/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <div className="lg:hidden">
              <ScheduleLogo compact />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                {meta.title}
              </h1>
              {meta.subtitle && (
                <p className="hidden truncate text-xs text-[#A0A0A0] sm:block">{meta.subtitle}</p>
              )}
            </div>
            <label className="relative hidden min-w-[220px] max-w-sm flex-1 md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
              <input
                disabled
                placeholder="Buscar clientes, agendamentos…"
                className="h-10 w-full rounded-xl border border-white/10 bg-[#151922] pl-9 pr-14 text-sm text-[#A0A0A0] outline-none"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-[#6B7280]">
                ⌘K
              </span>
            </label>
            <ProductSwitcher compact />
            {displayName && (
              <div className="hidden items-center gap-2 sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7C3CFF]/25 text-[11px] font-bold text-[#C4B5FD]">
                  {initials(displayName)}
                </span>
                <span className="hidden max-w-[140px] truncate text-xs text-[#A0A0A0] xl:inline">
                  {displayName}
                </span>
              </div>
            )}
          </div>
        </header>

        <main className="overflow-x-clip px-4 py-5 pb-[calc(6.25rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:pb-8">
          {children}
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#7C3CFF]/15 bg-[#0B0F14]/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        aria-label="Navegação principal"
      >
        <div className="flex items-stretch">
          {SCHEDULE_MOBILE_PRIMARY.slice(0, 2).map((item) => {
            const active = isScheduleNavActive(pathname, item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-semibold",
                  active ? "text-[#7C3CFF]" : "text-[#A0A0A0]",
                )}
              >
                {active && (
                  <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-[#7C3CFF]" />
                )}
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                {item.label}
              </Link>
            );
          })}
          <div className="relative flex min-h-[56px] flex-1 items-center justify-center">
            <Link
              href="/schedule/agenda/novo"
              aria-label="Novo agendamento"
              className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3CFF] to-[#3882F6] text-white"
            >
              <Plus className="h-6 w-6" strokeWidth={2.25} />
            </Link>
          </div>
          {SCHEDULE_MOBILE_PRIMARY.slice(2).map((item) => {
            const active = isScheduleNavActive(pathname, item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-semibold",
                  active ? "text-[#7C3CFF]" : "text-[#A0A0A0]",
                )}
              >
                {active && (
                  <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-[#7C3CFF]" />
                )}
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            className={cn(
              "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-semibold",
              moreOpen || SCHEDULE_MOBILE_MORE.some((item) => isScheduleNavActive(pathname, item))
                ? "text-[#7C3CFF]"
                : "text-[#A0A0A0]",
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            Mais
          </button>
        </div>
      </nav>
    </div>
  );
}

export function ScheduleOnboardingFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F5F6FA]">
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0B0F14]/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <ScheduleLogo />
          <ProductSwitcher />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">{children}</main>
    </div>
  );
}
