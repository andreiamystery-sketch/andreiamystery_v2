-- Traduções editoriais de produtos para arquitetura multilingue escalável.
-- Idempotente, sem apagar campos/tabelas anteriores e sem tradução automática.

create table if not exists public.product_translations (
  id bigint generated always as identity primary key,
  product_id text not null,
  locale text not null,
  name text null,
  description text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid null references auth.users(id),
  constraint product_translations_product_locale_unique unique (product_id, locale),
  constraint product_translations_locale_check check (locale in ('pt-PT', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'zh-CN'))
);

alter table public.product_translations
  add column if not exists id bigint generated always as identity,
  add column if not exists locale text,
  add column if not exists name text null,
  add column if not exists description text null,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists updated_by uuid null references auth.users(id);

-- Compatibilidade com a versão anterior baseada em colunas por idioma, se tiver sido aplicada.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'product_translations' and column_name = 'name_pt'
  ) then
    execute $legacy$
      insert into public.product_translations (product_id, locale, name, description, updated_at, updated_by)
      select product_id, locale, name, description, now(), updated_by
      from (
        select product_id, 'pt-PT' as locale, name_pt as name, description_pt as description, updated_by from public.product_translations where name_pt is not null or description_pt is not null
        union all select product_id, 'en-GB', name_en, description_en, updated_by from public.product_translations where name_en is not null or description_en is not null
        union all select product_id, 'es-ES', name_es, description_es, updated_by from public.product_translations where name_es is not null or description_es is not null
        union all select product_id, 'fr-FR', name_fr, description_fr, updated_by from public.product_translations where name_fr is not null or description_fr is not null
      ) legacy
      where name is not null or description is not null
      on conflict (product_id, locale) do update set
        name = coalesce(excluded.name, public.product_translations.name),
        description = coalesce(excluded.description, public.product_translations.description),
        updated_at = now()
    $legacy$;
  end if;
end $$;
alter table public.product_translations drop constraint if exists product_translations_locale_check;
alter table public.product_translations add constraint product_translations_locale_check check (locale in ('pt-PT', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'zh-CN'));

create unique index if not exists product_translations_product_locale_idx on public.product_translations (product_id, locale);

alter table public.product_translations enable row level security;

drop policy if exists "Public can read product translations" on public.product_translations;
create policy "Public can read product translations" on public.product_translations for select using (true);

drop policy if exists "Admins can insert product translations" on public.product_translations;
create policy "Admins can insert product translations" on public.product_translations for insert to authenticated
  with check (public.is_admin() and updated_by = auth.uid());

drop policy if exists "Admins can update product translations" on public.product_translations;
create policy "Admins can update product translations" on public.product_translations for update to authenticated
  using (public.is_admin()) with check (public.is_admin() and updated_by = auth.uid());

revoke delete on public.product_translations from anon, authenticated;

