"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OmniHub } from "@/components/hub/omni-hub";
import { useSessionUser } from "@/hooks/use-session-user";
import {
  isOmniOnboardingDone,
  OMNI_ONBOARDING_PATH,
  resolveOnboardingUserKey,
} from "@/lib/omni-onboarding";
import { PageLoader } from "@/components/ui/loading";

/** Hub só após onboarding concluído. */
export default function HubPage() {
  const router = useRouter();
  const { data: user, isFetched } = useSessionUser();
  const [allowed, setAllowed] = useState(false);
  const userKey = resolveOnboardingUserKey(user);

  useEffect(() => {
    if (!isFetched) return;
    if (!userKey || !isOmniOnboardingDone(userKey)) {
      router.replace(OMNI_ONBOARDING_PATH);
      return;
    }
    setAllowed(true);
  }, [isFetched, userKey, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05060c]">
        <PageLoader />
      </div>
    );
  }

  return <OmniHub />;
}
