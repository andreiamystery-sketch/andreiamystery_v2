# Checkout e encomendas

O checkout valida nome e telefone, aceita email opcional e recalcula todos os preços no servidor a partir do catálogo publicado. O browser envia apenas os identificadores estáveis e as quantidades.

## Configuração do Supabase

Execute `supabase/orders.sql` no SQL Editor do projeto Supabase antes de disponibilizar o checkout. O script cria a tabela `orders` com:

- dados do cliente;
- linhas da encomenda em JSON;
- total recalculado;
- estado inicial `Pendente`;
- data de criação.

A tabela não aceita escrita direta do browser. As encomendas são inseridas exclusivamente pela Server Action através da service role.

## Notificações por email

Configure no servidor:

- `RESEND_API_KEY`: chave privada da API Resend;
- `RESEND_FROM_EMAIL`: remetente num domínio verificado, por exemplo `Andrea's Mystery <encomendas@andreasmystery.pt>`.

Após guardar a encomenda, o servidor envia automaticamente um resumo para `andreiamystery@gmail.com`. A chamada usa uma chave de idempotência baseada no número da encomenda. Se o serviço de email estiver indisponível, a encomenda não é perdida: o erro fica registado em `notification_error` para consulta no admin.

O WhatsApp não faz parte da finalização. Está disponível apenas no Admin → Encomendas como ação manual para contactar o cliente.
