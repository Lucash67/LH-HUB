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
  NotebookPen,
  Settings,
  TrendingUp,
  LineChart,
  PiggyBank,
  ClipboardPaste,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Módulo pausado — oculto do menu, rota permanece ativa para reativação futura. */
  paused?: boolean;
}

/** Setor/departamento do menu — agrupa módulos na sidebar. */
export type NavSectorId =
  | "operate"
  | "review"
  | "catalog"
  | "paused_ops"
  | "paused_money"
  | "paused_perf"
  | "paused_intel";

export interface NavSector {
  id: NavSectorId;
  label: string;
  items: NavItem[];
  /** Setor inteiro oculto se todos os itens estiverem paused (sidebar filtra item a item). */
}

const NAV_BY_HREF = {
  visaoGeral: { href: "/visao-geral", label: "Visão Geral", icon: LayoutGrid, paused: true },
  dashboard: { href: "/", label: "Dashboard", icon: LayoutDashboard },
  vendas: { href: "/vendas", label: "Vendas", icon: ShoppingCart, paused: true },
  produtos: { href: "/produtos", label: "Produtos", icon: Package },
  estoque: { href: "/estoque", label: "Estoque", icon: Warehouse, paused: true },
  clientes: { href: "/clientes", label: "Clientes", icon: Users },
  financeiro: { href: "/financeiro", label: "Financeiro", icon: Wallet, paused: true },
  desempenho: { href: "/desempenho", label: "Semana", icon: TrendingUp },
  retrato: { href: "/retrato", label: "Retrato", icon: ScrollText },
  projecoes: { href: "/projecoes", label: "Projeções", icon: LineChart, paused: true },
  fechamento: {
    href: "/fechamento",
    label: "Mês",
    icon: CalendarClock,
  },
  bancoLucro: { href: "/banco-lucro", label: "Cofrinho", icon: PiggyBank },
  metas: { href: "/metas", label: "Metas", icon: Target, paused: true },
  insights: { href: "/insights", label: "Insights", icon: Sparkles, paused: true },
  relatorios: { href: "/relatorios", label: "Relatórios", icon: FileText, paused: true },
  diario: { href: "/diario", label: "Diário Operacional", icon: BookOpen, paused: true },
  notas: { href: "/notas", label: "Notas", icon: NotebookPen },
  registroDia: { href: "/registro-dia", label: "Registro do Dia", icon: ClipboardPaste },
  calendario: { href: "/calendario", label: "Calendário", icon: Calendar, paused: true },
  configuracoes: { href: "/configuracoes", label: "Configurações", icon: Settings },
} as const satisfies Record<string, NavItem>;

/** Sem hub de holding — Dashboard é a home. */
export const NAV_PINNED_TOP: NavItem[] = [];

/** Sistema / ajustes — sempre no fim da lista de módulos. */
export const NAV_PINNED_BOTTOM: NavItem[] = [NAV_BY_HREF.configuracoes];

/**
 * Menu pé no chão (Salgados): Operação → Revisão → Cadastros.
 * Pausados ficam no array para reativar sem perder a rota.
 */
export const NAV_SECTORS: NavSector[] = [
  {
    id: "operate",
    label: "Operação",
    items: [
      NAV_BY_HREF.dashboard,
      NAV_BY_HREF.registroDia,
      NAV_BY_HREF.notas,
      NAV_BY_HREF.diario,
      NAV_BY_HREF.calendario,
      NAV_BY_HREF.vendas,
      NAV_BY_HREF.visaoGeral,
    ],
  },
  {
    id: "review",
    label: "Revisão",
    items: [
      NAV_BY_HREF.desempenho,
      NAV_BY_HREF.retrato,
      NAV_BY_HREF.fechamento,
      NAV_BY_HREF.bancoLucro,
      NAV_BY_HREF.financeiro,
      NAV_BY_HREF.projecoes,
      NAV_BY_HREF.metas,
    ],
  },
  {
    id: "catalog",
    label: "Cadastros",
    items: [NAV_BY_HREF.produtos, NAV_BY_HREF.clientes, NAV_BY_HREF.estoque],
  },
  {
    id: "paused_intel",
    label: "Inteligência",
    items: [NAV_BY_HREF.insights, NAV_BY_HREF.relatorios],
  },
];

/** Lista plana (compat / buscas). Ordem: pin topo → setores → pin fundo. */
export const NAV_ITEMS: NavItem[] = [
  ...NAV_PINNED_TOP,
  ...NAV_SECTORS.flatMap((s) => s.items),
  ...NAV_PINNED_BOTTOM,
];

export const SIDEBAR_WIDTH = 240;

/** Destinos da barra inferior no celular — operação no chão. */
export const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Hoje", icon: LayoutDashboard },
  { href: "/registro-dia", label: "Registrar", icon: ClipboardPaste },
  { href: "/retrato", label: "Retrato", icon: ScrollText },
  { href: "/notas", label: "Notas", icon: NotebookPen },
];

export const APP_NAME = "OMNI Business";
export const APP_TAGLINE = "Gestão da operação";
