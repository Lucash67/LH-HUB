import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./hub-login.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LH Hub — Centro Operacional | LH Empreendimentos",
  description:
    "Administre todos os empreendimentos da LH Empreendimentos em um único lugar. Vendas, estoque, clientes, financeiro e indicadores.",
  icons: {
    icon: "/brand/lh-empreendimentos-favicon.png?v=3",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`hub-login ${manrope.variable} h-full min-h-screen overflow-x-hidden antialiased lg:h-screen lg:overflow-hidden`}
      style={{ fontFamily: "var(--font-manrope), Inter, system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
