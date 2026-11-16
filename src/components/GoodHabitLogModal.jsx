import { useState } from 'react'
import { toDatetimeLocal, fromDatetimeLocal } from '../lib/date'

export default function GoodHabitLogModal({ event, onClose, onSubmit, onDelete }) {
  const [note, setNote] = useState(event?.note ?? '')
  const [occurredAt, setOccurredAt] = useState(toDatetimeLocal(event?.occurred_at))

  const handleSubmit = () => {
    onSubmit({ note, occurred_at: fromDatetimeLocal(occurredAt) })
    onClose()
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.handle} />
        <h2 style={styles.title}>{event ? 'Editar registro' : 'Hoy sí lo hice 🎉'}</h2>
        <p style={styles.subtitle}>
          {event ? 'Corrige la fecha/hora o la nota de este registro.' : 'Nota opcional — algo que quieras recordar de hoy.'}
        </p>

        <label style={styles.label}>Fecha y hora</label>
        <input
          type="datetime-local"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          max={toDatetimeLocal()}
          style={styles.input}
        />

        <label style={styles.label}>Nota (opcional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ej: me costó al principio pero lo logré"
          style={styles.textarea}
          rows={3}
        />

        <div style={styles.actions}>
          {event && onDelete && (
            <button onClick={() => { onDelete(event.id); onClose() }} style={styles.deleteBtn}>Eliminar</button>
          )}
          <button onClick={onClose} style={styles.cancelBtn}>Cancelar</button>
          <button onClick={handleSubmit} style={styles.saveBtn}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 },
  sheet: { width: '100%', maxWidth: 480, background: 'var(--surface-raised)', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: '10px 20px 24px', boxShadow: '0 -8px 30px rgba(0,0,0,0.4)' },
  handle: { width: 36, height: 4, borderRadius: 2, background: 'var(--thread-dim)', margin: '4px auto 16px' },
  title: { fontFamily: 'var(--font-display)', fontSize: 22, margin: '0 0 6px', fontWeight: 500 },
  subtitle: { fontSize: 13, color: 'var(--ink-muted)', margin: '0 0 16px', lineHeight: 1.5 },
  label: { fontSize: 11, color: 'var(--ink-muted)', display: 'block', margin: '0 0 4px' },
  input: { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--ink)', fontSize: 14, marginBottom: 14 },
  textarea: { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--ink)', fontSize: 14, fontFamily: 'inherit', resize: 'none', marginBottom: 16 },
  actions: { display: 'flex', gap: 10 },
  deleteBtn: { padding: '12px 14px', borderRadius: 10, border: '1px solid var(--slip-rust)', background: 'transparent', color: 'var(--slip-rust)', fontSize: 13, cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer' },
  saveBtn: { flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: 'var(--thread-gold)', color: '#221703', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
}
