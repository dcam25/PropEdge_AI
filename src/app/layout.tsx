import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthInit } from "@/components/auth-init";
import { ScrollToTop } from "@/components/scroll-to-top";
import { ModalProvider } from "@/components/modal-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://propedge.ai"),
  title: {
    default: "PropEdge AI - Sports Props Analytics",
    template: "%s | PropEdge AI",
  },
  description: "Research player props with custom models and AI insights. NBA, NFL, MLB, NHL, WNBA, LoL, CS2, Valorant.",
  keywords: ["sports props", "player props", "analytics", "NBA", "NFL", "MLB", "NHL", "PrizePicks", "Underdog", "AI insights"],
  authors: [{ name: "PropEdge AI" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PropEdge AI",
    title: "PropEdge AI - Sports Props Analytics",
    description: "Research player props with custom models and AI insights. NBA, NFL, MLB, NHL, WNBA, LoL, CS2, Valorant.",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "PropEdge AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PropEdge AI - Sports Props Analytics",
    description: "Research player props with custom models and AI insights.",
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "64x64" },
    ],
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-zinc-950/55">
          <ModalProvider>
            <AuthInit />
            {children}
            <ScrollToTop />
            <Toaster richColors position="top-right" />
          </ModalProvider>
        </div>
      </body>
    </html>
  );
}
