import { useCallback, useEffect, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'
import { todayIso, addDays } from '../lib/date'

const DEMO_KEY = 'habit-app-demo-water-logs'
export const DAILY_GOAL = 8 // vasos de 250ml ≈ 2L

function loadDemoLogs() {
  const raw = localStorage.getItem(DEMO_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveDemoLogs(logs) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(logs))
}

function computeStreak(logs) {
  const byDate = new Map(logs.map((l) => [l.logged_date, l.glasses]))
  let streak = 0
  let cursor = todayIso()
  while ((byDate.get(cursor) ?? 0) >= DAILY_GOAL) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

/**
 * Agua: un registro por día (upsert). `setGlasses` reemplaza el total de
 * hoy (así el tap de las botellitas puede "desmarcar" tocando la misma),
 * `addGlasses` suma/resta sobre lo que ya había (entrada manual).
 */
export function useWaterLog() {
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
        .from('water_logs')
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

  const today = todayIso()
  const todayGlasses = logs.find((l) => l.logged_date === today)?.glasses ?? 0

  const setGlasses = useCallback(async (glasses, loggedDate = todayIso()) => {
    const clamped = Math.max(0, glasses)
    if (isDemoMode) {
      const existing = loadDemoLogs().filter((l) => l.logged_date !== loggedDate)
      const updated = [...existing, { id: `w${Date.now()}`, logged_date: loggedDate, glasses: clamped }]
        .sort((a, b) => (a.logged_date < b.logged_date ? 1 : -1))
      saveDemoLogs(updated)
      setLogs(updated)
      return
    }
    const { data, error: err } = await supabase
      .from('water_logs')
      .upsert({ logged_date: loggedDate, glasses: clamped }, { onConflict: 'user_id,logged_date' })
      .select()
      .single()
    if (err) { setError(err.message); return }
    setLogs((prev) => [...prev.filter((l) => l.logged_date !== loggedDate), data].sort((a, b) => (a.logged_date < b.logged_date ? 1 : -1)))
  }, [])

  const addGlasses = useCallback((delta, loggedDate = todayIso()) => {
    const current = logs.find((l) => l.logged_date === loggedDate)?.glasses ?? 0
    return setGlasses(current + delta, loggedDate)
  }, [logs, setGlasses])

  return { logs, todayGlasses, streak: computeStreak(logs), loading, error, setGlasses, addGlasses, isDemoMode }
}
