import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import BroadcastListener from "@/components/broadcast-listener";
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PropertiesNexus | Luxury Real Estate Marketplace",
  description: "Find your place in India. Discover verified homes, investments, and commercial spaces.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${playfair.variable} antialiased`}
      >
        {children}
        <BroadcastListener />
      </body>
    </html>
  );
}
