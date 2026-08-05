import {
  LayoutDashboard,
  LayoutGrid,
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  Wallet,
  Target,
  Sparkles,
  FileText,
  Calendar,
  CalendarClock,
  BookOpen,
  Settings,
  TrendingUp,
  LineChart,
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

/** Ordem e itens idênticos à versão Lovable oficial (+ Visão Geral no topo). */
export const NAV_ITEMS: NavItem[] = [
  { href: "/visao-geral", label: "Visão Geral", icon: LayoutGrid },
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  // Vendas pausado — histórico de vendas agora aparece por dia no Dashboard/Calendário.
  { href: "/vendas", label: "Vendas", icon: ShoppingCart, paused: true },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/estoque", label: "Estoque", icon: Warehouse, paused: true },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/desempenho", label: "Desempenho", icon: TrendingUp },
  { href: "/projecoes", label: "Projeções", icon: LineChart },
  { href: "/fechamento", label: "Fechamento & Tendência", icon: CalendarClock },
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

/** Destinos da barra inferior no celular — o resto fica no menu lateral. */
export const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: "/visao-geral", label: "Hub", icon: LayoutGrid },
  { href: "/registro-dia", label: "Registrar", icon: ClipboardPaste },
  { href: "/desempenho", label: "Semana", icon: TrendingUp },
  { href: "/fechamento", label: "Tendência", icon: CalendarClock },
];

export const APP_NAME = "LH Hub";
export const APP_TAGLINE = "Centro operacional";
