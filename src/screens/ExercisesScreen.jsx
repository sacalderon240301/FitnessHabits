import { useState } from 'react'
import { useExerciseCatalog } from '../hooks/useExerciseCatalog'
import { useExerciseLogs } from '../hooks/useExerciseLogs'
import { useExerciseRoutines } from '../hooks/useExerciseRoutines'
import SubTabs from '../components/SubTabs'
import ExerciseCatalogBrowser from '../components/exercises/ExerciseCatalogBrowser'
import CreateExerciseModal from '../components/exercises/CreateExerciseModal'
import ExerciseDetailScreen from './ExerciseDetailScreen'
import RoutineListView from '../components/exercises/RoutineListView'
import RoutineFormModal from '../components/exercises/RoutineFormModal'
import RoutineSessionModal from '../components/exercises/RoutineSessionModal'
import SessionHistoryList from '../components/exercises/SessionHistoryList'

const TABS = [
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'rutinas', label: 'Rutinas' },
  { id: 'historial', label: 'Historial' },
]

export default function ExercisesScreen() {
  const [tab, setTab] = useState('catalogo')
  const { catalog, loading: l1, addExercise, setExercisePhoto, isDemoMode } = useExerciseCatalog()
  const { logs, loading: l2, addLog, updateLog, deleteLog } = useExerciseLogs()
  const { routines, loading: l3, addRoutine, updateRoutine, deleteRoutine } = useExerciseRoutines()

  const [selectedExerciseId, setSelectedExerciseId] = useState(null)
  const [creatingExercise, setCreatingExercise] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState(undefined) // undefined = cerrado, null = creando, obj = editando
  const [activeSession, setActiveSession] = useState(undefined) // undefined = cerrado, { routine, existingLogs }

  const loading = l1 || l2 || l3
  const selectedExercise = catalog.find((e) => e.id === selectedExerciseId)

  if (selectedExercise) {
    return (
      <ExerciseDetailScreen
        exercise={selectedExercise}
        logs={logs}
        onBack={() => setSelectedExerciseId(null)}
        onAddLog={addLog}
        onUpdateLog={updateLog}
        onDeleteLog={deleteLog}
        onSetPhoto={setExercisePhoto}
      />
    )
  }

  if (loading) {
    return <div style={{ padding: 40, color: 'var(--ink-muted)' }}>Cargando...</div>
  }

  const openSessionFromHistory = (session) => {
    const realRoutine = session.routineId ? routines.find((r) => r.id === session.routineId) : null
    const virtualRoutine = !realRoutine && session.routineName !== 'Sesión libre'
      ? { id: session.routineId, name: session.routineName, location: session.location, exercise_ids: [] }
      : null
    setActiveSession({ routine: realRoutine ?? virtualRoutine, existingLogs: session.logs })
  }

  return (
    <>
      <SubTabs tabs={TABS} active={tab} onChange={setTab} />
      <div style={{ padding: '16px 20px 90px', flex: 1, overflowY: 'auto' }}>
        {isDemoMode && <div style={styles.demoBadge}>Modo demo · datos locales</div>}

        {tab === 'catalogo' && (
          <ExerciseCatalogBrowser
            catalog={catalog}
            onSelect={(ex) => setSelectedExerciseId(ex.id)}
            onCreateNew={() => setCreatingExercise(true)}
          />
        )}

        {tab === 'rutinas' && (
          <RoutineListView
            routines={routines}
            onStartSession={(routine) => setActiveSession({ routine, existingLogs: [] })}
            onEdit={(routine) => setEditingRoutine(routine)}
            onCreate={() => setEditingRoutine(null)}
          />
        )}

        {tab === 'historial' && (
          <SessionHistoryList logs={logs} catalog={catalog} onOpenSession={openSessionFromHistory} />
        )}
      </div>

      {creatingExercise && (
        <CreateExerciseModal onClose={() => setCreatingExercise(false)} onSubmit={addExercise} />
      )}

      {editingRoutine !== undefined && (
        <RoutineFormModal
          routine={editingRoutine}
          catalog={catalog}
          onClose={() => setEditingRoutine(undefined)}
          onSubmit={(payload) => (editingRoutine ? updateRoutine(editingRoutine.id, payload) : addRoutine(payload))}
          onDelete={editingRoutine ? deleteRoutine : undefined}
        />
      )}

      {activeSession !== undefined && (
        <RoutineSessionModal
          routine={activeSession.routine}
          catalog={catalog}
          existingLogs={activeSession.existingLogs}
          onAddLog={addLog}
          onUpdateLog={updateLog}
          onDeleteLog={deleteLog}
          onCreateRoutine={addRoutine}
          onCreateExercise={addExercise}
          onClose={() => setActiveSession(undefined)}
        />
      )}
    </>
  )
}

const styles = {
  demoBadge: {
    display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 11,
    color: 'var(--focus-teal)', background: 'var(--focus-teal-soft)',
    border: '1px solid var(--focus-teal)', borderRadius: 999, padding: '3px 10px', marginBottom: 12,
  },
}
