import type { AppLocale } from "@/config/locales";
import type { Product, ProductTranslationContent } from "@/types/product";

type LocalTranslationMap = Record<string, Partial<Record<AppLocale, ProductTranslationContent>>>;
type TextSet = Record<AppLocale, string>;
type Feature = { pattern: RegExp; label: TextSet };

const availability: TextSet = {
  "pt-PT": "Disponível",
  "en-GB": "Available",
  "es-ES": "Disponible",
  "fr-FR": "Disponible",
  "de-DE": "Verfügbar",
  "zh-CN": "有货",
};

const categoryNames: Record<AppLocale, Record<string, string>> = {
  "pt-PT": { "Anéis": "Anéis", "AnÃ©is": "Anéis", Brincos: "Brincos", Colares: "Colares", Pulseiras: "Pulseiras" },
  "en-GB": { "Anéis": "Rings", "AnÃ©is": "Rings", Brincos: "Earrings", Colares: "Necklaces", Pulseiras: "Bracelets" },
  "es-ES": { "Anéis": "Anillos", "AnÃ©is": "Anillos", Brincos: "Pendientes", Colares: "Collares", Pulseiras: "Pulseras" },
  "fr-FR": { "Anéis": "Bagues", "AnÃ©is": "Bagues", Brincos: "Boucles d'oreilles", Colares: "Colliers", Pulseiras: "Bracelets" },
  "de-DE": { "Anéis": "Ringe", "AnÃ©is": "Ringe", Brincos: "Ohrringe", Colares: "Halsketten", Pulseiras: "Armbänder" },
  "zh-CN": { "Anéis": "戒指", "AnÃ©is": "戒指", Brincos: "耳环", Colares: "项链", Pulseiras: "手链" },
};

