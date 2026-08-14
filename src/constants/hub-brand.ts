import { BRIGADEIROS_BUSINESS_ID, SALGADOS_BUSINESS_ID } from "@/lib/business-units";

/** Assets de marca — PNGs amarelos removidos; aguardando pacote teal. */
export const HUB_BRAND_ASSETS = {
  /** Favicon temporário (SVG monograma mint). */
  favicon: "/icons/hub-favicon.svg",
  /**
   * Slots para quando você enviar os novos arquivos (sugestão de nomes):
   * - /brand/lh-empreendimentos.png
   * - /brand/lh-empreendimentos-icon.png
   * - /brand/lh-empreendimentos-favicon.png
   * - /brand/lh-hub-horizontal.png
   * - /brand/lh-hub-horizontal-compact.png
   * - /brand/lh-hub-icon.png
   * - /brand/lh-hub-favicon.png
   */
} as const;

/** Tokens visuais LH Empreendimentos / LH Hub — paleta mint/teal (refs dash). */
export const HUB_COLORS = {
  black: "#121212",
  yellow: "#00D4A8",
  secondary: "#14B8A6",
  mintLight: "#5EEAD4",
  white: "#FFFFFF",
  gray: {
    400: "#A0A0A0",
    500: "#8E8E93",
    600: "#525252",
    700: "#2A2A2A",
    800: "#1C1C1C",
    900: "#121212",
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
    name: "LH Salty",
    description: "Operação de salgados",
    status: "active",
  },
  {
    id: BRIGADEIROS_BUSINESS_ID,
    index: "02",
    name: "LH Candy",
    description: "Doces e confeitaria",
    status: "active",
  },
];

export const HUB_VALUE_PROPS = [
  {
    title: "Operação em tempo real",
    description: "Indicadores e vendas atualizados conforme sua operação evolui.",
  },
  {
    title: "Dados protegidos",
    description: "Informações centralizadas com controle por empreendimento.",
  },
  {
    title: "Arquitetura escalável",
    description: "Pronto para novos negócios sem reestruturar a plataforma.",
  },
] as const;

export const HUB_COPY = {
  holdingName: "LH Empreendimentos",
  holdingTagline: "Holding de negócios",
  productName: "LH Hub",
  productTagline: "Centro operacional",
  heroTitle: "Vender no feeling cansa.",
  heroHighlight: "Controlar, escala.",
  heroTagline: "LH Hub · LH Empreendimentos",
  heroDescription:
    "LH Hub é o centro de gestão da LH Empreendimentos. Integramos dados, equipes e operações em um único painel inteligente.",
  enterprisesHeading: "Operação ao vivo",
  footerSlogan: "Construindo hoje o amanhã que inspira.",
  footerLegacy:
    "Tecnologia e gestão que impulsionam o presente, preparam o futuro e constroem legado.",
  authWelcome: "Bem-vindo ao",
  authSubtitle: "Sua central. Seu império. Seu comando.",
} as const;
