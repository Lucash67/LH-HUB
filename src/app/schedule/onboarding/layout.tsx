import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getScheduleContext, needsScheduleOnboarding } from "@/lib/schedule/context";
import { ScheduleOnboardingFrame } from "@/components/schedule/schedule-shell";

export default async function ScheduleOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/schedule/onboarding");

  const ctx = await getScheduleContext(user.id);
  if (!needsScheduleOnboarding(ctx)) {
    redirect("/schedule");
  }

  return <ScheduleOnboardingFrame>{children}</ScheduleOnboardingFrame>;
}
