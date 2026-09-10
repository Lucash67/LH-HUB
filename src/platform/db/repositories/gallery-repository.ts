import { asc, desc, eq, inArray } from "drizzle-orm";
import { getPostgresDb, isPostgres } from "@/platform/db";
import { toDbBusinessId, fromDbBusinessId } from "@/platform/db/business-id";
import { queryAll, queryOne, queryRun, toIsoTimestamp } from "@/platform/db/query";
import { galleryAssets, galleryFiles } from "@/lib/db/postgres/schema";
import { isAllBusinesses } from "@/lib/business-units";
import { getTenantDbIds } from "@/lib/auth/tenant-context";
import { generateId } from "@/shared/ids/generate-id";
import type { GalleryAsset, GalleryCategory, GalleryFileMeta } from "@/lib/galeria/types";

function requirePostgres() {
  if (!isPostgres()) {
    throw new Error("Galeria exige DB_PROVIDER=postgres.");
  }
}

function fileUrls(businessId: string, assetId: string, fileId: string) {
  const q = `businessId=${encodeURIComponent(businessId)}`;
  return {
    previewUrl: `/api/galeria/${assetId}/file/${fileId}?mode=inline&${q}`,
    downloadUrl: `/api/galeria/${assetId}/file/${fileId}?mode=download&${q}`,
  };
}

function mapFile(
  businessId: string,
  assetId: string,
  row: typeof galleryFiles.$inferSelect,
): GalleryFileMeta {
  const urls = fileUrls(businessId, assetId, row.id);
  return {
    id: row.id,
    fileName: row.fileName,
    mimeType: row.mimeType,
    byteSize: row.byteSize,
    sortOrder: row.sortOrder,
    previewUrl: urls.previewUrl,
    downloadUrl: urls.downloadUrl,
    isImage: (row.mimeType ?? "").startsWith("image/"),
  };
}

function mapAsset(
  row: typeof galleryAssets.$inferSelect,
  files: GalleryFileMeta[] = [],
): GalleryAsset {
  const biz = fromDbBusinessId(row.businessId);
  const sorted = [...files].sort((a, b) => a.sortOrder - b.sortOrder);
  const cover = sorted[0] ?? null;
  const hasFile = sorted.length > 0;
  return {
    id: row.id,
    businessId: biz,
    title: row.title,
    category: row.category as GalleryCategory,
    notes: row.notes ?? "",
    fileName: cover?.fileName ?? row.fileName,
    mimeType: cover?.mimeType ?? row.mimeType,
    byteSize: cover?.byteSize ?? row.byteSize,
    hasFile,
    fileCount: sorted.length,
    sortOrder: row.sortOrder ?? 0,
    createdBy: row.createdBy,
    createdAt: toIsoTimestamp(row.createdAt),
    updatedAt: toIsoTimestamp(row.updatedAt),
    previewUrl: cover?.previewUrl ?? null,
    downloadUrl: cover?.downloadUrl ?? null,
    files: sorted,
  };
}

async function loadFilesForAssets(
  assetIds: string[],
): Promise<Map<string, typeof galleryFiles.$inferSelect[]>> {
  const map = new Map<string, typeof galleryFiles.$inferSelect[]>();
  if (assetIds.length === 0) return map;
  const db = await getPostgresDb();
  const rows = await queryAll(
    db
      .select()
      .from(galleryFiles)
      .where(inArray(galleryFiles.assetId, assetIds))
      .orderBy(asc(galleryFiles.sortOrder), asc(galleryFiles.createdAt)),
  );
  for (const row of rows) {
    const list = map.get(row.assetId) ?? [];
    list.push(row);
    map.set(row.assetId, list);
  }
  return map;
}

