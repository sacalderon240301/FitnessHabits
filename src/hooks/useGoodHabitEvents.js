import { useCallback, useEffect, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'

const DEMO_KEY = 'habit-app-demo-good-events'

function isoDaysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function seedAllEvents() {
  return [
    { id: 'g1', habit_id: 'agua', note: '', occurred_at: isoDaysAgo(0) },
    { id: 'g2', habit_id: 'agua', note: '', occurred_at: isoDaysAgo(1) },
    { id: 'g3', habit_id: 'agua', note: '', occurred_at: isoDaysAgo(2) },
    { id: 'g4', habit_id: 'leer', note: 'Capítulo 3 de un libro nuevo', occurred_at: isoDaysAgo(1) },
  ]
}

function loadAllDemoEvents() {
  const raw = localStorage.getItem(DEMO_KEY)
  if (raw) return JSON.parse(raw)
  const seeded = seedAllEvents()
  localStorage.setItem(DEMO_KEY, JSON.stringify(seeded))
  return seeded
}

function saveAllDemoEvents(events) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(events))
}

/**
 * Eventos ("hoy sí lo hice") de UN hábito positivo específico.
 */
export function useGoodHabitEvents(habitId) {
  const [events, setEvents] = useState(() => {
    if (!isDemoMode) return []
    return loadAllDemoEvents().filter((e) => e.habit_id === habitId)
  })
  const [loading, setLoading] = useState(!isDemoMode)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isDemoMode) {
      setEvents(loadAllDemoEvents().filter((e) => e.habit_id === habitId))
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('good_habit_events')
        .select('*')
        .eq('habit_id', habitId)
        .order('occurred_at', { ascending: false })
      if (cancelled) return
      if (err) setError(err.message)
      else setEvents(data ?? [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [habitId])

  const logDone = useCallback(async ({ note, occurred_at } = {}) => {
    if (isDemoMode) {
      const newEvent = {
        id: `g${Date.now()}`,
        habit_id: habitId,
        note: note ?? '',
        occurred_at: occurred_at ?? new Date().toISOString(),
      }
      const all = loadAllDemoEvents()
      const updated = [newEvent, ...all].sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at))
      saveAllDemoEvents(updated)
      setEvents(updated.filter((e) => e.habit_id === habitId))
      return
    }

    const { data, error: insertErr } = await supabase
      .from('good_habit_events')
      .insert({ habit_id: habitId, note, occurred_at })
      .select()
      .single()

    if (insertErr) { setError(insertErr.message); return }
    setEvents((prev) => [data, ...prev].sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at)))
  }, [habitId])

  const updateEvent = useCallback(async (id, payload) => {
    if (isDemoMode) {
      const all = loadAllDemoEvents()
      const updated = all.map((e) => (e.id === id ? { ...e, ...payload } : e))
        .sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at))
      saveAllDemoEvents(updated)
      setEvents(updated.filter((e) => e.habit_id === habitId))
      return
    }
    const { data, error: err } = await supabase.from('good_habit_events').update(payload).eq('id', id).select().single()
    if (err) { setError(err.message); return }
    setEvents((prev) => prev.map((e) => (e.id === id ? data : e)).sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at)))
  }, [habitId])

  const deleteEvent = useCallback(async (id) => {
    if (isDemoMode) {
      const all = loadAllDemoEvents()
      const updated = all.filter((e) => e.id !== id)
      saveAllDemoEvents(updated)
      setEvents(updated.filter((e) => e.habit_id === habitId))
      return
    }
    const { error: err } = await supabase.from('good_habit_events').delete().eq('id', id)
    if (err) { setError(err.message); return }
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [habitId])

  return { events, loading, error, logDone, updateEvent, deleteEvent, isDemoMode }
}
