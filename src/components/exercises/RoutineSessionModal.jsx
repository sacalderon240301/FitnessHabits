import { useState } from 'react'
import { Plus, Check, Trash2 } from 'lucide-react'
import { todayIso } from '../../lib/date'
import { rowsFromSets, cleanSetRows } from '../../lib/setRows'
import { exerciseLocations } from '../../data/exerciseCatalog'
import SetsEditor from './SetsEditor'
import ExerciseCatalogBrowser from './ExerciseCatalogBrowser'
import CreateExerciseModal from './CreateExerciseModal'

function ExerciseSessionCard({ exercise, rows, onChange, saved, onSave, onDelete }) {
  return (
    <div style={styles.exerciseCard}>
      <div style={styles.exerciseHeadRow}>
        <h4 style={styles.exerciseName}>{exercise.name}</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {saved && <span style={styles.savedBadge}><Check size={12} /></span>}
          {saved && onDelete && (
            <button onClick={onDelete} style={styles.deleteIconBtn} aria-label="Eliminar">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <SetsEditor rows={rows} onChange={onChange} isTime={exercise.tracking === 'time'} trackWeight={exercise.trackWeight} />
      <button onClick={onSave} style={styles.saveRowBtn}>
        {saved ? 'Actualizar' : 'Guardar ejercicio'}
      </button>
    </div>
  )
}

/**
 * Registra una sesión completa: un entorno para todos, y series por
 * ejercicio (de la rutina, más los que se agreguen sueltos). Cada ejercicio
 * se guarda de forma incremental — útil para ir marcando mientras entrenas.
 */
export default function RoutineSessionModal({ routine, catalog, existingLogs = [], onAddLog, onUpdateLog, onDeleteLog, onCreateRoutine, onCreateExercise, onClose }) {
  const [sessionDate, setSessionDate] = useState(existingLogs[0]?.session_date ?? todayIso())
  const [location, setLocation] = useState(existingLogs[0]?.location ?? routine?.location ?? 'gimnasio')

  const routineExerciseIds = routine?.exercise_ids ?? []
  const loggedExerciseIds = existingLogs.map((l) => l.exercise_id)
  const [extraIds, setExtraIds] = useState(
    loggedExerciseIds.filter((id) => !routineExerciseIds.includes(id)).filter((id, i, arr) => arr.indexOf(id) === i)
  )
  const exerciseIds = [...routineExerciseIds, ...extraIds].filter((id, i, arr) => arr.indexOf(id) === i)
  const exercises = exerciseIds.map((id) => catalog.find((e) => e.id === id)).filter(Boolean)

  const [rowsByExercise, setRowsByExercise] = useState(() => {
    const initial = {}
    for (const id of exerciseIds) {
      const log = existingLogs.find((l) => l.exercise_id === id)
      initial[id] = rowsFromSets(log?.sets)
    }
    return initial
  })
  const [savedIds, setSavedIds] = useState(() => {
    const initial = {}
    for (const log of existingLogs) initial[log.exercise_id] = log.id
    return initial
  })
  const [picking, setPicking] = useState(false)
  const [creatingExercise, setCreatingExercise] = useState(false)
  const [showSaveAsRoutine, setShowSaveAsRoutine] = useState(false)
  const [routineName, setRoutineName] = useState(routine?.name ?? '')

  const rowsFor = (id) => rowsByExercise[id] ?? rowsFromSets(null)

  const handleSave = async (exercise) => {
    const rows = rowsFor(exercise.id)
    const cleanSets = cleanSetRows(rows, { isTime: exercise.tracking === 'time', trackWeight: exercise.trackWeight })
    if (cleanSets.length === 0) return
    const payload = {
      exercise_id: exercise.id,
      session_date: sessionDate,
      location,
      routine_id: routine?.id ?? null,
      routine_name: routine?.name ?? null,
      sets: cleanSets,
      note: null,
    }
    if (savedIds[exercise.id]) {
      await onUpdateLog(savedIds[exercise.id], payload)
    } else {
      const created = await onAddLog(payload)
      if (created) setSavedIds((prev) => ({ ...prev, [exercise.id]: created.id }))
    }
  }

  const handleDelete = async (exerciseId) => {
    const logId = savedIds[exerciseId]
    if (!logId) return
    await onDeleteLog(logId)
    setSavedIds((prev) => { const c = { ...prev }; delete c[exerciseId]; return c })
  }

  const addExtraExercise = (ex) => {
    if (!exerciseIds.includes(ex.id)) {
      setExtraIds((prev) => [...prev, ex.id])
      setRowsByExercise((prev) => ({ ...prev, [ex.id]: rowsFromSets(null) }))
    }
    setPicking(false)
  }

  const handleCreateExercise = (payload) => {
    if (!onCreateExercise) return
    onCreateExercise(payload).then((created) => {
      if (created) addExtraExercise(created)
    })
  }

  const handleSaveAsRoutine = async () => {
    if (!routineName.trim() || exerciseIds.length === 0 || !onCreateRoutine) return
    await onCreateRoutine({ name: routineName.trim(), location, exercise_ids: exerciseIds })
    setShowSaveAsRoutine(false)
  }

  if (picking) {
    const availableCatalog = catalog.filter((e) => !exerciseIds.includes(e.id))
    return (
      <div style={styles.overlay} onClick={() => setPicking(false)}>
        <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
          <div style={styles.handle} />
          <h2 style={styles.title}>Agregar ejercicio</h2>
          {exercises.length > 0 && (
            <div style={styles.alreadyAddedWrap}>
              <span style={styles.alreadyAddedLabel}>Ya tienes en esta sesión</span>
              <div style={styles.alreadyAddedRow}>
                {exercises.map((ex) => (
                  <span key={ex.id} style={styles.alreadyAddedChip}>
                    <Check size={11} />
                    {ex.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          <ExerciseCatalogBrowser
            catalog={availableCatalog}
            onSelect={addExtraExercise}
            onCreateNew={onCreateExercise ? () => setCreatingExercise(true) : undefined}
          />
          <button onClick={() => setPicking(false)} style={styles.cancelBtn}>Volver</button>
        </div>
        {creatingExercise && (
          <CreateExerciseModal
            onClose={() => { setCreatingExercise(false); setPicking(false) }}
            onSubmit={handleCreateExercise}
          />
        )}
      </div>
    )
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.handle} />
        <h2 style={styles.title}>{routine?.name ?? 'Sesión libre'}</h2>

        <div style={styles.topRow}>
          <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} style={styles.dateInput} />
          <div style={styles.locationChips}>
            {exerciseLocations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setLocation(loc.id)}
                style={{ ...styles.locationChip, ...(location === loc.id ? styles.locationChipActive : {}) }}
              >
                {loc.label}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.list}>
          {exercises.map((ex) => (
            <ExerciseSessionCard
              key={ex.id}
              exercise={ex}
              rows={rowsFor(ex.id)}
              onChange={(rows) => setRowsByExercise((prev) => ({ ...prev, [ex.id]: rows }))}
              saved={!!savedIds[ex.id]}
              onSave={() => handleSave(ex)}
              onDelete={() => handleDelete(ex.id)}
            />
          ))}
          {exercises.length === 0 && <p style={styles.emptyHint}>Agrega al menos un ejercicio para registrar la sesión.</p>}
        </div>

        <button onClick={() => setPicking(true)} style={styles.addBtn}>
          <Plus size={14} /> Agregar ejercicio
        </button>

        {onCreateRoutine && !routine && (
          !showSaveAsRoutine ? (
            <button onClick={() => setShowSaveAsRoutine(true)} style={styles.saveAsRoutineBtn}>
              Guardar esta sesión como rutina
            </button>
          ) : (
            <div style={styles.saveAsRoutineBox}>
              <label style={styles.label}>Nombre de la rutina</label>
              <input value={routineName} onChange={(e) => setRoutineName(e.target.value)} placeholder="Ej: Empuje" style={styles.dateInput} />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={() => setShowSaveAsRoutine(false)} style={styles.cancelBtn}>Cancelar</button>
                <button onClick={handleSaveAsRoutine} style={styles.doneBtn}>Guardar rutina</button>
              </div>
            </div>
          )
        )}

        <button onClick={onClose} style={styles.closeBtn}>Cerrar</button>
      </div>
    </div>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 },
  sheet: { width: '100%', maxWidth: 480, background: 'var(--surface-raised)', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: '10px 20px 24px', boxShadow: '0 -8px 30px rgba(0,0,0,0.4)', maxHeight: '88vh', overflowY: 'auto' },
  handle: { width: 36, height: 4, borderRadius: 2, background: 'var(--thread-dim)', margin: '4px auto 16px' },
  title: { fontFamily: 'var(--font-display)', fontSize: 19, margin: '0 0 12px', fontWeight: 500, color: 'var(--ink)' },
  alreadyAddedWrap: { marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 },
  alreadyAddedLabel: { fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.4, color: 'var(--ink-muted)' },
  alreadyAddedRow: { display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 },
  alreadyAddedChip: {
    display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0, whiteSpace: 'nowrap',
    border: '1px solid var(--focus-teal)', color: 'var(--focus-teal)', background: 'var(--focus-teal-soft)',
    borderRadius: 999, padding: '5px 10px', fontSize: 12,
  },
  topRow: { display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  dateInput: { flex: 1, minWidth: 130, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 10px', color: 'var(--ink)', fontSize: 13 },
  locationChips: { display: 'flex', gap: 6 },
  locationChip: { padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink-muted)', fontSize: 12.5, cursor: 'pointer' },
  locationChipActive: { borderColor: 'var(--thread-gold)', color: 'var(--thread-gold)', background: 'var(--thread-gold-soft)' },
  list: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10 },
  emptyHint: { color: 'var(--ink-muted)', fontSize: 13, textAlign: 'center', padding: '14px 0' },
  exerciseCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 12 },
  exerciseHeadRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 },
  exerciseName: { fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 500, margin: 0, color: 'var(--ink)' },
  savedBadge: { display: 'flex', color: 'var(--focus-teal)' },
  deleteIconBtn: { background: 'transparent', border: 'none', color: 'var(--slip-rust)', cursor: 'pointer', display: 'flex', padding: 2 },
  saveRowBtn: { width: '100%', marginTop: 10, padding: '9px', borderRadius: 8, border: 'none', background: 'var(--plan-brown)', color: 'var(--plan-tan)', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  addBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', background: 'transparent', border: '1px dashed var(--border)', color: 'var(--ink-muted)', borderRadius: 10, padding: '10px 12px', fontSize: 13, cursor: 'pointer', marginBottom: 12 },
  saveAsRoutineBtn: { width: '100%', padding: '11px', borderRadius: 10, border: '1px solid var(--thread-gold)', background: 'var(--thread-gold-soft)', color: 'var(--thread-gold)', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 12 },
  saveAsRoutineBox: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, marginBottom: 12 },
  label: { fontSize: 11, color: 'var(--ink-muted)', display: 'block', marginBottom: 4 },
  cancelBtn: { flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-muted)', fontSize: 13, cursor: 'pointer' },
  doneBtn: { flex: 2, padding: '10px', borderRadius: 8, border: 'none', background: 'var(--thread-gold)', color: '#221703', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  closeBtn: { width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer' },
}
