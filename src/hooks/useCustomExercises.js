import { useCallback, useEffect, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'

const DEMO_KEY = 'habit-app-demo-custom-exercises-v2'

function loadDemoExercises() {
  const raw = localStorage.getItem(DEMO_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveDemoExercises(exercises) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(exercises))
}

/**
 * Ejercicios que el usuario agrega él mismo, además del catálogo por
 * defecto (src/data/exerciseCatalog.js). Entorno-agnósticos: aplican a
 * cualquier lugar (casa/parque/gimnasio), `default_location` es solo la
 * sugerencia inicial al registrar.
 */
export function useCustomExercises() {
  const [exercises, setExercises] = useState(() => (isDemoMode ? loadDemoExercises() : []))
  const [loading, setLoading] = useState(!isDemoMode)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isDemoMode) {
      setExercises(loadDemoExercises())
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('custom_exercises')
        .select('*')
        .order('created_at', { ascending: true })
      if (cancelled) return
      if (err) setError(err.message)
      else setExercises(data ?? [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const addExercise = useCallback(async (payload) => {
    if (isDemoMode) {
      const newExercise = { id: `c${Date.now()}`, ...payload }
      const updated = [...loadDemoExercises(), newExercise]
      saveDemoExercises(updated)
      setExercises(updated)
      return newExercise
    }
    const { data, error: err } = await supabase.from('custom_exercises').insert(payload).select().single()
    if (err) { setError(err.message); return null }
    setExercises((prev) => [...prev, data])
    return data
  }, [])

  const deleteExercise = useCallback(async (id) => {
    if (isDemoMode) {
      const updated = loadDemoExercises().filter((e) => e.id !== id)
      saveDemoExercises(updated)
      setExercises(updated)
      return
    }
    const { error: err } = await supabase.from('custom_exercises').delete().eq('id', id)
    if (err) { setError(err.message); return }
    setExercises((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return { exercises, loading, error, addExercise, deleteExercise, isDemoMode }
}
