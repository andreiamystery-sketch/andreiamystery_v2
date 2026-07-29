# 09 - Security

Regras atuais:

- `.env.local` não deve ser versionado nem exposto;
- `SUPABASE_SERVICE_ROLE_KEY` só no servidor;
- admin protegido por Supabase Auth e `admin_users`;
- checkout recalcula preços e totais no servidor;
- público não deve listar, ler ou alterar encomendas.

Pendente recomendado:

- rate limiting no checkout/login;
- revisão completa de RLS em produção;
- cabeçalhos adicionais de segurança conforme deployment.
