"use client";

import { CreateBusinessOnboarding } from "@/components/onboarding/create-business-onboarding";
import { PageLoader } from "@/components/ui/loading";
import { useOwnedBusinesses } from "@/hooks/use-owned-businesses";

interface TenantWorkspaceGateProps {
  children: React.ReactNode;
}

/** Blocks module content until business context matches the signed-in account. */
export function TenantWorkspaceGate({ children }: TenantWorkspaceGateProps) {
  const { isLoading, isError, error, isEmpty, isReady } = useOwnedBusinesses();

  if (isLoading || !isReady) {
    return <PageLoader />;
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-brand-red/30 bg-brand-red/10 p-8 text-center">
        <p className="text-text-primary">
          {error instanceof Error ? error.message : "Não foi possível carregar suas operações."}
        </p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="py-4">
        <CreateBusinessOnboarding />
      </div>
    );
  }

  return <>{children}</>;
}