export const localProductTranslations: LocalTranslationMap = {
  "1": {
    "pt-PT": { name: "Anel Delicate", shortDescription: "Duas aliancas finas com brilho subtil, criadas para usar em conjunto ou separadas.", description: "Duas aliancas finas com brilho subtil, criadas para usar em conjunto ou separadas.", categoryName: "Anéis" },
    "en-GB": { name: "Delicate Ring", shortDescription: "Two fine bands with a subtle shine, designed to be worn together or apart.", description: "Two fine bands with a subtle shine, designed to be worn together or apart.", categoryName: "Rings" },
    "es-ES": { name: "Anillo Delicate", shortDescription: "Dos alianzas finas con brillo sutil, creadas para llevar juntas o por separado.", description: "Dos alianzas finas con brillo sutil, creadas para llevar juntas o por separado.", categoryName: "Anillos" },
    "fr-FR": { name: "Bague Delicate", shortDescription: "Deux anneaux fins à l'éclat subtil, à porter ensemble ou séparément.", description: "Deux anneaux fins à l'éclat subtil, à porter ensemble ou séparément.", categoryName: "Bagues" },
  },
  "2": {
    "pt-PT": { name: "Anel Glamour", shortDescription: "Anel com presença elegante e cristal luminoso, perfeito para ocasiões especiais.", description: "Anel com presença elegante e cristal luminoso, perfeito para ocasiões especiais.", categoryName: "Anéis" },
    "en-GB": { name: "Glamour Ring", shortDescription: "A ring with elegant presence and a luminous crystal, perfect for special occasions.", description: "A ring with elegant presence and a luminous crystal, perfect for special occasions.", categoryName: "Rings" },
    "es-ES": { name: "Anillo Glamour", shortDescription: "Un anillo de presencia elegante y cristal luminoso, perfecto para ocasiones especiales.", description: "Un anillo de presencia elegante y cristal luminoso, perfecto para ocasiones especiales.", categoryName: "Anillos" },
    "fr-FR": { name: "Bague Glamour", shortDescription: "Une bague à la présence élégante et au cristal lumineux, parfaite pour les occasions spéciales.", description: "Une bague à la présence élégante et au cristal lumineux, parfaite pour les occasions spéciales.", categoryName: "Bagues" },
  },
  "3": {
    "pt-PT": { name: "Brincos Princesa", shortDescription: "Brincos com zircónias brilhantes e silhueta refinada para iluminar o rosto.", description: "Brincos com zircónias brilhantes e silhueta refinada para iluminar o rosto.", categoryName: "Brincos" },
    "en-GB": { name: "Princess Earrings", shortDescription: "Bright zirconia earrings with a refined silhouette to illuminate the face.", description: "Bright zirconia earrings with a refined silhouette to illuminate the face.", categoryName: "Earrings" },
    "es-ES": { name: "Pendientes Princesa", shortDescription: "Pendientes con circonitas brillantes y silueta refinada para iluminar el rostro.", description: "Pendientes con circonitas brillantes y silueta refinada para iluminar el rostro.", categoryName: "Pendientes" },
    "fr-FR": { name: "Boucles d'oreilles Princesse", shortDescription: "Boucles d'oreilles en zirconia lumineux avec une silhouette raffinée.", description: "Boucles d'oreilles en zirconia lumineux avec une silhouette raffinée pour illuminer le visage.", categoryName: "Boucles d'oreilles" },
  },
  "4": {
    "en-GB": { name: "Celeste Pearl Necklace", shortDescription: "A luminous pearl on a golden chain, effortless and delicate at the neckline.", description: "A luminous pearl on a golden chain, effortless and delicate at the neckline.", categoryName: "Necklaces" },
    "es-ES": { name: "Collar Celeste Perla", shortDescription: "Perla luminosa en cadena dorada, elegante sin esfuerzo y delicada en el escote.", description: "Perla luminosa en cadena dorada, elegante sin esfuerzo y delicada en el escote.", categoryName: "Collares" },
    "fr-FR": { name: "Collier Celeste Perle", shortDescription: "Perle lumineuse sur chaîne dorée, élégante et délicate au décolleté.", description: "Perle lumineuse sur chaîne dorée, élégante et délicate au décolleté.", categoryName: "Colliers" },
  },
  "5": {
    "en-GB": { name: "Lumiere Bracelet", shortDescription: "A fine mesh with champagne reflections, worn alone or layered.", description: "A fine mesh with champagne reflections, worn alone or layered.", categoryName: "Bracelets" },
    "es-ES": { name: "Pulsera Lumiere", shortDescription: "Malla fina con reflejos champán para llevar sola o combinada.", description: "Malla fina con reflejos champán para llevar sola o combinada.", categoryName: "Pulseras" },
    "fr-FR": { name: "Bracelet Lumiere", shortDescription: "Maille fine aux reflets champagne, à porter seule ou en accumulation.", description: "Maille fine aux reflets champagne, à porter seule ou en accumulation.", categoryName: "Bracelets" },
  },
  "6": {
    "en-GB": { name: "Prestige Hoops", shortDescription: "Elegant hoops with a subtle shine, sophisticated finish and lightweight profile.", description: "Elegant hoops with a subtle shine, sophisticated finish and lightweight profile.", categoryName: "Earrings" },
    "es-ES": { name: "Aros Prestige", shortDescription: "Aros elegantes con brillo sutil, acabado sofisticado y perfil ligero.", description: "Aros elegantes con brillo sutil, acabado sofisticado y perfil ligero.", categoryName: "Pendientes" },
    "fr-FR": { name: "Créoles Prestige", shortDescription: "Créoles élégantes à l'éclat subtil, finition sophistiquée et profil léger.", description: "Créoles élégantes à l'éclat subtil, finition sophistiquée et profil léger.", categoryName: "Boucles d'oreilles" },
  },
};

