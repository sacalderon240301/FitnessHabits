// Cálculos puros sobre exercise_logs. Reemplaza a lib/gymStats.js — ahora
// una "sesión" agrupa cualquier entorno (no solo gimnasio), y el progreso
// de un ejercicio se calcula serie por serie en vez de un par sets/reps.

/** Sesiones = registros que comparten fecha + entorno + rutina (o "Sesión libre"). */
export function groupLogsBySession(logs) {
  const map = new Map()
  for (const log of logs) {
    const key = `${log.session_date}__${log.location}__${log.routine_name ?? 'Sesión libre'}`
    const existing = map.get(key)
    if (existing) existing.logs.push(log)
    else map.set(key, {
      date: log.session_date,
      location: log.location,
      routineId: log.routine_id ?? null,
      routineName: log.routine_name ?? 'Sesión libre',
      logs: [log],
    })
  }
  return [...map.values()].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

/**
 * Texto compacto para un array de series, ej. "8, 7, 6 reps @ 50kg" o "40s".
 */
export function setsSummary(sets = []) {
  if (sets.length === 0) return 'Sin series'
  const hasSeconds = sets.some((s) => s.seconds != null)
  const values = sets.map((s) => (hasSeconds ? s.seconds : s.reps) ?? '—').join(', ')
  const unit = hasSeconds ? 's' : ' reps'
  const weights = [...new Set(sets.map((s) => s.weight_kg).filter((w) => w != null))]
  const weightLabel = weights.length === 1 ? ` @ ${weights[0]}kg` : weights.length > 1 ? ' (peso variable)' : ''
  return `${values}${unit}${weightLabel}`
}

/**
 * Progreso cronológico de UN ejercicio (sin importar bajo qué rutina se
 * registró): un punto por log, con la mejor marca de esa sesión — peso
 * máximo, reps máximas y/o segundos máximos, según lo que se haya
 * registrado en esas series.
 */
export function buildExerciseProgress(logs, exerciseId) {
  return logs
    .filter((l) => l.exercise_id === exerciseId)
    .slice()
    .sort((a, b) => (a.session_date < b.session_date ? -1 : a.session_date > b.session_date ? 1 : new Date(a.created_at) - new Date(b.created_at)))
    .map((log) => {
      const sets = log.sets ?? []
      const weights = sets.map((s) => s.weight_kg).filter((w) => w != null)
      const reps = sets.map((s) => s.reps).filter((r) => r != null)
      const seconds = sets.map((s) => s.seconds).filter((s) => s != null)
      return {
        logId: log.id,
        date: log.session_date,
        location: log.location,
        setsCount: sets.length,
        maxWeight: weights.length ? Math.max(...weights) : null,
        maxReps: reps.length ? Math.max(...reps) : null,
        maxSeconds: seconds.length ? Math.max(...seconds) : null,
        totalReps: reps.reduce((sum, r) => sum + r, 0),
        summary: setsSummary(sets),
      }
    })
}
