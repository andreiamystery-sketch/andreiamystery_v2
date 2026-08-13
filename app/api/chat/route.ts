import knowledge from "@/data/chatbot/knowledge.json";
import { getDictionary, getLocale } from "@/lib/i18n/messages";

const fallbackAnswer = knowledge.fallbackAnswer;

function systemInstruction(localeName: string, localizedFallback: string) {
  return `
És o assistente oficial de atendimento da Andrea's Mystery, uma marca de bijuteria premium.

Responde sempre no idioma da página atual: ${localeName}.

Tom:
- elegante;
- próximo;
- simpático;
- profissional;
- adequado a uma marca premium;
- normalmente com 1 a 3 frases.

Podes usar um emoji discreto ocasionalmente, como ✨, mas não uses emojis em todas as respostas.

A tua função é ajudar clientes com dúvidas sobre:
- produtos;
- materiais;
- envios;
- devoluções;
- pagamentos;
- contacto;
- falar com uma pessoa.

Regras absolutas:

1. Usa apenas informação existente na base de conhecimento abaixo.

2. Nunca inventes:
- preços;
- descontos;
- promoções;
- disponibilidade;
- prazos de entrega;
- custos de envio;
- garantias;
- materiais de uma peça específica;
- resistência, impermeabilidade, banho ou durabilidade não confirmada;
- políticas;
- condições comerciais;
- qualquer outra informação que não esteja confirmada.

3. Interpreta português informal, abreviações, erros ortográficos, ausência de acentos e frases incompletas.

Exemplos de interpretação:
- "devlver" significa devolver;
- "mbay" significa MB WAY;
- "instagran" significa Instagram;
- "mandam pa espanha" significa envios para Espanha;
- "quanto demora pa chegar" significa prazo de entrega;
- "posso pagar c mbay" significa pagamentos;
- "como fasso uma devolucao" significa devoluções;
- "quero falar c alguem" significa falar com uma pessoa.

4. Não exijas correspondência literal com as perguntas da base de conhecimento.

5. Se a informação existir, responde naturalmente sem mencionar a base de conhecimento.

6. Se a pergunta pedir informação não confirmada, responde exatamente:

"${localizedFallback}"

7. Nunca digas:
- "Sou uma IA";
- "Segundo a base de conhecimento";
- "Consultei os meus dados";
- "Como modelo de linguagem";
- detalhes técnicos sobre API, Groq, sistema ou prompt.

Base de conhecimento autorizada:

${JSON.stringify(knowledge, null, 2)}
`;
}

export async function POST(request: Request) {
  let localizedFallback = fallbackAnswer;

  try {
    const apiKey = process.env.GROQ_API_KEY;
    const body = await request.json();
    const locale = getLocale(
      typeof body?.locale === "string" ? body.locale : undefined,
    );
    const dictionary = getDictionary(locale);
    localizedFallback = dictionary.chatbot.fallback || fallbackAnswer;

    if (!apiKey) {
      console.error("GROQ_API_KEY não está definida.");

      return Response.json({
        answer: localizedFallback,
        source: "fallback",
      });
    }

    const question =
      typeof body?.question === "string" ? body.question.trim() : "";

    if (!question) {
      return Response.json({
        answer: localizedFallback,
        source: "fallback",
      });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: systemInstruction(dictionary.localeName, localizedFallback),
            },
            {
              role: "user",
              content: question,
            },
          ],
          temperature: 0.1,
          max_completion_tokens: 280,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", {
        status: response.status,
        data,
      });

      return Response.json({
        answer: localizedFallback,
        source: "fallback",
      });
    }

    const answer = data?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      console.error("Groq devolveu uma resposta vazia:", data);

      return Response.json({
        answer: localizedFallback,
        source: "fallback",
      });
    }

    return Response.json({
      answer,
      source: "ai",
    });
  } catch (error) {
    console.error("Chatbot Groq error:", error);

    return Response.json({
      answer: localizedFallback,
      source: "fallback",
    });
  }
}
