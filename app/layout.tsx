import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "@/styles/globals.css";
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget";
import { CookieConsent } from "@/components/cookie-consent";
import { Footer } from "@/components/footer";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { Header } from "@/components/header";
import { StoreProvider } from "@/hooks/use-store";
import { MusicPlayer } from "@/components/music-player";
import { companyConfig } from "@/config/company";
import { seoConfig } from "@/config/seo";
import { getPublishedProducts, toPublicProduct } from "@/lib/product-visibility";
import { storeSettings } from "@/data/store-settings";

const serif = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-serif", display: "swap", weight: ["500", "600", "700"] });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  title: { default: seoConfig.defaultTitle, template: seoConfig.titleTemplate },
  description: seoConfig.defaultDescription,
  keywords: ["Andrea's Mystery", "bijuteria premium", "joalharia", "brincos", "colares", "anéis", "pulseiras"],
  openGraph: {
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    url: seoConfig.siteUrl,
    siteName: "Andrea's Mystery",
    images: [{ url: seoConfig.defaultImage, width: 1920, height: 1080, alt: "Andrea's Mystery" }],
    locale: "pt_PT",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: seoConfig.defaultTitle, description: seoConfig.defaultDescription, images: [seoConfig.defaultImage] },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const publishedProducts = (await getPublishedProducts()).map(toPublicProduct);
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: storeSettings.storeName,
    url: seoConfig.siteUrl,
    email: storeSettings.orderEmail,
    telephone: storeSettings.contactPhoneInternational,
    address: {
      "@type": "PostalAddress",
      streetAddress: companyConfig.addressLine1,
      postalCode: companyConfig.postalCode,
      addressLocality: companyConfig.city,
      addressCountry: "PT",
    },
    sameAs: [storeSettings.instagramUrl],
    contactPoint: { "@type": "ContactPoint", telephone: storeSettings.contactPhoneInternational, contactType: "customer service", availableLanguage: ["Portuguese", "English", "Spanish", "French", "German", "Chinese"] },
  };

  return (
    <html lang="pt">
      <body className={`${serif.variable} ${sans.variable}`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <StoreProvider products={publishedProducts}>
          <I18nProvider>
            <Header />
            {children}
            <Footer />
            <MusicPlayer />
            <CookieConsent />
            <ChatbotWidget />
          </I18nProvider>
        </StoreProvider>
      </body>
    </html>
  );
}


