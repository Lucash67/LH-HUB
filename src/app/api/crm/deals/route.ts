import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";
import { CRM_TEMPERATURES } from "@/constants/crm-brand";
import { defaultTemperatureForStage } from "@/lib/crm/deal-temperature";
import { ensureCrmWorkspace, listCrmStages } from "@/lib/crm/ensure-workspace";
import { crmContacts, crmDeals, crmPipelineStages } from "@/lib/db/postgres/schema-crm";
import { getPostgresDb } from "@/platform/db";
import { apiError } from "@/shared/api-messages";

const dealCreateSchema = z.object({
  title: z.string().trim().min(1, "Informe o título do negócio."),
  value: z.coerce.number().min(0).optional(),
  source: z.string().trim().optional(),
  notes: z.string().optional(),
  contactId: z.string().uuid().optional().nullable(),
  stageId: z.string().uuid().optional(),
  expectedClose: z.string().optional().nullable(),
  temperature: z.enum(CRM_TEMPERATURES).optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const id = request.nextUrl.searchParams.get("id");
    const { workspaceId } = await ensureCrmWorkspace(auth.id);
    const db = await getPostgresDb();

    if (id) {
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
    }

    const deals = await db
      .select()
      .from(crmDeals)
      .where(eq(crmDeals.workspaceId, workspaceId));
    return NextResponse.json({ deals });
  } catch (error) {
    console.error("CRM deals GET error:", error);
    return apiError("Não foi possível carregar o negócio.");
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const body = await request.json();
    const parsed = dealCreateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Negócio inválido.", 400);
    }

    const { workspaceId } = await ensureCrmWorkspace(auth.id);
    const stages = await listCrmStages(workspaceId);
    const stageId =
      parsed.data.stageId ??
      stages.find((s) => s.slug === "lead")?.id ??
      stages[0]?.id;
    if (!stageId) {
      return apiError("Pipeline sem estágios. Recarregue a página.", 400);
    }

    if (parsed.data.contactId) {
      const db = await getPostgresDb();
      const [contact] = await db
        .select({ id: crmContacts.id, workspaceId: crmContacts.workspaceId })
        .from(crmContacts)
        .where(eq(crmContacts.id, parsed.data.contactId))
        .limit(1);
      if (!contact || contact.workspaceId !== workspaceId) {
        return apiError("Contato inválido.", 400);
      }
    }

    const stage = stages.find((s) => s.id === stageId);
    const temperature =
      parsed.data.temperature ??
      defaultTemperatureForStage(stage?.slug ?? "lead", parsed.data.value ?? 0);

    const db = await getPostgresDb();
    const [deal] = await db
      .insert(crmDeals)
      .values({
        workspaceId,
        title: parsed.data.title,
        value: String(parsed.data.value ?? 0),
        source: parsed.data.source || null,
        notes: parsed.data.notes || null,
        contactId: parsed.data.contactId || null,
        stageId,
        temperature,
        expectedClose: parsed.data.expectedClose || null,
      })
      .returning();

    return NextResponse.json({ deal }, { status: 201 });
  } catch (error) {
    console.error("CRM deals POST error:", error);
    return apiError("Não foi possível criar o negócio.");
  }
}
