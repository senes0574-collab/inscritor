import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  icons: { icon: "/logo.svg", apple: "/icon-192.png" },
  title: "Inscriptor — Inscriptions 6e à 3e",
  description: "Registre simple des élèves : prénom, nom, classe, date de naissance et inscription de 1.000 FCFA.",
};

export const viewport = { themeColor: "#15803d" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${nunito.className} bg-[#f3faf6] text-slate-800 antialiased`}><PwaRegister />
        {children}
      </body>
    </html>
  );
}
