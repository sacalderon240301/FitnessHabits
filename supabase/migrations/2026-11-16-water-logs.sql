-- ============================================================
-- Migración: agua diaria (Change Request #5).
--
-- Un registro por día con el total de vasos de hoy (250 ml cada uno).
-- La app hace upsert cada vez que tocas una botella o agregas manual,
-- así que nunca hay más de una fila por día por usuario. La racha se
-- calcula en el cliente a partir de qué días cumplieron la meta.
--
-- Corre este archivo completo de una sola vez en Supabase → SQL Editor.
-- ============================================================

create table if not exists water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  logged_date date not null default current_date,
  glasses int not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists water_logs_user_date_idx on water_logs(user_id, logged_date);

alter table water_logs enable row level security;

drop policy if exists "own rows only" on water_logs;
create policy "own rows only" on water_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
