// Igual que buildUnifiedDayMap en lib/unifiedCalendar.js, pero para eventos
// de hábitos (buenos y malos) en vez de sesiones de ejercicio. Los eventos
// traen `occurred_at` como timestamp, no `session_date`, así que hay que
// pasar por toDayKey para saber a qué día LOCAL pertenecen.

import { toDayKey } from './date'

/**
 * Devuelve un Map<dateKey, { good, replace, slip }> con la cantidad de
 * eventos de cada tipo ese día.
 */
export function buildHabitsDayMap({ goodEvents = [], badEvents = [] }) {
  const map = new Map()

  const bump = (dateKey, type) => {
    const entry = map.get(dateKey) ?? { good: 0, replace: 0, slip: 0 }
    entry[type] += 1
    map.set(dateKey, entry)
  }

  for (const e of goodEvents) bump(toDayKey(e.occurred_at), 'good')
  for (const e of badEvents) bump(toDayKey(e.occurred_at), e.event_type === 'slip' ? 'slip' : 'replace')

  return map
}
