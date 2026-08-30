/** Copy / nav do produto OMNI CRM (família OMNI, isolado do Business). */
export const CRM_COPY = {
  productName: "OMNI CRM",
  productTagline: "Pipeline e conversão de clientes",
  holdingName: "OMNI",
  homeHint: "Como está o seu funil hoje?",
} as const;

export const CRM_NAV = [
  { href: "/crm", label: "Início", exact: true as const },
  { href: "/crm/pipeline", label: "Pipeline", exact: false as const },
  { href: "/crm/contatos", label: "Contatos", exact: false as const },
  { href: "/crm/configuracoes", label: "Configurações", exact: false as const },
] as const;

/** Estágios padrão — freela sites/softwares. */
export const CRM_DEFAULT_STAGES = [
  { slug: "lead", label: "A converter", sortOrder: 10, isWon: false, isLost: false },
  { slug: "qualified", label: "Qualificação", sortOrder: 20, isWon: false, isLost: false },
  { slug: "negotiation", label: "Negociação", sortOrder: 30, isWon: false, isLost: false },
  { slug: "won", label: "Fechado", sortOrder: 40, isWon: true, isLost: false },
  { slug: "lost", label: "Perdido", sortOrder: 50, isWon: false, isLost: true },
] as const;
