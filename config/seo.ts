export const seoConfig = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://andreasmystery.pt",
  defaultTitle: "Andrea's Mystery | Bijuteria Premium",
  titleTemplate: "%s | Andrea's Mystery",
  defaultDescription: "Loja online premium de bijuteria com peças elegantes, femininas e cuidadosamente selecionadas.",
  defaultImage: "/images/hero/andreas-mystery-hero.jpg",
} as const;
