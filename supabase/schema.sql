-- ============================================================
-- Esquema: módulo "hábitos que quiero dejar"
-- Corre esto en Supabase → SQL Editor → New query → Run
-- ============================================================

-- Un hábito que quieres dejar (ej: "dejar de fumar", "dejar de morderme las uñas")
create table if not exists bad_habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  description text,
  -- catálogo de actividades de reemplazo sugeridas para ESTE hábito
  replacement_suggestions text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Cada evento diario: o recaíste, o hiciste una actividad de reemplazo en su lugar
create table if not exists habit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  habit_id uuid not null references bad_habits(id) on delete cascade,
  event_type text not null check (event_type in ('slip', 'replacement')),
  activity text,       -- qué actividad de reemplazo hiciste (solo si event_type = 'replacement')
  note text,           -- nota libre opcional
  occurred_at timestamptz not null default now()
);

create index if not exists habit_events_habit_id_idx on habit_events(habit_id);
create index if not exists habit_events_occurred_at_idx on habit_events(occurred_at);

-- Row Level Security por usuario (Supabase Auth): cada quien solo ve y
-- puede tocar sus propias filas. `default auth.uid()` en la columna
-- user_id ya se encarga de etiquetar cada fila nueva con quien la crea —
-- el código de la app no necesita mandar user_id explícitamente.
alter table bad_habits enable row level security;
alter table habit_events enable row level security;

drop policy if exists "allow all bad_habits" on bad_habits;
create policy "own rows only" on bad_habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "allow all habit_events" on habit_events;
create policy "own rows only" on habit_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Nota: ya no se insertan hábitos de ejemplo acá — bajo RLS por usuario
-- quedarían sin dueño (nadie logueado los vería). Cada quien crea los
-- suyos desde la app con "+ Nuevo hábito".

-- ============================================================
-- Módulo 2: "trote y parque" (lo bueno de tu vida, seguimiento
-- de rutinas al aire libre)
-- ============================================================

create table if not exists activity_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  activity_type text not null check (activity_type in ('trote', 'parque')),
  session_date date not null default current_date,
  distance_km numeric,
  duration_min integer,
  perceived_effort smallint check (perceived_effort between 1 and 5),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists activity_sessions_date_idx on activity_sessions(session_date);

alter table activity_sessions enable row level security;

drop policy if exists "allow all activity_sessions" on activity_sessions;
create policy "own rows only" on activity_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Sub-módulo: ejercicios de parque (dominadas, fondos, etc)
-- El catálogo de ejercicios vive en el código (src/data/parkExercises.js),
-- aquí solo se guardan los registros de series/repeticiones/tiempo.
-- ============================================================

create table if not exists park_exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  exercise_id text not null,
  session_date date not null default current_date,
  sets integer,
  reps integer,
  hold_seconds integer,
  note text,
  created_at timestamptz not null default now()
);

-- LEGACY: esta tabla (y group_key, que se agregó para que sirviera también
-- para "casa") ya no la usa la app — el registro de ejercicios de
-- casa/parque/gimnasio se unificó en exercise_logs (ver más abajo). Se deja
-- sin tocar/borrar por si algún día se quiere consultar el historial viejo
-- directo desde Supabase.
alter table park_exercise_logs add column if not exists group_key text not null default 'parque';

create index if not exists park_exercise_logs_date_idx on park_exercise_logs(session_date);
create index if not exists park_exercise_logs_exercise_idx on park_exercise_logs(exercise_id);
create index if not exists park_exercise_logs_group_idx on park_exercise_logs(group_key);

alter table park_exercise_logs enable row level security;

drop policy if exists "allow all park_exercise_logs" on park_exercise_logs;
create policy "own rows only" on park_exercise_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Ejercicios que el usuario agrega él mismo, además del catálogo por
-- defecto que vive en el código (src/data/exerciseCatalog.js). Son
-- entorno-agnósticos: `group_key` es legacy sin usar (viene de cuando este
-- catálogo era solo para parque/casa); el entorno real se registra por
-- log, no por ejercicio (ver exercise_logs.location más abajo).
create table if not exists custom_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  group_key text,
  name text not null,
  category text,
  tracking_type text not null default 'reps' check (tracking_type in ('reps', 'time')),
  tip text,
  muscle_group text not null default 'otro',
  default_location text not null default 'casa',
  track_weight boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists custom_exercises_group_idx on custom_exercises(group_key);

alter table custom_exercises enable row level security;

drop policy if exists "allow all custom_exercises" on custom_exercises;
create policy "own rows only" on custom_exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Módulo: "Organiza tu día" (planificador de bloques de tiempo)
-- ============================================================

