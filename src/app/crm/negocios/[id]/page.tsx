import { CrmDealDetailClient } from "@/components/crm/crm-deal-detail-client";

export default async function CrmDealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CrmDealDetailClient dealId={id} />;
}
