import { useEffect, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'

// Misma clave que useDayPlanBlocks.js — leemos TODOS los días a la vez (sin
// filtrar por plan_date) para poder calcular el % de cumplimiento del plan.
const DEMO_KEY = 'habit-app-demo-day-plan-blocks'

function loadAllDemoBlocks() {
  const raw = localStorage.getItem(DEMO_KEY)
  return raw ? JSON.parse(raw) : []
}

/**
 * Todos los bloques del planificador, de todos los días. Para un día
 * específico, ver useDayPlanBlocks(date).
 */
export function useAllDayPlanBlocks() {
  const [blocks, setBlocks] = useState(() => (isDemoMode ? loadAllDemoBlocks() : []))
  const [loading, setLoading] = useState(!isDemoMode)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isDemoMode) {
      setBlocks(loadAllDemoBlocks())
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('day_plan_blocks')
        .select('*')
        .order('plan_date', { ascending: false })
      if (cancelled) return
      if (err) setError(err.message)
      else setBlocks(data ?? [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  return { blocks, loading, error }
}