const kindByLocale: Record<AppLocale, Record<string, string>> = {
  "pt-PT": { ring: "Anel", band: "Aliança", earrings: "Brincos", hoops: "Argolas", necklace: "Colar", bracelet: "Pulseira", jewel: "Joia" },
  "en-GB": { ring: "ring", band: "band", earrings: "earrings", hoops: "hoop earrings", necklace: "necklace", bracelet: "bracelet", jewel: "jewellery piece" },
  "es-ES": { ring: "anillo", band: "alianza", earrings: "pendientes", hoops: "aros", necklace: "collar", bracelet: "pulsera", jewel: "joya" },
  "fr-FR": { ring: "bague", band: "anneau", earrings: "boucles d'oreilles", hoops: "créoles", necklace: "collier", bracelet: "bracelet", jewel: "bijou" },
  "de-DE": { ring: "Ring", band: "Bandring", earrings: "Ohrringe", hoops: "Creolen", necklace: "Halskette", bracelet: "Armband", jewel: "Schmuckstück" },
  "zh-CN": { ring: "戒指", band: "戒圈", earrings: "耳环", hoops: "圈形耳环", necklace: "项链", bracelet: "手链", jewel: "饰品" },
};

const materialLabels: Record<AppLocale, Record<string, string>> = {
  "pt-PT": { steel: "Aço inoxidável", zirconia: "Zircónias", pearl: "Pérola", crystal: "Cristal", stone: "Pedra natural" },
  "en-GB": { steel: "Stainless steel", zirconia: "Zirconia accents", pearl: "Pearl detail", crystal: "Crystal detail", stone: "Natural stone" },
  "es-ES": { steel: "Acero inoxidable", zirconia: "Detalles de circonitas", pearl: "Detalle de perla", crystal: "Detalle de cristal", stone: "Piedra natural" },
  "fr-FR": { steel: "Acier inoxydable", zirconia: "Détails en zirconia", pearl: "Détail perle", crystal: "Détail cristal", stone: "Pierre naturelle" },
  "de-DE": { steel: "Edelstahl", zirconia: "Zirkonia-Details", pearl: "Perlendetail", crystal: "Kristalldetail", stone: "Naturstein" },
  "zh-CN": { steel: "不锈钢", zirconia: "锆石细节", pearl: "珍珠细节", crystal: "水晶细节", stone: "天然石" },
};

