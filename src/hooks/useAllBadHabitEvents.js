import { useEffect, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'

// Misma clave que useBadHabitEvents.js — leemos TODOS los hábitos a la vez
// (sin filtrar por habit_id) para poder calcular KPIs agregados.
const DEMO_KEY = 'habit-app-demo-bad-events-v2'

function loadAllDemoEvents() {
  const raw = localStorage.getItem(DEMO_KEY)
  return raw ? JSON.parse(raw) : []
}

/**
 * Todos los eventos (recaída/reemplazo) de todos los hábitos malos.
 * Para el seguimiento de UN hábito específico, ver useBadHabitEvents(habitId).
 */
export function useAllBadHabitEvents() {
  const [events, setEvents] = useState(() => (isDemoMode ? loadAllDemoEvents() : []))
  const [loading, setLoading] = useState(!isDemoMode)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isDemoMode) {
      setEvents(loadAllDemoEvents())
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('habit_events')
        .select('*')
        .order('occurred_at', { ascending: false })
      if (cancelled) return
      if (err) setError(err.message)
      else setEvents(data ?? [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  return { events, loading, error }
}
