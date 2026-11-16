// Cálculos puros para la pantalla de KPIs. Sin dependencias de UI, para que
// sea fácil de razonar y probar — igual que lib/stats.js y lib/gymStats.js.

import { todayIso, addDays, toDayKey } from './date'

function lastNDays(n) {
  const days = []
  const today = todayIso()
  for (let i = n - 1; i >= 0; i--) {
    days.push(addDays(today, -i))
  }
  return days
}

// `session_date`/`plan_date` ya vienen como 'YYYY-MM-DD' (columna date de
// Postgres) — se usan tal cual. `occurred_at` es un timestamptz completo y
// necesita convertirse al día LOCAL en que ocurrió (ver toDayKey en lib/date).
function dayKeyOf(value) {
  if (typeof value === 'string' && value.length === 10) return value
  return toDayKey(value)
}

function distinctDaysInWindow(items, dateField, windowSet) {
  const set = new Set()
  for (const item of items) {
    const key = dayKeyOf(item[dateField])
    if (windowSet.has(key)) set.add(key)
  }
  return set
}

// exerciseLogs viene unificado (casa/parque/gimnasio en una sola lista,
// diferenciados por `location`) — este helper lo separa donde el desglose
// por entorno todavía importa (ej. el radar del ICF).
function byLocation(exerciseLogs, location) {
  return exerciseLogs.filter((l) => l.location === location)
}

const ICF_TARGET_SESSIONS_PER_WEEK = 3

/**
 * Índice de Consistencia Física: días distintos entrenados en cada entorno
 * en los últimos 7 días, normalizado contra una meta semanal razonable.
 * Mismos colores que ya usa UnifiedCalendar para estos 4 tipos.
 */
export function computeICF({ troteSessions, exerciseLogs }) {
  const windowDays = new Set(lastNDays(7))

  const envs = [
    { id: 'trote', label: 'Trotar', color: 'var(--focus-teal)', items: troteSessions, field: 'session_date' },
    { id: 'parque', label: 'Parque', color: 'var(--thread-gold)', items: byLocation(exerciseLogs, 'parque'), field: 'session_date' },
    { id: 'gimnasio', label: 'Gimnasio', color: 'var(--plan-tan)', items: byLocation(exerciseLogs, 'gimnasio'), field: 'session_date' },
    { id: 'casa', label: 'Casa', color: 'var(--slip-rust)', items: byLocation(exerciseLogs, 'casa'), field: 'session_date' },
  ]

  return envs.map((env) => {
    const count = distinctDaysInWindow(env.items, env.field, windowDays).size
    const value = Math.min(count, ICF_TARGET_SESSIONS_PER_WEEK) / ICF_TARGET_SESSIONS_PER_WEEK * 100
    return { ...env, count, value }
  })
}

/**
 * Balance de hábitos: hábitos buenos completados - recaídas registradas,
 * día por día en la última semana, más el neto total del período.
 */
export function computeNetHabitScore({ badEvents, goodEvents }, days = 7) {
  const window = lastNDays(days)

  const goodByDay = new Map()
  for (const e of goodEvents) {
    const key = toDayKey(e.occurred_at)
    goodByDay.set(key, (goodByDay.get(key) ?? 0) + 1)
  }

  const slipByDay = new Map()
  for (const e of badEvents) {
    if (e.event_type !== 'slip') continue
    const key = toDayKey(e.occurred_at)
    slipByDay.set(key, (slipByDay.get(key) ?? 0) + 1)
  }

  const byDay = window.map((date) => {
    const good = goodByDay.get(date) ?? 0
    const slip = slipByDay.get(date) ?? 0
    const d = new Date(date + 'T00:00:00')
    return { date, label: d.toLocaleDateString('es-CO', { weekday: 'narrow' }), good, slip, net: good - slip }
  })

  const total = byDay.reduce((sum, d) => sum + d.net, 0)
  return { total, byDay }
}

const MIN_SLIP_DAYS_FOR_INSIGHT = 3

/**
 * Compara qué tan seguido faltó ejercicio en días con recaída vs. días sin
 * recaída, en los últimos `windowDays` días. Necesita un mínimo de días con
 * recaída en la ventana para no sacar conclusiones de muy poca data.
 */
