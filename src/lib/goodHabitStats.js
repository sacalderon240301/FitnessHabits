// Igual que lib/stats.js pero para hábitos positivos: no existe el
// concepto de "recaída", solo "hoy sí lo hice". Reutilizamos el mismo
// componente DayWeave mapeando cada día con evento al estado 'replacement'
// (el punto dorado lleno) para no duplicar esa pieza visual.

import { isoDate, toDayKey } from './date'

export function buildGoodHabitWeave(events, count = 14) {
  const daysWithEvent = new Set(events.map((e) => toDayKey(e.occurred_at)))

  const days = []
  const today = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = isoDate(d)
    days.push({
      key,
      label: d.toLocaleDateString('es-CO', { weekday: 'narrow' }),
      isToday: i === 0,
      state: daysWithEvent.has(key) ? 'replacement' : 'empty',
    })
  }
  return days
}

export function computeGoodHabitStats(events) {
  const daysWithEvent = new Set(events.map((e) => toDayKey(e.occurred_at)))

  let streak = 0
  const cursor = new Date()
  while (daysWithEvent.has(isoDate(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  // mejor racha histórica
  const sortedDays = [...daysWithEvent].sort()
  let best = 0
  let current = 0
  let prevDate = null
  for (const dayKey of sortedDays) {
    const date = new Date(dayKey + 'T00:00:00')
    if (prevDate) {
      const diff = Math.round((date - prevDate) / 86_400_000)
      current = diff === 1 ? current + 1 : 1
    } else {
      current = 1
    }
    best = Math.max(best, current)
    prevDate = date
  }

  return { streak, bestStreak: best, totalDone: events.length }
}
