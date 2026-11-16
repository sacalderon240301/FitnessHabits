# Hábitos — app personal de seguimiento (v6)

## Qué cambió en esta versión (v6)

**Arreglado: los bloques del día no se guardaban.** La causa era que la
tabla `day_plan_blocks` nunca se había creado en el Supabase real (solo
existía en `schema.sql`, pero esa parte no se había corrido en el SQL
Editor) — cada guardado fallaba con un error 404 que quedaba en silencio
porque la pantalla nunca lo mostraba. Ahora `PlannerScreen` muestra el
error si algo falla, y **tienes que correr la migración** (ver abajo).

**"Organiza tu día" ahora tiene modo IA.** Botón "Generar con IA" junto
al de "Agregar bloque": describes tu día en texto libre (con o sin
horarios) y una Edge Function de Supabase le pasa el texto a OpenAI, que
devuelve los bloques ya estructurados — los revisas (puedes quitar los
que no quieras) y los guardas. La API key de OpenAI vive como secreto del
proyecto de Supabase, nunca en el código del navegador — necesario porque
esta app se va a publicar en una URL pública (Netlify/Vercel) e instalar
como PWA. Ver "Conectar OpenAI" abajo para el paso de deploy.

**Se fue la mascota gorila.** Reemplazada por iconografía abstracta
minimalista (`src/data/motionIcons.jsx`): formas geométricas con trazo en
vez de un personaje ilustrado, tanto en las 5 poses de ejercicios de
parque como en la marca de la app (antes `GorillaMascot`, ahora
`WeaveMark`, basada en el mismo lenguaje visual de nodos/hilos que ya
usaba `DayWeave`). Las variables de color `--gorilla-fur`/`--gorilla-face`
se renombraron a `--plan-brown`/`--plan-tan` (se seguían usando como
acento en Gym y Ejercicios, no solo en el gorila).

### Correr la migración que falta

En Supabase → SQL Editor, corre esto (ya está en `supabase/schema.sql`,
sección "Organiza tu día"):

```sql
create table if not exists day_plan_blocks (
  id uuid primary key default gen_random_uuid(),
  plan_date date not null,
  start_time text not null,
  end_time text not null,
  activity text,
  category text,
  is_flexible boolean not null default false,
  flexible_label text,
  created_at timestamptz not null default now()
);

create index if not exists day_plan_blocks_date_idx on day_plan_blocks(plan_date);

alter table day_plan_blocks enable row level security;

create policy "allow all day_plan_blocks" on day_plan_blocks
  for all using (true) with check (true);
```

### Conectar OpenAI (Edge Function)

1. Instala el CLI de Supabase y haz login (`supabase login`).
2. Enlaza el proyecto: `supabase link --project-ref ufegubpfsamuszfewixc`.
3. Deploy de la función: `supabase functions deploy parse-day-plan`.
4. Guarda tu API key como secreto (nunca en `.env`):
   `supabase secrets set OPENAI_API_KEY=sk-...`.

Con eso, el botón "Generar con IA" en "Organiza tu día" queda funcional
en cualquier lado donde publiques el frontend (Netlify, Vercel, PWA),
porque la key nunca sale del servidor de Supabase.


Bienvenida → 3 ramas (Hábitos, Ejercicio, Mi día), cada rama con sus
propias secciones. React + Vite + Supabase, PWA.

## Navegación

```
Bienvenida (solo la primera vez, o cuando le des al botón de casa)
├── Hábitos
│   ├── Malos    → LISTA de hábitos → detalle por hábito (racha + recaídas)
│   └── Buenos   → LISTA de hábitos → detalle por hábito (racha + "hoy sí lo hice")
├── Ejercicio
│   ├── Calendario → vista unificada: trote/parque/casa/gym con filtros
│   ├── Trotar   → calendario + guía de técnica
│   ├── Parque   → ejercicios de barra + historial + agregar los tuyos
│   ├── Casa     → ejercicios en casa + historial + agregar los tuyos
│   └── Gimnasio → rutinas guardadas + sesiones retomables + historial
└── Mi día        → planificador de bloques de tiempo (nuevo)
```

## Qué cambió en esta versión

