// Fechas en tiempo LOCAL del dispositivo, no UTC.
//
// `new Date().toISOString()` siempre devuelve la fecha en UTC. Para alguien
// en Colombia (UTC-5), eso significa que desde ~7pm hora local, "hoy" ya
// devuelve la fecha de MAÑANA — y cualquier registro (bloque del planificador,
// sesión de gym, evento de hábito) guardado de noche queda con la fecha
// equivocada. Todo cálculo de "qué día es" en la app debe pasar por acá,
// nunca por `.toISOString().slice(0, 10)` directo.

export function isoDate(d = new Date()) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayIso() {
  return isoDate(new Date())
}

export function addDays(dateKey, n) {
  const d = new Date(dateKey + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return isoDate(d)
}

export function isoDaysAgo(n) {
  return addDays(todayIso(), -n)
}

/** Convierte un timestamp ISO en UTC (ej. `occurred_at` de Supabase) a la fecha del calendario LOCAL en que ocurrió. */
export function toDayKey(isoString) {
  return isoDate(new Date(isoString))
}

/**
 * Convierte un timestamp (ISO o Date) al formato que espera un input
 * `datetime-local` ('YYYY-MM-DDTHH:mm'), en hora LOCAL. Por defecto, ahora.
 */
export function toDatetimeLocal(value = new Date()) {
  const d = typeof value === 'string' ? new Date(value) : value
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Convierte el valor de un input `datetime-local` (hora LOCAL) a un ISO timestamp para guardar. */
export function fromDatetimeLocal(value) {
  return new Date(value).toISOString()
}
