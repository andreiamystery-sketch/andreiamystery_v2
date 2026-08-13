-- Traduções completas de produtos e categorias.
-- Idempotente, preserva dados existentes e expande a tabela já usada pelo projeto.

alter table public.product_translations
  add column if not exists short_description text null,
  add column if not exists category_name text null,
  add column if not exists materials text[] not null default '{}',
  add column if not exists details text[] not null default '{}',
  add column if not exists availability text null,
  add column if not exists seo_title text null,
  add column if not exists seo_description text null;

update public.product_translations
set
  short_description = coalesce(short_description, description),
  seo_title = coalesce(seo_title, name),
  seo_description = coalesce(seo_description, short_description, description),
  updated_at = now()
where short_description is null
   or seo_title is null
   or seo_description is null;

create index if not exists product_translations_product_id_idx on public.product_translations (product_id);
create index if not exists product_translations_locale_idx on public.product_translations (locale);

create table if not exists public.category_translations (
  id bigint generated always as identity primary key,
  category_id text not null,
  locale text not null,
  name text not null,
  description text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid null references auth.users(id),
  constraint category_translations_category_locale_unique unique (category_id, locale),
  constraint category_translations_locale_check check (locale in ('pt-PT', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'zh-CN'))
);

create index if not exists category_translations_category_id_idx on public.category_translations (category_id);
create index if not exists category_translations_locale_idx on public.category_translations (locale);

alter table public.category_translations enable row level security;

drop policy if exists "Public can read category translations" on public.category_translations;
create policy "Public can read category translations" on public.category_translations for select using (true);

drop policy if exists "Admins can insert category translations" on public.category_translations;
create policy "Admins can insert category translations" on public.category_translations for insert to authenticated
  with check (public.is_admin() and (updated_by = auth.uid() or updated_by is null));

drop policy if exists "Admins can update category translations" on public.category_translations;
create policy "Admins can update category translations" on public.category_translations for update to authenticated
  using (public.is_admin()) with check (public.is_admin() and (updated_by = auth.uid() or updated_by is null));

revoke delete on public.category_translations from anon, authenticated;

insert into public.category_translations (category_id, locale, name, description, updated_at)
values
  ('Todos', 'pt-PT', 'Ver tudo', 'Seleção completa Andrea''s Mystery.', now()),
  ('Todos', 'en-GB', 'View all', 'The complete Andrea''s Mystery selection.', now()),
  ('Todos', 'es-ES', 'Ver todo', 'La selección completa de Andrea''s Mystery.', now()),
  ('Todos', 'fr-FR', 'Tout voir', 'La sélection complète Andrea''s Mystery.', now()),
  ('Todos', 'de-DE', 'Alle ansehen', 'Die komplette Auswahl von Andrea''s Mystery.', now()),
  ('Todos', 'zh-CN', '查看全部', 'Andrea''s Mystery 完整系列。', now()),
  ('Anéis', 'pt-PT', 'Anéis', 'Alianças delicadas, cristais e linhas minimalistas.', now()),
  ('Anéis', 'en-GB', 'Rings', 'Delicate bands, crystals and minimalist lines.', now()),
  ('Anéis', 'es-ES', 'Anillos', 'Aros delicados, cristales y líneas minimalistas.', now()),
  ('Anéis', 'fr-FR', 'Bagues', 'Anneaux délicats, cristaux et lignes minimalistes.', now()),
  ('Anéis', 'de-DE', 'Ringe', 'Zarte Ringe, Kristalle und minimalistische Linien.', now()),
  ('Anéis', 'zh-CN', '戒指', '精致戒圈、水晶与极简线条。', now()),
  ('Brincos', 'pt-PT', 'Brincos', 'Luz junto ao rosto, com zircónias e pérolas.', now()),
  ('Brincos', 'en-GB', 'Earrings', 'Light close to the face, with zirconia and pearls.', now()),
  ('Brincos', 'es-ES', 'Pendientes', 'Luz junto al rostro, con circonitas y perlas.', now()),
  ('Brincos', 'fr-FR', 'Boucles d''oreilles', 'De la lumière près du visage, avec zircons et perles.', now()),
  ('Brincos', 'de-DE', 'Ohrringe', 'Licht am Gesicht, mit Zirkonia und Perlen.', now()),
  ('Brincos', 'zh-CN', '耳环', '贴近面庞的光泽，点缀锆石与珍珠。', now()),
  ('Colares', 'pt-PT', 'Colares', 'Pontos de brilho para decotes limpos.', now()),
  ('Colares', 'en-GB', 'Necklaces', 'Points of shine for clean necklines.', now()),
  ('Colares', 'es-ES', 'Collares', 'Puntos de brillo para escotes limpios.', now()),
  ('Colares', 'fr-FR', 'Colliers', 'Des points d''éclat pour les décolletés épurés.', now()),
  ('Colares', 'de-DE', 'Halsketten', 'Glanzpunkte für klare Ausschnitte.', now()),
  ('Colares', 'zh-CN', '项链', '为简洁领口增添亮点。', now()),
  ('Pulseiras', 'pt-PT', 'Pulseiras', 'Detalhes dourados para gestos elegantes.', now()),
  ('Pulseiras', 'en-GB', 'Bracelets', 'Golden details for elegant gestures.', now()),
  ('Pulseiras', 'es-ES', 'Pulseras', 'Detalles dorados para gestos elegantes.', now()),
  ('Pulseiras', 'fr-FR', 'Bracelets', 'Des détails dorés pour des gestes élégants.', now()),
  ('Pulseiras', 'de-DE', 'Armbänder', 'Goldene Details für elegante Gesten.', now()),
  ('Pulseiras', 'zh-CN', '手链', '为举手投足加入金色细节。', now())
on conflict (category_id, locale) do update set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();
