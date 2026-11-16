-- ============================================================
-- Migración: peso corporal (Change Request #1 — dashboard diario).
--
-- Un registro por día (índice único user_id+logged_date); la app hace
-- upsert cuando actualizas el peso del día, así que nunca hay más de
-- una fila por día por usuario. El más reciente es el "peso actual"
-- que se muestra en el dashboard.
--
-- Corre este archivo completo de una sola vez en Supabase → SQL Editor.
-- ============================================================

create table if not exists body_weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  logged_date date not null default current_date,
  weight_kg numeric not null,
  created_at timestamptz not null default now()
);

create unique index if not exists body_weight_logs_user_date_idx on body_weight_logs(user_id, logged_date);

alter table body_weight_logs enable row level security;

drop policy if exists "own rows only" on body_weight_logs;
create policy "own rows only" on body_weight_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
