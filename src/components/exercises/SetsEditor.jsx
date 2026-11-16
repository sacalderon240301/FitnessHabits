import { Plus, Trash2 } from 'lucide-react'
import { emptySetRow } from '../../lib/setRows'

export default function SetsEditor({ rows, onChange, isTime, trackWeight }) {
  const updateRow = (i, field, value) => onChange(rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))
  const addRow = () => onChange([...rows, { ...emptySetRow(), weight_kg: rows[rows.length - 1]?.weight_kg ?? '' }])
  const removeRow = (i) => onChange(rows.length <= 1 ? rows : rows.filter((_, idx) => idx !== i))

  return (
    <div>
      <div style={styles.setsList}>
        {rows.map((row, i) => (
          <div key={i} style={styles.setRow}>
            <span style={styles.setIndex}>{i + 1}</span>
            {isTime ? (
              <input value={row.seconds} onChange={(e) => updateRow(i, 'seconds', e.target.value)} placeholder="Segundos" inputMode="numeric" style={styles.setInput} />
            ) : (
              <input value={row.reps} onChange={(e) => updateRow(i, 'reps', e.target.value)} placeholder="Reps" inputMode="numeric" style={styles.setInput} />
            )}
            {trackWeight && (
              <input value={row.weight_kg} onChange={(e) => updateRow(i, 'weight_kg', e.target.value)} placeholder="Kg" inputMode="decimal" style={styles.setInput} />
            )}
            <button onClick={() => removeRow(i)} style={styles.removeSetBtn} aria-label="Quitar serie" disabled={rows.length <= 1}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={addRow} style={styles.addSetBtn}>
        <Plus size={14} /> Agregar serie
      </button>
    </div>
  )
}

const styles = {
  setsList: { display: 'flex', flexDirection: 'column', gap: 8 },
  setRow: { display: 'flex', alignItems: 'center', gap: 8 },
  setIndex: { width: 20, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-muted)', flexShrink: 0 },
  setInput: { flex: 1, minWidth: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 10px', color: 'var(--ink)', fontSize: 14 },
  removeSetBtn: {
    width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent',
    color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  addSetBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', marginTop: 10,
    padding: '10px', borderRadius: 10, border: '1px dashed var(--border)', background: 'transparent',
    color: 'var(--ink-muted)', fontSize: 13, cursor: 'pointer',
  },
}
