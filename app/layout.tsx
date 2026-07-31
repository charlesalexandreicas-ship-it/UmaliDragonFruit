import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://dragonbloom-farms.pages.dev"),
  title: "DragonBloom Farms | Premium Dragon Fruit",
  description: "Premium dragon fruit harvested for homes and growing businesses.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "DragonBloom Farms",
    description: "Freshness you can experience.",
    type: "website",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "DragonBloom Farms — Freshness You Can Experience" }],
  },
  twitter: { card: "summary_large_image", title: "DragonBloom Farms", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
