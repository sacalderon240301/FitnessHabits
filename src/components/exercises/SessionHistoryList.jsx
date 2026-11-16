import { groupLogsBySession, setsSummary } from '../../lib/exerciseStats'
import { locationLabel } from '../../data/exerciseCatalog'

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
}

function exerciseName(catalog, id) {
  return catalog.find((e) => e.id === id)?.name ?? id
}

export default function SessionHistoryList({ logs, catalog, onOpenSession }) {
  const sessions = groupLogsBySession(logs)

  if (sessions.length === 0) {
    return <p style={styles.empty}>Todavía no has registrado ninguna sesión.</p>
  }

  return (
    <div style={styles.list}>
      {sessions.map((session, i) => (
        <button key={i} style={styles.card} onClick={() => onOpenSession(session)}>
          <div style={styles.headerRow}>
            <span style={styles.date}>{formatDateLabel(session.date)}</span>
            <span style={styles.routineName}>{session.routineName} · {locationLabel(session.location)}</span>
          </div>
          <div style={styles.exerciseList}>
            {session.logs.map((log) => (
              <div key={log.id} style={styles.exerciseRow}>
                <span>{exerciseName(catalog, log.exercise_id)}</span>
                <span style={styles.exerciseStats}>{setsSummary(log.sets)}</span>
              </div>
            ))}
          </div>
          <span style={styles.tapHint}>Toca para editar o agregar ejercicios</span>
        </button>
      ))}
    </div>
  )
}

const styles = {
  empty: { color: 'var(--ink-muted)', fontSize: 14, textAlign: 'center', padding: '30px 10px' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: {
    display: 'block', width: '100%', textAlign: 'left', background: 'var(--surface)',
    border: '1px solid var(--border)', borderRadius: 12, padding: 14, cursor: 'pointer',
  },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8 },
  date: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-muted)', textTransform: 'capitalize' },
  routineName: { fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 500, color: 'var(--ink)', textAlign: 'right' },
  exerciseList: { display: 'flex', flexDirection: 'column', gap: 4 },
  exerciseRow: { display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, color: 'var(--ink-muted)' },
  exerciseStats: { fontFamily: 'var(--font-mono)', color: 'var(--ink)', textAlign: 'right', flexShrink: 0 },
  tapHint: { display: 'block', marginTop: 8, fontSize: 11, color: 'var(--ink-muted)', opacity: 0.7 },
}
