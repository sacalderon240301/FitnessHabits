-- ============================================================
-- Migración: separar los datos por usuario (Supabase Auth + RLS).
--
-- IMPORTANTE: corre esto en 3 pasos SEPARADOS, en este orden exacto,
-- no lo pegues todo de una vez. El paso 2 necesita tu user id, que
-- solo existe después de registrarte desde la app.
-- ============================================================

-- ------------------------------------------------------------
-- PASO 1 — correr AHORA, antes de registrarte.
-- Agrega la columna user_id a las 10 tablas. `default auth.uid()` hace
-- que todo lo que guardes DESPUÉS de loguearte quede etiquetado con tu
-- cuenta automáticamente, sin tocar ningún código de la app. Todavía no
-- cambia quién puede ver qué (eso es el paso 3) — es 100% seguro de
-- correr ya, no rompe nada de lo que tienes funcionando hoy.
-- ------------------------------------------------------------

alter table bad_habits add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table habit_events add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table activity_sessions add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table park_exercise_logs add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table custom_exercises add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table day_plan_blocks add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table good_habits add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table good_habit_events add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table gym_routines add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table gym_logs add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- ------------------------------------------------------------
-- PASO 2 — correr DESPUÉS de crear tu cuenta desde la app (pantalla de
-- login → "Crear cuenta"). Busca tu user id en Supabase → Authentication
-- → Users (columna "UID", se ve como 8f9a1c2e-...). Reemplaza
-- 'TU-USER-ID-AQUI' por ese valor en las 10 líneas de abajo y corre esto.
--
-- Esto "adopta" todo lo que ya tenías guardado hacia tu cuenta nueva —
-- si te saltas este paso, esos datos quedan invisibles en el paso 3
-- (no se borran, solo dejan de aparecer porque no tienen dueño).
-- ------------------------------------------------------------

update bad_habits set user_id = 'TU-USER-ID-AQUI' where user_id is null;
update habit_events set user_id = 'TU-USER-ID-AQUI' where user_id is null;
update activity_sessions set user_id = 'TU-USER-ID-AQUI' where user_id is null;
update park_exercise_logs set user_id = 'TU-USER-ID-AQUI' where user_id is null;
update custom_exercises set user_id = 'TU-USER-ID-AQUI' where user_id is null;
update day_plan_blocks set user_id = 'TU-USER-ID-AQUI' where user_id is null;
update good_habits set user_id = 'TU-USER-ID-AQUI' where user_id is null;
update good_habit_events set user_id = 'TU-USER-ID-AQUI' where user_id is null;
update gym_routines set user_id = 'TU-USER-ID-AQUI' where user_id is null;
update gym_logs set user_id = 'TU-USER-ID-AQUI' where user_id is null;

-- ------------------------------------------------------------
-- PASO 3 — correr AL FINAL, después de confirmar (recarga la app) que
-- sigues viendo todos tus datos con tu cuenta ya logueada. Esto es lo
-- que realmente bloquea el acceso: reemplaza las políticas "cualquiera
-- puede todo" por "solo el dueño de la fila". A partir de aquí, cada
-- persona que se registre ve una app completamente vacía y solo la suya.
-- ------------------------------------------------------------

drop policy if exists "allow all bad_habits" on bad_habits;
create policy "own rows only" on bad_habits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "allow all habit_events" on habit_events;
create policy "own rows only" on habit_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "allow all activity_sessions" on activity_sessions;
create policy "own rows only" on activity_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "allow all park_exercise_logs" on park_exercise_logs;
create policy "own rows only" on park_exercise_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "allow all custom_exercises" on custom_exercises;
create policy "own rows only" on custom_exercises for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "allow all day_plan_blocks" on day_plan_blocks;
create policy "own rows only" on day_plan_blocks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "allow all good_habits" on good_habits;
create policy "own rows only" on good_habits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "allow all good_habit_events" on good_habit_events;
create policy "own rows only" on good_habit_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "allow all gym_routines" on gym_routines;
create policy "own rows only" on gym_routines for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "allow all gym_logs" on gym_logs;
create policy "own rows only" on gym_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
