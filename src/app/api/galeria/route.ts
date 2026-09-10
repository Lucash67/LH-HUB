import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/shared/api-messages";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";
import { withTenantScope } from "@/lib/auth/with-tenant-api";
import { requireTenantBusinessWrite } from "@/lib/auth/tenant-scope";
import {
  GALLERY_MAX_BYTES,
  GALLERY_MAX_FILES_PER_ASSET,
  galleryMetaSchema,
  isAllowedGalleryMime,
  type GalleryCategory,
} from "@/lib/galeria/types";
import {
  addGalleryFiles,
  createGalleryAsset,
  deleteGalleryAsset,
  deleteGalleryFile,
  getGalleryAsset,
  listGalleryAssets,
  reorderGalleryAssets,
  reorderGalleryFiles,
  updateGalleryAssetMeta,
} from "@/platform/db/repositories/gallery-repository";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    return await withTenantScope(
      auth,
      request.nextUrl.searchParams.get("businessId"),
      async (scope) => {
        const items = await listGalleryAssets(scope.businessId);
        return NextResponse.json({ items });
      },
    );
  } catch (error) {
    console.error("Galeria GET error:", error);
    return apiError("Não foi possível carregar a galeria.");
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const businessIdRaw = String(form.get("businessId") ?? "");
      return await withTenantScope(auth, businessIdRaw, async (scope) => {
        const businessId = requireTenantBusinessWrite(scope, businessIdRaw);
        const parsed = galleryMetaSchema.safeParse({
          title: String(form.get("title") ?? ""),
          category: String(form.get("category") ?? "outro"),
          notes: String(form.get("notes") ?? ""),
        });
        if (!parsed.success) {
          return apiError(parsed.error.issues[0]?.message ?? "Dados inválidos.", 400);
        }

        const asset = await createGalleryAsset({
          businessId,
          title: parsed.data.title,
          category: parsed.data.category,
          notes: parsed.data.notes,
          createdBy: auth.id,
        });

        const packed = await collectUploadedFiles(form);
        if (packed instanceof NextResponse) return packed;
        if (packed.length > 0) {
          const updated = await addGalleryFiles({
            businessId,
            assetId: asset.id,
            files: packed,
          });
          return NextResponse.json({ item: updated ?? asset }, { status: 201 });
        }

        return NextResponse.json({ item: asset }, { status: 201 });
      });
    }

    const body = await request.json();

    // Reorder assets
    if (Array.isArray(body.orderedIds)) {
      return await withTenantScope(auth, body.businessId, async (scope) => {
        const businessId = requireTenantBusinessWrite(scope, body.businessId);
        const items = await reorderGalleryAssets(businessId, body.orderedIds as string[]);
        return NextResponse.json({ items });
      });
    }

    return await withTenantScope(auth, body.businessId, async (scope) => {
      const businessId = requireTenantBusinessWrite(scope, body.businessId);
      const parsed = galleryMetaSchema.safeParse(body);
      if (!parsed.success) {
        return apiError(parsed.error.issues[0]?.message ?? "Dados inválidos.", 400);
      }
      const item = await createGalleryAsset({
        businessId,
        title: parsed.data.title,
        category: parsed.data.category,
        notes: parsed.data.notes,
        createdBy: auth.id,
      });
      return NextResponse.json({ item }, { status: 201 });
    });
  } catch (error) {
    console.error("Galeria POST error:", error);
    if (error instanceof Error && error.message.includes("operação específica")) {
      return apiError(error.message, 400);
    }
    return apiError("Não foi possível criar o item.");
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const businessIdRaw = String(form.get("businessId") ?? "");
      const assetId = String(form.get("id") ?? "");
      if (!assetId) return apiError("Informe o id do item.", 400);

      return await withTenantScope(auth, businessIdRaw, async (scope) => {
        const businessId = requireTenantBusinessWrite(scope, businessIdRaw);
        const existing = await getGalleryAsset(businessId, assetId);
        if (!existing) return apiError("Item não encontrado.", 404);

        const parsed = galleryMetaSchema.safeParse({
          id: assetId,
          title: String(form.get("title") ?? existing.title),
          category: String(form.get("category") ?? existing.category),
          notes: String(form.get("notes") ?? existing.notes),
        });
        if (!parsed.success) {
          return apiError(parsed.error.issues[0]?.message ?? "Dados inválidos.", 400);
        }

        await updateGalleryAssetMeta({
          businessId,
          id: assetId,
          title: parsed.data.title,
          category: parsed.data.category,
          notes: parsed.data.notes,
        });

        const packed = await collectUploadedFiles(form);
        if (packed instanceof NextResponse) return packed;
        if (packed.length > 0) {
          if (existing.fileCount + packed.length > GALLERY_MAX_FILES_PER_ASSET) {
            return apiError(`Máximo de ${GALLERY_MAX_FILES_PER_ASSET} arquivos por pasta.`, 400);
          }
          const updated = await addGalleryFiles({
            businessId,
            assetId,
            files: packed,
          });
          return NextResponse.json({ item: updated });
        }

        const fresh = await getGalleryAsset(businessId, assetId);
        return NextResponse.json({ item: fresh });
      });
    }

    const body = await request.json();
    return await withTenantScope(auth, body.businessId, async (scope) => {
      const businessId = requireTenantBusinessWrite(scope, body.businessId);

      if (body.action === "reorder-files" && body.id && Array.isArray(body.orderedFileIds)) {
        const item = await reorderGalleryFiles(
          businessId,
          body.id,
          body.orderedFileIds as string[],
        );
        if (!item) return apiError("Item não encontrado.", 404);
        return NextResponse.json({ item });
      }

      if (body.action === "delete-file" && body.id && body.fileId) {
        const item = await deleteGalleryFile(businessId, body.id, body.fileId);
        if (!item) return apiError("Item não encontrado.", 404);
        return NextResponse.json({ item });
      }

      const parsed = galleryMetaSchema.safeParse(body);
      if (!parsed.success) {
        return apiError(parsed.error.issues[0]?.message ?? "Dados inválidos.", 400);
      }
      if (!parsed.data.id) return apiError("Informe o id do item.", 400);
      const item = await updateGalleryAssetMeta({
        businessId,
        id: parsed.data.id,
        title: parsed.data.title,
        category: parsed.data.category as GalleryCategory,
        notes: parsed.data.notes,
      });
      if (!item) return apiError("Item não encontrado.", 404);
      return NextResponse.json({ item });
    });
  } catch (error) {
    console.error("Galeria PUT error:", error);
    if (error instanceof Error && error.message.includes("operação específica")) {
      return apiError(error.message, 400);
    }
    return apiError("Não foi possível salvar o item.");
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const id = request.nextUrl.searchParams.get("id");
    const businessIdRaw = request.nextUrl.searchParams.get("businessId");
    if (!id) return apiError("Informe o id do item.", 400);
    return await withTenantScope(auth, businessIdRaw, async (scope) => {
      const businessId = requireTenantBusinessWrite(scope, businessIdRaw);
      const ok = await deleteGalleryAsset(businessId, id);
      if (!ok) return apiError("Item não encontrado.", 404);
      return NextResponse.json({ success: true });
    });
  } catch (error) {
    console.error("Galeria DELETE error:", error);
    if (error instanceof Error && error.message.includes("operação específica")) {
      return apiError(error.message, 400);
    }
    return apiError("Não foi possível excluir o item.");
  }
}

async function collectUploadedFiles(form: FormData) {
  const entries = form.getAll("file").concat(form.getAll("files"));
  const files: Array<{ fileName: string; mimeType: string; content: Buffer }> = [];
  for (const entry of entries) {
    if (!(entry instanceof File) || entry.size <= 0) continue;
    if (entry.size > GALLERY_MAX_BYTES) {
      return apiError(`“${entry.name}” passa de 4 MB. Compacte o arquivo.`, 400);
    }
    const mime = entry.type || "application/octet-stream";
    if (!isAllowedGalleryMime(mime)) {
      return apiError(`Tipo não suportado: ${entry.name}`, 400);
    }
    files.push({
      fileName: entry.name,
      mimeType: mime,
      content: Buffer.from(await entry.arrayBuffer()),
    });
  }
  if (files.length > GALLERY_MAX_FILES_PER_ASSET) {
    return apiError(`Máximo de ${GALLERY_MAX_FILES_PER_ASSET} arquivos por vez.`, 400);
  }
  return files;
}
