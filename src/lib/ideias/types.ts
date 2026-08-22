import { z } from "zod";

export const IDEA_KINDS = ["ideia", "demanda", "observacao"] as const;
export type IdeaKind = (typeof IDEA_KINDS)[number];

export const IDEA_STATUSES = ["open", "done", "archived"] as const;
export type IdeaStatus = (typeof IDEA_STATUSES)[number];

export const IDEA_KIND_LABELS: Record<IdeaKind, string> = {
  ideia: "Ideia",
  demanda: "Demanda",
  observacao: "Observação",
};

export const IDEA_STATUS_LABELS: Record<IdeaStatus, string> = {
  open: "Aberta",
  done: "Feita",
  archived: "Arquivada",
};

export interface IdeaItem {
  id: string;
  ownerId: string;
  businessId: string | null;
  title: string;
  body: string;
  kind: IdeaKind;
  status: IdeaStatus;
  pinned: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const ideaUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().max(200).optional(),
  body: z.string().max(8000).optional(),
  kind: z.enum(IDEA_KINDS).optional(),
  status: z.enum(IDEA_STATUSES).optional(),
  pinned: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  businessId: z.string().uuid().nullable().optional(),
});

export type IdeaUpsertInput = z.infer<typeof ideaUpsertSchema>;