export function computeFrictionAnalysis({ badEvents, troteSessions, exerciseLogs }, windowDays = 30) {
  const window = lastNDays(windowDays)
  const windowSet = new Set(window)

  const exerciseDays = new Set([
    ...distinctDaysInWindow(troteSessions, 'session_date', windowSet),
    ...distinctDaysInWindow(exerciseLogs, 'session_date', windowSet),
  ])

  const slipDays = new Set()
  for (const e of badEvents) {
    if (e.event_type !== 'slip') continue
    const key = toDayKey(e.occurred_at)
    if (windowSet.has(key)) slipDays.add(key)
  }

  const nonSlipDays = window.filter((d) => !slipDays.has(d))
  const slipDaysList = [...slipDays]

  const hasEnoughData = slipDaysList.length >= MIN_SLIP_DAYS_FOR_INSIGHT
  if (!hasEnoughData) {
    return { hasEnoughData, slipDaysCount: slipDaysList.length }
  }

  const noExerciseOnSlip = slipDaysList.filter((d) => !exerciseDays.has(d)).length
  const noExerciseOnNonSlip = nonSlipDays.filter((d) => !exerciseDays.has(d)).length

  return {
    hasEnoughData,
    slipDaysCount: slipDaysList.length,
    pctNoExerciseOnSlipDays: Math.round((noExerciseOnSlip / slipDaysList.length) * 100),
    pctNoExerciseOnNonSlipDays: nonSlipDays.length ? Math.round((noExerciseOnNonSlip / nonSlipDays.length) * 100) : 0,
  }
}

/**
 * % de cumplimiento del plan: de los bloques cuya hora de fin ya pasó (no
 * tiene sentido contar bloques futuros como "incumplidos"), cuántos quedaron
 * marcados con alguna de las 3 variantes de "sí lo hice".
 */
export function computePlanCompliance({ planBlocks }, windowDays = 7) {
  const windowSet = new Set(lastNDays(windowDays))
  const now = new Date()

  const dueBlocks = planBlocks.filter((b) => {
    if (!windowSet.has(b.plan_date)) return false
    return new Date(`${b.plan_date}T${b.end_time}:00`) <= now
  })

  if (dueBlocks.length === 0) return { hasData: false }

  // 3 categorías que se excluyen entre sí (cada bloque tiene un solo status),
  // más "no cumplido" para lo que sobra — las 4 suman exactamente el total.
  const doneCount = dueBlocks.filter((b) => b.status === 'done').length
  const differentTimeCount = dueBlocks.filter((b) => b.status === 'done_different_time').length
  const shorterCount = dueBlocks.filter((b) => b.status === 'done_shorter').length
  const compliantCount = doneCount + differentTimeCount + shorterCount
  const notDoneCount = dueBlocks.length - compliantCount

  return {
    hasData: true,
    totalCount: dueBlocks.length,
    doneCount,
    differentTimeCount,
    shorterCount,
    notDoneCount,
    pct: Math.round((compliantCount / dueBlocks.length) * 100),
  }
}

const SEDENTARY_STREAK_CAP = 21

/**
 * Sedentarismo: cuántos días de los últimos 7 NO hubo ejercicio en ningún
 * entorno, más la racha actual de días consecutivos (contando desde hoy
 * hacia atrás) sin entrenar. Complementa al ICF — ese mide qué tanto
 * entrenaste, esto mide el costo de no haberlo hecho.
 */
export function computeSedentaryStats({ troteSessions, exerciseLogs }, windowDays = 7) {
  const windowSet = new Set(lastNDays(windowDays))
  const exerciseDays = new Set([
    ...distinctDaysInWindow(troteSessions, 'session_date', windowSet),
    ...distinctDaysInWindow(exerciseLogs, 'session_date', windowSet),
  ])

  const allExerciseDays = new Set([
    ...troteSessions.map((s) => dayKeyOf(s.session_date)),
    ...exerciseLogs.map((l) => dayKeyOf(l.session_date)),
  ])

  let currentStreak = 0
  for (let i = 0; i < SEDENTARY_STREAK_CAP; i++) {
    const day = addDays(todayIso(), -i)
    if (allExerciseDays.has(day)) break
    currentStreak += 1
  }

  const byDay = lastNDays(windowDays).map((date) => {
    const d = new Date(date + 'T00:00:00')
    return { date, active: exerciseDays.has(date), label: d.toLocaleDateString('es-CO', { weekday: 'narrow' }) }
  })

  return {
    sedentaryDaysThisWeek: windowDays - exerciseDays.size,
    activeDaysThisWeek: exerciseDays.size,
    windowDays,
    currentStreak,
    streakCapped: currentStreak >= SEDENTARY_STREAK_CAP,
    byDay,
  }
}

/** Días distintos esta semana con alguna acción constructiva (ejercicio o hábito bueno). */
export function computeActiveDaysThisWeek({ troteSessions, exerciseLogs, goodEvents }) {
  const windowSet = new Set(lastNDays(7))
  const active = new Set([
    ...distinctDaysInWindow(troteSessions, 'session_date', windowSet),
    ...distinctDaysInWindow(exerciseLogs, 'session_date', windowSet),
    ...distinctDaysInWindow(goodEvents, 'occurred_at', windowSet),
  ])
  return active.size
}
