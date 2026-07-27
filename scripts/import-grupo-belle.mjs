import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const CATEGORY_URL = "https://grupobelle.com/276-gb-colares";
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

async function discoverProductUrls(limit) {
  const firstPage = await fetchText(CATEGORY_URL);
  const totalMatch = firstPage.match(/Existem\s+(\d+)\s+produtos/i) ?? firstPage.match(/total de\s+(\d+)\s+artigo/i);
  const advertisedTotal = totalMatch ? Number(totalMatch[1]) : null;
  const firstUrls = productUrlsFromCategory(firstPage);
  if (firstUrls.length === 0) throw new Error("A categoria não devolveu produtos.");

  const pageCount = advertisedTotal ? Math.ceil(advertisedTotal / firstUrls.length) : 1;
  const urls = [...firstUrls];
  for (let page = 2; page <= pageCount && (!limit || urls.length < limit); page += 1) {
    const html = await fetchText(`${CATEGORY_URL}?page=${page}`);
    const pageUrls = productUrlsFromCategory(html);
    if (pageUrls.length === 0) break;
    urls.push(...pageUrls);
  }

  return {
    advertisedTotal,
    urls: [...new Set(urls)].slice(0, limit ?? undefined),
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

async function inspectProduct(url, index, existingBySourceId) {
  const html = await fetchText(url);
  const schema = jsonLdBlocks(html).find((block) => block["@type"] === "Product");
  if (!schema?.name || !schema?.sku || !schema?.image) throw new Error(`Dados estruturados incompletos em ${url}`);

  const sku = decodeHtml(schema.sku);
  const supplierProductId = new URL(url).pathname.match(/^\/(\d+)/)?.[1] ?? String(90000 + index);
  const previous = existingBySourceId.get(supplierProductId);
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
      categoria: "Colares",
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

async function loadExistingProducts() {
  if (!(await exists(outputPath))) return [];
  const moduleUrl = `${pathToFileURL(outputPath).href}?sync=${Date.now()}`;
  const catalogModule = await import(moduleUrl);
  return Array.isArray(catalogModule.grupoBelleProducts) ? catalogModule.grupoBelleProducts : [];
}

function serializeProducts(products) {
  return `import type { Product } from "@/types/product";

// Gerado por scripts/import-grupo-belle.mjs. Não editar manualmente.
export const grupoBelleProducts = ${JSON.stringify(products, null, 2)} satisfies Product[];
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
  const existingBySourceId = new Map(existing.map((product) => [String(product.supplierProductId ?? product.id - 100000), product]));
  const discovery = await discoverProductUrls(options.limit);
  console.log(`Encontrados ${discovery.advertisedTotal ?? discovery.urls.length} produtos; a analisar ${discovery.urls.length}.`);

  const inspected = await mapLimit(discovery.urls, CONCURRENCY, async (url, index) => {
    const result = await inspectProduct(url, index, existingBySourceId);
    console.log(`[${index + 1}/${discovery.urls.length}] ${result.product.sku} — ${result.product.nome}`);
    return result;
  });

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

  const report = {
    mode: options.limit ? `limit-${options.limit}` : "full",
    startedAt,
    finishedAt: new Date().toISOString(),
    productsFound: discovery.advertisedTotal ?? discovery.urls.length,
    productsSynchronized: inspected.length,
    catalogProducts: merged.size,
    imagesDownloaded: downloaded,
    imagesReused: reused,
    duplicateSkus,
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
