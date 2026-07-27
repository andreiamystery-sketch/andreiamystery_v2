import type { MetadataRoute } from "next";
import { products } from "@/data/products";

const baseUrl = "https://andreasmystery.pt";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...products.map((product) => ({
      url: `${baseUrl}/produto/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