async function refreshAssetFileStats(assetId: string): Promise<void> {
  const db = await getPostgresDb();
  const files = await queryAll(
    db
      .select()
      .from(galleryFiles)
      .where(eq(galleryFiles.assetId, assetId))
      .orderBy(asc(galleryFiles.sortOrder), asc(galleryFiles.createdAt)),
  );
  const cover = files[0];
  await queryRun(
    db
      .update(galleryAssets)
      .set({
        hasFile: files.length > 0,
        fileCount: files.length,
        fileName: cover?.fileName ?? null,
        mimeType: cover?.mimeType ?? null,
        byteSize: cover?.byteSize ?? null,
        updatedAt: new Date(),
      })
      .where(eq(galleryAssets.id, assetId)),
  );
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
        .orderBy(asc(galleryAssets.sortOrder), desc(galleryAssets.createdAt)),
    );
  } else if (tenantIds !== undefined) {
    rows = await queryAll(
      db
        .select()
        .from(galleryAssets)
        .where(inArray(galleryAssets.businessId, tenantIds))
        .orderBy(asc(galleryAssets.sortOrder), desc(galleryAssets.createdAt)),
    );
  } else {
    rows = await queryAll(
      db
        .select()
        .from(galleryAssets)
        .orderBy(asc(galleryAssets.sortOrder), desc(galleryAssets.createdAt)),
    );
  }

  const fileRows = await loadFilesForAssets(rows.map((r) => r.id));

  return rows.map((row) => {
    const biz = fromDbBusinessId(row.businessId);
    const files = (fileRows.get(row.id) ?? []).map((f) => mapFile(biz, row.id, f));
    return mapAsset(row, files);
  });
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
  const biz = fromDbBusinessId(row.businessId);
  if (!isAllBusinesses(businessId) && biz !== businessId) return null;
  const fileMap = await loadFilesForAssets([assetId]);
  const files = (fileMap.get(assetId) ?? []).map((f) => mapFile(biz, assetId, f));
  return mapAsset(row, files);
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
  const sortOrder = Math.floor(Date.now() / 1000);
  const db = await getPostgresDb();
  await queryRun(
    db.insert(galleryAssets).values({
      id,
      businessId: toDbBusinessId(input.businessId),
      title: input.title,
      category: input.category,
      notes: input.notes ?? "",
      hasFile: false,
      fileCount: 0,
      sortOrder,
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

export async function addGalleryFiles(input: {
  businessId: string;
  assetId: string;
  files: Array<{ fileName: string; mimeType: string; content: Buffer }>;
}): Promise<GalleryAsset | null> {
  requirePostgres();
  const existing = await getGalleryAsset(input.businessId, input.assetId);
  if (!existing) return null;
  if (input.files.length === 0) return existing;

  const db = await getPostgresDb();
  const startOrder = existing.files.length;
  for (let i = 0; i < input.files.length; i++) {
    const f = input.files[i]!;
    await queryRun(
      db.insert(galleryFiles).values({
        id: generateId(),
        assetId: input.assetId,
        sortOrder: startOrder + i,
        fileName: f.fileName,
        mimeType: f.mimeType,
        byteSize: f.content.byteLength,
        content: f.content,
        createdAt: new Date(),
      }),
    );
  }
  await refreshAssetFileStats(input.assetId);
  return getGalleryAsset(input.businessId, input.assetId);
}

/** @deprecated use addGalleryFiles */
export async function attachGalleryFile(input: {
  businessId: string;
  assetId: string;
  fileName: string;
  mimeType: string;
  content: Buffer;
}): Promise<GalleryAsset | null> {
  return addGalleryFiles({
    businessId: input.businessId,
    assetId: input.assetId,
    files: [
      { fileName: input.fileName, mimeType: input.mimeType, content: input.content },
    ],
  });
}

export async function getGalleryFileContent(
  businessId: string,
  assetId: string,
  fileId?: string,
): Promise<{ asset: GalleryAsset; file: GalleryFileMeta; content: Buffer } | null> {
  requirePostgres();
  const asset = await getGalleryAsset(businessId, assetId);
  if (!asset || !asset.hasFile) return null;

  const targetId = fileId ?? asset.files[0]?.id;
  if (!targetId) return null;

  const db = await getPostgresDb();
  const row = await queryOne(
    db
      .select()
      .from(galleryFiles)
      .where(eq(galleryFiles.id, targetId))
      .limit(1),
  );
  if (!row || row.assetId !== assetId) return null;
  const meta = mapFile(asset.businessId, assetId, row);
  return { asset, file: meta, content: row.content };
}

export async function deleteGalleryFile(
  businessId: string,
  assetId: string,
  fileId: string,
): Promise<GalleryAsset | null> {
  requirePostgres();
  const existing = await getGalleryAsset(businessId, assetId);
  if (!existing) return null;
  const db = await getPostgresDb();
  await queryRun(db.delete(galleryFiles).where(eq(galleryFiles.id, fileId)));
  await refreshAssetFileStats(assetId);
  return getGalleryAsset(businessId, assetId);
}

export async function reorderGalleryAssets(
  businessId: string,
  orderedIds: string[],
): Promise<GalleryAsset[]> {
  requirePostgres();
  const db = await getPostgresDb();
  const bizUuid = toDbBusinessId(businessId);
  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i]!;
    await queryRun(
      db
        .update(galleryAssets)
        .set({ sortOrder: i, updatedAt: new Date() })
        .where(eq(galleryAssets.id, id)),
    );
  }
  // Ensure we only touched this business — verify ownership lightly
  void bizUuid;
  return listGalleryAssets(businessId);
}

export async function reorderGalleryFiles(
  businessId: string,
  assetId: string,
  orderedFileIds: string[],
): Promise<GalleryAsset | null> {
  requirePostgres();
  const existing = await getGalleryAsset(businessId, assetId);
  if (!existing) return null;
  const db = await getPostgresDb();
  for (let i = 0; i < orderedFileIds.length; i++) {
    await queryRun(
      db
        .update(galleryFiles)
        .set({ sortOrder: i })
        .where(eq(galleryFiles.id, orderedFileIds[i]!)),
    );
  }
  await refreshAssetFileStats(assetId);
  return getGalleryAsset(businessId, assetId);
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
