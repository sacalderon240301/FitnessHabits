// Convierte la lista de eventos en estadísticas y en la "línea de días" que
// pinta el DayWeave. Todo esto es lógica pura, sin dependencias de UI,
// para que sea fácil de probar y de entender.

import { isoDate, toDayKey } from './date'

/**
 * Para cada uno de los últimos `count` días, decide su estado:
 * - 'replacement' si ese día hubo al menos un reemplazo (y ningún slip)
 * - 'slip'        si ese día hubo al menos una recaída
 * - 'empty'        si no hay registro ese día
 * (un slip "gana" visualmente sobre un reemplazo el mismo día: es honesto,
 * no se esconde una recaída detrás de un reemplazo posterior)
 */
export function buildDayWeave(events, count = 14) {
  const byDay = new Map()
  for (const e of events) {
    const key = toDayKey(e.occurred_at)
    const current = byDay.get(key)
    if (e.event_type === 'slip') byDay.set(key, 'slip')
    else if (!current) byDay.set(key, 'replacement')
  }

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
      state: byDay.get(key) ?? 'empty',
    })
  }
  return days
}

export function computeStats(events) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.occurred_at) - new Date(a.occurred_at)
  )

  const lastSlip = sorted.find((e) => e.event_type === 'slip')
  const daysSinceSlip = lastSlip
    ? Math.floor((Date.now() - new Date(lastSlip.occurred_at)) / 86_400_000)
    : null

  const totalReplacements = sorted.filter((e) => e.event_type === 'replacement').length

  // racha = días consecutivos (hasta hoy) con reemplazo y sin recaída
  const byDay = new Map()
  for (const e of sorted) {
    const key = toDayKey(e.occurred_at)
    if (e.event_type === 'slip') byDay.set(key, 'slip')
    else if (!byDay.has(key)) byDay.set(key, 'replacement')
  }
  let streak = 0
  const cursor = new Date()
  while (true) {
    const key = isoDate(cursor)
    const state = byDay.get(key)
    if (state === 'replacement') {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  return { daysSinceSlip, totalReplacements, streak }
}
