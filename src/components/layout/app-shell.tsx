"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { SIDEBAR_WIDTH } from "@/constants/navigation";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export function AppShell({ children, title, subtitle, actions }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface-base">
      <Sidebar />
      <div style={{ paddingLeft: SIDEBAR_WIDTH }}>
        <Header title={title} subtitle={subtitle} actions={actions} />
        <main className="p-4 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
