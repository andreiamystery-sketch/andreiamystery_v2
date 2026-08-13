# Chatbot Andrea's Mystery

O chatbot usa a rota `app/api/chat/route.ts`, com Groq como motor de interpretação, e `data/chatbot/knowledge.json` como base de conhecimento autorizada.

## Onde alterar respostas

Editar `data/chatbot/knowledge.json`.

Cada entrada mantém uma estrutura simples:

- `category`: área do atendimento;
- `questions`: perguntas e variações que os clientes podem escrever;
- `keywords`: palavras usadas pela correspondência local e testes;
- `answer`: resposta autorizada para essa categoria.

## Onde adicionar perguntas

Adicionar novas variações em `questions` e palavras relevantes em `keywords`.

Não colocar respostas diretamente em `components/chatbot/chatbot-widget.tsx`; o componente deve apenas mostrar a conversa.

## Como ativar ou desativar

Em `data/chatbot/knowledge.json`, alterar:

```json
"enabled": true
```

Para ocultar temporariamente o chatbot sem apagar código:

```json
"enabled": false
```

## API

A API está em `app/api/chat/route.ts`.

Ela envia a pergunta para Groq com instruções rígidas para responder apenas com informação confirmada no `knowledge.json`. Se a API falhar, se a chave `GROQ_API_KEY` não existir ou se não houver informação suficiente, o cliente recebe a resposta de fallback sem detalhes técnicos.

## Regras de segurança

Não acrescentar no `knowledge.json` informação que não esteja confirmada.

O chatbot não deve inventar:

- preços;
- descontos;
- promoções;
- portes;
- prazos;
- disponibilidade;
- composição de uma peça específica;
- resistência, banho, impermeabilidade ou garantias;
- políticas ou condições comerciais.

## Como trocar o modelo futuramente

Para alterar o modelo de IA, editar apenas `app/api/chat/route.ts`, no campo `model` do pedido à Groq.

A interface e a base de conhecimento não precisam de ser reconstruídas.

## Testes

O teste local da base de conhecimento está em `scripts/test-chatbot-knowledge.mjs`.

Executar:

```bash
node scripts/test-chatbot-knowledge.mjs
```

Depois validar o projeto:

```bash
npm run lint
npm run typecheck
npm run build
```
