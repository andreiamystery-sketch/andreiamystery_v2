import type { LocaleCode } from "@/config/locales";
import type { Category } from "@/types/product";

const categoryLabels: Record<LocaleCode, Partial<Record<"Todos" | Category, string>>> = {
  pt: { Todos: "Ver tudo", "Anéis": "Anéis", Brincos: "Brincos", Colares: "Colares", Pulseiras: "Pulseiras" },
  en: { Todos: "View all", "Anéis": "Rings", Brincos: "Earrings", Colares: "Necklaces", Pulseiras: "Bracelets" },
  es: { Todos: "Ver todo", "Anéis": "Anillos", Brincos: "Pendientes", Colares: "Collares", Pulseiras: "Pulseras" },
  fr: { Todos: "Tout voir", "Anéis": "Bagues", Brincos: "Boucles d'oreilles", Colares: "Colliers", Pulseiras: "Bracelets" },
  de: { Todos: "Alle ansehen", "Anéis": "Ringe", Brincos: "Ohrringe", Colares: "Halsketten", Pulseiras: "Armbänder" },
  zh: { Todos: "查看全部", "Anéis": "戒指", Brincos: "耳环", Colares: "项链", Pulseiras: "手链" },
};

const categoryDescriptions: Record<LocaleCode, Partial<Record<"Todos" | Category, string>>> = {
  pt: { Todos: "Seleção completa Andrea's Mystery.", "Anéis": "Alianças delicadas, cristais e linhas minimalistas.", Brincos: "Luz junto ao rosto, com zircónias e pérolas.", Colares: "Pontos de brilho para decotes limpos.", Pulseiras: "Detalhes dourados para gestos elegantes." },
  en: { Todos: "The complete Andrea's Mystery selection.", "Anéis": "Delicate bands, crystals and minimalist lines.", Brincos: "Light close to the face, with zirconia and pearls.", Colares: "Points of shine for clean necklines.", Pulseiras: "Golden details for elegant gestures." },
  es: { Todos: "La selección completa de Andrea's Mystery.", "Anéis": "Aros delicados, cristales y líneas minimalistas.", Brincos: "Luz junto al rostro, con circonitas y perlas.", Colares: "Puntos de brillo para escotes limpios.", Pulseiras: "Detalles dorados para gestos elegantes." },
  fr: { Todos: "La sélection complète Andrea's Mystery.", "Anéis": "Anneaux délicats, cristaux et lignes minimalistes.", Brincos: "De la lumière près du visage, avec zircons et perles.", Colares: "Des points d'éclat pour les décolletés épurés.", Pulseiras: "Des détails dorés pour des gestes élégants." },
  de: { Todos: "Die komplette Auswahl von Andrea's Mystery.", "Anéis": "Zarte Ringe, Kristalle und minimalistische Linien.", Brincos: "Licht am Gesicht, mit Zirkonia und Perlen.", Colares: "Glanzpunkte für klare Ausschnitte.", Pulseiras: "Goldene Details für elegante Gesten." },
  zh: { Todos: "Andrea's Mystery 完整系列。", "Anéis": "精致戒圈、水晶与极简线条。", Brincos: "贴近面庞的光泽，点缀锆石与珍珠。", Colares: "为简洁领口增添亮点。", Pulseiras: "为举手投足加入金色细节。" },
};

export function getCategoryLabel(category: string, locale: LocaleCode) {
  const labels = categoryLabels[locale] ?? categoryLabels.pt;
  return labels[category as "Todos" | Category] ?? category;
}

export function getCategoryDescription(category: string, locale: LocaleCode) {
  const descriptions = categoryDescriptions[locale] ?? categoryDescriptions.pt;
  return descriptions[category as "Todos" | Category] ?? "";
}
