import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getScheduleContext, needsScheduleOnboarding } from "@/lib/schedule/context";
import { ScheduleShell } from "@/components/schedule/schedule-shell";

export default async function ScheduleAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/schedule");

  const ctx = await getScheduleContext(user.id);
  if (needsScheduleOnboarding(ctx)) {
    redirect("/schedule/onboarding");
  }

  return (
    <ScheduleShell
      organization={
        ctx.organization
          ? {
              name: ctx.organization.name,
              address: ctx.organization.address,
              slug: ctx.organization.slug,
              logoUrl: ctx.organization.logoUrl,
              publicPageReady: ctx.organization.onboardingCompletedAt != null,
            }
          : null
      }
    >
      {children}
    </ScheduleShell>
  );
}
