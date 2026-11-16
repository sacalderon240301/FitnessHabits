-- ============================================================
-- Migración: unificar ejercicios de casa/parque/gimnasio.
--
-- Reemplaza el modelo viejo (park_exercise_logs con sets/reps agregados,
-- gym_routines/gym_logs con exercise_name en texto libre) por un catálogo
-- único (src/data/exerciseCatalog.js) + un log con series individuales.
--
-- Las tablas viejas (park_exercise_logs, gym_routines, gym_logs) NO se
-- tocan ni se borran — la app deja de leerlas/escribirlas, pero el
-- historial sigue ahí por si algún día quieres consultarlo directo desde
-- Supabase. El tracking nuevo por serie arranca limpio desde hoy.
--
-- Corre este archivo completo de una sola vez en Supabase → SQL Editor.
-- ============================================================

create table if not exists exercise_routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  location text,                      -- sugerencia de entorno para la rutina, opcional
  exercise_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  exercise_id text not null,
  session_date date not null default current_date,
  location text not null,             -- 'casa' | 'parque' | 'gimnasio' | texto libre
  routine_id uuid references exercise_routines(id) on delete set null,
  routine_name text,                  -- copia por si luego se borra la rutina
  sets jsonb not null default '[]',   -- [{reps, seconds, weight_kg}, ...] una entrada por serie
  note text,
  created_at timestamptz not null default now()
);

create index if not exists exercise_logs_date_idx on exercise_logs(session_date);
create index if not exists exercise_logs_exercise_idx on exercise_logs(exercise_id);

alter table exercise_routines enable row level security;
alter table exercise_logs enable row level security;

drop policy if exists "own rows only" on exercise_routines;
create policy "own rows only" on exercise_routines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows only" on exercise_logs;
create policy "own rows only" on exercise_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Ejercicios personalizados: ahora son entorno-agnósticos (el entorno vive
-- en el log, no en el ejercicio), así que suman grupo muscular, entorno
-- sugerido y si registran peso por serie. `group_key` queda como columna
-- legacy sin usar (se libera el NOT NULL para no romper inserts nuevos).
alter table custom_exercises add column if not exists muscle_group text not null default 'otro';
alter table custom_exercises add column if not exists default_location text not null default 'casa';
alter table custom_exercises add column if not exists track_weight boolean not null default false;
alter table custom_exercises alter column group_key drop not null;
