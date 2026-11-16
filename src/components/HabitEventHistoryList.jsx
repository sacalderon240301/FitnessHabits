import { Trash2, Pencil } from 'lucide-react'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function groupByDay(events) {
  const map = new Map()
  for (const e of events) {
    const key = e.occurred_at.slice(0, 10)
    const existing = map.get(key) ?? []
    existing.push(e)
    map.set(key, existing)
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, entries]) => ({ date, entries }))
}

// variant "bad": muestra recaída/reemplazo con color según tipo.
// variant "good": todos los eventos son "hoy sí lo hice".
export default function HabitEventHistoryList({ events, variant, onEdit, onDelete }) {
  const days = groupByDay(events)

  if (days.length === 0) {
    return <p style={styles.empty}>Todavía no hay historial registrado.</p>
  }

  return (
    <div style={styles.list}>
      {days.map(({ date, entries }) => (
        <div key={date} style={styles.card}>
          <span style={styles.date}>{formatDate(date + 'T00:00:00')}</span>
          <div style={styles.entryList}>
            {entries.map((e) => {
              const isSlip = variant === 'bad' && e.event_type === 'slip'
              const label = variant === 'good'
                ? 'Hoy sí lo hice'
                : isSlip ? 'Recaída' : `Reemplazo: ${e.activity ?? '—'}`
              return (
                <div key={e.id} style={styles.entryRow}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.entryHeadRow}>
                      <span style={{ ...styles.entryLabel, color: isSlip ? 'var(--slip-rust)' : 'var(--ink)' }}>
                        {label}
                      </span>
                      <span style={styles.entryTime}>{formatTime(e.occurred_at)}</span>
                    </div>
                    {e.note && <p style={styles.note}>{e.note}</p>}
                  </div>
                  {onEdit && (
                    <button style={styles.deleteBtn} onClick={() => onEdit(e)} aria-label="Editar registro">
                      <Pencil size={14} />
                    </button>
                  )}
                  {onDelete && (
                    <button style={styles.deleteBtn} onClick={() => onDelete(e.id)} aria-label="Borrar registro">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  empty: { color: 'var(--ink-muted)', fontSize: 14, textAlign: 'center', padding: '30px 10px' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 },
  date: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-muted)', textTransform: 'capitalize', display: 'block', marginBottom: 8 },
  entryList: { display: 'flex', flexDirection: 'column', gap: 8 },
  entryRow: { display: 'flex', alignItems: 'flex-start', gap: 8 },
  entryHeadRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  entryLabel: { fontSize: 13.5, fontWeight: 500 },
  entryTime: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-muted)', flexShrink: 0 },
  note: { fontSize: 12.5, color: 'var(--ink-muted)', margin: '3px 0 0', lineHeight: 1.4 },
  deleteBtn: {
    width: 26, height: 26, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent',
    color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
}
