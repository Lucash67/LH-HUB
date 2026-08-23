import { z } from "zod";
import { buildWeekdayDraftTemplate } from "./weekday-draft-templates";

export { buildWeekdayDraftTemplate } from "./weekday-draft-templates";

export const draftSaleSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/),
  clientName: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  paymentMethod: z.enum(["pix", "card", "cash"]),
  paymentStatus: z.enum(["paid", "pending", "partial"]).default("paid"),
  department: z.string().min(1),
  notes: z.string().optional(),
});

export const draftClientSchema = z.object({
  name: z.string().min(1),
  sector: z.string().optional(),
  notes: z.string().optional(),
});

export const draftPurchaseSchema = z.object({
  totalUnits: z.number().int().min(0),
  investment: z.number().min(0),
  ownInvestment: z.number().min(0).optional(),
  thirdParty: z
    .object({
      name: z.string(),
      amount: z.number().min(0),
    })
    .optional(),
  products: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().int().min(1),
    }),
  ),
  acalAllocation: z
    .array(z.object({ name: z.string(), quantity: z.number().int().min(1) }))
    .optional(),
  fatherAllocation: z
    .array(z.object({ name: z.string(), quantity: z.number().int().min(1) }))
    .optional(),
});

export const dayRegistrationPlanSchema = z.object({
  businessId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dailyGoalUnits: z.number().int().min(0).optional(),
  purchase: draftPurchaseSchema.optional(),
  summary: z.object({
    revenue: z.number().min(0),
    profit: z.number(),
    quantitySold: z.number().int().min(0),
    quantityLost: z.number().int().min(0).default(0),
    lossReason: z.string().optional(),
    forecastProfit: z.number().optional(),
  }),
  sales: z.array(draftSaleSchema),
  newClients: z.array(draftClientSchema).default([]),
  suggestedActions: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        status: z.enum(["planned", "in_progress", "done"]).default("planned"),
      }),
    )
    .optional(),
  observations: z.string().optional(),
  manualInsights: z.string().optional(),
  lessonsLearned: z.string().optional(),
});

export type DraftSale = z.infer<typeof draftSaleSchema>;
export type DraftClient = z.infer<typeof draftClientSchema>;
export type DraftPurchase = z.infer<typeof draftPurchaseSchema>;
export type DayRegistrationPlan = z.infer<typeof dayRegistrationPlanSchema>;

export interface ProductMatchPreview {
  context: string;
  productName: string;
  matchedProductId?: string;
  matchedProductName?: string;
  willCreate: boolean;
}

export interface ClientMatchPreview {
  clientName: string;
  existingClientId?: string;
  existingClientName?: string;
  willCreate: boolean;
}

export interface DayRegistrationPreview extends DayRegistrationPlan {
  warnings: string[];
  errors: string[];
  productMatches: ProductMatchPreview[];
  clientMatches: ClientMatchPreview[];
  dayAlreadyRegistered: boolean;
  existingSalesCount: number;
}

/** Modelo no padrão Lucas — use buildWeekdayDraftTemplate(hoje) ao carregar (data atual). */
export const DRAFT_TEMPLATE = buildWeekdayDraftTemplate(new Date());
