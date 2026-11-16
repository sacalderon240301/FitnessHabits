-- ============================================================
-- Migración: foto de la máquina/ejercicio (Change Request #4).
--
-- Bucket público de Storage para las fotos (son solo fotos de equipo de
-- gym, no datos sensibles, así que se sirven por URL pública directa en
-- vez de con URLs firmadas). Cada quien solo puede subir/borrar las suyas.
--
-- Corre este archivo completo de una sola vez en Supabase → SQL Editor.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('exercise-photos', 'exercise-photos', true)
on conflict (id) do nothing;

drop policy if exists "public read exercise-photos" on storage.objects;
create policy "public read exercise-photos" on storage.objects
  for select using (bucket_id = 'exercise-photos');

drop policy if exists "owner manage exercise-photos" on storage.objects;
create policy "owner manage exercise-photos" on storage.objects
  for all to authenticated
  using (bucket_id = 'exercise-photos' and owner = auth.uid())
  with check (bucket_id = 'exercise-photos' and owner = auth.uid());

alter table custom_exercises add column if not exists photo_url text;
