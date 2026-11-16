import { useMemo } from 'react'
import { useCustomExercises } from './useCustomExercises'
import { exerciseCatalog } from '../data/exerciseCatalog'

function normalizeCustom(row) {
  return {
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group,
    defaultLocation: row.default_location,
    tracking: row.tracking_type,
    trackWeight: row.track_weight,
    tip: row.tip ?? '',
    photoUrl: row.photo_url ?? null,
    isCustom: true,
  }
}

/**
 * Catálogo completo de ejercicios: los por defecto (src/data/exerciseCatalog.js)
 * más los que el usuario agregó (custom_exercises), todos en la misma forma.
 */
export function useExerciseCatalog() {
  const { exercises: customRows, loading, error, addExercise, deleteExercise, isDemoMode } = useCustomExercises()

  const catalog = useMemo(() => [
    ...exerciseCatalog.map((e) => ({ ...e, isCustom: false })),
    ...customRows.map(normalizeCustom),
  ], [customRows])

  return { catalog, loading, error, addExercise, deleteExercise, isDemoMode }
}
