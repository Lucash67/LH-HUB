"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { SIDEBAR_WIDTH } from "@/constants/navigation";
import { useTheme } from "next-themes";
import { resolveTheme } from "@/lib/theme-config";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export function AppShell({ children, title, subtitle, actions }: AppShellProps) {
  const { theme } = useTheme();
  const isBrand = resolveTheme(theme) === "brand";

  return (
    <div className={cn("relative min-h-screen bg-surface-base", isBrand && "brand-shell")}>
      {isBrand && (
        <>
          <div className="brand-ambient brand-ambient-a" aria-hidden />
          <div className="brand-ambient brand-ambient-b" aria-hidden />
          <div className="brand-vignette" aria-hidden />
          <div className="brand-grain" aria-hidden />
        </>
      )}
      <Sidebar />
      <div className="relative z-[1]" style={{ paddingLeft: SIDEBAR_WIDTH }}>
        <Header title={title} subtitle={subtitle} actions={actions} brandHeader={isBrand} />
        <main className="p-4 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
