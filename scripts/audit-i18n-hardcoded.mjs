import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const targets = ["app", "components"];
const ignored = [
  `${path.sep}api${path.sep}`,
  `${path.sep}admin${path.sep}`,
  `${path.sep}social${path.sep}`,
  `${path.sep}i18n${path.sep}messages.ts`,
  `${path.sep}chatbot${path.sep}knowledge.json`,
  `${path.sep}product-translations.ts`,
];

const visibleWords =
  /(Adicionar|Guardar|Detalhes|Aço|Acabamento|Design|Onde nos encontrar|Pontos de venda|Testemunhos|Compra verificada|Cliente exemplo|Ajuda|Assistente|Pesquisar|Carrinho|Favoritos|Fechar|Enviar|Produtos|Materiais|Envios|Devoluções|Pagamentos|Falar|Publicar|Scheduled|Checkout|Shipping|Available|Details)/i;

function walk(folder) {
  const absolute = path.join(root, folder);
  if (!fs.existsSync(absolute)) return [];

  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const current = path.join(absolute, entry.name);
    if (entry.isDirectory()) return walk(path.relative(root, current));
    if (!/\.(tsx|jsx)$/.test(entry.name)) return [];
    if (ignored.some((part) => current.includes(part))) return [];
    return [current];
  });
}

const matches = [];

for (const file of targets.flatMap(walk)) {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (
      visibleWords.test(trimmed) &&
      !trimmed.startsWith("import ") &&
      !trimmed.includes("t.") &&
      !trimmed.includes("dictionary.") &&
      !trimmed.includes("aria-label={") &&
      !trimmed.includes("href=")
    ) {
      matches.push({
        file: path.relative(root, file).replace(/\\/g, "/"),
        line: index + 1,
        text: trimmed.slice(0, 180),
      });
    }
  });
}

console.log(JSON.stringify({ matches: matches.length, items: matches }, null, 2));
