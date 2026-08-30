import { asc, eq } from "drizzle-orm";
import { CRM_DEFAULT_STAGES } from "@/constants/crm-brand";
import {
  crmPipelineStages,
  crmWorkspaceMembers,
  crmWorkspaces,
} from "@/lib/db/postgres/schema-crm";
import { getPostgresDb } from "@/platform/db";

export type CrmWorkspaceContext = {
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  role: string;
};

/**
 * Garante workspace CRM do usuário (tenant freela).
 * Cria workspace + stages padrão na primeira visita.
 * Postgres-only — schema `crm.*` não existe no SQLite.
 */
export async function ensureCrmWorkspace(userId: string): Promise<CrmWorkspaceContext> {
  const db = await getPostgresDb();

  const existing = await db
    .select({
      workspaceId: crmWorkspaces.id,
      workspaceName: crmWorkspaces.name,
      workspaceSlug: crmWorkspaces.slug,
      role: crmWorkspaceMembers.role,
    })
    .from(crmWorkspaceMembers)
    .innerJoin(crmWorkspaces, eq(crmWorkspaceMembers.workspaceId, crmWorkspaces.id))
    .where(eq(crmWorkspaceMembers.userId, userId))
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const short = userId.replace(/-/g, "").slice(0, 8);
  const slug = `freela-${short}`;
  const name = "Meu escritório";

  const [workspace] = await db
    .insert(crmWorkspaces)
    .values({ name, slug })
    .returning({
      id: crmWorkspaces.id,
      name: crmWorkspaces.name,
      slug: crmWorkspaces.slug,
    });

  if (!workspace) {
    throw new Error("Não foi possível criar o workspace CRM.");
  }

  await db.insert(crmWorkspaceMembers).values({
    workspaceId: workspace.id,
    userId,
    role: "owner",
  });

  await db.insert(crmPipelineStages).values(
    CRM_DEFAULT_STAGES.map((s) => ({
      workspaceId: workspace.id,
      slug: s.slug,
      label: s.label,
      sortOrder: s.sortOrder,
      isWon: s.isWon,
      isLost: s.isLost,
    })),
  );

  return {
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    workspaceSlug: workspace.slug,
    role: "owner",
  };
}

export async function listCrmStages(workspaceId: string) {
  const db = await getPostgresDb();
  return db
    .select()
    .from(crmPipelineStages)
    .where(eq(crmPipelineStages.workspaceId, workspaceId))
    .orderBy(asc(crmPipelineStages.sortOrder));
}
