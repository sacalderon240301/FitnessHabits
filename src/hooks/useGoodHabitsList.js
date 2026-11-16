import { useCallback, useEffect, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'

const DEMO_KEY = 'habit-app-demo-good-habits-list'

const SEED_HABITS = [
  { id: 'agua', name: 'Tomar 2L de agua', description: 'Llevar una botella conmigo y rellenarla durante el día.' },
  { id: 'leer', name: 'Leer 10 páginas', description: 'Antes de dormir, en vez del celular.' },
]

function loadDemoHabits() {
  const raw = localStorage.getItem(DEMO_KEY)
  if (raw) return JSON.parse(raw)
  localStorage.setItem(DEMO_KEY, JSON.stringify(SEED_HABITS))
  return SEED_HABITS
}

function saveDemoHabits(habits) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(habits))
}

/**
 * Lista de hábitos positivos (CRUD). Mismo patrón que useBadHabitsList.js
 * pero sin actividades de reemplazo (no aplica para hábitos positivos).
 */
export function useGoodHabitsList() {
  const [habits, setHabits] = useState(isDemoMode ? loadDemoHabits() : [])
  const [loading, setLoading] = useState(!isDemoMode)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isDemoMode) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('good_habits')
        .select('*')
        .order('created_at', { ascending: true })
      if (cancelled) return
      if (err) setError(err.message)
      else setHabits(data ?? [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const addHabit = useCallback(async (payload) => {
    if (isDemoMode) {
      const newHabit = { id: `h${Date.now()}`, ...payload }
      setHabits((prev) => {
        const updated = [...prev, newHabit]
        saveDemoHabits(updated)
        return updated
      })
      return newHabit
    }
    const { data, error: err } = await supabase
      .from('good_habits')
      .insert(payload)
      .select()
      .single()
    if (err) { setError(err.message); return null }
    setHabits((prev) => [...prev, data])
    return data
  }, [])

  const updateHabit = useCallback(async (habitId, payload) => {
    if (isDemoMode) {
      setHabits((prev) => {
        const updated = prev.map((h) => (h.id === habitId ? { ...h, ...payload } : h))
        saveDemoHabits(updated)
        return updated
      })
      return
    }
    const { data, error: err } = await supabase
      .from('good_habits')
      .update(payload)
      .eq('id', habitId)
      .select()
      .single()
    if (err) { setError(err.message); return }
    setHabits((prev) => prev.map((h) => (h.id === habitId ? data : h)))
  }, [])

  const deleteHabit = useCallback(async (habitId) => {
    if (isDemoMode) {
      setHabits((prev) => {
        const updated = prev.filter((h) => h.id !== habitId)
        saveDemoHabits(updated)
        return updated
      })
      return
    }
    const { error: err } = await supabase.from('good_habits').delete().eq('id', habitId)
    if (err) { setError(err.message); return }
    setHabits((prev) => prev.filter((h) => h.id !== habitId))
  }, [])

  return { habits, loading, error, addHabit, updateHabit, deleteHabit, isDemoMode }
}
