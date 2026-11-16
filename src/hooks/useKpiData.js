import { useActivitySessions } from './useActivitySessions'
import { useExerciseLogs } from './useExerciseLogs'
import { useAllBadHabitEvents } from './useAllBadHabitEvents'
import { useAllGoodHabitEvents } from './useAllGoodHabitEvents'
import { useAllDayPlanBlocks } from './useAllDayPlanBlocks'
import { isDemoMode } from '../lib/supabase'

/**
 * Junta todas las fuentes de datos que necesitan los KPIs. Reutiliza los
 * hooks existentes de cada módulo en vez de duplicar lógica de fetch.
 */
export function useKpiData() {
  const { sessions: troteSessions, loading: l1 } = useActivitySessions()
  const { logs: exerciseLogs, loading: l2 } = useExerciseLogs()
  const { events: badEvents, loading: l3 } = useAllBadHabitEvents()
  const { events: goodEvents, loading: l4 } = useAllGoodHabitEvents()
  const { blocks: planBlocks, loading: l5 } = useAllDayPlanBlocks()

  return {
    troteSessions,
    exerciseLogs,
    badEvents,
    goodEvents,
    planBlocks,
    loading: l1 || l2 || l3 || l4 || l5,
    isDemoMode,
  }
}
