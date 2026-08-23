import { BRIGADEIROS_BUSINESS_ID, SALGADOS_BUSINESS_ID } from "@/lib/business-units";

/** Assets de marca OMNI. */
export const HUB_BRAND_ASSETS = {
  favicon: "/icons/hub-favicon.svg",
} as const;

/**
 * Tokens visuais OMNI — paleta oficial.
 * `yellow` / `secondary` mantêm nomes legacy usados em charts/componentes.
 */
export const HUB_COLORS = {
  black: "#0D0F17",
  /** Accent principal (roxo OMNI) — alias legacy `yellow`. */
  yellow: "#7C3CFF",
  secondary: "#0CD4FF",
  purple: "#7C3CFF",
  blue: "#3882F6",
  cyan: "#0CD4FF",
  mintLight: "#0CD4FF",
  white: "#F5F6FA",
  surface: "#1F2430",
  gray: {
    400: "#A0A0A0",
    500: "#8E8E93",
    600: "#525252",
    700: "#2A2A2A",
    800: "#1F2430",
    900: "#0D0F17",
  },
} as const;

export type HubEnterpriseStatus = "active" | "coming_soon";

/** Workspaces exibidos na landing — mapeiam para business_id existentes. */
export interface HubEnterprise {
  id: string;
  index: string;
  name: string;
  description: string;
  status: HubEnterpriseStatus;
}

export const HUB_ENTERPRISES: HubEnterprise[] = [
  {
    id: SALGADOS_BUSINESS_ID,
    index: "01",
    name: "Salgados",
    description: "Operação de salgados",
    status: "active",
  },
  {
    id: BRIGADEIROS_BUSINESS_ID,
    index: "02",
    name: "Brigadeiros",
    description: "Doces e confeitaria",
    status: "active",
  },
];

export const HUB_VALUE_PROPS = [
  {
    title: "Conexão",
    description: "Tudo centralizado — operação e decisões no mesmo lugar.",
  },
  {
    title: "Organização",
    description: "Registros e indicadores claros, no ritmo do dia a dia.",
  },
  {
    title: "Inteligência",
    description: "Dados que ajudam a decidir com segurança.",
  },
  {
    title: "Evolução",
    description: "Uma marca expansível: Business hoje, novas soluções depois.",
  },
] as const;

/**
 * Arquitetura de marca (oficial):
 *
 *   OMNI              = marca-mãe / ecossistema / plataforma
 *   OMNI Business     = produto de gestão (este app em produção)
 *   OMNI Schedule     = produto de agenda (`/schedule`, schema `schedule.*`)
 *
 * Telas globais (login, auth, conta) priorizam a marca OMNI.
 * O chrome interno do app identifica o produto OMNI Business.
 */
export const HUB_COPY = {
  holdingName: "OMNI",
  holdingTagline: "Ecossistema de soluções para o seu negócio",
  productName: "OMNI Business",
  productTagline: "Gestão da operação",
  brandName: "OMNI",
  heroTitle: "Conecte. Organize.",
  heroHighlight: "Evolua.",
  heroTagline: "OMNI · Ecossistema",
  heroDescription:
    "A OMNI é a plataforma. OMNI Business cuida da gestão da operação — e o ecossistema cresce com novas soluções.",
  enterprisesHeading: "Operações ativas",
  footerSlogan: "Uma marca. Várias soluções. Seu negócio no centro.",
  footerLegacy: "Conexão, organização e inteligência para o seu negócio evoluir.",
  authWelcome: "Bem-vindo de volta",
  authSubtitle: "Entre na OMNI — seu ecossistema de produtos.",
} as const;
