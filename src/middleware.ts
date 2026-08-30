import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, verifySessionToken } from "@/lib/auth/session";
import { OMNI_HUB_PATH } from "@/constants/omni-products";
import { OMNI_ONBOARDING_PATH } from "@/lib/omni-onboarding";
import { resolvePostLoginPath } from "@/lib/auth/safe-next-path";

const PUBLIC_PREFIXES = [
  "/login",
  "/api/auth",
  OMNI_ONBOARDING_PATH,
  "/agendar",
  "/agendamento",
  "/api/schedule/public",
];

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/brand/")) return true;
  if (pathname === "/favicon.ico") return true;
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // Visitante na raiz → onboarding público (não Business-first).
  if (!session && pathname === "/") {
    return NextResponse.redirect(new URL(OMNI_ONBOARDING_PATH, request.url));
  }

  if (pathname.startsWith("/login")) {
    if (session) {
      const next = request.nextUrl.searchParams.get("next");
      const dest = resolvePostLoginPath(next);
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  // Já logado no onboarding público → Hub.
  if (session && (pathname === OMNI_ONBOARDING_PATH || pathname.startsWith(`${OMNI_ONBOARDING_PATH}/`))) {
    return NextResponse.redirect(new URL(OMNI_HUB_PATH, request.url));
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    if (pathname !== OMNI_HUB_PATH && pathname !== OMNI_ONBOARDING_PATH) {
      loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)"],
};
