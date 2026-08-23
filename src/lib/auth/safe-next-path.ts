import { OMNI_HUB_PATH } from "@/constants/omni-products";

/**
 * Valida `?next=` pós-login — evita open redirect.
 * Login normal (sem next) → Hub.
 * Login após rota protegida → retorna à rota solicitada.
 */
export function resolvePostLoginPath(next: string | null | undefined): string {
  if (!next) return OMNI_HUB_PATH;

  const path = next.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return OMNI_HUB_PATH;
  if (path.includes("://") || path.includes("\\")) return OMNI_HUB_PATH;
  if (path.startsWith("/login") || path.startsWith("/api/")) return OMNI_HUB_PATH;

  return path;
}
