import { ALL_BUSINESSES_ID, isAllBusinesses, BUSINESS_WRITE_BLOCKED_MESSAGE } from "@/lib/business-units";
import { toDbBusinessId } from "@/platform/db/business-id";
import { listBusinesses } from "@/platform/db/repositories/business-repository";

export class TenantAccessError extends Error {
  constructor(message = "Esta operação não pertence à sua conta.") {
    super(message);
    this.name = "TenantAccessError";
  }
}

export interface TenantScope {
  businessId: string;
  slugs: string[];
  dbIds: string[];
  isEmpty: boolean;
}

export async function resolveTenantScope(
  userId: string,
  businessIdParam: string | null | undefined,
): Promise<TenantScope> {
  const units = await listBusinesses(userId);
  const slugs = units.map((u) => u.id);
  const dbIds = slugs.map((slug) => toDbBusinessId(slug));

  const raw = businessIdParam?.trim();
  const businessId =
    !raw || raw === ALL_BUSINESSES_ID ? ALL_BUSINESSES_ID : raw;

  if (!isAllBusinesses(businessId) && !slugs.includes(businessId)) {
    throw new TenantAccessError();
  }

  return {
    businessId,
    slugs,
    dbIds,
    isEmpty: slugs.length === 0,
  };
}

export function requireTenantBusinessWrite(
  scope: TenantScope,
  businessId: string | null | undefined,
): string {
  const parsed = businessId?.trim();
  if (!parsed || isAllBusinesses(parsed)) {
    throw new Error(BUSINESS_WRITE_BLOCKED_MESSAGE);
  }
  if (!scope.slugs.includes(parsed)) {
    throw new TenantAccessError();
  }
  return parsed;
}