**Nuevo apartado "Organiza tu día"** (pestaña propia, al lado de Hábitos y
Ejercicio). Es un planificador de bloques de tiempo:

- **Línea de tiempo vertical** por día — cada bloque muestra hora inicio/fin,
  actividad, categoría (con color) y duración. Pensada para verse limpia en
  un pantallazo.
- **Navegación por día** (‹ Hoy › / Mañana / cualquier fecha) — el flujo
  pensado es: la noche anterior, le das a "Mañana" y armas el plan del día
  siguiente en un par de minutos.
- **Bloques flexibles**: para cuando no sabes exactamente qué vas a hacer —
  les pones una etiqueta libre ("Bloque libre", "Estudio", "Lo que salga de
  trabajo") en vez de una actividad + categoría fija. Se ven con borde
  punteado para diferenciarlos de los bloques ya decididos.
- 12 categorías con color propio (Descanso, Rutina, Ejercicio, Preparación,
  Trabajo, Comida, Estudio, Proyecto personal, Ocio, Hogar, Personal, Otro).

**Entrada manual, y ahora también por IA** (ver el changelog de v6 más
arriba) — el modelo de datos (`day_plan_blocks`) se diseñó desde el
principio en la forma que ese parseo necesitaba llenar, así que agregar
el modo IA no requirió rediseñar nada de esto.

## Qué cambió en esta versión

**Parque: ahora puedes agregar tus propios ejercicios.** Botón "+ Agregar
ejercicio" — le das nombre, categoría (libre), si se mide en series/reps o
en tiempo, y opcionalmente un tip de técnica. Aparece junto a los 7
básicos, marcado como "tuyo" para diferenciarlo.

**Parque: pestaña de Historial**, igual que en Gym — tus sesiones pasadas
agrupadas por fecha, tocas cualquier ejercicio registrado para corregirlo
o borrarlo.

**Nueva sección "Casa"** (pestaña propia dentro de Ejercicio, entre Parque
y Gimnasio). Mismo patrón exacto que Parque: 6 ejercicios básicos
(flexiones, sentadillas, plancha, zancadas, puente de glúteo, fondos en
silla), historial, y la posibilidad de agregar los tuyos. Como no puedo
dibujarle una pose de gorila a cada ejercicio que inventes, los ejercicios
sin ilustración propia muestran un ícono genérico de pesa — es una
limitación consciente, no un olvido.

**Por debajo, esto quedó generalizado**: el mismo código (`useExerciseLogs`,
`useCustomExercises`, `ExerciseGroupScreen`) sirve para Parque y Casa —
agregar un tercer grupo en el futuro sería mucho más rápido que las
primeras dos veces.

**El calendario unificado ahora tiene 4 tipos**: Trote / Parque / Casa /
Gym, cada uno con su punto de color y su chip de filtro.

**Gym: sesiones retomables.** Antes, una vez cerrabas el modal de registro,
solo podías editar un ejercicio a la vez desde el historial — no agregar
más. Ahora, tocar cualquier sesión en el historial (o en el calendario) te
lleva al mismo editor completo: puedes corregir lo ya guardado, agregar
ejercicios nuevos (de la rutina o libres) a esa misma sesión, y borrar
cualquiera. Así calza con cómo realmente entrenas: un ejercicio a la vez, a
veces con extras que no estaban en el plan.

**Gym: guardar una sesión como rutina.** Desde ese mismo editor de sesión,
el botón "Guardar esta sesión como rutina predeterminada" toma los
ejercicios que quedaron ahí (de la rutina + los que agregaste libres) y
crea una rutina nueva con el nombre que tú le des.

**Calendario unificado (pestaña "Calendario" en Ejercicio, ahora la
primera).** Un solo calendario de mes con chips para filtrar Trote /
Parque / Gym (puedes activar los que quieras a la vez). Cada día muestra
un punto de color por tipo de actividad registrada. Tocar cualquier día
abre un selector de "¿qué quieres ver/registrar?" con un resumen de cada
tipo ese día, y de ahí entras al editor correspondiente — funciona para
cualquier día, no solo hoy.

**Parque: ahora también editable por fecha.** `useParkExerciseLogs` tiene
`updateLog`/`deleteLog` nuevos, y el modal de registro acepta una fecha
específica en vez de asumir siempre "hoy" — esto es lo que hace posible
entrar por el calendario a cualquier día pasado y corregir/agregar ahí.

**Bug de contraste arreglado** (de la versión anterior, por si no la
habías corrido aún): los botones no heredan color de texto por defecto en
los navegadores — una regla global en `index.css` lo corrige en toda la app.

**Hábitos ahora son listas, no uno solo fijo.** Tanto en "Malos" como en
"Buenos" ves una lista de tarjetas; tocas una y entras a su seguimiento
individual (weave de 14 días, racha, notas). Desde la lista puedes crear
hábitos nuevos con "+ Nuevo hábito", y desde el detalle puedes editarlo o
eliminarlo con el botón "Editar".

**Hábitos positivos (Buenos) ya está construido.** Mismo patrón visual que
"Malos" (weave + racha), pero solo existe un estado: "Hoy sí lo hice". No
hay botón de "recaída" — la ausencia de registro ya se ve como un hueco en
la racha.

**Gimnasio ya está construido.**
- Pestaña "Rutinas": crea rutinas con nombre + lista de ejercicios (ej.
  "Empuje" con Press banca, Press militar, Fondos). Tócala para editarla.
- Botón "+ Registrar sesión de hoy": eliges una rutina guardada (o "sesión
  libre" sin rutina) y registras series/repeticiones/peso por ejercicio.
- Pestaña "Historial": tus sesiones pasadas agrupadas por fecha y rutina.

**El gorila ahora se ve más gorila.** Ceja prominente, hocico que
sobresale, orejas redondas, brazos largos con nudillos visibles, pecho
ancho con un parche más claro (como un lomo plateado), piernas cortas. La
cabeza (`Head` en `gorillaArt.jsx`) se reutiliza en la mascota y en las 5
poses de ejercicios de parque — mejorarla ahí mejora todo a la vez.

## Estructura del código (piezas nuevas)

```
src/hooks/
  useBadHabitsList.js    ← lista de hábitos malos (CRUD)
  useBadHabitEvents.js   ← eventos de UN hábito malo (antes era global)
  useGoodHabitsList.js   ← lista de hábitos positivos (CRUD)
  useGoodHabitEvents.js  ← eventos de UN hábito positivo
  useGymRoutines.js      ← rutinas de gimnasio guardadas (CRUD)
  useGymLogs.js          ← sesiones de gimnasio registradas

src/lib/
  goodHabitStats.js      ← racha para hábitos positivos (reutiliza DayWeave)
  gymStats.js            ← agrupar sesiones de gym por fecha

src/screens/
  MalosScreen.jsx / BuenosScreen.jsx  ← manejan lista ↔ detalle
  BadHabitDetail.jsx / GoodHabitDetail.jsx  ← vista de un hábito específico
  GymScreen.jsx          ← rutinas + registrar sesión + historial

src/components/
  HabitsListView.jsx     ← lista genérica (compartida malos/buenos)
  HabitFormModal.jsx     ← crear/editar hábito (compartido malos/buenos)
  DetailHeader.jsx        ← header con botón de volver, compartido
  gym/RoutineFormModal.jsx, gym/LogSessionModal.jsx, gym/GymHistoryList.jsx
```

## Cómo correrla / conectar Supabase

Igual que siempre:
```bash
npm install
npm run dev
```
Y para persistencia real, `supabase/schema.sql` ya trae las tablas nuevas
(`good_habits`, `good_habit_events`, `gym_routines`, `gym_logs`) con datos
de ejemplo — solo tienes que correrlo de nuevo en el SQL Editor de tu
proyecto (los `create table if not exists` no rompen lo que ya tenías).

## Próximos pasos sugeridos

1. Pulir el estilo visual general (sigue pendiente, a propósito).
2. Editar/borrar logs ya registrados (gym, parque, trote) desde su historial.
3. Auth real de Supabase + RLS por usuario.
4. Notificaciones/recordatorios (Web Push).
5. Mostrar una vista previa de racha en las tarjetas de la lista de hábitos
   (hoy la lista solo muestra nombre + descripción, sin adelanto de racha).
