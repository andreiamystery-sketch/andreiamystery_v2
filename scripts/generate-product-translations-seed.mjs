import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { createRequire } from "node:module";

const root = process.cwd();
const require = createRequire(import.meta.url);
require.extensions[".ts"] = function loadTs(module, filename) {
  let source = fs.readFileSync(filename, "utf8");
  source = source.replace(/@\//g, `${root.replace(/\\/g, "/")}/`);
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, skipLibCheck: true },
  }).outputText;
  module._compile(output, filename);
};

const { catalogProducts } = require("../data/products.ts");
const locales = ["pt-PT", "en-GB", "es-ES", "fr-FR", "de-DE", "zh-CN"];
const categoryNames = {
  "pt-PT": { Todos: "Ver tudo", "Anéis": "Anéis", Brincos: "Brincos", Colares: "Colares", Pulseiras: "Pulseiras" },
  "en-GB": { Todos: "View all", "Anéis": "Rings", Brincos: "Earrings", Colares: "Necklaces", Pulseiras: "Bracelets" },
  "es-ES": { Todos: "Ver todo", "Anéis": "Anillos", Brincos: "Pendientes", Colares: "Collares", Pulseiras: "Pulseras" },
  "fr-FR": { Todos: "Tout voir", "Anéis": "Bagues", Brincos: "Boucles d'oreilles", Colares: "Colliers", Pulseiras: "Bracelets" },
  "de-DE": { Todos: "Alle ansehen", "Anéis": "Ringe", Brincos: "Ohrringe", Colares: "Halsketten", Pulseiras: "Armbänder" },
  "zh-CN": { Todos: "查看全部", "Anéis": "戒指", Brincos: "耳环", Colares: "项链", Pulseiras: "手链" },
};

const availability = {
  "pt-PT": "Disponível",
  "en-GB": "Available",
  "es-ES": "Disponible",
  "fr-FR": "Disponible",
  "de-DE": "Verfügbar",
  "zh-CN": "有货",
};

