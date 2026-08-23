import { OMNI_HUB_PATH } from "@/constants/omni-products";
import { OMNI_ONBOARDING_PATH } from "@/lib/omni-onboarding";

/**
 * Destino pós-login.
 * - Deep link (`?next=`) → rota pedida (não força onboarding).
 * - Login normal → onboarding (a página redireciona ao Hub se já concluído).
 */
export function resolvePostLoginPath(next: string | null | undefined): string {
  if (!next) return OMNI_ONBOARDING_PATH;

  const path = next.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return OMNI_ONBOARDING_PATH;
  if (path.includes("://") || path.includes("\\")) return OMNI_ONBOARDING_PATH;
  if (path.startsWith("/login") || path.startsWith("/api/")) return OMNI_ONBOARDING_PATH;

  // Já está indo ao Hub/onboarding — mantém.
  if (path === OMNI_HUB_PATH || path.startsWith(`${OMNI_HUB_PATH}/`)) return path;
  if (path === OMNI_ONBOARDING_PATH || path.startsWith(`${OMNI_ONBOARDING_PATH}/`)) {
    return path;
  }

  return path;
}
