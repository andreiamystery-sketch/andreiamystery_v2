import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "@/styles/globals.css";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { StoreProvider } from "@/hooks/use-store";
import { MusicPlayer } from "@/components/music-player";

const serif = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-serif", display: "swap", weight: ["500", "600", "700"] });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://andreasmystery.pt"),
  title: {
    default: "Andrea's Mystery | Bijuteria Premium",
    template: "%s | Andrea's Mystery",
  },
  description: "Loja online premium de bijuteria, com brincos, colares, pulseiras e aneis.",
  keywords: ["Andrea's Mystery", "bijuteria premium", "joalharia", "brincos", "colares", "aneis", "pulseiras"],
  openGraph: {
    title: "Andrea's Mystery | Bijuteria Premium",
    description: "Bijuteria premium com brilho controlado, detalhe e misterio.",
    url: "https://andreasmystery.pt",
    siteName: "Andrea's Mystery",
    images: [{ url: "/images/hero/andreas-mystery-hero.jpg", width: 1920, height: 1080, alt: "Andrea's Mystery" }],
    locale: "pt_PT",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt">
      <body className={`${serif.variable} ${sans.variable}`}>
        <StoreProvider>
  <Header />
  {children}
  <Footer />
  <MusicPlayer />
</StoreProvider>
      </body>
    </html>
  );
}
