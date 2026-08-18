import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./lab.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OMNI Design Lab — ambiente de teste",
  description:
    "Laboratório visual isolado para clonar as referências OMNI sem afetar a produção.",
  robots: { index: false, follow: false },
};

/**
 * Layout isolado do Design Lab.
 * Não usa AppShell/sidebar de produção — zero impacto no produto diário.
 */
export default function OmniLabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`omni-lab ${sora.variable} min-h-screen bg-[#05050C] text-white antialiased`}
      style={{ fontFamily: "var(--font-sora), system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
