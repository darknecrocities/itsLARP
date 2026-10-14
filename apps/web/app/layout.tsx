import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/Shell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });
const jb = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jb" });

export const metadata: Metadata = {
  title: "itsLARP — Your AI Job-Hunting Workforce & Career OS",
  description: "A career operating system: Career DNA, verified APA resumes, and a 1,000-agent AI workforce for your job search.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "itsLARP — Your AI Job-Hunting Workforce & Career OS",
    description: "Upload your resume once. 1,000 Agents search, tailor APA 7th resumes with 0% hallucinations, and auto-apply with 1-click Notion sync.",
    images: [{ url: "/branding/og-card.png", width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable} ${jb.variable}`}>
      <body><Suspense fallback={null}><Shell>{children}</Shell></Suspense></body>
    </html>
  );
}
