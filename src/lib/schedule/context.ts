import { eq } from "drizzle-orm";
import {
  SCHEDULE_MEMBER_ROLES,
  scheduleOrganizationMembers,
  scheduleOrganizations,
} from "@/lib/db/postgres/schema-schedule";
import { getPostgresDb } from "@/platform/db";

export type ScheduleMemberRole = (typeof SCHEDULE_MEMBER_ROLES)[number];

export type ScheduleOrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  businessType: string;
  timezone: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  logoUrl: string | null;
  onboardingStep: number;
  onboardingCompletedAt: Date | null;
};

export type ScheduleContext = {
  organization: ScheduleOrganizationSummary | null;
  role: ScheduleMemberRole | null;
};

/**
 * Resolve a organização ativa do usuário.
 * NÃO cria organização — persistência começa no save da 1ª etapa (Fase 2).
 * MVP: primeira membership. Multi-org fica para depois.
 */
export async function getScheduleContext(userId: string): Promise<ScheduleContext> {
  const db = await getPostgresDb();

  const rows = await db
    .select({
      id: scheduleOrganizations.id,
      name: scheduleOrganizations.name,
      slug: scheduleOrganizations.slug,
      businessType: scheduleOrganizations.businessType,
      timezone: scheduleOrganizations.timezone,
      phone: scheduleOrganizations.phone,
      email: scheduleOrganizations.email,
      address: scheduleOrganizations.address,
      logoUrl: scheduleOrganizations.logoUrl,
      onboardingStep: scheduleOrganizations.onboardingStep,
      onboardingCompletedAt: scheduleOrganizations.onboardingCompletedAt,
      role: scheduleOrganizationMembers.role,
    })
    .from(scheduleOrganizationMembers)
    .innerJoin(
      scheduleOrganizations,
      eq(scheduleOrganizationMembers.organizationId, scheduleOrganizations.id),
    )
    .where(eq(scheduleOrganizationMembers.userId, userId))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return { organization: null, role: null };
  }

  const role = (SCHEDULE_MEMBER_ROLES as readonly string[]).includes(row.role)
    ? (row.role as ScheduleMemberRole)
    : "owner";

  return {
    organization: {
      id: row.id,
      name: row.name,
      slug: row.slug,
      businessType: row.businessType,
      timezone: row.timezone,
      phone: row.phone,
      email: row.email,
      address: row.address,
      logoUrl: row.logoUrl,
      onboardingStep: row.onboardingStep,
      onboardingCompletedAt: row.onboardingCompletedAt,
    },
    role,
  };
}

/** Owner/manager sem onboarding concluído (ou sem org) vai para o gate. Profissional convidado não. */
export function needsScheduleOnboarding(ctx: ScheduleContext): boolean {
  if (!ctx.organization) return true;
  if (ctx.role === "professional") return false;
  return ctx.organization.onboardingCompletedAt == null;
}

export function toPublicScheduleOrganization(org: ScheduleOrganizationSummary | null) {
  if (!org) return null;
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    onboardingStep: org.onboardingStep,
    onboardingCompleted: org.onboardingCompletedAt != null,
  };
}
