import { useCallback, useEffect, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'

const DEMO_KEY = 'habit-app-demo-exercise-routines'

const SEED_ROUTINES = [
  { id: 'r1', name: 'Empuje (pecho/hombro/tríceps)', location: 'gimnasio', exercise_ids: ['press-banca-plano', 'press-militar-barra', 'fondos-banco'] },
  { id: 'r2', name: 'Tirón (espalda/bíceps)', location: 'gimnasio', exercise_ids: ['remo-con-barra', 'dominadas-agarre-neutro', 'curl-biceps-barra'] },
  { id: 'r3', name: 'Pierna', location: 'gimnasio', exercise_ids: ['sentadilla-barra', 'peso-muerto', 'zancada-adelante'] },
]

function loadDemoRoutines() {
  const raw = localStorage.getItem(DEMO_KEY)
  if (raw) return JSON.parse(raw)
  localStorage.setItem(DEMO_KEY, JSON.stringify(SEED_ROUTINES))
  return SEED_ROUTINES
}

function saveDemoRoutines(routines) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(routines))
}

/**
 * Rutinas: una lista de ids de ejercicios (del catálogo unificado) para
 * registrar juntos en una sesión — sin importar el entorno, ya que ahora
 * eso se elige al registrar la sesión, no al armar la rutina.
 */
export function useExerciseRoutines() {
  const [routines, setRoutines] = useState(isDemoMode ? loadDemoRoutines() : [])
  const [loading, setLoading] = useState(!isDemoMode)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isDemoMode) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('exercise_routines')
        .select('*')
        .order('created_at', { ascending: true })
      if (cancelled) return
      if (err) setError(err.message)
      else setRoutines(data ?? [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const addRoutine = useCallback(async (payload) => {
    if (isDemoMode) {
      const newRoutine = { id: `r${Date.now()}`, ...payload }
      const updated = [...loadDemoRoutines(), newRoutine]
      saveDemoRoutines(updated)
      setRoutines(updated)
      return newRoutine
    }
    const { data, error: err } = await supabase.from('exercise_routines').insert(payload).select().single()
    if (err) { setError(err.message); return null }
    setRoutines((prev) => [...prev, data])
    return data
  }, [])

  const updateRoutine = useCallback(async (id, payload) => {
    if (isDemoMode) {
      const updated = loadDemoRoutines().map((r) => (r.id === id ? { ...r, ...payload } : r))
      saveDemoRoutines(updated)
      setRoutines(updated)
      return
    }
    const { data, error: err } = await supabase.from('exercise_routines').update(payload).eq('id', id).select().single()
    if (err) { setError(err.message); return }
    setRoutines((prev) => prev.map((r) => (r.id === id ? data : r)))
  }, [])

  const deleteRoutine = useCallback(async (id) => {
    if (isDemoMode) {
      const updated = loadDemoRoutines().filter((r) => r.id !== id)
      saveDemoRoutines(updated)
      setRoutines(updated)
      return
    }
    const { error: err } = await supabase.from('exercise_routines').delete().eq('id', id)
    if (err) { setError(err.message); return }
    setRoutines((prev) => prev.filter((r) => r.id !== id))
  }, [])

  return { routines, loading, error, addRoutine, updateRoutine, deleteRoutine, isDemoMode }
}
