/** Persistência leve do onboarding OMNI (por usuário, no dispositivo). */

const PREFIX = "omni-onboarding-done:";

export const OMNI_ONBOARDING_PATH = "/onboarding";

function storageKey(userKey: string): string {
  return `${PREFIX}${userKey}`;
}

/** Preferir userId real; fallback e-mail (nunca a chave "local"). */
export function resolveOnboardingUserKey(
  user: { id?: string | null; email?: string | null } | null | undefined,
): string | null {
  if (!user) return null;
  if (user.id && user.id !== "local") return user.id;
  if (user.email?.trim()) return user.email.trim().toLowerCase();
  return null;
}

export function isOmniOnboardingDone(userKey: string | null | undefined): boolean {
  if (typeof window === "undefined" || !userKey) return false;
  try {
    return localStorage.getItem(storageKey(userKey)) === "1";
  } catch {
    return false;
  }
}

export function markOmniOnboardingDone(userKey: string | null | undefined): void {
  if (typeof window === "undefined" || !userKey) return;
  try {
    localStorage.setItem(storageKey(userKey), "1");
  } catch {
    /* ignore */
  }
}
