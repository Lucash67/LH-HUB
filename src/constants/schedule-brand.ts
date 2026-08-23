/** Copy / nav do produto OMNI Schedule (família OMNI, produto distinto do Business). */
export const SCHEDULE_COPY = {
  productName: "OMNI Schedule",
  productTagline: "Agenda e atendimento",
  holdingName: "OMNI",
  homeHint: "O que está acontecendo hoje?",
} as const;

export const SCHEDULE_NAV = [
  { href: "/schedule", label: "Início", exact: true as const },
  { href: "/schedule/agenda", label: "Agenda", exact: false as const },
  { href: "/schedule/clientes", label: "Clientes", exact: false as const },
  { href: "/schedule/servicos", label: "Serviços", exact: false as const },
  { href: "/schedule/equipe", label: "Equipe", exact: false as const },
  { href: "/schedule/configuracoes", label: "Configurações", exact: false as const },
] as const;