const dictionaries = {
  "en-GB": [
    ["Andrea's Mystery", "Andrea's Mystery"], ["Grupo Belle", "Grupo Belle"], ["GB Bijoux", "GB Bijoux"],
    ["Aliança", "Band"], ["aliança", "band"], ["Anel", "Ring"], ["anel", "ring"], ["Anéis", "Rings"], ["Brincos", "Earrings"], ["brincos", "earrings"], ["Argolas", "Hoop earrings"], ["argolas", "hoops"], ["Colar", "Necklace"], ["colar", "necklace"], ["Colares", "Necklaces"], ["Pulseira", "Bracelet"], ["pulseira", "bracelet"], ["Pulseiras", "Bracelets"],
    ["aço inoxidável", "stainless steel"], ["Aço inoxidável", "Stainless steel"], ["Aço", "Steel"], ["aço", "steel"], ["zircónias", "zirconia"], ["Zircónias", "Zirconia"], ["zirconias", "zirconia"], ["pérola", "pearl"], ["Pérola", "Pearl"], ["perola", "pearl"], ["cristal", "crystal"], ["Cristal", "Crystal"], ["brilhantes", "sparkling stones"], ["Brilhantes", "Sparkling stones"],
    ["dourado", "golden"], ["Dourado", "Golden"], ["prateado", "silver-tone"], ["Prateado", "Silver-tone"], ["fina", "fine"], ["Fina", "Fine"], ["básica", "essential"], ["Básica", "Essential"], ["delicada", "delicate"], ["Delicada", "Delicate"], ["delicado", "delicate"], ["Elegante", "Elegant"], ["elegante", "elegant"], ["ajustável", "adjustable"], ["Ajustável", "Adjustable"], ["acabamento", "finish"], ["Acabamento", "Finish"], ["Referência", "Reference"], ["com", "with"], ["para", "for"], ["e", "and"], ["em", "in"], ["de", "of"],
  ],
  "es-ES": [
    ["Aliança", "Anillo"], ["aliança", "anillo"], ["Anel", "Anillo"], ["anel", "anillo"], ["Anéis", "Anillos"], ["Brincos", "Pendientes"], ["brincos", "pendientes"], ["Argolas", "Aros"], ["argolas", "aros"], ["Colar", "Collar"], ["colar", "collar"], ["Pulseira", "Pulsera"], ["pulseira", "pulsera"],
    ["aço inoxidável", "acero inoxidable"], ["Aço inoxidável", "Acero inoxidable"], ["Aço", "Acero"], ["aço", "acero"], ["zircónias", "circonitas"], ["Zircónias", "Circonitas"], ["zirconias", "circonitas"], ["pérola", "perla"], ["Pérola", "Perla"], ["perola", "perla"], ["brilhantes", "brillos"], ["cristal", "cristal"], ["dourado", "dorado"], ["prateado", "plateado"], ["fina", "fina"], ["básica", "esencial"], ["delicada", "delicada"], ["elegante", "elegante"], ["ajustável", "ajustable"], ["Referência", "Referencia"], ["com", "con"], ["para", "para"], [" e ", " y "], [" em ", " en "],
  ],
  "fr-FR": [
    ["Aliança", "Anneau"], ["aliança", "anneau"], ["Anel", "Bague"], ["anel", "bague"], ["Anéis", "Bagues"], ["Brincos", "Boucles d'oreilles"], ["brincos", "boucles d'oreilles"], ["Argolas", "Créoles"], ["argolas", "créoles"], ["Colar", "Collier"], ["colar", "collier"], ["Pulseira", "Bracelet"], ["pulseira", "bracelet"],
    ["aço inoxidável", "acier inoxydable"], ["Aço inoxidável", "Acier inoxydable"], ["Aço", "Acier"], ["aço", "acier"], ["zircónias", "zircons"], ["Zircónias", "Zircons"], ["zirconias", "zircons"], ["pérola", "perle"], ["Pérola", "Perle"], ["perola", "perle"], ["brilhantes", "pierres brillantes"], ["cristal", "cristal"], ["dourado", "doré"], ["prateado", "argenté"], ["fina", "fine"], ["básica", "essentielle"], ["delicada", "délicate"], ["elegante", "élégante"], ["ajustável", "ajustable"], ["Referência", "Référence"], ["com", "avec"], ["para", "pour"], [" e ", " et "], [" em ", " en "],
  ],
  "de-DE": [
    ["Aliança", "Ring"], ["aliança", "Ring"], ["Anel", "Ring"], ["anel", "Ring"], ["Anéis", "Ringe"], ["Brincos", "Ohrringe"], ["brincos", "Ohrringe"], ["Argolas", "Creolen"], ["argolas", "Creolen"], ["Colar", "Halskette"], ["colar", "Halskette"], ["Pulseira", "Armband"], ["pulseira", "Armband"],
    ["aço inoxidável", "Edelstahl"], ["Aço inoxidável", "Edelstahl"], ["Aço", "Stahl"], ["aço", "Stahl"], ["zircónias", "Zirkonia"], ["Zircónias", "Zirkonia"], ["zirconias", "Zirkonia"], ["pérola", "Perle"], ["Pérola", "Perle"], ["perola", "Perle"], ["brilhantes", "Glanzsteinen"], ["cristal", "Kristall"], ["dourado", "goldfarben"], ["prateado", "silberfarben"], ["fina", "fein"], ["básica", "essentiell"], ["delicada", "zart"], ["elegante", "elegant"], ["ajustável", "verstellbar"], ["Referência", "Referenz"], ["com", "mit"], ["para", "für"], [" e ", " und "], [" em ", " in "],
  ],
  "zh-CN": [
    ["Aliança", "戒圈"], ["aliança", "戒圈"], ["Anel", "戒指"], ["anel", "戒指"], ["Anéis", "戒指"], ["Brincos", "耳环"], ["brincos", "耳环"], ["Argolas", "圈形耳环"], ["argolas", "圈形耳环"], ["Colar", "项链"], ["colar", "项链"], ["Pulseira", "手链"], ["pulseira", "手链"],
    ["aço inoxidável", "不锈钢"], ["Aço inoxidável", "不锈钢"], ["Aço", "钢"], ["aço", "钢"], ["zircónias", "锆石"], ["Zircónias", "锆石"], ["zirconias", "锆石"], ["pérola", "珍珠"], ["Pérola", "珍珠"], ["perola", "珍珠"], ["brilhantes", "亮石"], ["cristal", "水晶"], ["dourado", "金色"], ["prateado", "银色"], ["fina", "纤细"], ["básica", "基础款"], ["delicada", "精致"], ["elegante", "优雅"], ["ajustável", "可调节"], ["Referência", "参考"], ["com", "配"], ["para", "适合"],
  ],
};

