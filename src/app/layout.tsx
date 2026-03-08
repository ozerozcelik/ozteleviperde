import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import WhatsAppButton from "@/components/WhatsAppButton";
import { OrganizationJsonLd } from "@/components/JsonLd";
import { Analytics } from "@/components/Analytics";
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ÖzTelevi - Ev Tekstili ve Perdeleri | Işığın Huzurla Buluştuğu Yer",
    template: "%s | ÖzTelevi",
  },
  description: "Japon estetiğinin sade güzelliği ve İskandinav sadeliğinden ilham alan, el işçiliği tekstiller ve perdeler. Keten perdeler, organik pamuk tekstiller, yatak örtüleri ve özel tasarım çözümler. İstanbul'da mağazamızı ziyaret edin.",
  keywords: [
    "ÖzTelevi",
    "perde",
    "ev tekstili",
    "keten perde",
    "organik pamuk",
    "Japandi",
    "yatak örtüsü",
    "tül perde",
    "blackout perde",
    "el dokuma",
    "İstanbul perde",
    "Türkiye ev tekstili",
    "doğal kumaş",
    "sürdürülebilir tekstil",
  ],
  authors: [{ name: "ÖzTelevi" }],
  creator: "ÖzTelevi",
  publisher: "ÖzTelevi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/logo.svg",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE_URL,
    siteName: "ÖzTelevi",
    title: "ÖzTelevi - Ev Tekstili ve Perdeleri | Işığın Huzurla Buluştuğu Yer",
    description: "Japon estetiği ve İskandinav sadeliğinden ilham alan el işçiliği tekstiller ve perdeler. Her parça, yaşam alanınıza huzur davetidir.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "ÖzTelevi - Ev Tekstili ve Perdeleri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ÖzTelevi - Ev Tekstili ve Perdeleri",
    description: "Işığın huzurla buluştuğu yer. Japandi tasarım ev tekstilleri.",
    images: ["/images/og-image.png"],
    creator: "@televiperde",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "tr-TR": SITE_URL,
    },
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
          <OrganizationJsonLd />
          {children}
          <Toaster />
          <WhatsAppButton />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
