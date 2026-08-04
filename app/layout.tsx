import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://umali-dragon-fruit-farm.pages.dev"),
  title: "Umali Family Dragon Fruit Farm | Fresh from Ragay",
  description: "Fresh, seasonal dragon fruit from a family farm in Ragay, Camarines Sur.",
  icons: { icon: "/umali-logo.jpg", shortcut: "/umali-logo.jpg" },
  openGraph: {
    title: "Umali Family Dragon Fruit Farm",
    description: "Taste dragon fruit at its freshest.",
    type: "website",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "Umali Family Dragon Fruit Farm — Taste dragon fruit at its freshest" }],
  },
  twitter: { card: "summary_large_image", title: "Umali Family Dragon Fruit Farm", description: "Taste dragon fruit at its freshest.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${manrope.variable} ${jakarta.variable}`}><body>{children}</body></html>;
}
