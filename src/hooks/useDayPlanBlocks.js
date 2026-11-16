import { useCallback, useEffect, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'
import { isoDate } from '../lib/date'

const DEMO_KEY = 'habit-app-demo-day-plan-blocks'

function seedDemoBlocks() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const date = isoDate(tomorrow)
  return [
    { id: 'b1', plan_date: date, start_time: '05:00', end_time: '05:25', activity: 'Desayuno', category: 'rutina', is_flexible: false },
    { id: 'b2', plan_date: date, start_time: '05:50', end_time: '07:20', activity: 'Parque — barras/calistenia', category: 'ejercicio', is_flexible: false },
    { id: 'b3', plan_date: date, start_time: '08:00', end_time: '09:00', activity: 'Tiempo libre / pendientes', category: 'preparacion', is_flexible: false },
    { id: 'b4', plan_date: date, start_time: '16:00', end_time: '17:20', activity: null, category: null, is_flexible: true, flexible_label: 'Bloque libre / lo que salga de trabajo' },
  ]
}

function loadDemoBlocks() {
  const raw = localStorage.getItem(DEMO_KEY)
  if (raw) return JSON.parse(raw)
  const seeded = seedDemoBlocks()
  localStorage.setItem(DEMO_KEY, JSON.stringify(seeded))
  return seeded
}

function saveDemoBlocks(blocks) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(blocks))
}

/**
 * Bloques del plan de UN día específico. "date" en formato 'YYYY-MM-DD'.
 */
export function useDayPlanBlocks(date) {
  const [blocks, setBlocks] = useState(() => {
    if (!isDemoMode) return []
    return loadDemoBlocks().filter((b) => b.plan_date === date)
  })
  const [loading, setLoading] = useState(!isDemoMode)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isDemoMode) {
      setBlocks(loadDemoBlocks().filter((b) => b.plan_date === date))
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('day_plan_blocks')
        .select('*')
        .eq('plan_date', date)
        .order('start_time', { ascending: true })
      if (cancelled) return
      if (err) setError(err.message)
      else setBlocks(data ?? [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [date])

  const addBlock = useCallback(async (payload) => {
    const fullPayload = { ...payload, plan_date: date }
    if (isDemoMode) {
      const newBlock = { id: `b${Date.now()}`, ...fullPayload }
      const all = loadDemoBlocks()
      const updated = [...all, newBlock]
      saveDemoBlocks(updated)
      setBlocks(updated.filter((b) => b.plan_date === date))
      return newBlock
    }
    const { data, error: err } = await supabase.from('day_plan_blocks').insert(fullPayload).select().single()
    if (err) { setError(err.message); return null }
    setBlocks((prev) => [...prev, data].sort((a, b) => a.start_time.localeCompare(b.start_time)))
    return data
  }, [date])

  const updateBlock = useCallback(async (id, payload) => {
    if (isDemoMode) {
      const all = loadDemoBlocks()
      const updated = all.map((b) => (b.id === id ? { ...b, ...payload } : b))
      saveDemoBlocks(updated)
      setBlocks(updated.filter((b) => b.plan_date === date))
      return
    }
    const { data, error: err } = await supabase.from('day_plan_blocks').update(payload).eq('id', id).select().single()
    if (err) { setError(err.message); return }
    setBlocks((prev) => prev.map((b) => (b.id === id ? data : b)).sort((a, b) => a.start_time.localeCompare(b.start_time)))
  }, [date])

  const addBlocks = useCallback(async (payloads) => {
    const fullPayloads = payloads.map((p) => ({ ...p, plan_date: date }))
    if (isDemoMode) {
      const newBlocks = fullPayloads.map((p, i) => ({ id: `b${Date.now()}-${i}`, ...p }))
      const all = loadDemoBlocks()
      const updated = [...all, ...newBlocks]
      saveDemoBlocks(updated)
      setBlocks(updated.filter((b) => b.plan_date === date))
      return newBlocks
    }
    const { data, error: err } = await supabase.from('day_plan_blocks').insert(fullPayloads).select()
    if (err) { setError(err.message); return null }
    setBlocks((prev) => [...prev, ...data].sort((a, b) => a.start_time.localeCompare(b.start_time)))
    return data
  }, [date])

  const deleteBlock = useCallback(async (id) => {
    if (isDemoMode) {
      const all = loadDemoBlocks()
      const updated = all.filter((b) => b.id !== id)
      saveDemoBlocks(updated)
      setBlocks(updated.filter((b) => b.plan_date === date))
      return
    }
    const { error: err } = await supabase.from('day_plan_blocks').delete().eq('id', id)
    if (err) { setError(err.message); return }
    setBlocks((prev) => prev.filter((b) => b.id !== id))
  }, [])

  return { blocks, loading, error, addBlock, addBlocks, updateBlock, deleteBlock, isDemoMode }
}
