import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import WhatsAppButton from "@/components/WhatsAppButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ÖzTelevi - Ev Tekstili ve Perdeleri | Işığın Huzurla Buluştuğu Yer",
  description: "Japon estetiğinin sade güzelliği ve İskandinav sadeliğinden ilham alan, el işçiliği tekstiller ve perdeler. Her parça, yaşam alanınıza huzur, doğal ışık ve zamansız bir zarafet davetiyesidir.",
  keywords: ["ÖzTelevi", "perde", "ev tekstili", "keten", "organik pamuk", "Japandi", "İstanbul", "Türkiye"],
  authors: [{ name: "ÖzTelevi" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "ÖzTelevi - Ev Tekstili ve Perdeleri",
    description: "Işığın huzurla buluştuğu yer. Japon estetiği ve İskandinav sadeliğinden ilham alan el işçiliği tekstiller.",
    url: "https://oztelevi.com",
    siteName: "ÖzTelevi",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ÖzTelevi - Ev Tekstili ve Perdeleri",
    description: "Işığın huzurla buluştuğu yer",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
