import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CRM_TEMPERATURES } from "@/constants/crm-brand";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";
import { temperatureAfterStageChange } from "@/lib/crm/deal-temperature";
import { ensureCrmWorkspace } from "@/lib/crm/ensure-workspace";
import { normalizeServiceUrl } from "@/lib/crm/service-url";
import { crmContacts, crmDeals, crmPipelineStages } from "@/lib/db/postgres/schema-crm";
import { getPostgresDb } from "@/platform/db";
import { apiError } from "@/shared/api-messages";

const dealPatchSchema = z.object({
  title: z.string().trim().min(1).optional(),
  value: z.coerce.number().min(0).optional(),
  source: z.string().trim().optional().nullable(),
  notes: z.string().optional().nullable(),
  contactId: z.string().uuid().optional().nullable(),
  stageId: z.string().uuid().optional(),
  expectedClose: z.string().optional().nullable(),
  temperature: z.enum(CRM_TEMPERATURES).optional(),
  serviceUrl: z.string().trim().optional().nullable(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const { id } = await params;
    const { workspaceId } = await ensureCrmWorkspace(auth.id);
    const db = await getPostgresDb();
    const rows = await db
      .select({
        id: crmDeals.id,
        title: crmDeals.title,
        value: crmDeals.value,
        source: crmDeals.source,
        notes: crmDeals.notes,
        expectedClose: crmDeals.expectedClose,
        stageId: crmDeals.stageId,
        contactId: crmDeals.contactId,
        workspaceId: crmDeals.workspaceId,
        contactName: crmContacts.name,
        contactEmail: crmContacts.email,
        contactPhone: crmContacts.phone,
        stageLabel: crmPipelineStages.label,
        stageSlug: crmPipelineStages.slug,
        temperature: crmDeals.temperature,
        serviceUrl: crmDeals.serviceUrl,
        createdAt: crmDeals.createdAt,
        updatedAt: crmDeals.updatedAt,
      })
      .from(crmDeals)
      .leftJoin(crmContacts, eq(crmDeals.contactId, crmContacts.id))
      .innerJoin(crmPipelineStages, eq(crmDeals.stageId, crmPipelineStages.id))
      .where(eq(crmDeals.id, id))
      .limit(1);

    const deal = rows[0];
    if (!deal || deal.workspaceId !== workspaceId) {
      return apiError("Negócio não encontrado.", 404);
    }
    return NextResponse.json({ deal });
  } catch (error) {
    console.error("CRM deal GET error:", error);
    return apiError("Não foi possível carregar o negócio.");
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = dealPatchSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Negócio inválido.", 400);
    }

    const { workspaceId } = await ensureCrmWorkspace(auth.id);
    const db = await getPostgresDb();

    const [current] = await db
      .select()
      .from(crmDeals)
      .where(eq(crmDeals.id, id))
      .limit(1);
    if (!current || current.workspaceId !== workspaceId) {
      return apiError("Negócio não encontrado.", 404);
    }

    let nextStageSlug: string | null = null;
    if (parsed.data.stageId) {
      const [stage] = await db
        .select()
        .from(crmPipelineStages)
        .where(eq(crmPipelineStages.id, parsed.data.stageId))
        .limit(1);
      if (!stage || stage.workspaceId !== workspaceId) {
        return apiError("Estágio inválido.", 400);
      }
      nextStageSlug = stage.slug;
    }

    if (parsed.data.contactId) {
      const [contact] = await db
        .select()
        .from(crmContacts)
        .where(eq(crmContacts.id, parsed.data.contactId))
        .limit(1);
      if (!contact || contact.workspaceId !== workspaceId) {
        return apiError("Contato inválido.", 400);
      }
    }

    const nextValue =
      parsed.data.value !== undefined ? parsed.data.value : Number(current.value || 0);
    const nextTemperature =
      parsed.data.temperature ??
      (nextStageSlug
        ? temperatureAfterStageChange(nextStageSlug, nextValue, current.temperature)
        : undefined);

    const [deal] = await db
      .update(crmDeals)
      .set({
        ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
        ...(parsed.data.value !== undefined ? { value: String(parsed.data.value) } : {}),
        ...(parsed.data.source !== undefined ? { source: parsed.data.source } : {}),
        ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
        ...(parsed.data.contactId !== undefined ? { contactId: parsed.data.contactId } : {}),
        ...(parsed.data.stageId !== undefined ? { stageId: parsed.data.stageId } : {}),
        ...(parsed.data.expectedClose !== undefined
          ? { expectedClose: parsed.data.expectedClose }
          : {}),
        ...(parsed.data.serviceUrl !== undefined
          ? { serviceUrl: normalizeServiceUrl(parsed.data.serviceUrl) }
          : {}),
        ...(nextTemperature !== undefined ? { temperature: nextTemperature } : {}),
        updatedAt: new Date(),
      })
      .where(eq(crmDeals.id, id))
      .returning();

    return NextResponse.json({ deal });
  } catch (error) {
    console.error("CRM deal PATCH error:", error);
    return apiError("Não foi possível atualizar o negócio.");
  }
}
