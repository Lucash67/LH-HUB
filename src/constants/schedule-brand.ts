/** Copy / nav do produto OMNI Schedule (família OMNI, produto distinto do Business). */
export const SCHEDULE_COPY = {
  productName: "OMNI Schedule",
  productTagline: "Agenda e atendimento",
  holdingName: "OMNI",
  homeHint: "O que está acontecendo hoje?",
} as const;

export const SCHEDULE_NAV = [
  { href: "/schedule", label: "Início", exact: true },
  { href: "/schedule/agenda", label: "Agenda" },
  { href: "/schedule/clientes", label: "Clientes" },
  { href: "/schedule/servicos", label: "Serviços" },
  { href: "/schedule/equipe", label: "Equipe" },
  { href: "/schedule/configuracoes", label: "Configurações" },
] as const;
