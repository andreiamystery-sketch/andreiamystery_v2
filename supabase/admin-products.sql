create table if not exists public.product_visibility (
  product_id text primary key,
  is_visible boolean not null,
  is_best_seller boolean not null default false,
  is_new_arrival boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid null references auth.users(id)
);

alter table public.product_visibility
  add column if not exists is_best_seller boolean not null default false,
  add column if not exists is_new_arrival boolean not null default false;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  admin_user_id uuid references auth.users(id),
  action text not null,
  product_ids text[] not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_log
  drop constraint if exists admin_audit_log_action_check;
alter table public.admin_audit_log
  add constraint admin_audit_log_action_check check (action in (
    'publish','hide','publish_filtered','hide_filtered',
    'best_seller_add','best_seller_remove',
    'best_seller_add_filtered','best_seller_remove_filtered',
    'new_arrival_add','new_arrival_remove',
    'new_arrival_add_filtered','new_arrival_remove_filtered'
  ));

alter table public.product_visibility enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_audit_log enable row level security;

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean language sql stable security definer
set search_path = public
as $$
  select exists(select 1 from public.admin_users where user_id = check_user_id);
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

drop policy if exists "Public can read visibility" on public.product_visibility;
create policy "Public can read visibility" on public.product_visibility for select using (true);
drop policy if exists "Admins can insert visibility" on public.product_visibility;
create policy "Admins can insert visibility" on public.product_visibility for insert to authenticated
  with check (public.is_admin() and updated_by = auth.uid());
drop policy if exists "Admins can update visibility" on public.product_visibility;
create policy "Admins can update visibility" on public.product_visibility for update to authenticated
  using (public.is_admin()) with check (public.is_admin() and updated_by = auth.uid());

drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users" on public.admin_users for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read audit" on public.admin_audit_log;
create policy "Admins can read audit" on public.admin_audit_log for select to authenticated
  using (public.is_admin());
drop policy if exists "Admins can insert audit" on public.admin_audit_log;
create policy "Admins can insert audit" on public.admin_audit_log for insert to authenticated
  with check (public.is_admin() and admin_user_id = auth.uid());

revoke insert, update, delete on public.admin_users from anon, authenticated;
revoke update, delete on public.admin_audit_log from anon, authenticated;

-- Depois de criar o utilizador em Authentication > Users:
-- insert into public.admin_users (user_id, email)
-- select id, email from auth.users where lower(email) = lower('admin@exemplo.pt');
