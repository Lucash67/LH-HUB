import type { Metadata } from "next";
import { OmniHub } from "@/components/hub/omni-hub";

export const metadata: Metadata = {
  title: "OMNI Hub — Escolha seu produto",
  description: "Porta de entrada do ecossistema OMNI. Business, Schedule e próximos produtos.",
};

export default function HubPage() {
  return <OmniHub />;
}
