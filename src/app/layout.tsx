import type { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OMNI Business — Gestão da operação | OMNI",
  description:
    "OMNI Business — produto de gestão do ecossistema OMNI. Operação, vendas, financeiro e indicadores em um só lugar.",
  icons: {
    icon: "/icons/hub-favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0D0F17",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`${sora.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
