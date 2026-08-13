import knowledge from "@/data/chatbot/knowledge.json";
import type { ChatbotKnowledge, ChatbotKnowledgeEntry, ChatbotMatch } from "@/types/chatbot";

export const chatbotKnowledge = knowledge as ChatbotKnowledge;

const minimumConfidence = 0.34;
const stopWords = new Set(["a", "o", "os", "as", "um", "uma", "uns", "umas", "de", "da", "do", "das", "dos", "e", "ou", "em", "no", "na", "nos", "nas", "pa", "p", "para", "por", "com", "c", "sem", "que", "qual", "quais", "como", "posso", "podem", "vocês", "voces", "eu", "se", "esta", "este", "isto", "isso", "mais"]);

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
  ["aneis", "aneis"],
  ["colarz", "colares"],
]);

function normalizeText(value: string) {
  const normalized = value
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

function tokenize(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

function scoreText(queryTokens: string[], candidate: string) {
  const candidateText = normalizeText(candidate);
  const candidateTokens = tokenize(candidate);
  if (!queryTokens.length || !candidateTokens.length) return 0;

  const candidateSet = new Set(candidateTokens);
  const directMatches = queryTokens.filter((token) => candidateSet.has(token)).length;
  const partialMatches = queryTokens.filter((token) => token.length > 3 && candidateText.includes(token)).length;
  const coverage = directMatches / queryTokens.length;
  const partialCoverage = partialMatches / queryTokens.length;

  return coverage * 0.78 + partialCoverage * 0.22;
}

function scoreEntry(query: string, entry: ChatbotKnowledgeEntry) {
  const queryTokens = tokenize(query);
  const questionScores = entry.questions.map((question) => ({ question, score: scoreText(queryTokens, question) }));
  const keywordScore = scoreText(queryTokens, entry.keywords.join(" "));
  const bestQuestion = questionScores.sort((a, b) => b.score - a.score)[0];
  const exactCategory = normalizeText(query) === normalizeText(entry.category) ? 1 : 0;
  const score = Math.max(bestQuestion?.score ?? 0, keywordScore * 0.92, exactCategory);
  return { score, matchedQuestion: bestQuestion?.question };
}

export function findChatbotAnswer(query: string, source: ChatbotKnowledge = chatbotKnowledge): ChatbotMatch {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return { entry: null, answer: source.fallbackAnswer, confidence: 0, source: "fallback" };
  }

  const ranked = source.entries
    .map((entry) => ({ entry, ...scoreEntry(cleanQuery, entry) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];

  if (!best || best.score < minimumConfidence) {
    return { entry: null, answer: source.fallbackAnswer, confidence: best?.score ?? 0, source: "fallback" };
  }

  return {
    entry: best.entry,
    answer: best.entry.answer,
    confidence: Number(best.score.toFixed(3)),
    matchedQuestion: best.matchedQuestion,
    source: "knowledge",
  };
}

export function getChatbotQuickPromptAnswer(prompt: string, source: ChatbotKnowledge = chatbotKnowledge) {
  return findChatbotAnswer(prompt, source);
}
