import type { MetadataRoute } from "next";
import { locales } from "@/config/locales";
import { seoConfig } from "@/config/seo";
import { legalPages } from "@/data/legal";
import { getPublishedProducts } from "@/lib/product-visibility";

const baseUrl = seoConfig.siteUrl;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getPublishedProducts();
  const now = new Date();
  return locales.flatMap((locale) => {
    const prefix = `${baseUrl}/${locale.code}`;
    return [
      { url: prefix, lastModified: now, changeFrequency: "weekly" as const, priority: locale.code === "pt" ? 1 : 0.9 },
      { url: `${prefix}/bijuteria`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 },
      { url: `${prefix}/gravacoes`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 },
      { url: `${prefix}/checkout`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.3 },
      ...legalPages.map((page) => ({ url: `${prefix}/${page.slug}`, lastModified: new Date(page.updatedAt), changeFrequency: "yearly" as const, priority: page.slug === "contactos" ? 0.7 : 0.4 })),
      ...products.map((product) => ({ url: `${prefix}/produto/${product.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    ];
  });
}
