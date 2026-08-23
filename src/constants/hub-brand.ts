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
    title: "Visão completa",
    description: "Tudo conectado em um só lugar para você enxergar a operação.",
  },
  {
    title: "Mais controle",
    description: "Indicadores e registros em tempo real da sua operação.",
  },
  {
    title: "Inteligência",
    description: "Dados claros para decidir com segurança.",
  },
  {
    title: "Crescimento",
    description: "Organização que escala com o seu negócio.",
  },
] as const;

/**
 * Arquitetura de marca:
 * OMNI = marca-mãe / ecossistema
 * OMNI Business = produto de gestão (este app)
 * OMNI Schedule = produto de agenda (`/schedule`, schema `schedule.*`)
 */
export const HUB_COPY = {
  holdingName: "OMNI",
  holdingTagline: "Seu sistema operacional de negócios",
  productName: "OMNI Business",
  productTagline: "Gestão da operação",
  brandName: "OMNI",
  heroTitle: "Seu sistema operacional",
  heroHighlight: "de negócios.",
  heroTagline: "OMNI · Ecossistema",
  heroDescription:
    "Um sistema completo para você entender, controlar e fazer sua operação crescer.",
  enterprisesHeading: "Operações ativas",
  footerSlogan: "Um sistema. Toda a sua operação. Resultados reais.",
  footerLegacy: "Conexão, organização e inteligência para o seu negócio evoluir.",
  authWelcome: "Bem-vindo de volta",
  authSubtitle: "Faça login para continuar no OMNI Business.",
} as const;
