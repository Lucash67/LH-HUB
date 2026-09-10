import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/shared/api-messages";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";
import { withTenantScope } from "@/lib/auth/with-tenant-api";
import { requireTenantBusinessWrite } from "@/lib/auth/tenant-scope";
import {
  GALLERY_MAX_BYTES,
  galleryMetaSchema,
  isAllowedGalleryMime,
  type GalleryCategory,
} from "@/lib/galeria/types";
import {
  attachGalleryFile,
  createGalleryAsset,
  deleteGalleryAsset,
  getGalleryAsset,
  listGalleryAssets,
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

        const file = form.get("file");
        if (file instanceof File && file.size > 0) {
          const attached = await attachUploadedFile(businessId, asset.id, file);
          if (attached instanceof NextResponse) return attached;
          return NextResponse.json({ item: attached }, { status: 201 });
        }

        return NextResponse.json({ item: asset }, { status: 201 });
      });
    }

    const body = await request.json();
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

        const file = form.get("file");
        if (file instanceof File && file.size > 0) {
          const attached = await attachUploadedFile(businessId, assetId, file);
          if (attached instanceof NextResponse) return attached;
          return NextResponse.json({ item: attached });
        }

        const fresh = await getGalleryAsset(businessId, assetId);
        return NextResponse.json({ item: fresh });
      });
    }

    const body = await request.json();
    return await withTenantScope(auth, body.businessId, async (scope) => {
      const businessId = requireTenantBusinessWrite(scope, body.businessId);
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

async function attachUploadedFile(businessId: string, assetId: string, file: File) {
  if (file.size > GALLERY_MAX_BYTES) {
    return apiError("Arquivo acima de 4 MB. Compacte ou envie em partes menores.", 400);
  }
  const mime = file.type || "application/octet-stream";
  if (!isAllowedGalleryMime(mime)) {
    return apiError("Tipo de arquivo não suportado. Use imagem, PDF, ZIP ou Office.", 400);
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const updated = await attachGalleryFile({
    businessId,
    assetId,
    fileName: file.name,
    mimeType: mime,
    content: buffer,
  });
  if (!updated) return apiError("Item não encontrado.", 404);
  return updated;
}
