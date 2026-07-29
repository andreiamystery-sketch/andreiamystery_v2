import type { LocaleCode } from "@/config/locales";
import type { Category } from "@/types/product";

const categoryLabels: Record<LocaleCode, Record<"Todos" | Category, string>> = {
  pt: { Todos: "Ver tudo", "Anéis": "Anéis", Brincos: "Brincos", Colares: "Colares", Pulseiras: "Pulseiras" },
  en: { Todos: "View all", "Anéis": "Rings", Brincos: "Earrings", Colares: "Necklaces", Pulseiras: "Bracelets" },
  es: { Todos: "Ver todo", "Anéis": "Anillos", Brincos: "Pendientes", Colares: "Collares", Pulseiras: "Pulseras" },
  fr: { Todos: "Tout voir", "Anéis": "Bagues", Brincos: "Boucles d'oreilles", Colares: "Colliers", Pulseiras: "Bracelets" },
  de: { Todos: "Alle ansehen", "Anéis": "Ringe", Brincos: "Ohrringe", Colares: "Halsketten", Pulseiras: "Armbänder" },
  zh: { Todos: "查看全部", "Anéis": "戒指", Brincos: "耳环", Colares: "项链", Pulseiras: "手链" },
};

export function getCategoryLabel(category: string, locale: LocaleCode) {
  const labels = categoryLabels[locale] ?? categoryLabels.pt;
  return labels[category as "Todos" | Category] ?? category;
}
