import { useCallback, useEffect, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'
import { uploadPhoto } from '../lib/uploadPhoto'

const DEMO_KEY = 'habit-app-demo-exercise-photo-overrides'

function loadDemoPhotos() {
  const raw = localStorage.getItem(DEMO_KEY)
  return raw ? JSON.parse(raw) : {}
}

function saveDemoPhotos(map) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(map))
}

/**
 * Foto propia para CUALQUIER ejercicio (base o tuyo) — un overlay aparte
 * del catálogo, para no depender de que sea un ejercicio custom.
 */
export function useExercisePhotos() {
  const [photosByExercise, setPhotosByExercise] = useState(isDemoMode ? loadDemoPhotos() : {})
  const [loading, setLoading] = useState(!isDemoMode)

  useEffect(() => {
    if (isDemoMode) return
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data } = await supabase.from('exercise_photos').select('exercise_id, photo_url')
      if (cancelled) return
      const map = {}
      for (const row of data ?? []) map[row.exercise_id] = row.photo_url
      setPhotosByExercise(map)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const setPhoto = useCallback(async (exerciseId, file) => {
    const photo_url = await uploadPhoto('exercise-photos', file)
    if (!photo_url) return null
    if (isDemoMode) {
      const map = { ...loadDemoPhotos(), [exerciseId]: photo_url }
      saveDemoPhotos(map)
      setPhotosByExercise(map)
      return photo_url
    }
    const { error } = await supabase
      .from('exercise_photos')
      .upsert({ exercise_id: exerciseId, photo_url }, { onConflict: 'user_id,exercise_id' })
    if (error) return null
    setPhotosByExercise((prev) => ({ ...prev, [exerciseId]: photo_url }))
    return photo_url
  }, [])

  return { photosByExercise, loading, setPhoto, isDemoMode }
}
