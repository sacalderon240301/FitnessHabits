import { useState } from 'react'
import { Plus } from 'lucide-react'
import { setsSummary } from '../../lib/exerciseStats'
import { locationLabel } from '../../data/exerciseCatalog'
import ExerciseCatalogBrowser from './ExerciseCatalogBrowser'
import LogSetsModal from './LogSetsModal'

function formatDate(dateKey) {
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
}

/** Bottom sheet para un día del calendario: qué se registró + agregar/editar ejercicios de ese día. */
export default function DayExerciseSheet({ date, catalog, logsForDate, onAddLog, onUpdateLog, onDeleteLog, onClose }) {
  const [picking, setPicking] = useState(false)
  const [activeExercise, setActiveExercise] = useState(null)
  const [editingLog, setEditingLog] = useState(null)

  const exerciseFor = (id) => catalog.find((e) => e.id === id)

  if (picking) {
    return (
      <div style={styles.overlay} onClick={() => setPicking(false)}>
        <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
          <div style={styles.handle} />
          <h2 style={styles.title}>Agregar ejercicio</h2>
          <ExerciseCatalogBrowser catalog={catalog} onSelect={(ex) => { setActiveExercise(ex); setPicking(false) }} />
          <button onClick={() => setPicking(false)} style={styles.closeBtn}>Volver</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
          <div style={styles.handle} />
          <h2 style={styles.title}>{formatDate(date)}</h2>

          <div style={styles.list}>
            {logsForDate.length === 0 && <p style={styles.empty}>Sin ejercicios registrados este día.</p>}
            {logsForDate.map((log) => {
              const ex = exerciseFor(log.exercise_id)
              if (!ex) return null
              return (
                <button key={log.id} style={styles.row} onClick={() => setEditingLog(log)}>
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <h4 style={styles.rowName}>{ex.name}</h4>
                    <span style={styles.rowMeta}>{locationLabel(log.location)} · {setsSummary(log.sets)}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <button onClick={() => setPicking(true)} style={styles.addBtn}>
            <Plus size={14} /> Agregar ejercicio
          </button>
          <button onClick={onClose} style={styles.closeBtn}>Cerrar</button>
        </div>
      </div>

      {activeExercise && (
        <LogSetsModal exercise={activeExercise} date={date} onClose={() => setActiveExercise(null)} onSubmit={onAddLog} />
      )}
      {editingLog && (
        <LogSetsModal
          exercise={exerciseFor(editingLog.exercise_id)}
          existingLog={editingLog}
          onClose={() => setEditingLog(null)}
          onSubmit={(payload) => onUpdateLog(editingLog.id, payload)}
          onDelete={onDeleteLog}
        />
      )}
    </>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 },
  sheet: { width: '100%', maxWidth: 480, background: 'var(--surface-raised)', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: '10px 20px 24px', boxShadow: '0 -8px 30px rgba(0,0,0,0.4)', maxHeight: '85vh', overflowY: 'auto' },
  handle: { width: 36, height: 4, borderRadius: 2, background: 'var(--thread-dim)', margin: '4px auto 16px' },
  title: { fontFamily: 'var(--font-display)', fontSize: 19, margin: '0 0 14px', fontWeight: 500, color: 'var(--ink)', textTransform: 'capitalize' },
  list: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 },
  empty: { color: 'var(--ink-muted)', fontSize: 13.5, textAlign: 'center', padding: '10px 0' },
  row: {
    display: 'flex', alignItems: 'center', width: '100%', textAlign: 'left',
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px', cursor: 'pointer',
  },
  rowName: { fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 500, margin: '0 0 2px', color: 'var(--ink)' },
  rowMeta: { fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' },
  addBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%',
    padding: '11px', borderRadius: 10, border: '1px dashed var(--border)', background: 'transparent',
    color: 'var(--ink-muted)', fontSize: 13, cursor: 'pointer', marginBottom: 8,
  },
  closeBtn: { width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer' },
}
