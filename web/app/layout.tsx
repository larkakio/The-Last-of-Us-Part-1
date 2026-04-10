import type { Metadata, Viewport } from "next";
import { Orbitron, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { NetworkBanner } from "@/components/network-banner";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const DEFAULT_SITE_URL = "https://the-last-of-us-part-1.vercel.app";
const DEFAULT_BASE_APP_ID = "69d8bb3634c69936dc95d6e0";

const baseAppId =
  process.env.NEXT_PUBLIC_BASE_APP_ID ?? DEFAULT_BASE_APP_ID;

export const metadata: Metadata = {
  title: "Neon Wasteland: Outskirts",
  description:
    "Cyberpunk grid survival — swipe to escape the spores. Daily check-in on Base.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL,
  ),
  icons: {
    icon: "/app-icon.jpg",
    apple: "/app-icon.jpg",
  },
  openGraph: {
    title: "Neon Wasteland: Outskirts",
    description: "Swipe-grid survival on Base. Connect. Survive. Check in.",
    images: ["/app-thumbnail.jpg"],
  },
  other: {
    "base:app_id": baseAppId,
  },
};

export const viewport: Viewport = {
  themeColor: "#03030a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="font-sans min-h-full flex flex-col">
        <Providers>
          <NetworkBanner />
          <div className="hex-grid-bg flex min-h-full flex-1 flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
