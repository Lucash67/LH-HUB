import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/shared/api-messages";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";
import { withTenantScope } from "@/lib/auth/with-tenant-api";
import { getGalleryFileContent } from "@/platform/db/repositories/gallery-repository";

type RouteContext = {
  params: Promise<{ id: string; fileId: string }> | { id: string; fileId: string };
};

async function resolveParams(params: RouteContext["params"]) {
  return Promise.resolve(params);
}

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const { id, fileId } = await resolveParams(context.params);
    const mode = request.nextUrl.searchParams.get("mode") === "download" ? "download" : "inline";
    return await withTenantScope(
      auth,
      request.nextUrl.searchParams.get("businessId"),
      async (scope) => {
        const packed = await getGalleryFileContent(scope.businessId, id, fileId);
        if (!packed) return apiError("Arquivo não encontrado.", 404);

        const { file, content } = packed;
        const headers = new Headers();
        headers.set("Content-Type", file.mimeType || "application/octet-stream");
        headers.set("Content-Length", String(content.byteLength));
        headers.set("Cache-Control", "private, max-age=60");
        const safeName = (file.fileName || "arquivo").replace(/"/g, "");
        headers.set(
          "Content-Disposition",
          mode === "download"
            ? `attachment; filename="${safeName}"`
            : `inline; filename="${safeName}"`,
        );

        return new NextResponse(new Uint8Array(content), { status: 200, headers });
      },
    );
  } catch (error) {
    console.error("Galeria file GET error:", error);
    return apiError("Não foi possível abrir o arquivo.");
  }
}
