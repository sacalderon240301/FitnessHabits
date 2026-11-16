-- ============================================================
-- Fix: "infinite recursion detected in policy for relation
-- gym_group_members".
--
-- La política de gym_group_members se consultaba A SÍ MISMA dentro de
-- su propia condición (para saber si sos parte del grupo, miraba la
-- tabla que tiene esa misma regla puesta) — Postgres entra en bucle.
-- Lo mismo aplicaba, indirecto, a profiles/gym_checkins/gym_equivalences/
-- gym_challenge_progress, que también leen gym_group_members por dentro.
--
-- La solución estándar: funciones `security definer` — se ejecutan con
-- permiso para leer la tabla SIN pasar de nuevo por su propia política,
-- cortando el ciclo. Esto reemplaza las políticas de
-- 2026-11-16-gym-groups.sql y 2026-11-16-gym-challenges.sql por
-- versiones que usan estas funciones en vez de sub-consultas directas.
--
-- Corre este archivo completo de una sola vez en Supabase → SQL Editor.
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

create or replace function is_member_of_challenge_group(p_challenge_id uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from gym_challenges c
    where c.id = p_challenge_id and is_group_member(c.group_id, auth.uid())
  );
$$;

create or replace function is_member_of_equivalence_group(p_equivalence_id uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from gym_equivalences e
    where e.id = p_equivalence_id and is_member_of_challenge_group(e.challenge_id)
  );
$$;

-- ============================================================
-- Re-crea las políticas que antes leían gym_group_members "a mano",
-- ahora usando las funciones de arriba.
-- ============================================================

drop policy if exists "groupmates can view members" on gym_group_members;
create policy "groupmates can view members" on gym_group_members
  for select using (is_group_member(group_id, auth.uid()));

drop policy if exists "profiles viewable by self and groupmates" on profiles;
create policy "profiles viewable by self and groupmates" on profiles
  for select using (user_id = auth.uid() or shares_group_with(user_id));

drop policy if exists "groupmates can view checkins" on gym_checkins;
create policy "groupmates can view checkins" on gym_checkins
  for select using (shares_group_with(user_id));

drop policy if exists "groupmates view challenges" on gym_challenges;
create policy "groupmates view challenges" on gym_challenges
  for select using (is_group_member(group_id, auth.uid()));

drop policy if exists "groupmates create challenges" on gym_challenges;
create policy "groupmates create challenges" on gym_challenges
  for insert with check (is_group_member(group_id, auth.uid()));

drop policy if exists "groupmates view equivalences" on gym_equivalences;
create policy "groupmates view equivalences" on gym_equivalences
  for select using (is_member_of_challenge_group(challenge_id));

drop policy if exists "groupmates propose equivalences" on gym_equivalences;
create policy "groupmates propose equivalences" on gym_equivalences
  for insert with check (is_member_of_challenge_group(challenge_id));

drop policy if exists "groupmates view votes" on gym_equivalence_votes;
create policy "groupmates view votes" on gym_equivalence_votes
  for select using (is_member_of_equivalence_group(equivalence_id));

drop policy if exists "groupmates view progress" on gym_challenge_progress;
create policy "groupmates view progress" on gym_challenge_progress
  for select using (is_member_of_challenge_group(challenge_id));
