export type ChatbotKnowledgeEntry = {
  id: string;
  category: string;
  questions: string[];
  keywords: string[];
  answer: string;
};

export type ChatbotKnowledge = {
  version: number;
  enabled: boolean;
  brandName: string;
  welcomeMessage: string;
  fallbackAnswer: string;
  humanAnswer: string;
  contact: {
    whatsappLabel: string;
    whatsappNumber: string;
    whatsappHref: string;
    email: string;
    instagram: string;
  };
  quickPrompts: string[];
  entries: ChatbotKnowledgeEntry[];
};

export type ChatbotMatch = {
  entry: ChatbotKnowledgeEntry | null;
  answer: string;
  confidence: number;
  matchedQuestion?: string;
  source: "knowledge" | "fallback";
};
