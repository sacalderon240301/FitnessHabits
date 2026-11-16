-- ============================================================
-- Migración: foto en CUALQUIER ejercicio, no solo al crear uno nuevo.
--
-- 2026-11-16-exercise-photos.sql solo dejaba poner foto a los
-- ejercicios que TÚ creas (custom_exercises tiene su propia columna
-- photo_url). Pero el catálogo base (src/data/exerciseCatalog.js) es
-- un archivo estático, no una tabla — no se le puede agregar una
-- columna. Esta tabla es un "overlay" aparte: una foto tuya para
-- CUALQUIER id de ejercicio, base o propio, sin tocar el catálogo.
--
-- Corre este archivo completo de una sola vez en Supabase → SQL Editor.
-- ============================================================

create table if not exists exercise_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  exercise_id text not null,
  photo_url text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists exercise_photos_user_exercise_idx on exercise_photos(user_id, exercise_id);

alter table exercise_photos enable row level security;

drop policy if exists "own rows only" on exercise_photos;
create policy "own rows only" on exercise_photos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
