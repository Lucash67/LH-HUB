import { desc, eq, inArray } from "drizzle-orm";
import { getPostgresDb, isPostgres } from "@/platform/db";
import { toDbBusinessId, fromDbBusinessId } from "@/platform/db/business-id";
import { queryAll, queryOne, queryRun, toIsoTimestamp } from "@/platform/db/query";
import { galleryAssetFiles, galleryAssets } from "@/lib/db/postgres/schema";
import { isAllBusinesses } from "@/lib/business-units";
import { getTenantDbIds } from "@/lib/auth/tenant-context";
import { generateId } from "@/shared/ids/generate-id";
import type { GalleryAsset, GalleryCategory } from "@/lib/galeria/types";

function requirePostgres() {
  if (!isPostgres()) {
    throw new Error("Galeria exige DB_PROVIDER=postgres.");
  }
}

function mapAsset(row: typeof galleryAssets.$inferSelect): GalleryAsset {
  const hasFile = Boolean(row.hasFile);
  const biz = fromDbBusinessId(row.businessId);
  const q = `businessId=${encodeURIComponent(biz)}`;
  return {
    id: row.id,
    businessId: biz,
    title: row.title,
    category: row.category as GalleryCategory,
    notes: row.notes ?? "",
    fileName: row.fileName,
    mimeType: row.mimeType,
    byteSize: row.byteSize,
    hasFile,
    createdBy: row.createdBy,
    createdAt: toIsoTimestamp(row.createdAt),
    updatedAt: toIsoTimestamp(row.updatedAt),
    previewUrl: hasFile ? `/api/galeria/${row.id}/file?mode=inline&${q}` : null,
    downloadUrl: hasFile ? `/api/galeria/${row.id}/file?mode=download&${q}` : null,
  };
}

export async function listGalleryAssets(businessId: string): Promise<GalleryAsset[]> {
  requirePostgres();
  const tenantIds = getTenantDbIds();
  if (tenantIds !== undefined && tenantIds.length === 0) return [];

  const db = await getPostgresDb();
  let rows;
  if (!isAllBusinesses(businessId)) {
    rows = await queryAll(
      db
        .select()
        .from(galleryAssets)
        .where(eq(galleryAssets.businessId, toDbBusinessId(businessId)))
        .orderBy(desc(galleryAssets.createdAt)),
    );
  } else if (tenantIds !== undefined) {
    rows = await queryAll(
      db
        .select()
        .from(galleryAssets)
        .where(inArray(galleryAssets.businessId, tenantIds))
        .orderBy(desc(galleryAssets.createdAt)),
    );
  } else {
    rows = await queryAll(
      db.select().from(galleryAssets).orderBy(desc(galleryAssets.createdAt)),
    );
  }
  return rows.map(mapAsset);
}

export async function getGalleryAsset(
  businessId: string,
  assetId: string,
): Promise<GalleryAsset | null> {
  requirePostgres();
  const db = await getPostgresDb();
  const row = await queryOne(
    db.select().from(galleryAssets).where(eq(galleryAssets.id, assetId)).limit(1),
  );
  if (!row) return null;
  if (!isAllBusinesses(businessId) && fromDbBusinessId(row.businessId) !== businessId) {
    return null;
  }
  return mapAsset(row);
}

export async function createGalleryAsset(input: {
  businessId: string;
  title: string;
  category: GalleryCategory;
  notes?: string;
  createdBy?: string | null;
}): Promise<GalleryAsset> {
  requirePostgres();
  const id = generateId();
  const now = new Date();
  const db = await getPostgresDb();
  await queryRun(
    db.insert(galleryAssets).values({
      id,
      businessId: toDbBusinessId(input.businessId),
      title: input.title,
      category: input.category,
      notes: input.notes ?? "",
      hasFile: false,
      createdBy: input.createdBy ?? null,
      createdAt: now,
      updatedAt: now,
    }),
  );
  const created = await getGalleryAsset(input.businessId, id);
  if (!created) throw new Error("Falha ao criar item da galeria.");
  return created;
}

export async function updateGalleryAssetMeta(input: {
  businessId: string;
  id: string;
  title: string;
  category: GalleryCategory;
  notes?: string;
}): Promise<GalleryAsset | null> {
  requirePostgres();
  const existing = await getGalleryAsset(input.businessId, input.id);
  if (!existing) return null;
  const db = await getPostgresDb();
  await queryRun(
    db
      .update(galleryAssets)
      .set({
        title: input.title,
        category: input.category,
        notes: input.notes ?? "",
        updatedAt: new Date(),
      })
      .where(eq(galleryAssets.id, input.id)),
  );
  return getGalleryAsset(input.businessId, input.id);
}

export async function attachGalleryFile(input: {
  businessId: string;
  assetId: string;
  fileName: string;
  mimeType: string;
  content: Buffer;
}): Promise<GalleryAsset | null> {
  requirePostgres();
  const existing = await getGalleryAsset(input.businessId, input.assetId);
  if (!existing) return null;

  const db = await getPostgresDb();
  const now = new Date();
  const byteSize = input.content.byteLength;

  const fileRow = await queryOne(
    db
      .select()
      .from(galleryAssetFiles)
      .where(eq(galleryAssetFiles.assetId, input.assetId))
      .limit(1),
  );

  if (fileRow) {
    await queryRun(
      db
        .update(galleryAssetFiles)
        .set({ content: input.content, createdAt: now })
        .where(eq(galleryAssetFiles.assetId, input.assetId)),
    );
  } else {
    await queryRun(
      db.insert(galleryAssetFiles).values({
        assetId: input.assetId,
        content: input.content,
        createdAt: now,
      }),
    );
  }

  await queryRun(
    db
      .update(galleryAssets)
      .set({
        fileName: input.fileName,
        mimeType: input.mimeType,
        byteSize,
        hasFile: true,
        updatedAt: now,
      })
      .where(eq(galleryAssets.id, input.assetId)),
  );

  return getGalleryAsset(input.businessId, input.assetId);
}

export async function getGalleryFileContent(
  businessId: string,
  assetId: string,
): Promise<{ asset: GalleryAsset; content: Buffer } | null> {
  requirePostgres();
  const asset = await getGalleryAsset(businessId, assetId);
  if (!asset || !asset.hasFile) return null;

  const db = await getPostgresDb();
  const row = await queryOne(
    db
      .select()
      .from(galleryAssetFiles)
      .where(eq(galleryAssetFiles.assetId, assetId))
      .limit(1),
  );
  if (!row) return null;
  return { asset, content: row.content };
}

export async function deleteGalleryAsset(
  businessId: string,
  assetId: string,
): Promise<boolean> {
  requirePostgres();
  const existing = await getGalleryAsset(businessId, assetId);
  if (!existing) return false;
  const db = await getPostgresDb();
  await queryRun(db.delete(galleryAssets).where(eq(galleryAssets.id, assetId)));
  return true;
}