create table if not exists day_plan_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  plan_date date not null,
  start_time text not null,  -- formato 'HH:MM', 24 horas
  end_time text not null,
  activity text,
  category text,
  is_flexible boolean not null default false,
  flexible_label text,
  -- cumplimiento del bloque: null = sin marcar (aplica sobre todo a bloques
  -- futuros o que todavía no revisas). 'done' = tal como estaba planeado,
  -- 'done_different_time' = lo hiciste pero en otro horario, 'done_shorter'
  -- = lo hiciste pero por menos tiempo del planeado.
  status text check (status in ('done', 'done_different_time', 'done_shorter')),
  created_at timestamptz not null default now()
);

-- Ya tenías esta tabla creada sin la columna status — este add column la
-- suma sin tocar los bloques que ya guardaste (quedan con status = null).
alter table day_plan_blocks add column if not exists status text check (status in ('done', 'done_different_time', 'done_shorter'));

create index if not exists day_plan_blocks_date_idx on day_plan_blocks(plan_date);

alter table day_plan_blocks enable row level security;

drop policy if exists "allow all day_plan_blocks" on day_plan_blocks;
create policy "own rows only" on day_plan_blocks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Módulo: hábitos positivos (los que quieres construir)
-- Mismo espíritu que bad_habits/habit_events, pero sin el concepto de
-- "recaída" — cada evento es simplemente "hoy sí lo hice".
-- ============================================================

create table if not exists good_habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists good_habit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  habit_id uuid not null references good_habits(id) on delete cascade,
  note text,
  occurred_at timestamptz not null default now()
);

create index if not exists good_habit_events_habit_id_idx on good_habit_events(habit_id);

alter table good_habits enable row level security;
alter table good_habit_events enable row level security;

drop policy if exists "allow all good_habits" on good_habits;
create policy "own rows only" on good_habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "allow all good_habit_events" on good_habit_events;
create policy "own rows only" on good_habit_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Nota: ya no se insertan hábitos de ejemplo acá — bajo RLS por usuario
-- quedarían sin dueño (nadie logueado los vería). Cada quien crea los
-- suyos desde la app con "+ Nuevo hábito".

-- ============================================================
-- Módulo: gimnasio (rutinas de pesas) — LEGACY, ver nota abajo.
-- Una rutina es una plantilla con una lista de ejercicios (guardada como
-- jsonb para no complicar el esquema con otra tabla). Cada sesión registrada
-- queda como una fila por ejercicio con series/repeticiones/peso.
--
-- LEGACY: reemplazado por exercise_routines/exercise_logs (ver más abajo),
-- que unifican casa/parque/gimnasio en un solo catálogo con series
-- individuales. Estas dos tablas se dejan sin tocar/borrar por el
-- historial ya guardado, pero la app ya no las lee ni les escribe.
-- ============================================================

create table if not exists gym_routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  -- ejemplo: [{"name": "Press banca"}, {"name": "Remo con barra"}]
  exercises jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists gym_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  session_date date not null default current_date,
  routine_id uuid references gym_routines(id) on delete set null,
  routine_name text,     -- copia del nombre por si luego borras la rutina
  exercise_name text not null,
  sets integer,
  reps integer,
  weight_kg numeric,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists gym_logs_date_idx on gym_logs(session_date);

alter table gym_routines enable row level security;
alter table gym_logs enable row level security;

drop policy if exists "allow all gym_routines" on gym_routines;
create policy "own rows only" on gym_routines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "allow all gym_logs" on gym_logs;
create policy "own rows only" on gym_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Nota: ya no se insertan rutinas de ejemplo acá por la misma razón —
-- quedarían sin dueño bajo RLS. Créalas desde la app con "+ Nueva rutina".

-- ============================================================
-- Módulo: ejercicios unificados (casa / parque / gimnasio)
-- Un solo catálogo (src/data/exerciseCatalog.js + custom_exercises de
-- arriba) para los tres entornos. El entorno ("dónde lo hice") vive en
-- CADA registro (location), no en el ejercicio ni en la rutina — así el
-- mismo ejercicio puede registrarse en casa un día y en el gym otro.
-- `sets` guarda una entrada por serie individual (reps/segundos/peso),
-- en vez del viejo par agregado "sets: 3, reps: 10".
-- ============================================================

create table if not exists exercise_routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  location text,
  exercise_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  exercise_id text not null,
  session_date date not null default current_date,
  location text not null,
  routine_id uuid references exercise_routines(id) on delete set null,
  routine_name text,
  -- ejemplo: [{"reps": 8, "weight_kg": 50}, {"reps": 7, "weight_kg": 50}]
  sets jsonb not null default '[]',
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

-- ============================================================
-- Módulo: peso corporal (Change Request #1 — dashboard diario).
-- Un registro por día; la app hace upsert, el más reciente es el
-- "peso actual" del dashboard. Ver supabase/migrations/2026-11-16-body-weight-logs.sql
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
