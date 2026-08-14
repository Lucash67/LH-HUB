import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LH Hub — Centro Operacional | LH Empreendimentos",
  description: "Centro operacional de gestão — vendas, financeiro, metas e indicadores da LH Empreendimentos.",
  icons: {
    icon: "/icons/hub-favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Zoom liberado de propósito: acessibilidade acima de "app nativo".
  maximumScale: 5,
  themeColor: "#050505",
  // A barra do teclado não deve empurrar o layout fixo no Android.
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
