# Administração de produtos

## Configuração

1. Crie um projeto em [Supabase](https://supabase.com/dashboard) e aguarde pela preparação da base de dados.
2. Abra **SQL Editor**, cole o conteúdo de `supabase/admin-products.sql` e execute-o.
3. Em **Authentication > Users**, crie manualmente o utilizador administrador com email e password. O site não permite registo.
4. No SQL Editor, execute:

   ```sql
   insert into public.admin_users (user_id, email)
   select id, email from auth.users where lower(email) = lower('email-do-admin@exemplo.pt');
   ```

5. Copie `.env.example` para `.env.local` e preencha os quatro valores. A service role existe em **Project Settings > API** e nunca deve ser exposta no browser.
6. Na Vercel, abra **Project Settings > Environment Variables**, adicione os mesmos valores a Production/Preview e faça um redeploy.
7. Entre em `/admin/login`. Só utilizadores presentes em `admin_users` têm acesso.

## Recuperar ou alterar acesso

Para recuperar a password, use **Authentication > Users** no Supabase e envie uma recuperação ou defina uma nova password. Para trocar o administrador, crie primeiro o novo utilizador, insira-o em `admin_users`, atualize `ADMIN_EMAIL` e só depois remova o anterior:

```sql
delete from public.admin_users where email = 'email-antigo@exemplo.pt';
```

`ADMIN_EMAIL` documenta e valida o único email inicialmente autorizado; a autorização efetiva nunca confia no browser e é sempre determinada pelo UUID existente em `admin_users`.

## Persistência

As decisões de visibilidade, Best Seller e Novo ficam em `product_visibility` e a auditoria em `admin_audit_log`, ambas no Supabase. Por isso sobrevivem a builds e novos deploys. O catálogo local continua a ser o fallback para produtos sem override.

Se as tabelas já existirem, volte a executar `supabase/admin-products.sql`. Os comandos acrescentam as colunas em falta e atualizam as ações permitidas no registo de auditoria.

## Segurança e operação

- Não use a service role em componentes client nem lhe dê prefixo `NEXT_PUBLIC_`.
- O layout privado e cada server action voltam a validar sessão e pertença a `admin_users`.
- O SQL ativa RLS nas três tabelas e impede auto-promoção.
- Operações são validadas, limitadas a 1000 IDs e divididas em lotes de 100.
- O preço público já calculado é apresentado; `supplierPrice` nunca entra no DTO do browser.
- A regra Grupo Belle ×3 em `data/store-settings.ts` e nos dados importados permanece inalterada.
