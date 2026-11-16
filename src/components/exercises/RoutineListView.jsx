import { ChevronRight, Plus, Pencil } from 'lucide-react'
import { locationLabel } from '../../data/exerciseCatalog'

export default function RoutineListView({ routines, onStartSession, onEdit, onCreate }) {
  return (
    <div>
      <div style={styles.list}>
        {routines.length === 0 && <p style={styles.empty}>Todavía no tienes rutinas guardadas.</p>}
        {routines.map((r) => (
          <div key={r.id} style={styles.card}>
            <button style={styles.cardMain} onClick={() => onStartSession(r)}>
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <span style={styles.meta}>{r.exercise_ids.length} ejercicio{r.exercise_ids.length === 1 ? '' : 's'}{r.location ? ` · ${locationLabel(r.location)}` : ''}</span>
                <h3 style={styles.name}>{r.name}</h3>
              </div>
              <ChevronRight size={18} color="var(--ink-muted)" style={{ flexShrink: 0 }} />
            </button>
            <button style={styles.editBtn} onClick={() => onEdit(r)} aria-label="Editar rutina">
              <Pencil size={14} />
            </button>
          </div>
        ))}
        <button style={styles.freeBtn} onClick={() => onStartSession(null)}>
          Sesión libre (sin rutina)
        </button>
      </div>
      <button style={styles.createBtn} onClick={onCreate}>
        <Plus size={16} />
        Nueva rutina
      </button>
    </div>
  )
}

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 },
  empty: { color: 'var(--ink-muted)', fontSize: 14, textAlign: 'center', padding: '20px 10px' },
  card: { display: 'flex', alignItems: 'stretch', gap: 8 },
  cardMain: {
    flex: 1, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 14, padding: '14px 16px', cursor: 'pointer', minWidth: 0,
  },
  editBtn: {
    width: 44, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface)',
    color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  meta: { fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink-muted)', letterSpacing: 0.4 },
  name: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500, margin: '3px 0 0', color: 'var(--ink)' },
  freeBtn: {
    textAlign: 'center', background: 'transparent', border: '1px dashed var(--border)',
    borderRadius: 14, padding: 14, color: 'var(--ink-muted)', fontSize: 13, cursor: 'pointer',
  },
  createBtn: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '13px', borderRadius: 12, border: '1px dashed var(--border)',
    background: 'transparent', color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer',
  },
}