const featureCatalog: Feature[] = [
  { pattern: /anjo da guarda|guarda/i, label: { "pt-PT": "anjo da guarda", "en-GB": "guardian angel", "es-ES": "ángel de la guarda", "fr-FR": "ange gardien", "de-DE": "Schutzengel", "zh-CN": "守护天使" } },
  { pattern: /olho eg[ií]pcio|olho/i, label: { "pt-PT": "olho egípcio", "en-GB": "Egyptian eye", "es-ES": "ojo egipcio", "fr-FR": "œil égyptien", "de-DE": "ägyptisches Auge", "zh-CN": "埃及之眼" } },
  { pattern: /cora[cç][aã]o|cora[çc][oõ]es/i, label: { "pt-PT": "coração", "en-GB": "heart", "es-ES": "corazón", "fr-FR": "cœur", "de-DE": "Herz", "zh-CN": "爱心" } },
  { pattern: /estrela/i, label: { "pt-PT": "estrela", "en-GB": "star", "es-ES": "estrella", "fr-FR": "étoile", "de-DE": "Stern", "zh-CN": "星星" } },
  { pattern: /lua/i, label: { "pt-PT": "lua", "en-GB": "moon", "es-ES": "luna", "fr-FR": "lune", "de-DE": "Mond", "zh-CN": "月亮" } },
  { pattern: /sol(?!it[áa]rio)/i, label: { "pt-PT": "sol", "en-GB": "sun", "es-ES": "sol", "fr-FR": "soleil", "de-DE": "Sonne", "zh-CN": "太阳" } },
  { pattern: /trevo/i, label: { "pt-PT": "trevo", "en-GB": "clover", "es-ES": "trébol", "fr-FR": "trèfle", "de-DE": "Kleeblatt", "zh-CN": "四叶草" } },
  { pattern: /cruz/i, label: { "pt-PT": "cruz", "en-GB": "cross", "es-ES": "cruz", "fr-FR": "croix", "de-DE": "Kreuz", "zh-CN": "十字架" } },
  { pattern: /flor/i, label: { "pt-PT": "flor", "en-GB": "flower", "es-ES": "flor", "fr-FR": "fleur", "de-DE": "Blume", "zh-CN": "花朵" } },
  { pattern: /borboleta/i, label: { "pt-PT": "borboleta", "en-GB": "butterfly", "es-ES": "mariposa", "fr-FR": "papillon", "de-DE": "Schmetterling", "zh-CN": "蝴蝶" } },
  { pattern: /abelha/i, label: { "pt-PT": "abelha", "en-GB": "bee", "es-ES": "abeja", "fr-FR": "abeille", "de-DE": "Biene", "zh-CN": "蜜蜂" } },
  { pattern: /cobra/i, label: { "pt-PT": "cobra", "en-GB": "snake", "es-ES": "serpiente", "fr-FR": "serpent", "de-DE": "Schlange", "zh-CN": "蛇形" } },
  { pattern: /gota/i, label: { "pt-PT": "gota", "en-GB": "drop", "es-ES": "gota", "fr-FR": "goutte", "de-DE": "Tropfen", "zh-CN": "水滴" } },
  { pattern: /inicial|letra/i, label: { "pt-PT": "inicial", "en-GB": "initial", "es-ES": "inicial", "fr-FR": "initiale", "de-DE": "Initiale", "zh-CN": "字母" } },
  { pattern: /p[ée]rola|perola/i, label: { "pt-PT": "pérola", "en-GB": "pearl", "es-ES": "perla", "fr-FR": "perle", "de-DE": "Perle", "zh-CN": "珍珠" } },
  { pattern: /zirc[oóô]nia|zirconia/i, label: { "pt-PT": "zircónias", "en-GB": "zirconia", "es-ES": "circonitas", "fr-FR": "zirconia", "de-DE": "Zirkonia", "zh-CN": "锆石" } },
  { pattern: /brilhante|brilhantes/i, label: { "pt-PT": "brilhantes", "en-GB": "sparkle", "es-ES": "brillo", "fr-FR": "éclat", "de-DE": "Glanz", "zh-CN": "闪耀" } },
  { pattern: /pedra natural/i, label: { "pt-PT": "pedra natural", "en-GB": "natural stone", "es-ES": "piedra natural", "fr-FR": "pierre naturelle", "de-DE": "Naturstein", "zh-CN": "天然石" } },
  { pattern: /pedra/i, label: { "pt-PT": "pedra", "en-GB": "stone", "es-ES": "piedra", "fr-FR": "pierre", "de-DE": "Stein", "zh-CN": "宝石" } },
  { pattern: /corrente/i, label: { "pt-PT": "corrente", "en-GB": "chain", "es-ES": "cadena", "fr-FR": "chaîne", "de-DE": "Kette", "zh-CN": "链条" } },
  { pattern: /elos?/i, label: { "pt-PT": "elos", "en-GB": "links", "es-ES": "eslabones", "fr-FR": "maillons", "de-DE": "Glieder", "zh-CN": "链节" } },
  { pattern: /bolas?|esferas?/i, label: { "pt-PT": "esferas", "en-GB": "beads", "es-ES": "bolitas", "fr-FR": "perles rondes", "de-DE": "Kugeln", "zh-CN": "圆珠" } },
  { pattern: /quadrad[oa]/i, label: { "pt-PT": "quadrado", "en-GB": "square", "es-ES": "cuadrado", "fr-FR": "carré", "de-DE": "quadratisch", "zh-CN": "方形" } },
  { pattern: /redond[oa]|c[ií]rculo/i, label: { "pt-PT": "redondo", "en-GB": "round", "es-ES": "redondo", "fr-FR": "rond", "de-DE": "rund", "zh-CN": "圆形" } },
  { pattern: /hex[aá]gono|hexagonal/i, label: { "pt-PT": "hexagonal", "en-GB": "hexagon", "es-ES": "hexagonal", "fr-FR": "hexagonal", "de-DE": "sechseckig", "zh-CN": "六边形" } },
  { pattern: /solit[áa]rio/i, label: { "pt-PT": "solitário", "en-GB": "solitaire", "es-ES": "solitario", "fr-FR": "solitaire", "de-DE": "Solitär", "zh-CN": "单钻" } },
  { pattern: /minimal/i, label: { "pt-PT": "minimalista", "en-GB": "minimal", "es-ES": "minimalista", "fr-FR": "minimaliste", "de-DE": "minimalistisch", "zh-CN": "极简" } },
  { pattern: /boho/i, label: { "pt-PT": "boho", "en-GB": "boho", "es-ES": "boho", "fr-FR": "boho", "de-DE": "Boho", "zh-CN": "波西米亚" } },
  { pattern: /multicor|colorid[ao]/i, label: { "pt-PT": "colorido", "en-GB": "colourful", "es-ES": "colorido", "fr-FR": "coloré", "de-DE": "farbenfroh", "zh-CN": "彩色" } },
  { pattern: /dourad[oa]/i, label: { "pt-PT": "Acabamento dourado", "en-GB": "Gold-tone finish", "es-ES": "Acabado dorado", "fr-FR": "Finition dorée", "de-DE": "Goldfarbenes Finish", "zh-CN": "金色饰面" } },
  { pattern: /pratead[oa]/i, label: { "pt-PT": "Acabamento prateado", "en-GB": "Silver-tone finish", "es-ES": "Acabado plateado", "fr-FR": "Finition argentée", "de-DE": "Silberfarbene Veredelung", "zh-CN": "银色饰面" } },
  { pattern: /fin[ao]/i, label: { "pt-PT": "fino", "en-GB": "slim", "es-ES": "fino", "fr-FR": "fin", "de-DE": "schmal", "zh-CN": "纤细" } },
  { pattern: /gross[ao]/i, label: { "pt-PT": "grosso", "en-GB": "bold", "es-ES": "grueso", "fr-FR": "large", "de-DE": "markant", "zh-CN": "粗款" } },
  { pattern: /b[áa]sic[oa]/i, label: { "pt-PT": "básico", "en-GB": "essential", "es-ES": "básico", "fr-FR": "essentiel", "de-DE": "essentiell", "zh-CN": "基础款" } },
  { pattern: /simples/i, label: { "pt-PT": "simples", "en-GB": "simple", "es-ES": "sencillo", "fr-FR": "simple", "de-DE": "schlicht", "zh-CN": "简约" } },
  { pattern: /ajust[áa]vel/i, label: { "pt-PT": "Design ajustável", "en-GB": "Adjustable design", "es-ES": "Diseño ajustable", "fr-FR": "Design ajustable", "de-DE": "Verstellbares Design", "zh-CN": "可调节设计" } },
];

