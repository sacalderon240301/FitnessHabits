import { useCallback, useEffect, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'
import { isoDaysAgo } from '../lib/date'

const DEMO_KEY = 'habit-app-demo-exercise-logs-v2'

function seedDemoLogs() {
  return [
    { id: 'e1', exercise_id: 'press-banca-plano', session_date: isoDaysAgo(1), location: 'gimnasio', routine_id: null, routine_name: null, sets: [{ reps: 8, weight_kg: 50 }, { reps: 7, weight_kg: 50 }, { reps: 6, weight_kg: 50 }], note: '' },
    { id: 'e2', exercise_id: 'sentadilla-profunda', session_date: isoDaysAgo(1), location: 'gimnasio', routine_id: null, routine_name: null, sets: [{ reps: 12 }, { reps: 10 }, { reps: 10 }], note: '' },
    { id: 'e3', exercise_id: 'flexiones-pecho', session_date: isoDaysAgo(3), location: 'casa', routine_id: null, routine_name: null, sets: [{ reps: 15 }, { reps: 12 }, { reps: 10 }], note: '' },
    { id: 'e4', exercise_id: 'dominadas-agarre-neutro', session_date: isoDaysAgo(4), location: 'parque', routine_id: null, routine_name: null, sets: [{ reps: 6 }, { reps: 5 }, { reps: 5 }], note: '' },
    { id: 'e5', exercise_id: 'press-banca-plano', session_date: isoDaysAgo(6), location: 'gimnasio', routine_id: null, routine_name: null, sets: [{ reps: 8, weight_kg: 47.5 }, { reps: 8, weight_kg: 47.5 }, { reps: 6, weight_kg: 47.5 }], note: '' },
  ]
}

function loadDemoLogs() {
  const raw = localStorage.getItem(DEMO_KEY)
  if (raw) return JSON.parse(raw)
  const seeded = seedDemoLogs()
  localStorage.setItem(DEMO_KEY, JSON.stringify(seeded))
  return seeded
}

function saveDemoLogs(logs) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(logs))
}

/**
 * Todos los registros de ejercicio del usuario (casa/parque/gimnasio
 * unificados). Sin filtrar por ejercicio a propósito — Calendario, KPIs e
 * Historial necesitan verlos todos, y el detalle de un ejercicio filtra
 * en el cliente (`logs.filter(l => l.exercise_id === id)`).
 */
export function useExerciseLogs() {
  const [logs, setLogs] = useState(isDemoMode ? loadDemoLogs() : [])
  const [loading, setLoading] = useState(!isDemoMode)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isDemoMode) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('exercise_logs')
        .select('*')
        .order('session_date', { ascending: false })
      if (cancelled) return
      if (err) setError(err.message)
      else setLogs(data ?? [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const addLog = useCallback(async (payload) => {
    if (isDemoMode) {
      const newLog = { id: `e${Date.now()}`, ...payload }
      const updated = [newLog, ...loadDemoLogs()]
      saveDemoLogs(updated)
      setLogs(updated)
      return newLog
    }
    const { data, error: err } = await supabase.from('exercise_logs').insert(payload).select().single()
    if (err) { setError(err.message); return null }
    setLogs((prev) => [data, ...prev])
    return data
  }, [])

  // inserta varias filas de una vez (una sesión con varios ejercicios)
  const addLogs = useCallback(async (entries) => {
    if (isDemoMode) {
      const newLogs = entries.map((e, i) => ({ id: `e${Date.now()}-${i}`, ...e }))
      const updated = [...newLogs, ...loadDemoLogs()]
      saveDemoLogs(updated)
      setLogs(updated)
      return newLogs
    }
    const { data, error: err } = await supabase.from('exercise_logs').insert(entries).select()
    if (err) { setError(err.message); return [] }
    setLogs((prev) => [...(data ?? []), ...prev])
    return data ?? []
  }, [])

  const updateLog = useCallback(async (id, payload) => {
    if (isDemoMode) {
      const updated = loadDemoLogs().map((l) => (l.id === id ? { ...l, ...payload } : l))
      saveDemoLogs(updated)
      setLogs(updated)
      return
    }
    const { data, error: err } = await supabase.from('exercise_logs').update(payload).eq('id', id).select().single()
    if (err) { setError(err.message); return }
    setLogs((prev) => prev.map((l) => (l.id === id ? data : l)))
  }, [])

  const deleteLog = useCallback(async (id) => {
    if (isDemoMode) {
      const updated = loadDemoLogs().filter((l) => l.id !== id)
      saveDemoLogs(updated)
      setLogs(updated)
      return
    }
    const { error: err } = await supabase.from('exercise_logs').delete().eq('id', id)
    if (err) { setError(err.message); return }
    setLogs((prev) => prev.filter((l) => l.id !== id))
  }, [])

  return { logs, loading, error, addLog, addLogs, updateLog, deleteLog, isDemoMode }
}
