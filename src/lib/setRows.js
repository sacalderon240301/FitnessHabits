// Helpers puros para editar filas de "serie" (reps/segundos + peso opcional)
// en un formulario, compartidos entre LogSetsModal (un ejercicio) y
// RoutineSessionModal (varios ejercicios a la vez).

export function emptySetRow() {
  return { reps: '', seconds: '', weight_kg: '' }
}

export function rowsFromSets(sets) {
  if (!sets?.length) return [emptySetRow()]
  return sets.map((s) => ({ reps: s.reps ?? '', seconds: s.seconds ?? '', weight_kg: s.weight_kg ?? '' }))
}

/** Convierte filas de formulario (strings) a series limpias para guardar, descartando filas vacías. */
export function cleanSetRows(rows, { isTime, trackWeight }) {
  return rows
    .map((r) => {
      const entry = {}
      if (isTime) {
        if (r.seconds !== '') entry.seconds = parseInt(r.seconds, 10)
      } else if (r.reps !== '') {
        entry.reps = parseInt(r.reps, 10)
      }
      if (trackWeight && r.weight_kg !== '') entry.weight_kg = parseFloat(r.weight_kg)
      return entry
    })
    .filter((e) => e.reps != null || e.seconds != null)
}
