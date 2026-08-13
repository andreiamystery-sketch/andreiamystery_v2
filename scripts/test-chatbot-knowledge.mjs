import fs from "node:fs";

const knowledge = JSON.parse(
  fs.readFileSync("data/chatbot/knowledge.json", "utf8").replace(/^\uFEFF/, ""),
);

const minimumConfidence = 0.34;
const stopWords = new Set([
  "a",
  "o",
  "os",
  "as",
  "um",
  "uma",
  "uns",
  "umas",
  "de",
  "da",
  "do",
  "das",
  "dos",
  "e",
  "ou",
  "em",
  "no",
  "na",
  "nos",
  "nas",
  "pa",
  "p",
  "para",
  "por",
  "com",
  "c",
  "sem",
  "que",
  "qual",
  "quais",
  "como",
  "posso",
  "podem",
  "voces",
  "eu",
  "se",
  "esta",
  "este",
  "isto",
  "isso",
  "mais",
]);

const commonCorrections = new Map([
  ["devlver", "devolver"],
  ["devolucao", "devolucao"],
  ["devoluçao", "devolucao"],
  ["fasso", "faco"],
  ["faço", "faco"],
  ["mbay", "mbway"],
  ["mb", "mbway"],
  ["instagran", "instagram"],
  ["insta", "instagram"],
  ["alguem", "pessoa"],
  ["alguém", "pessoa"],
  ["mandam", "enviam"],
  ["manda", "envia"],
  ["chegar", "entrega"],
  ["brico", "brinco"],
  ["brincu", "brinco"],
]);

function normalizeText(value) {
  const normalized = String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized
    .split(" ")
    .map((token) => commonCorrections.get(token) ?? token)
    .join(" ");
}

function tokenize(value) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

function scoreText(queryTokens, candidate) {
  const candidateText = normalizeText(candidate);
  const candidateTokens = tokenize(candidate);

  if (!queryTokens.length || !candidateTokens.length) {
    return 0;
  }

  const candidateSet = new Set(candidateTokens);
  const directMatches = queryTokens.filter((token) =>
    candidateSet.has(token),
  ).length;
  const partialMatches = queryTokens.filter(
    (token) => token.length > 3 && candidateText.includes(token),
  ).length;

  return (
    (directMatches / queryTokens.length) * 0.78 +
    (partialMatches / queryTokens.length) * 0.22
  );
}

function find(query) {
  const queryTokens = tokenize(query);
  const ranked = knowledge.entries
    .map((entry) => {
      const questionScores = entry.questions.map((question) => ({
        question,
        score: scoreText(queryTokens, question),
      }));
      const keywordScore = scoreText(queryTokens, entry.keywords.join(" "));
      const bestQuestion = questionScores.sort((a, b) => b.score - a.score)[0];
      const exactCategory =
        normalizeText(query) === normalizeText(entry.category) ? 1 : 0;

      return {
        entry,
        score: Math.max(bestQuestion?.score ?? 0, keywordScore * 0.92, exactCategory),
        matchedQuestion: bestQuestion?.question,
      };
    })
    .sort((a, b) => b.score - a.score)[0];

  return ranked && ranked.score >= minimumConfidence
    ? {
        id: ranked.entry.id,
        confidence: Number(ranked.score.toFixed(3)),
        source: "knowledge",
      }
    : {
        id: null,
        confidence: Number((ranked?.score ?? 0).toFixed(3)),
        source: "fallback",
      };
}

const cases = [
  ["Que tipos de joias vendem?", "produtos"],
  ["vocês vendem brincos?", "produtos"],
  ["Têm colares?", "produtos"],
  ["Têm pulseiras?", "produtos"],
  ["Têm anéis?", "produtos"],
  ["Quero saber mais sobre esta peça.", "produtos"],
  ["Como sei se está disponível?", "produtos"],
  ["Qual é o material dos brincos?", "materiais"],
  ["As peças são em aço?", "materiais"],
  ["Têm pérolas e cristais?", "materiais"],
  ["Como cuidar das peças?", "materiais"],
  ["mandam pa espanha?", "envios"],
  ["vocês enviam para portugal?", "envios"],
  ["Quanto tempo demora a entrega?", "envios"],
  ["Como acompanho a encomenda?", "envios"],
  ["posso devlver se não gostar?", "devolucoes"],
  ["como fasso uma devolucao?", "devolucoes"],
  ["Quem paga os portes da devolução?", "devolucoes"],
  ["aceitam mbay?", "pagamentos"],
  ["posso pagar c cartão?", "pagamentos"],
  ["Aceitam referência Multibanco?", "pagamentos"],
  ["qual é o instagran?", "contacto"],
  ["como posso falar c alguem?", "humano"],
  ["quero falar com uma pessoa.", "humano"],
  ["quanto custa enviar para espanha?", "envios"],
  ["qual é o prazo exato para madrid?", "envios"],
  ["têm este produto disponível?", "produtos"],
  ["Têm loja no Porto aberta ao domingo?", null],
];

const results = cases.map(([question, expected]) => ({
  question,
  expected,
  ...find(question),
}));

console.table(results);

const failed = results.filter((row) => row.expected !== row.id);

if (failed.length) {
  console.error(JSON.stringify({ failed }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      tested: results.length,
      passed: results.length - failed.length,
      fallbackPassed: results.filter((row) => row.source === "fallback").length,
    },
    null,
    2,
  ),
);
