import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const CATEGORY_SOURCES = [
  { category: "Colares", url: "https://grupobelle.com/276-gb-colares" },
  { category: "Brincos", url: "https://grupobelle.com/277-gb-brincos" },
  { category: "Pulseiras", url: "https://grupobelle.com/278-gb-pulseiras" },
  { category: "AnÃ©is", url: "https://grupobelle.com/275-gb-aneis" },
];
const SUPPLIER = "Grupo Belle";
const PRICE_MULTIPLIER = 3;
const CONCURRENCY = 6;
const projectRoot = process.cwd();
const outputPath = path.join(projectRoot, "data", "grupo-belle-products.ts");

function parseArguments(argv) {
  const args = { dryRun: false, limit: null };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--dry-run") args.dryRun = true;
    if (argv[index] === "--limit") args.limit = Number.parseInt(argv[index + 1], 10);
  }
  if (args.limit !== null && (!Number.isFinite(args.limit) || args.limit < 1)) {
    throw new Error("--limit requer um número inteiro positivo.");
  }
  return args;
}

function decodeHtml(value) {
  return String(value)
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&nbsp;", " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function multiplyDecimalCurrency(rawValue, multiplier) {
  const normalized = String(rawValue).trim();
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return 0;
  const [whole, fraction = ""] = normalized.split(".");
  const scale = 10 ** fraction.length;
  const units = Number(whole) * scale + Number(fraction || 0);
  return Math.round((units * multiplier * 10) / scale) / 10;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function fetchResponse(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "AndreaMysteryProductImporter/2.0 (+authorized catalogue synchronization)",
      accept: "text/html,application/xhtml+xml,image/avif,image/webp,image/*,*/*",
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Pedido falhou (${response.status}) para ${url}`);
  return response;
}

async function fetchText(url) {
  return (await fetchResponse(url)).text();
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => {
      try {
        return JSON.parse(match[1]);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function productUrlsFromCategory(html) {
  const itemList = jsonLdBlocks(html).find((block) => block["@type"] === "ItemList");
  return (itemList?.itemListElement ?? [])
    .map((item) => item.url?.split("#")[0])
    .filter((url) => typeof url === "string");
}

async function discoverCategory(source, limit) {
  const firstPage = await fetchText(source.url);
  const totalMatch = firstPage.match(/Existem\s+(\d+)\s+produtos/i) ?? firstPage.match(/total de\s+(\d+)\s+artigo/i);
  const advertisedTotal = totalMatch ? Number(totalMatch[1]) : null;
  const firstUrls = productUrlsFromCategory(firstPage);
  if (firstUrls.length === 0) throw new Error("A categoria não devolveu produtos.");

  const pageCount = advertisedTotal ? Math.ceil(advertisedTotal / firstUrls.length) : 1;
  const urls = [...firstUrls];
  for (let page = 2; page <= pageCount && (!limit || urls.length < limit); page += 1) {
    const html = await fetchText(`${source.url}?page=${page}`);
    const pageUrls = productUrlsFromCategory(html);
    if (pageUrls.length === 0) break;
    urls.push(...pageUrls);
  }

  return {
    ...source,
    advertisedTotal,
    urls: [...new Set(urls)].slice(0, limit ?? undefined),
  };
}

async function discoverProductUrls(limit) {
  const categories = [];
  let remaining = limit;
  for (const source of CATEGORY_SOURCES) {
    if (remaining !== null && remaining <= 0) break;
    const discovered = await discoverCategory(source, remaining);
    categories.push(discovered);
    if (remaining !== null) remaining -= discovered.urls.length;
  }
  const allItems = categories.flatMap((category) =>
    category.urls.map((url) => ({ url, category: category.category, categoryUrl: category.url })),
  );
  const itemsByUrl = new Map();
  for (const item of allItems) if (!itemsByUrl.has(item.url)) itemsByUrl.set(item.url, item);
  return {
    advertisedTotal: categories.reduce((sum, category) => sum + (category.advertisedTotal ?? category.urls.length), 0),
    categories,
    items: [...itemsByUrl.values()],
    duplicateCategoryUrls: allItems.length - itemsByUrl.size,
  };
}

function imageUrlsFromProduct(html, coverUrl) {
  const gallery = html.match(/<div class="product__images js-images-container">([\s\S]*?)<div class="modal fade/i)?.[1] ?? html;
  const galleryUrls = [...gallery.matchAll(/https:\/\/grupobelle\.com\/[^"' \n]+-product_main\/[^"' \n]+?\.(?:jpg|jpeg|png|webp)/gi)]
    .map((match) => match[0]);
  return [coverUrl, ...new Set(galleryUrls.filter((url) => url !== coverUrl))];
}

function materialsFromProduct(schema, html) {
  const text = decodeHtml(`${schema.name} ${schema.description} ${schema.category} ${html.match(/product-features[\s\S]{0,4000}/i)?.[0] ?? ""}`);
  const candidates = ["Aço inoxidável", "Aço", "Zircónias", "Zircónia", "Pérola", "Cortiça", "Prata", "Esmalte", "Caramujo"];
  return candidates.filter((material, index) =>
    text.toLocaleLowerCase("pt-PT").includes(material.toLocaleLowerCase("pt-PT")) &&
    !candidates.slice(0, index).some((previous) => material.startsWith(previous)),
  );
}

function classifyProduct(schema, fallbackCategory) {
  const text = decodeHtml(`${schema.category ?? ""} ${schema.name ?? ""}`).toLocaleLowerCase("pt-PT");
  if (/\b(carteir|mala|expositor|saco de tecido)/.test(text)) return null;
  if (/\b(anel|alianÃ§a|solitario|solitÃ¡rio)\b/.test(text)) return "AnÃ©is";
  if (/\b(brinco|argola|arrecada|piercing|ear cuff)\b/.test(text)) return "Brincos";
  if (/\b(pulseira|bracelete)\b/.test(text)) return "Pulseiras";
  if (/\b(colar|escapulÃ¡rio|trancelim)\b/.test(text)) return "Colares";
  return fallbackCategory;
}

function extensionFromUrl(url) {
  const extension = path.extname(new URL(url).pathname).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp"].includes(extension) ? extension : ".jpg";
}

function localImagePlan(sourceImages, slug) {
  return sourceImages.map((sourceUrl, index) => {
    const filename = index === 0 ? `capa${extensionFromUrl(sourceUrl)}` : `foto${index}${extensionFromUrl(sourceUrl)}`;
    return {
      sourceUrl,
      filePath: path.join(projectRoot, "public", "images", "produtos", slug, filename),
      publicPath: `/images/produtos/${slug}/${filename}`,
    };
  });
}

async function inspectProduct(discovered, index, existingIndexes) {
  const { url, category } = discovered;
  const html = await fetchText(url);
  const schema = jsonLdBlocks(html).find((block) => block["@type"] === "Product");
  if (!schema?.name || !schema?.sku || !schema?.image) {
    return { skippedUrl: url, reason: "Dados estruturados incompletos" };
  }
  const resolvedCategory = classifyProduct(schema, category);
  if (!resolvedCategory) return null;

  const sku = decodeHtml(schema.sku);
  const supplierProductId = new URL(url).pathname.match(/^\/(\d+)/)?.[1] ?? String(90000 + index);
  const previous =
    existingIndexes.bySupplierProductId.get(supplierProductId) ??
    existingIndexes.bySku.get(sku) ??
    existingIndexes.byStableId.get(sku);
  const slug = previous?.slug ?? `grupo-belle-${slugify(sku)}-${supplierProductId}`;
  const schemaImage = Array.isArray(schema.image) ? schema.image[0] : schema.image;
  const coverUrl = schemaImage.replace(/-(?:home_default|default_md|large_default)\//, "-product_main/");
  const sourceImages = imageUrlsFromProduct(html, coverUrl);
  const images = localImagePlan(sourceImages, slug);
  const supplierPriceMatch =
    html.match(/"initialProduct":\{[^}]*"price":([0-9.]+)/) ??
    html.match(/"rrp_base_price":([0-9.]+)/);
  const supplierPriceRaw = supplierPriceMatch?.[1] ?? "";
  const supplierPrice = supplierPriceRaw ? Number(supplierPriceRaw) : 0;
  const hasValidPrice = Number.isFinite(supplierPrice) && supplierPrice > 0;
  const price = hasValidPrice ? multiplyDecimalCurrency(supplierPriceRaw, PRICE_MULTIPLIER) : 0;
  const now = new Date().toISOString();
  const categoriaOriginal = decodeHtml(schema.category || "Colares");
  const materiais = materialsFromProduct(schema, html);

  return {
    product: {
      id: previous?.id ?? 100000 + Number(supplierProductId),
      stableId: sku,
      supplierProductId,
      slug,
      nome: decodeHtml(schema.name),
      categoria: resolvedCategory,
      preco: price,
      supplierPrice,
      priceMultiplier: PRICE_MULTIPLIER,
      price,
      currency: "EUR",
      descricao: decodeHtml(schema.description || schema.name),
      capa: images[0].publicPath,
      imagens: images.slice(1).map((image) => image.publicPath),
      detalhes: [categoriaOriginal, `Referência: ${sku}`, ...materiais],
      materiais,
      sku,
      categoriaOriginal,
      urlOriginal: url,
      sourceImageUrls: sourceImages,
      isPublished: hasValidPrice ? (previous?.isPublished ?? false) : false,
      isFeatured: previous?.isFeatured ?? false,
      supplier: SUPPLIER,
      supplierUrl: url,
      importedAt: previous?.importedAt ?? now,
      updatedAt: now,
    },
    images,
  };
}

async function downloadMissingImages(images) {
  let downloaded = 0;
  let reused = 0;
  for (const image of images) {
    if (await exists(image.filePath)) {
      reused += 1;
      continue;
    }
    await mkdir(path.dirname(image.filePath), { recursive: true });
    const response = await fetchResponse(image.sourceUrl);
    await writeFile(image.filePath, Buffer.from(await response.arrayBuffer()));
    downloaded += 1;
  }
  return { downloaded, reused };
}

function completenessScore(product) {
  return [
    product.supplierProductId,
    product.sku,
    product.stableId,
    product.nome,
    product.slug,
    product.supplierPrice > 0,
    product.price > 0,
    product.capa,
    product.imagens?.length,
  ].filter(Boolean).length;
}

function deduplicateProducts(products) {
  const accepted = [];
  const indexByKey = new Map();
  const duplicates = [];
  for (const product of products) {
    const keys = [
      product.supplierProductId && `id:${product.supplierProductId}`,
      product.sku && `sku:${product.sku.trim().toLocaleLowerCase("pt-PT")}`,
      product.stableId && `stable:${String(product.stableId).trim().toLocaleLowerCase("pt-PT")}`,
    ].filter(Boolean);
    const existingIndex = keys.map((key) => indexByKey.get(key)).find((value) => value !== undefined);
    if (existingIndex === undefined) {
      const nextIndex = accepted.push(product) - 1;
      keys.forEach((key) => indexByKey.set(key, nextIndex));
      continue;
    }
    const existing = accepted[existingIndex];
    const replacement = completenessScore(product) > completenessScore(existing) ? product : existing;
    accepted[existingIndex] = replacement;
    keys.forEach((key) => indexByKey.set(key, existingIndex));
    duplicates.push({
      sku: product.sku,
      keptSupplierProductId: replacement.supplierProductId,
      discardedSupplierProductId: replacement === product ? existing.supplierProductId : product.supplierProductId,
    });
  }
  return { products: accepted, duplicates };
}

function protectCompleteExisting(candidate, existingIndexes) {
  const previous =
    existingIndexes.bySupplierProductId.get(String(candidate.supplierProductId)) ??
    existingIndexes.bySku.get(String(candidate.sku)) ??
    existingIndexes.byStableId.get(String(candidate.stableId));
  if (!previous || completenessScore(candidate) >= completenessScore(previous)) return candidate;
  return {
    ...previous,
    categoria: candidate.categoria,
    categoriaOriginal: candidate.categoriaOriginal || previous.categoriaOriginal,
    supplierUrl: candidate.supplierUrl || previous.supplierUrl,
    urlOriginal: candidate.urlOriginal || previous.urlOriginal,
    updatedAt: candidate.updatedAt,
  };
}

async function loadExistingProducts() {
  if (!(await exists(outputPath))) return [];
  const moduleUrl = `${pathToFileURL(outputPath).href}?sync=${Date.now()}`;
  const catalogModule = await import(moduleUrl);
  return Array.isArray(catalogModule.grupoBelleProducts) ? catalogModule.grupoBelleProducts : [];
}

function serializeProducts(products) {
  return `/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- Catálogo gerado; o literal completo excede o limite de complexidade do TypeScript.
import type { Product } from "@/types/product";
// @ts-nocheck -- Catálogo gerado; o literal completo excede o limite de complexidade do TypeScript.

// Gerado por scripts/import-grupo-belle.mjs. Não editar manualmente.
export const grupoBelleProducts: Product[] = ${JSON.stringify(products, null, 2)};
`;
}

async function writeCatalog(products) {
  const sorted = [...products].sort((a, b) => a.nome.localeCompare(b.nome, "pt-PT"));
  await writeFile(outputPath, serializeProducts(sorted), "utf8");
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const startedAt = new Date().toISOString();
  const existing = await loadExistingProducts();
  const existingIndexes = {
    bySupplierProductId: new Map(existing.filter((product) => product.supplierProductId).map((product) => [String(product.supplierProductId), product])),
    bySku: new Map(existing.filter((product) => product.sku).map((product) => [String(product.sku), product])),
    byStableId: new Map(existing.filter((product) => product.stableId).map((product) => [String(product.stableId), product])),
  };
  const discovery = await discoverProductUrls(options.limit);
  console.log("Descoberta por categoria:");
  for (const category of discovery.categories) {
    console.log(`- ${category.category}: ${category.urls.length}/${category.advertisedTotal ?? "?"} (${category.url})`);
  }
  console.log(`Encontrados ${discovery.advertisedTotal} produtos anunciados; ${discovery.items.length} URLs únicos a analisar.`);

  const inspectedRaw = await mapLimit(discovery.items, CONCURRENCY, async (item, index) => {
    const result = await inspectProduct(item, index, existingIndexes);
    if (!result?.product) {
      console.log(`[${index + 1}/${discovery.items.length}] Ignorado: ${result?.reason ?? "fora das categorias da loja"} — ${item.url}`);
      return result ?? { skippedUrl: item.url, reason: "Fora das categorias da loja" };
    }
    result.product = protectCompleteExisting(result.product, existingIndexes);
    console.log(`[${index + 1}/${discovery.items.length}] ${result.product.sku} — ${result.product.nome}`);
    return result;
  });
  const validInspected = inspectedRaw.filter((item) => item?.product);
  const skippedProducts = inspectedRaw.filter((item) => !item?.product);
  const deduplicated = deduplicateProducts(validInspected.map((item) => item.product));
  const inspectedById = new Map(validInspected.map((item) => [item.product.supplierProductId, item]));
  const inspected = deduplicated.products.map((product) => ({ ...inspectedById.get(product.supplierProductId), product }));
  const countsByCategory = Object.fromEntries(
    CATEGORY_SOURCES.map(({ category }) => [category, inspected.filter(({ product }) => product.categoria === category).length]),
  );

  const plannedImages = inspected.flatMap((item) => item.images);
  const missingImages = [];
  for (const image of plannedImages) if (!(await exists(image.filePath))) missingImages.push(image);
  const skuCounts = new Map();
  for (const { product } of inspected) skuCounts.set(product.sku, (skuCounts.get(product.sku) ?? 0) + 1);
  const duplicateSkus = [...skuCounts].filter(([, count]) => count > 1).map(([sku, count]) => ({ sku, count }));
  const productsWithoutPrice = inspected
    .filter(({ product }) => !product.supplierPrice || product.supplierPrice <= 0)
    .map(({ product }) => ({
      supplierProductId: product.supplierProductId,
      sku: product.sku,
      name: product.nome,
      supplierUrl: product.supplierUrl,
    }));

  if (options.dryRun) {
    console.log(JSON.stringify({
      mode: "dry-run",
      advertisedProducts: discovery.advertisedTotal,
      productsAnalyzed: inspected.length,
      categories: discovery.categories.map(({ category, url, advertisedTotal, urls }) => ({
        category,
        url,
        advertisedTotal,
        discoveredUrls: urls.length,
      })),
      countsByCategory,
      duplicateCategoryUrls: discovery.duplicateCategoryUrls,
      deduplicatedProducts: deduplicated.duplicates,
      skippedProducts,
      imagesFound: plannedImages.length,
      imagesToDownload: missingImages.length,
      imagesAlreadyLocal: plannedImages.length - missingImages.length,
      duplicateSkus,
      productsWithoutPrice,
    }, null, 2));
    return;
  }

  const synchronizedIds = new Set(inspected.map(({ product }) => product.supplierProductId));
  const legacyWithoutPrice = existing
    .filter((product) => !synchronizedIds.has(product.supplierProductId) && (!product.supplierPrice || !product.price))
    .map((product) => ({
      ...product,
      preco: 0,
      supplierPrice: 0,
      priceMultiplier: PRICE_MULTIPLIER,
      price: 0,
      currency: "EUR",
      isPublished: false,
      updatedAt: new Date().toISOString(),
    }));
  const legacyWithoutPriceIds = new Set(legacyWithoutPrice.map((product) => product.supplierProductId));
  const merged = new Map(
    existing.map((product) => [
      String(product.supplierProductId ?? product.id - 100000),
      legacyWithoutPriceIds.has(product.supplierProductId)
        ? legacyWithoutPrice.find((legacy) => legacy.supplierProductId === product.supplierProductId)
        : product,
    ]),
  );
  for (const skipped of skippedProducts) {
    const supplierProductId = new URL(skipped.skippedUrl).pathname.match(/^\/(\d+)/)?.[1];
    if (supplierProductId) merged.delete(supplierProductId);
  }
  for (const duplicate of deduplicated.duplicates) {
    if (duplicate.discardedSupplierProductId) merged.delete(String(duplicate.discardedSupplierProductId));
  }
  let downloaded = 0;
  let reused = 0;
  for (const [index, item] of inspected.entries()) {
    const imageResult = await downloadMissingImages(item.images);
    downloaded += imageResult.downloaded;
    reused += imageResult.reused;
    merged.set(item.product.supplierProductId, item.product);
    await writeCatalog([...merged.values()]);
    console.log(`Guardado ${index + 1}/${inspected.length} (download: ${imageResult.downloaded}, reutilizadas: ${imageResult.reused}).`);
  }
  const normalizedProducts = [...merged.values()].map((product) => {
    if (!product.supplierPrice || product.supplierPrice <= 0) return product;
    const price = multiplyDecimalCurrency(String(product.supplierPrice), PRICE_MULTIPLIER);
    return { ...product, preco: price, priceMultiplier: PRICE_MULTIPLIER, price };
  });
  const finalDeduplicated = deduplicateProducts(normalizedProducts);
  await writeCatalog(finalDeduplicated.products);

  const report = {
    mode: options.limit ? `limit-${options.limit}` : "full",
    startedAt,
    finishedAt: new Date().toISOString(),
    productsFound: discovery.advertisedTotal,
    productsSynchronized: inspected.length,
    countsByCategory,
    skippedProducts,
    catalogProducts: finalDeduplicated.products.length,
    imagesDownloaded: downloaded,
    imagesReused: reused,
    duplicateSkus,
    finalDeduplicatedProducts: finalDeduplicated.duplicates,
    productsWithoutPrice: [
      ...productsWithoutPrice,
      ...legacyWithoutPrice.map((product) => ({
        supplierProductId: product.supplierProductId,
        sku: product.sku,
        name: product.nome,
        supplierUrl: product.supplierUrl,
      })),
    ],
  };
  const logsDirectory = path.join(projectRoot, "logs");
  await mkdir(logsDirectory, { recursive: true });
  const reportPath = path.join(logsDirectory, `grupo-belle-import-${report.finishedAt.replaceAll(":", "-")}.json`);
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
  console.log(`Relatório: ${path.relative(projectRoot, reportPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
