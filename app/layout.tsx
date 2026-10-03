import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://umali-dragon-fruit-farm.vercel.app"),
  title: "Umali Family Dragon Fruit Farm | Fresh from Ragay",
  description: "Explore the harvest and meet Umali Family Dragon Fruit Farm in Ragay, Camarines Sur.",
  icons: { icon: "/umali-logo.jpg", shortcut: "/umali-logo.jpg" },
  openGraph: {
    title: "Umali Family Dragon Fruit Farm",
    description: "Explore the harvest and meet the family farm in Ragay, Camarines Sur.",
    type: "website",
    images: [{ url: "/umali-journey-poster.jpg", width: 1280, height: 720, alt: "Dragon fruit on the vine at morning light" }],
  },
  twitter: { card: "summary_large_image", title: "Umali Family Dragon Fruit Farm", description: "Explore the harvest in Ragay, Camarines Sur.", images: ["/umali-journey-poster.jpg"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${manrope.variable} ${jakarta.variable}`}><body>{children}</body></html>;
}
