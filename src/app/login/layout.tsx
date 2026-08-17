import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./hub-login.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OMNI — Entrar",
  description:
    "Acesse o ecossistema OMNI. Conexão, organização e inteligência para o seu negócio.",
  icons: {
    icon: "/icons/hub-favicon.svg",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`hub-login ${sora.variable} h-full min-h-screen overflow-x-hidden antialiased lg:h-screen lg:overflow-hidden`}
      style={{ fontFamily: "var(--font-sora), system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
