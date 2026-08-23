/**
 * Presets da vertical Barbearia — apenas seed/onboarding.
 * Núcleo do produto permanece genérico (services / professionals / …).
 */
export const BARBER_SHOP_SERVICE_PRESETS = [
  { name: "Corte", durationMinutes: 40, price: "35.00" },
  { name: "Barba", durationMinutes: 30, price: "25.00" },
  { name: "Corte + Barba", durationMinutes: 60, price: "55.00" },
  { name: "Sobrancelha", durationMinutes: 15, price: "15.00" },
] as const;

export const BARBER_SHOP_VERTICAL = {
  businessType: "barber_shop" as const,
  label: "Barbearia",
  professionalLabel: "Barbeiro",
};
