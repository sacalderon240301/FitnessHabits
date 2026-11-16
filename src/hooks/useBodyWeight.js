import { useCallback, useEffect, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'
import { todayIso } from '../lib/date'

const DEMO_KEY = 'habit-app-demo-body-weight'

function loadDemoLogs() {
  const raw = localStorage.getItem(DEMO_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveDemoLogs(logs) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(logs))
}

/**
 * Peso corporal: un registro por día (upsert si ya existe uno para hoy).
 * `latest` es el que se muestra como "peso actual" en el dashboard.
 */
export function useBodyWeight() {
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
        .from('body_weight_logs')
        .select('*')
        .order('logged_date', { ascending: false })
      if (cancelled) return
      if (err) setError(err.message)
      else setLogs(data ?? [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const logWeight = useCallback(async (weightKg, loggedDate = todayIso()) => {
    if (isDemoMode) {
      const existing = loadDemoLogs()
      const withoutDay = existing.filter((l) => l.logged_date !== loggedDate)
      const updated = [{ id: `w${Date.now()}`, logged_date: loggedDate, weight_kg: weightKg }, ...withoutDay]
        .sort((a, b) => (a.logged_date < b.logged_date ? 1 : -1))
      saveDemoLogs(updated)
      setLogs(updated)
      return updated[0]
    }
    const { data, error: err } = await supabase
      .from('body_weight_logs')
      .upsert({ logged_date: loggedDate, weight_kg: weightKg }, { onConflict: 'user_id,logged_date' })
      .select()
      .single()
    if (err) { setError(err.message); return null }
    setLogs((prev) => [data, ...prev.filter((l) => l.logged_date !== loggedDate)].sort((a, b) => (a.logged_date < b.logged_date ? 1 : -1)))
    return data
  }, [])

  const latest = logs[0] ?? null

  return { logs, latest, loading, error, logWeight, isDemoMode }
}
