import { z } from "zod";

export const GALLERY_CATEGORIES = [
  "cardapio",
  "cartaz",
  "fidelidade",
  "anuncio",
  "arte",
  "outro",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export const GALLERY_CATEGORY_LABELS: Record<GalleryCategory, string> = {
  cardapio: "Cardápio",
  cartaz: "Cartaz",
  fidelidade: "Fidelidade",
  anuncio: "Anúncio",
  arte: "Arte",
  outro: "Outro",
};

export const galleryMetaSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Informe um título.").max(160),
  category: z.enum(GALLERY_CATEGORIES).default("outro"),
  notes: z.string().trim().max(4000).optional().default(""),
});

export type GalleryMetaInput = z.infer<typeof galleryMetaSchema>;

export interface GalleryFileMeta {
  id: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  sortOrder: number;
  previewUrl: string;
  downloadUrl: string;
  isImage: boolean;
}

export interface GalleryAsset {
  id: string;
  businessId: string;
  title: string;
  category: GalleryCategory;
  notes: string;
  /** Capa / primeiro arquivo (compat). */
  fileName: string | null;
  mimeType: string | null;
  byteSize: number | null;
  hasFile: boolean;
  fileCount: number;
  sortOrder: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  previewUrl: string | null;
  downloadUrl: string | null;
  files: GalleryFileMeta[];
}

/** Limite por arquivo (Vercel Hobby ~4,5 MB body total no request). */
export const GALLERY_MAX_BYTES = 4 * 1024 * 1024;
/** Máximo de arquivos por pasta/item. */
export const GALLERY_MAX_FILES_PER_ASSET = 20;

export const GALLERY_ALLOWED_MIME_PREFIXES = [
  "image/",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.",
  "text/plain",
  "text/csv",
] as const;

export function isAllowedGalleryMime(mime: string): boolean {
  const m = (mime || "").toLowerCase();
  if (!m) return false;
  return GALLERY_ALLOWED_MIME_PREFIXES.some((p) => m.startsWith(p));
}

export function formatByteSize(bytes: number | null | undefined): string {
  if (bytes == null || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
