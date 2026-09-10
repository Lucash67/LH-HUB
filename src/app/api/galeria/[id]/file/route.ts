import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/shared/api-messages";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";
import { withTenantScope } from "@/lib/auth/with-tenant-api";
import { getGalleryFileContent } from "@/platform/db/repositories/gallery-repository";

type RouteContext = { params: Promise<{ id: string }> | { id: string } };

async function resolveId(params: RouteContext["params"]): Promise<string> {
  const resolved = await Promise.resolve(params);
  return resolved.id;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const id = await resolveId(context.params);
    const mode = request.nextUrl.searchParams.get("mode") === "download" ? "download" : "inline";
    return await withTenantScope(
      auth,
      request.nextUrl.searchParams.get("businessId"),
      async (scope) => {
        const packed = await getGalleryFileContent(scope.businessId, id);
        if (!packed) return apiError("Arquivo não encontrado.", 404);

        const { asset, content } = packed;
        const headers = new Headers();
        headers.set("Content-Type", asset.mimeType || "application/octet-stream");
        headers.set("Content-Length", String(content.byteLength));
        headers.set("Cache-Control", "private, max-age=60");
        const safeName = (asset.fileName || asset.title || "arquivo").replace(/"/g, "");
        if (mode === "download") {
          headers.set("Content-Disposition", `attachment; filename="${safeName}"`);
        } else {
          headers.set("Content-Disposition", `inline; filename="${safeName}"`);
        }

        return new NextResponse(new Uint8Array(content), { status: 200, headers });
      },
    );
  } catch (error) {
    console.error("Galeria file GET error:", error);
    return apiError("Não foi possível abrir o arquivo.");
  }
}
