import { useCallback, useEffect, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'

const DEMO_KEY = 'habit-app-demo-bad-habits-list'

const SEED_HABITS = [
  {
    id: 'unas',
    name: 'Dejar de morderme las uñas',
    description: 'Cada vez que sienta el impulso, hago otra cosa con las manos.',
    replacement_suggestions: ['Apretar una pelota antiestrés', 'Lavarme las manos', 'Escribir en un papel qué siento', 'Salir a caminar 5 minutos'],
  },
  {
    id: 'celular-cama',
    name: 'Revisar el celular en la cama',
    description: 'Antes de dormir, dejo el celular fuera del cuarto.',
    replacement_suggestions: ['Leer unas páginas de un libro', 'Escribir 3 cosas del día', 'Estirar 5 minutos'],
  },
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
 * Lista de hábitos que quieres dejar (CRUD). Para el seguimiento día a día
 * de un hábito específico, ver useBadHabitEvents(habitId).
 */
export function useBadHabitsList() {
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
        .from('bad_habits')
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
      const newHabit = { id: `h${Date.now()}`, replacement_suggestions: [], ...payload }
      setHabits((prev) => {
        const updated = [...prev, newHabit]
        saveDemoHabits(updated)
        return updated
      })
      return newHabit
    }
    const { data, error: err } = await supabase
      .from('bad_habits')
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
      .from('bad_habits')
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
    const { error: err } = await supabase.from('bad_habits').delete().eq('id', habitId)
    if (err) { setError(err.message); return }
    setHabits((prev) => prev.filter((h) => h.id !== habitId))
  }, [])

  return { habits, loading, error, addHabit, updateHabit, deleteHabit, isDemoMode }
}
