import type React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { UserProvider } from "@/contexts/user-context";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const _geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Fusion Interno - Gestão de Tarefas Empresarial",
  description:
    "Gerencie seus projetos, tarefas e colaboração da equipe em uma plataforma poderosa",
  generator: "Next.js",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Fusion",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1625",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// 👇 A PARTE QUE ESTAVA FALTANDO 👇
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${_geist.variable} ${_geistMono.variable} antialiased`}>
        <UserProvider>{children}</UserProvider>
        <Analytics />
      </body>
    </html>
  );
}
