import { useCallback, useEffect, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'
import { isoDate } from '../lib/date'

const DEMO_KEY = 'habit-app-demo-activity-sessions'

function seedDemoSessions() {
  const today = new Date()
  const daysAgo = (n) => {
    const d = new Date(today)
    d.setDate(d.getDate() - n)
    return isoDate(d)
  }
  return [
    { id: 's1', activity_type: 'trote', session_date: daysAgo(1), distance_km: 5.2, duration_min: 32, perceived_effort: 3, note: 'Trote suave por la mañana' },
    { id: 's2', activity_type: 'trote', session_date: daysAgo(3), distance_km: 6.5, duration_min: 38, perceived_effort: 3, note: '' },
    { id: 's3', activity_type: 'trote', session_date: daysAgo(6), distance_km: 8, duration_min: 48, perceived_effort: 4, note: '' },
  ]
}

function loadDemoSessions() {
  const raw = localStorage.getItem(DEMO_KEY)
  if (raw) return JSON.parse(raw)
  const seeded = seedDemoSessions()
  localStorage.setItem(DEMO_KEY, JSON.stringify(seeded))
  return seeded
}

function saveDemoSessions(sessions) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(sessions))
}

/**
 * Hook central del módulo "trote y parque".
 * Expone: sessions, loading, error, addSession(), updateSession()
 * Mismo patrón demo/Supabase que useHabitEvents.js — compáralos.
 */
export function useActivitySessions() {
  const [sessions, setSessions] = useState(isDemoMode ? loadDemoSessions() : [])
  const [loading, setLoading] = useState(!isDemoMode)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isDemoMode) return

    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('activity_sessions')
        .select('*')
        .order('session_date', { ascending: false })

      if (cancelled) return
      if (err) setError(err.message)
      else setSessions(data ?? [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const addSession = useCallback(async (payload) => {
    if (isDemoMode) {
      const newSession = { id: `s${Date.now()}`, ...payload }
      setSessions((prev) => {
        const updated = [newSession, ...prev]
        saveDemoSessions(updated)
        return updated
      })
      return
    }

    const { data, error: err } = await supabase
      .from('activity_sessions')
      .insert(payload)
      .select()
      .single()

    if (err) { setError(err.message); return }
    setSessions((prev) => [data, ...prev])
  }, [])

  const updateSession = useCallback(async (id, payload) => {
    if (isDemoMode) {
      setSessions((prev) => {
        const updated = prev.map((s) => (s.id === id ? { ...s, ...payload } : s))
        saveDemoSessions(updated)
        return updated
      })
      return
    }

    const { data, error: err } = await supabase
      .from('activity_sessions')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (err) { setError(err.message); return }
    setSessions((prev) => prev.map((s) => (s.id === id ? data : s)))
  }, [])

  return { sessions, loading, error, addSession, updateSession, isDemoMode }
}
