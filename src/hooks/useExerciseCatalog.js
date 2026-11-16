import { useMemo } from 'react'
import { useCustomExercises } from './useCustomExercises'
import { useExercisePhotos } from './useExercisePhotos'
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
 * `photosByExercise` (exercise_photos) se superpone encima de CUALQUIER
 * ejercicio, base o propio — así una foto se puede agregar después, no
 * solo al crear el ejercicio.
 */
export function useExerciseCatalog() {
  const { exercises: customRows, loading, error, addExercise, deleteExercise, isDemoMode } = useCustomExercises()
  const { photosByExercise, setPhoto: setExercisePhoto } = useExercisePhotos()

  const catalog = useMemo(() => {
    const base = [
      ...exerciseCatalog.map((e) => ({ ...e, isCustom: false })),
      ...customRows.map(normalizeCustom),
    ]
    return base.map((ex) => ({ ...ex, photoUrl: photosByExercise[ex.id] ?? ex.photoUrl ?? null }))
  }, [customRows, photosByExercise])

  return { catalog, loading, error, addExercise, deleteExercise, setExercisePhoto, isDemoMode }
}
