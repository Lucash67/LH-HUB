import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";
import { isCrmTemperature } from "@/lib/crm/deal-temperature";
import { ensureCrmWorkspace } from "@/lib/crm/ensure-workspace";
import { buildNortePlan, noteAfterNorteDone, type NorteDealInput } from "@/lib/crm/norte-playbook";
import { crmContacts, crmDeals, crmPipelineStages } from "@/lib/db/postgres/schema-crm";
import { getPostgresDb } from "@/platform/db";
import { apiError } from "@/shared/api-messages";

function dateLabelFortaleza(now = new Date()) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Fortaleza",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now);
}

async function loadPlan(workspaceId: string) {
  const db = await getPostgresDb();
  const rows = await db
    .select({
      dealId: crmDeals.id,
      title: crmDeals.title,
      value: crmDeals.value,
      source: crmDeals.source,
      notes: crmDeals.notes,
      temperature: crmDeals.temperature,
      updatedAt: crmDeals.updatedAt,
      stageSlug: crmPipelineStages.slug,
      stageLabel: crmPipelineStages.label,
      isWon: crmPipelineStages.isWon,
      isLost: crmPipelineStages.isLost,
      contactId: crmDeals.contactId,
      contactName: crmContacts.name,
      contactCompany: crmContacts.company,
      contactPhone: crmContacts.phone,
      contactNotes: crmContacts.notes,
    })
    .from(crmDeals)
    .leftJoin(crmContacts, eq(crmDeals.contactId, crmContacts.id))
    .innerJoin(crmPipelineStages, eq(crmDeals.stageId, crmPipelineStages.id))
    .where(eq(crmDeals.workspaceId, workspaceId))
    .orderBy(desc(crmDeals.updatedAt));

  const inputs: NorteDealInput[] = rows.map((row) => ({
    dealId: row.dealId,
    title: row.title,
    value: Number(row.value || 0),
    source: row.source,
    notes: row.notes,
    temperature: isCrmTemperature(row.temperature) ? row.temperature : "neutral",
    updatedAt: row.updatedAt,
    stageSlug: row.stageSlug,
    stageLabel: row.stageLabel,
    isWon: row.isWon,
    isLost: row.isLost,
    contactId: row.contactId,
    contactName: row.contactName,
    contactCompany: row.contactCompany,
    contactPhone: row.contactPhone,
    contactNotes: row.contactNotes,
  }));

  return buildNortePlan(inputs);
}

export async function GET() {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const { workspaceId } = await ensureCrmWorkspace(auth.id);
    const plan = await loadPlan(workspaceId);
    return NextResponse.json({ plan });
  } catch (error) {
    console.error("CRM norte GET error:", error);
    return apiError("Não foi possível montar o plano de ação.");
  }
}

const doneSchema = z.object({
  dealId: z.string().uuid(),
  outcome: z.enum(["done"]).default("done"),
});

export async function POST(request: NextRequest) {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const parsed = doneSchema.safeParse(await request.json());
    if (!parsed.success) return apiError("Negócio inválido.", 400);

    const { workspaceId } = await ensureCrmWorkspace(auth.id);
    const db = await getPostgresDb();
    const [current] = await db
      .select({
        id: crmDeals.id,
        workspaceId: crmDeals.workspaceId,
        notes: crmDeals.notes,
        temperature: crmDeals.temperature,
        isWon: crmPipelineStages.isWon,
        isLost: crmPipelineStages.isLost,
      })
      .from(crmDeals)
      .innerJoin(crmPipelineStages, eq(crmDeals.stageId, crmPipelineStages.id))
      .where(eq(crmDeals.id, parsed.data.dealId))
      .limit(1);

    if (!current || current.workspaceId !== workspaceId) {
      return apiError("Negócio não encontrado.", 404);
    }

    const nextTemp =
      current.isWon || current.isLost
        ? current.temperature
        : current.temperature === "alert" || current.temperature === "cold"
          ? "warm"
          : current.temperature;

    await db
      .update(crmDeals)
      .set({
        notes: noteAfterNorteDone(current.notes, dateLabelFortaleza()),
        temperature: nextTemp,
        updatedAt: new Date(),
      })
      .where(eq(crmDeals.id, current.id));

    const plan = await loadPlan(workspaceId);
    return NextResponse.json({ plan, marked: current.id });
  } catch (error) {
    console.error("CRM norte POST error:", error);
    return apiError("Não foi possível registrar a ação.");
  }
}