function repairText(input: string | null | undefined) {
  let value = String(input ?? "").normalize("NFC");
  for (let index = 0; index < 3 && /[ÃÂ]/.test(value); index += 1) {
    try {
      value = Buffer.from(value, "latin1").toString("utf8");
    } catch {
      break;
    }
  }
  return value.replace(/\s+/g, " ").trim();
}

function productKind(product: Product) {
  const source = repairText(`${product.nome} ${product.categoria}`);
  if (/argola/i.test(source)) return "hoops";
  if (/alian[cç]a/i.test(source)) return "band";
  if (/brinco/i.test(source)) return "earrings";
  if (/colar/i.test(source)) return "necklace";
  if (/pulseira/i.test(source)) return "bracelet";
  if (/anel|an[ée]is/i.test(source)) return "ring";
  return "jewel";
}

function collectionName(product: Product) {
  const source = repairText(`${product.nome} ${product.categoriaOriginal ?? ""}`);
  const match = source.match(/\b(Delicate|Glamour|Prestige|Lumiere|Celeste|BijuBelle|BeLove|Valentines Day)\b/i);
  if (!match) return "";
  const value = match[1];
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function productFeatures(product: Product, locale: AppLocale) {
  const source = repairText(`${product.nome} ${product.descricao} ${(product.detalhes ?? []).join(" ")} ${(product.materiais ?? []).join(" ")}`);
  const labels: string[] = [];
  for (const feature of featureCatalog) {
    if (feature.pattern.test(source)) labels.push(feature.label[locale]);
  }
  return [...new Set(labels)].slice(0, 4);
}

function productMaterials(product: Product, locale: AppLocale) {
  const source = repairText(`${product.nome} ${product.descricao} ${(product.materiais ?? []).join(" ")}`);
  const materials: string[] = [];
  if (/a[cç]o|inox/i.test(source)) materials.push(materialLabels[locale].steel);
  if (/zirc[oóô]nia|zirconia/i.test(source)) materials.push(materialLabels[locale].zirconia);
  if (/p[ée]rola|perola/i.test(source)) materials.push(materialLabels[locale].pearl);
  if (/cristal/i.test(source)) materials.push(materialLabels[locale].crystal);
  if (/pedra/i.test(source)) materials.push(materialLabels[locale].stone);
  return [...new Set(materials)].slice(0, 3);
}

function capitalize(value: string) {
  return value ? value.charAt(0).toLocaleUpperCase() + value.slice(1) : value;
}

function generatedName(product: Product, locale: AppLocale) {
  if (locale === "pt-PT") return repairText(product.nome);

  const kind = kindByLocale[locale][productKind(product)] ?? kindByLocale[locale].jewel;
  const collection = collectionName(product);
  const features = productFeatures(product, locale).filter((feature) => !new RegExp(`^${feature}$`, "i").test(collection));

  if (locale === "en-GB") return capitalize([collection, ...features, kind].filter(Boolean).join(" "));
  if (locale === "zh-CN") return [collection, ...features, kind].filter(Boolean).join("");
  return capitalize([kind, collection, ...features].filter(Boolean).join(" "));
}

function generatedDescription(product: Product, locale: AppLocale, name: string) {
  if (locale === "pt-PT") return repairText(product.fullDescription ?? product.descricao);

  const kind = kindByLocale[locale][productKind(product)] ?? kindByLocale[locale].jewel;
  const category = categoryNames[locale]?.[product.categoria] ?? kind;
  const materials = productMaterials(product, locale);
  const materialText = materials.length ? materials.join(", ") : null;

  const descriptions: Record<AppLocale, string> = {
    "pt-PT": repairText(product.fullDescription ?? product.descricao),
    "en-GB": materialText
      ? `${name} in ${materialText}, designed as a refined ${kind} for elegant everyday styling.`
      : `${name}, a refined ${kind} from the ${category.toLowerCase()} collection for elegant everyday styling.`,
    "es-ES": materialText
      ? `${name} en ${materialText}, pensado como ${kind} refinado para un estilo elegante diario.`
      : `${name}, una pieza refinada de ${category.toLowerCase()} para un estilo elegante diario.`,
    "fr-FR": materialText
      ? `${name} en ${materialText}, pensé comme ${kind} raffiné pour une allure élégante au quotidien.`
      : `${name}, une pièce raffinée de la collection ${category.toLowerCase()} pour une allure élégante au quotidien.`,
    "de-DE": materialText
      ? `${name} aus ${materialText}, als raffiniertes ${kind} für elegante Alltagslooks gestaltet.`
      : `${name}, ein raffiniertes Schmuckstück aus der Kategorie ${category} für elegante Alltagslooks.`,
    "zh-CN": materialText
      ? `${name}，采用${materialText}打造，是适合日常优雅造型的精致${kind}。`
      : `${name}，来自${category}系列，适合日常优雅造型。`,
  };

  return descriptions[locale];
}

function generatedTranslation(product: Product, locale: AppLocale): ProductTranslationContent {
  const name = generatedName(product, locale);
  const description = generatedDescription(product, locale, name);
  return {
    name,
    shortDescription: description,
    description,
    categoryName: categoryNames[locale]?.[product.categoria] ?? product.categoryName ?? product.categoria,
    materials: productMaterials(product, locale),
    details: productFeatures(product, locale),
    availability: availability[locale],
    seoTitle: `${name} | Andrea's Mystery`,
    seoDescription: description,
  };
}

export function getLocalProductTranslation(product: Product, locale: AppLocale): ProductTranslationContent {
  const generated = generatedTranslation(product, locale);
  const manual = localProductTranslations[String(product.id)]?.[locale];

  return manual ? { ...generated, ...manual } : generated;
}
