import { z } from "zod";

export const STICKY_NOTE_COLORS = [
  "default",
  "coral",
  "peach",
  "sand",
  "mint",
  "fog",
  "dusk",
  "lilac",
  "rose",
  "slate",
] as const;

export type StickyNoteColor = (typeof STICKY_NOTE_COLORS)[number];

export const stickyNoteSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid().optional(),
  businessId: z.string().nullable().optional(),
  title: z.string().max(500).default(""),
  body: z.string().max(100_000).default(""),
  color: z.enum(STICKY_NOTE_COLORS).default("default"),
  pinned: z.boolean().default(false),
  archived: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  clientUpdatedAt: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type StickyNote = z.infer<typeof stickyNoteSchema>;

export const stickyNoteUpsertSchema = stickyNoteSchema.partial().extend({
  id: z.string().uuid().optional(),
  title: z.string().max(500).optional(),
  body: z.string().max(100_000).optional(),
  color: z.enum(STICKY_NOTE_COLORS).optional(),
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  clientUpdatedAt: z.string().min(1),
});

export type StickyNoteUpsert = z.infer<typeof stickyNoteUpsertSchema>;

/** Cores Keep-like adaptadas ao tema escuro do LH Hub. */
export const STICKY_NOTE_COLOR_STYLES: Record<
  StickyNoteColor,
  { card: string; border: string; accent: string }
> = {
  default: {
    card: "bg-[#2a2a2a]",
    border: "border-white/10",
    accent: "bg-[#3a3a3a]",
  },
  coral: {
    card: "bg-[#5c2b2b]",
    border: "border-red-400/20",
    accent: "bg-[#7a3a3a]",
  },
  peach: {
    card: "bg-[#5c3a22]",
    border: "border-orange-400/20",
    accent: "bg-[#7a4d2e]",
  },
  sand: {
    card: "bg-[#5c4f22]",
    border: "border-yellow-400/20",
    accent: "bg-[#7a682e]",
  },
  mint: {
    card: "bg-[#1f4a3a]",
    border: "border-emerald-400/20",
    accent: "bg-[#2a6350]",
  },
  fog: {
    card: "bg-[#1f3f4a]",
    border: "border-cyan-400/20",
    accent: "bg-[#2a5563]",
  },
  dusk: {
    card: "bg-[#1f2f5c]",
    border: "border-blue-400/20",
    accent: "bg-[#2a407a]",
  },
  lilac: {
    card: "bg-[#3a2a5c]",
    border: "border-purple-400/20",
    accent: "bg-[#4d387a]",
  },
  rose: {
    card: "bg-[#5c2a45]",
    border: "border-pink-400/20",
    accent: "bg-[#7a3a5c]",
  },
  slate: {
    card: "bg-[#3a3f45]",
    border: "border-slate-400/20",
    accent: "bg-[#4a5058]",
  },
};
