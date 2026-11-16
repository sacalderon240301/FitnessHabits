// El calendario sigue mostrando 4 categorías (trote/parque/casa/gym) por
// compatibilidad visual, pero las 3 últimas ahora vienen de UNA sola fuente
// (exercise_logs) diferenciadas por `location` — 'gimnasio' se mapea a
// 'gym' para no romper los colores/labels que ya usan UnifiedCalendar y
// TypeFilterChips. Un `location` personalizado (texto libre) no se pinta
// con dot propio; el registro sigue contando igual en KPIs/historial.
const LOCATION_TO_TYPE = { casa: 'casa', parque: 'parque', gimnasio: 'gym' }

/**
 * Devuelve un Map<dateKey, { trote: bool, parque: bool, casa: bool, gym: bool }>
 * combinando trote (activity_sessions) y ejercicio unificado (exercise_logs).
 */
export function buildUnifiedDayMap({ activitySessions = [], exerciseLogs = [] }) {
  const map = new Map()

  const mark = (dateKey, type) => {
    const entry = map.get(dateKey) ?? { trote: false, parque: false, casa: false, gym: false }
    entry[type] = true
    map.set(dateKey, entry)
  }

  for (const s of activitySessions) mark(s.session_date, 'trote')
  for (const l of exerciseLogs) {
    const type = LOCATION_TO_TYPE[l.location]
    if (type) mark(l.session_date, type)
  }

  return map
}

export function buildMonthCells(year, month) {
  const firstOfMonth = new Date(year, month, 1)
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7 // lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day))
  return cells
}

export { isoDate } from './date'
