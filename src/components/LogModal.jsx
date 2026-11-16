import { useState } from 'react'
import { toDatetimeLocal, fromDatetimeLocal } from '../lib/date'

export default function LogModal({ mode, suggestions, event, onClose, onSubmit, onDelete }) {
  const isReplacement = mode === 'replacement'
  const [activity, setActivity] = useState(event?.activity ?? '')
  const [note, setNote] = useState(event?.note ?? '')
  const [occurredAt, setOccurredAt] = useState(toDatetimeLocal(event?.occurred_at))

  const handleSubmit = () => {
    onSubmit({
      event_type: mode,
      activity: isReplacement ? activity || null : null,
      note,
      occurred_at: fromDatetimeLocal(occurredAt),
    })
    onClose()
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.handle} />
        <h2 style={styles.title}>
          {event ? 'Editar registro' : isReplacement ? 'Hice algo distinto' : 'Hoy recaí'}
        </h2>
        <p style={styles.subtitle}>
          {event
            ? 'Corrige la fecha/hora u otros datos de este registro.'
            : isReplacement
              ? '¿Qué hiciste en vez de la recaída?'
              : 'Está bien. Anotar esto también cuenta — es información, no un juicio.'}
        </p>

        <label style={styles.label}>Fecha y hora</label>
        <input
          type="datetime-local"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          max={toDatetimeLocal()}
          style={styles.input}
        />

        {isReplacement && (
          <div style={styles.chips}>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setActivity(s)}
                style={{
                  ...styles.chip,
                  ...(activity === s ? styles.chipActive : {}),
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {isReplacement && (
          <input
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="O escribe la tuya..."
            style={styles.input}
          />
        )}

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nota opcional (qué sentiste, qué lo disparó...)"
          style={styles.textarea}
          rows={3}
        />

        <div style={styles.actions}>
          {event && onDelete && (
            <button onClick={() => { onDelete(event.id); onClose() }} style={styles.deleteBtn}>Eliminar</button>
          )}
          <button onClick={onClose} style={styles.cancelBtn}>Cancelar</button>
          <button
            onClick={handleSubmit}
            style={{
              ...styles.saveBtn,
              background: isReplacement ? 'var(--focus-teal)' : 'var(--slip-rust)',
            }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 50,
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    background: 'var(--surface-raised)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: '10px 20px 24px',
    boxShadow: '0 -8px 30px rgba(0,0,0,0.4)',
    maxHeight: '88vh',
    overflowY: 'auto',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    background: 'var(--thread-dim)',
    margin: '4px auto 16px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    margin: '0 0 6px',
    fontWeight: 500,
  },
  subtitle: {
    fontSize: 13,
    color: 'var(--ink-muted)',
    margin: '0 0 16px',
    lineHeight: 1.5,
  },
  label: { fontSize: 11, color: 'var(--ink-muted)', display: 'block', margin: '0 0 4px' },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--ink)',
    borderRadius: 999,
    padding: '8px 14px',
    fontSize: 13,
    cursor: 'pointer',
  },
  chipActive: {
    background: 'var(--thread-gold-soft)',
    borderColor: 'var(--thread-gold)',
    color: 'var(--thread-gold)',
  },
  input: {
    width: '100%',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '10px 12px',
    color: 'var(--ink)',
    fontSize: 14,
    marginBottom: 10,
  },
  textarea: {
    width: '100%',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '10px 12px',
    color: 'var(--ink)',
    fontSize: 14,
    fontFamily: 'inherit',
    resize: 'none',
    marginBottom: 16,
  },
  actions: {
    display: 'flex',
    gap: 10,
  },
  deleteBtn: { padding: '12px 14px', borderRadius: 10, border: '1px solid var(--slip-rust)', background: 'transparent', color: 'var(--slip-rust)', fontSize: 13, cursor: 'pointer' },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--ink-muted)',
    fontSize: 14,
    cursor: 'pointer',
  },
  saveBtn: {
    flex: 2,
    padding: '12px',
    borderRadius: 10,
    border: 'none',
    color: '#12161c',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
}
