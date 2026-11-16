-- ============================================================
-- Migración: retos semanales + equivalencias votadas (Change Request #7
-- y el pedido de equivalencias, ej. "X km en bici = X km de cardio").
--
-- Autorreportado a propósito, igual que gym_checkins: cada quien anota
-- su propio avance (no se lee exercise_logs/activity_sessions de nadie),
-- así evitamos exponer el detalle de los hábitos/entrenos de cada quien,
-- solo el número que decide compartir con su grupo.
--
-- Tablas antes que políticas (mismo motivo que la migración de grupos:
-- las políticas hacen referencia a gym_group_members).
--
-- Corre este archivo completo de una sola vez en Supabase → SQL Editor.
-- ============================================================

create table if not exists gym_challenges (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references gym_groups(id) on delete cascade,
  title text not null,
  base_label text not null default 'unidades',
  target_value numeric not null default 0,
  week_start date not null default date_trunc('week', current_date)::date,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists gym_challenges_group_week_idx on gym_challenges(group_id, week_start);

create table if not exists gym_equivalences (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references gym_challenges(id) on delete cascade,
  label text not null,
  factor numeric not null default 1,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists gym_equivalence_votes (
  equivalence_id uuid not null references gym_equivalences(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  primary key (equivalence_id, user_id)
);

create table if not exists gym_challenge_progress (
  challenge_id uuid not null references gym_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  total_value numeric not null default 0,
  updated_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

-- ============================================================
-- Políticas: todo lo de arriba es visible/editable solo por integrantes
-- del grupo dueño del reto (vía el challenge_id → group_id).
-- ============================================================

alter table gym_challenges enable row level security;

drop policy if exists "groupmates view challenges" on gym_challenges;
create policy "groupmates view challenges" on gym_challenges
  for select using (
    exists (select 1 from gym_group_members gm where gm.group_id = gym_challenges.group_id and gm.user_id = auth.uid())
  );

drop policy if exists "groupmates create challenges" on gym_challenges;
create policy "groupmates create challenges" on gym_challenges
  for insert with check (
    exists (select 1 from gym_group_members gm where gm.group_id = gym_challenges.group_id and gm.user_id = auth.uid())
  );

drop policy if exists "creator manages challenge" on gym_challenges;
create policy "creator manages challenge" on gym_challenges
  for all using (created_by = auth.uid()) with check (created_by = auth.uid());

alter table gym_equivalences enable row level security;

drop policy if exists "groupmates view equivalences" on gym_equivalences;
create policy "groupmates view equivalences" on gym_equivalences
  for select using (
    exists (
      select 1 from gym_challenges c
      join gym_group_members gm on gm.group_id = c.group_id
      where c.id = gym_equivalences.challenge_id and gm.user_id = auth.uid()
    )
  );

drop policy if exists "groupmates propose equivalences" on gym_equivalences;
create policy "groupmates propose equivalences" on gym_equivalences
  for insert with check (
    exists (
      select 1 from gym_challenges c
      join gym_group_members gm on gm.group_id = c.group_id
      where c.id = gym_equivalences.challenge_id and gm.user_id = auth.uid()
    )
  );

alter table gym_equivalence_votes enable row level security;

drop policy if exists "groupmates view votes" on gym_equivalence_votes;
create policy "groupmates view votes" on gym_equivalence_votes
  for select using (
    exists (
      select 1 from gym_equivalences e
      join gym_challenges c on c.id = e.challenge_id
      join gym_group_members gm on gm.group_id = c.group_id
      where e.id = gym_equivalence_votes.equivalence_id and gm.user_id = auth.uid()
    )
  );

drop policy if exists "users vote themselves" on gym_equivalence_votes;
create policy "users vote themselves" on gym_equivalence_votes
  for insert with check (user_id = auth.uid());

drop policy if exists "users remove own vote" on gym_equivalence_votes;
create policy "users remove own vote" on gym_equivalence_votes
  for delete using (user_id = auth.uid());

alter table gym_challenge_progress enable row level security;

drop policy if exists "groupmates view progress" on gym_challenge_progress;
create policy "groupmates view progress" on gym_challenge_progress
  for select using (
    exists (
      select 1 from gym_challenges c
      join gym_group_members gm on gm.group_id = c.group_id
      where c.id = gym_challenge_progress.challenge_id and gm.user_id = auth.uid()
    )
  );

drop policy if exists "users manage own progress" on gym_challenge_progress;
create policy "users manage own progress" on gym_challenge_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
