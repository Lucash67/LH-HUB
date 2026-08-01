import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  Wallet,
  Target,
  Sparkles,
  FileText,
  Calendar,
  BookOpen,
  Settings,
  TrendingUp,
  PiggyBank,
  ClipboardPaste,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Módulo pausado — oculto do menu, rota permanece ativa para reativação futura. */
  paused?: boolean;
}

/** Ordem e itens idênticos à versão Lovable oficial */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendas", label: "Vendas", icon: ShoppingCart },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/estoque", label: "Estoque", icon: Warehouse, paused: true },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/desempenho", label: "Desempenho", icon: TrendingUp },
  { href: "/banco-lucro", label: "Banco de Lucro", icon: PiggyBank },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/insights", label: "Insights", icon: Sparkles },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
  { href: "/diario", label: "Diário Operacional", icon: BookOpen },
  { href: "/registro-dia", label: "Registro do Dia", icon: ClipboardPaste },
  { href: "/calendario", label: "Calendário", icon: Calendar },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export const SIDEBAR_WIDTH = 240;

export const APP_NAME = "LH Hub";
export const APP_TAGLINE = "Centro operacional";
