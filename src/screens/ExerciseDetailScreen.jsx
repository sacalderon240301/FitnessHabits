import { useMemo, useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { muscleGroupLabel, locationLabel } from '../data/exerciseCatalog'
import { buildExerciseProgress } from '../lib/exerciseStats'
import ExerciseProgressChart from '../components/exercises/ExerciseProgressChart'
import LogSetsModal from '../components/exercises/LogSetsModal'

function formatDate(dateKey) {
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function ExerciseDetailScreen({ exercise, logs, onBack, onAddLog, onUpdateLog, onDeleteLog }) {
  const [logging, setLogging] = useState(false)
  const [editingLog, setEditingLog] = useState(null)

  const progress = useMemo(() => buildExerciseProgress(logs, exercise.id), [logs, exercise.id])

  const metric = exercise.trackWeight ? 'maxWeight' : exercise.tracking === 'time' ? 'maxSeconds' : 'maxReps'
  const unit = exercise.trackWeight ? 'kg' : exercise.tracking === 'time' ? 's' : ' reps'
  const chartPoints = progress.filter((p) => p[metric] != null).map((p) => ({ date: p.date, value: p[metric] }))

  const history = [...progress].reverse()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn} aria-label="Volver">
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={styles.meta}>{muscleGroupLabel(exercise.muscleGroup)}</span>
          <h1 style={styles.name}>{exercise.name}</h1>
        </div>
      </div>

      <div style={{ padding: '4px 20px 90px', flex: 1, overflowY: 'auto' }}>
        {exercise.tip && <p style={styles.tip}>{exercise.tip}</p>}

        <button style={styles.logBtn} onClick={() => setLogging(true)}>
          <Plus size={16} /> Registrar
        </button>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Progreso</h2>
          <ExerciseProgressChart points={chartPoints} unit={unit} />
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Historial</h2>
          {history.length === 0 ? (
            <p style={styles.empty}>Todavía no hay registros.</p>
          ) : (
            <div style={styles.historyList}>
              {history.map((h) => {
                const log = logs.find((l) => l.id === h.logId)
                return (
                  <button key={h.logId} style={styles.historyRow} onClick={() => setEditingLog(log)}>
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <div style={styles.historyHead}>
                        <span style={styles.historyDate}>{formatDate(h.date)}</span>
                        <span style={styles.historyLocation}>{locationLabel(h.location)}</span>
                      </div>
                      <span style={styles.historySummary}>{h.summary}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {logging && (
        <LogSetsModal
          exercise={exercise}
          onClose={() => setLogging(false)}
          onSubmit={onAddLog}
        />
      )}

      {editingLog && (
        <LogSetsModal
          exercise={exercise}
          existingLog={editingLog}
          onClose={() => setEditingLog(null)}
          onSubmit={(payload) => onUpdateLog(editingLog.id, payload)}
          onDelete={onDeleteLog}
        />
      )}
    </div>
  )
}

const styles = {
  header: { padding: '20px 20px 8px', display: 'flex', alignItems: 'flex-start', gap: 12 },
  backBtn: {
    width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--surface)', color: 'var(--ink-muted)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 2,
  },
  meta: { fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink-muted)', letterSpacing: 0.4 },
  name: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, margin: '3px 0 0', color: 'var(--ink)' },
  tip: { fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.5, margin: '4px 0 14px' },
  logBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
    padding: '13px', borderRadius: 12, border: 'none', background: 'var(--focus-teal)',
    color: '#0d1f1d', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 16,
  },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 16px 18px', marginBottom: 14 },
  cardTitle: { fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500, color: 'var(--ink)', margin: '0 0 12px' },
  empty: { color: 'var(--ink-muted)', fontSize: 13.5, margin: 0 },
  historyList: { display: 'flex', flexDirection: 'column', gap: 8 },
  historyRow: {
    display: 'flex', alignItems: 'center', textAlign: 'left', background: 'var(--surface-raised)',
    border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
  },
  historyHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  historyDate: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-muted)', textTransform: 'capitalize' },
  historyLocation: { fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--thread-gold)', textTransform: 'uppercase' },
  historySummary: { fontSize: 13.5, color: 'var(--ink)', marginTop: 3, display: 'block' },
}
