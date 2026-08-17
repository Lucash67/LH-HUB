/** Cores de contexto por módulo — DNA visual OMNI. */
export type ModuleTheme = "dashboard" | "finance" | "goals" | "alerts" | "operations" | "clients" | "reports" | "performance";

export const MODULE_THEMES: Record<
  ModuleTheme,
  { accent: string; accentDim: string; border: string; label: string }
> = {
  dashboard: {
    accent: "text-[#7C3CFF]",
    accentDim: "bg-[#7C3CFF]/10",
    border: "border-[#7C3CFF]/20",
    label: "Dashboard",
  },
  finance: {
    accent: "text-brand-green",
    accentDim: "bg-brand-green/10",
    border: "border-brand-green/20",
    label: "Financeiro",
  },
  goals: {
    accent: "text-[#0CD4FF]",
    accentDim: "bg-[#0CD4FF]/10",
    border: "border-[#0CD4FF]/20",
    label: "Metas",
  },
  alerts: {
    accent: "text-[#7C3CFF]",
    accentDim: "bg-[#7C3CFF]/10",
    border: "border-[#7C3CFF]/20",
    label: "Alertas",
  },
  operations: {
    accent: "text-[#3882F6]",
    accentDim: "bg-[#3882F6]/10",
    border: "border-[#3882F6]/20",
    label: "Operações",
  },
  clients: {
    accent: "text-[#0CD4FF]",
    accentDim: "bg-[#0CD4FF]/10",
    border: "border-[#0CD4FF]/20",
    label: "Clientes",
  },
  reports: {
    accent: "text-[#3882F6]",
    accentDim: "bg-[#3882F6]/10",
    border: "border-[#3882F6]/20",
    label: "Relatórios",
  },
  performance: {
    accent: "text-[#7C3CFF]",
    accentDim: "bg-[#7C3CFF]/10",
    border: "border-[#7C3CFF]/20",
    label: "Desempenho",
  },
};