function repairText(input) {
  let value = String(input ?? "").normalize("NFC");
  for (let i = 0; i < 3 && /[ÃÂ]/.test(value); i += 1) {
    try { value = Buffer.from(value, "latin1").toString("utf8"); } catch { break; }
  }
  return value.replace(/\s+/g, " ").trim();
}

function translateText(input, locale) {
  const base = repairText(input);
  if (locale === "pt-PT") return base;
  let output = base;
  for (const [from, to] of dictionaries[locale] ?? []) output = output.replaceAll(from, to);
  return output;
}

function localizedProductName(product, locale) {
  const translated = translateText(product.nome, locale);
  if (locale === "pt-PT") return translated;
  return translated.replace(/\bGB\b/g, "GB").replace(/\s+/g, " ").trim();
}

function localizedDescription(product, locale) {
  const source = repairText(product.descricao || product.nome);
  if (locale === "pt-PT") return source;
  const translated = translateText(source, locale);
  if (translated !== source) return translated;
  const name = localizedProductName(product, locale);
  const category = categoryNames[locale]?.[repairText(product.categoria)] ?? translateText(product.categoria, locale);
  const suffix = {
    "en-GB": `${name}, a refined ${category.toLowerCase()} with premium presence for elegant everyday styling.`,
    "es-ES": `${name}, una pieza refinada de ${category.toLowerCase()} con presencia premium para un estilo elegante diario.`,
    "fr-FR": `${name}, une pièce raffinée de ${category.toLowerCase()} à l'allure premium pour un style élégant au quotidien.`,
    "de-DE": `${name}, ein raffiniertes Schmuckstück aus der Kategorie ${category} mit hochwertiger Ausstrahlung für elegante Alltagslooks.`,
    "zh-CN": `${name}，一款精致的${category}，适合日常优雅造型。`,
  };
  return suffix[locale] ?? source;
}

function sqlString(value) {
  if (value === null || value === undefined || value === "") return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlArray(values) {
  const items = (values ?? []).map(repairText).filter(Boolean);
  if (!items.length) return "'{}'::text[]";
  return `array[${items.map(sqlString).join(", ")}]::text[]`;
}

function row(product, locale) {
  const name = localizedProductName(product, locale);
  const shortDescription = localizedDescription(product, locale);
  const description = shortDescription;
  const category = repairText(product.categoria);
  const categoryName = categoryNames[locale]?.[category] ?? translateText(category, locale);
  const details = (product.detalhes ?? []).map((detail) => translateText(detail, locale));
  const materials = (product.materiais ?? []).map((material) => translateText(material, locale));
  const seoTitle = `${name} | Andrea's Mystery`;
  const seoDescription = shortDescription;
  return `(${sqlString(String(product.id))}, ${sqlString(locale)}, ${sqlString(name)}, ${sqlString(shortDescription)}, ${sqlString(description)}, ${sqlString(categoryName)}, ${sqlArray(materials)}, ${sqlArray(details)}, ${sqlString(availability[locale])}, ${sqlString(seoTitle)}, ${sqlString(seoDescription)}, now())`;
}

const allRows = [];
for (const product of catalogProducts) {
  for (const locale of locales) allRows.push(row(product, locale));
}

const chunks = [];
for (let i = 0; i < allRows.length; i += 250) chunks.push(allRows.slice(i, i + 250));

const header = `-- Seed inicial de traduções completas de produtos.\n-- Gerado por scripts/generate-product-translations-seed.mjs.\n-- Idempotente: atualiza linhas existentes por (product_id, locale).\n\n`;
const statements = chunks.map((chunk) => `insert into public.product_translations (product_id, locale, name, short_description, description, category_name, materials, details, availability, seo_title, seo_description, updated_at)\nvalues\n${chunk.join(",\n")}\non conflict (product_id, locale) do update set\n  name = excluded.name,\n  short_description = excluded.short_description,\n  description = excluded.description,\n  category_name = excluded.category_name,\n  materials = excluded.materials,\n  details = excluded.details,\n  availability = excluded.availability,\n  seo_title = excluded.seo_title,\n  seo_description = excluded.seo_description,\n  updated_at = now();`).join("\n\n");

fs.writeFileSync(path.join(root, "supabase/product-translations-seed.sql"), header + statements + "\n", "utf8");
console.log(`Generated ${allRows.length} translation rows for ${catalogProducts.length} products.`);
