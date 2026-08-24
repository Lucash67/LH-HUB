import { OMNI_HUB_PATH } from "@/constants/omni-products";
import { OMNI_ONBOARDING_PATH } from "@/lib/omni-onboarding";

/**
 * Destino após login/cadastro OMNI (única autenticação).
 * - Sem `next` → Hub.
 * - Com `next` (deep link / rota protegida) → rota solicitada.
 */
export function resolvePostLoginPath(next: string | null | undefined): string {
  if (!next) return OMNI_HUB_PATH;

  const path = next.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return OMNI_HUB_PATH;
  if (path.includes("://") || path.includes("\\")) return OMNI_HUB_PATH;
  if (path.startsWith("/login") || path.startsWith("/api/")) return OMNI_HUB_PATH;
  if (path === OMNI_ONBOARDING_PATH || path.startsWith(`${OMNI_ONBOARDING_PATH}/`)) {
    return OMNI_HUB_PATH;
  }

  return path;
}
