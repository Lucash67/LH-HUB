import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { isAuthFailure, requireApiSession } from "@/lib/auth/require-api-session";
import { ensureCrmWorkspace, listCrmStages } from "@/lib/crm/ensure-workspace";
import { crmContacts, crmDeals } from "@/lib/db/postgres/schema-crm";
import { getPostgresDb } from "@/platform/db";
import { apiError } from "@/shared/api-messages";

export async function GET() {
  const auth = await requireApiSession();
  if (isAuthFailure(auth)) return auth;
  try {
    const { workspaceId } = await ensureCrmWorkspace(auth.id);
    const db = await getPostgresDb();
    const stages = await listCrmStages(workspaceId);
    const deals = await db
      .select({
        id: crmDeals.id,
        title: crmDeals.title,
        value: crmDeals.value,
        source: crmDeals.source,
        notes: crmDeals.notes,
        expectedClose: crmDeals.expectedClose,
        stageId: crmDeals.stageId,
        contactId: crmDeals.contactId,
        contactName: crmContacts.name,
        temperature: crmDeals.temperature,
        createdAt: crmDeals.createdAt,
        updatedAt: crmDeals.updatedAt,
      })
      .from(crmDeals)
      .leftJoin(crmContacts, eq(crmDeals.contactId, crmContacts.id))
      .where(eq(crmDeals.workspaceId, workspaceId))
      .orderBy(desc(crmDeals.updatedAt));

    const columns = stages.map((stage) => ({
      stage,
      deals: deals.filter((d) => d.stageId === stage.id),
    }));

    const openStageIds = new Set(
      stages.filter((s) => !s.isWon && !s.isLost).map((s) => s.id),
    );
    const proposalStageIds = new Set(
      stages.filter((s) => s.slug === "negotiation").map((s) => s.id),
    );
    const wonStageIds = new Set(stages.filter((s) => s.isWon).map((s) => s.id));
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const leadStageIds = new Set(stages.filter((s) => s.slug === "lead").map((s) => s.id));
    const qualifiedStageIds = new Set(
      stages.filter((s) => s.slug === "qualified").map((s) => s.id),
    );
    const openDeals = deals.filter((d) => openStageIds.has(d.stageId));
    const toConvert = deals.filter((d) => leadStageIds.has(d.stageId));
    const restOpen = deals.filter(
      (d) => openStageIds.has(d.stageId) && !leadStageIds.has(d.stageId),
    );
    const inProposal = deals.filter((d) => proposalStageIds.has(d.stageId));
    const qualified = deals.filter((d) => qualifiedStageIds.has(d.stageId));
    const wonThisMonth = deals.filter(
      (d) => wonStageIds.has(d.stageId) && new Date(d.updatedAt) >= monthStart,
    );
    const sumValue = (rows: typeof deals) =>
      rows.reduce((acc, d) => acc + Number(d.value || 0), 0);

    return NextResponse.json({
      workspaceId,
      stages,
      columns,
      deals,
      kpis: {
        openLeads: openDeals.length,
        inProposal: inProposal.length,
        wonThisMonth: wonThisMonth.length,
        wonValueThisMonth: sumValue(wonThisMonth),
        pipelineValue: sumValue(openDeals),
        potentialGains: sumValue(openDeals),
        toConvertCount: toConvert.length,
        toConvertValue: sumValue(toConvert),
        restOpenCount: restOpen.length,
        restOpenValue: sumValue(restOpen),
        qualifiedCount: qualified.length,
        qualifiedValue: sumValue(qualified),
        negotiationValue: sumValue(inProposal),
      },
    });
  } catch (error) {
    console.error("CRM pipeline GET error:", error);
    return apiError("Não foi possível carregar o pipeline.");
  }
}
