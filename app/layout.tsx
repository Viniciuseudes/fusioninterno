import type React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { UserProvider } from "@/contexts/user-context";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fusion Interno - Gestão de Tarefas Empresarial", // Corrigi o erro de digitação de Fucion para Fusion
  description:
    "Gerencie seus projetos, tarefas e colaboração da equipe em uma plataforma poderosa",
  generator: "Next.js",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // Deixa a barra de status do iPhone integrada ao app
    title: "Fusion",
  },
  formatDetection: {
    telephone: false, // Evita que números pareçam links no iOS
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
  maximumScale: 1, // Impede zoom que quebra o layout no mobile
  userScalable: false,
};
