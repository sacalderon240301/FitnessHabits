-- ============================================================
-- Migración: grupos de gimnasio (Change Request #6).
--
-- Los hábitos siguen siendo personales — esto es solo para el progreso
-- de gym: grupos de máximo 4 integrantes, unión por código, check-in
-- diario con foto + si tomaste agua, visible para todo el grupo.
--
-- Por qué una tabla de perfiles: el cliente no puede leer auth.users
-- directamente (Supabase no lo expone), así que necesitamos un nombre
-- para mostrar a cada integrante. El trigger llena profiles para cuentas
-- nuevas; el insert de más abajo rellena las que ya existían.
--
-- Importante: todas las TABLAS se crean primero, y las POLÍTICAS después
-- — algunas políticas de "profiles" hacen referencia a gym_group_members,
-- así que esa tabla tiene que existir antes de crear esas políticas.
--
-- Corre este archivo completo de una sola vez en Supabase → SQL Editor.
-- ============================================================

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists gym_groups (
  id uuid primary key default gen_random_uuid(),
  code text unique not null default upper(substr(md5(random()::text), 1, 6)),
  name text not null,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  max_members int not null default 4,
  created_at timestamptz not null default now()
);

create table if not exists gym_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references gym_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table if not exists gym_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  checkin_date date not null default current_date,
  photo_url text,
  drank_water boolean not null default false,
  note text,
  created_at timestamptz not null default now()
);

create unique index if not exists gym_checkins_user_date_idx on gym_checkins(user_id, checkin_date);

-- ============================================================
-- Funciones `security definer`: una política de RLS que consulta la
-- MISMA tabla que protege (o una tabla que a su vez consulta esa misma
-- tabla) hace que Postgres entre en bucle ("infinite recursion detected
-- in policy..."). Estas funciones leen gym_group_members con permiso
-- para saltarse esa propia política, cortando el ciclo.
-- ============================================================

create or replace function is_group_member(p_group_id uuid, p_user_id uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from gym_group_members
    where group_id = p_group_id and user_id = p_user_id
  );
$$;

create or replace function shares_group_with(p_other_user uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from gym_group_members gm1
    join gym_group_members gm2 on gm1.group_id = gm2.group_id
    where gm1.user_id = auth.uid() and gm2.user_id = p_other_user
  );
$$;

-- ============================================================
-- Perfiles: políticas + trigger que llena el nombre al crear la cuenta.
-- ============================================================

alter table profiles enable row level security;

drop policy if exists "profiles viewable by self and groupmates" on profiles;
create policy "profiles viewable by self and groupmates" on profiles
  for select using (user_id = auth.uid() or shares_group_with(user_id));

drop policy if exists "users update own profile" on profiles;
create policy "users update own profile" on profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "users insert own profile" on profiles;
create policy "users insert own profile" on profiles
  for insert with check (user_id = auth.uid());

-- Backfill de cuentas que ya existían antes de este trigger.
insert into profiles (user_id, display_name)
select id, split_part(email, '@', 1) from auth.users
on conflict (user_id) do nothing;

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Grupos: cualquier usuario logueado puede BUSCAR uno por código para
-- unirse (el código es la "contraseña" — igual que un invite link de
-- Discord), pero solo quien lo creó puede editarlo/borrarlo.
-- ============================================================

alter table gym_groups enable row level security;

drop policy if exists "authenticated can read groups" on gym_groups;
create policy "authenticated can read groups" on gym_groups
  for select to authenticated using (true);

drop policy if exists "creator manages group" on gym_groups;
create policy "creator manages group" on gym_groups
  for all using (created_by = auth.uid()) with check (created_by = auth.uid());

drop policy if exists "authenticated can create group" on gym_groups;
create policy "authenticated can create group" on gym_groups
  for insert to authenticated with check (created_by = auth.uid());

-- ============================================================
-- Membresías: ves y te unes/sales tú mismo; el tope de integrantes se
-- refuerza en el servidor con un trigger (no solo en la app) para que
-- no se pueda esquivar con dos joins al mismo tiempo.
-- ============================================================

alter table gym_group_members enable row level security;

drop policy if exists "groupmates can view members" on gym_group_members;
create policy "groupmates can view members" on gym_group_members
  for select using (is_group_member(group_id, auth.uid()));

drop policy if exists "users join groups themselves" on gym_group_members;
create policy "users join groups themselves" on gym_group_members
  for insert with check (user_id = auth.uid());

drop policy if exists "users leave groups themselves" on gym_group_members;
create policy "users leave groups themselves" on gym_group_members
  for delete using (user_id = auth.uid());

create or replace function check_group_member_cap()
returns trigger as $$
declare
  current_count int;
  cap int;
begin
  select count(*) into current_count from gym_group_members where group_id = new.group_id;
  select max_members into cap from gym_groups where id = new.group_id;
  if current_count >= cap then
    raise exception 'Este grupo ya llegó a su máximo de % integrantes', cap;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists enforce_group_member_cap on gym_group_members;
create trigger enforce_group_member_cap
  before insert on gym_group_members
  for each row execute function check_group_member_cap();

-- ============================================================
-- Check-ins: los tuyos los manejas tú; tus compañeros de grupo solo
-- pueden VERLOS, nunca editarlos ni borrarlos.
-- ============================================================

alter table gym_checkins enable row level security;

drop policy if exists "own checkins" on gym_checkins;
create policy "own checkins" on gym_checkins
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "groupmates can view checkins" on gym_checkins;
create policy "groupmates can view checkins" on gym_checkins
  for select using (shares_group_with(user_id));

-- Bucket público de Storage para las fotos de check-in (igual criterio
-- que exercise-photos: no es información sensible).
insert into storage.buckets (id, name, public)
values ('checkin-photos', 'checkin-photos', true)
on conflict (id) do nothing;

drop policy if exists "public read checkin-photos" on storage.objects;
create policy "public read checkin-photos" on storage.objects
  for select using (bucket_id = 'checkin-photos');

drop policy if exists "owner manage checkin-photos" on storage.objects;
create policy "owner manage checkin-photos" on storage.objects
  for all to authenticated
  using (bucket_id = 'checkin-photos' and owner = auth.uid())
  with check (bucket_id = 'checkin-photos' and owner = auth.uid());
