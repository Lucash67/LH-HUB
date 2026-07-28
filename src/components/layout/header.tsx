"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const today = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });

  return (
    <header className="sticky top-0 z-30 border-b border-surface-border bg-surface-base/95 backdrop-blur-sm">
      <div className="flex min-h-[64px] flex-wrap items-center justify-between gap-2 px-4 sm:px-5 lg:px-6 py-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">{title}</h1>
          <div className="mt-0.5 text-sm text-text-muted capitalize">
            {subtitle ?? <span>{today}</span>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
