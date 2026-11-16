import { useState } from 'react'

export default function HabitFormModal({ kind, habit, onClose, onSubmit, onDelete }) {
  const isBad = kind === 'bad'
  const [name, setName] = useState(habit?.name ?? '')
  const [description, setDescription] = useState(habit?.description ?? '')
  const [suggestionsText, setSuggestionsText] = useState(
    (habit?.replacement_suggestions ?? []).join('\n')
  )

  const handleSubmit = () => {
    if (!name.trim()) return
    const payload = { name: name.trim(), description: description.trim() }
    if (isBad) {
      payload.replacement_suggestions = suggestionsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    }
    onSubmit(payload)
    onClose()
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.handle} />
        <h2 style={styles.title}>{habit ? 'Editar hábito' : 'Nuevo hábito'}</h2>

        <label style={styles.label}>Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isBad ? 'Ej: Dejar de fumar' : 'Ej: Meditar 10 minutos'}
          style={styles.input}
        />

        <label style={styles.label}>Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.textarea}
          rows={2}
        />

        {isBad && (
          <>
            <label style={styles.label}>Actividades de reemplazo sugeridas (una por línea)</label>
            <textarea
              value={suggestionsText}
              onChange={(e) => setSuggestionsText(e.target.value)}
              style={styles.textarea}
              rows={4}
            />
          </>
        )}

        <div style={styles.actions}>
          {habit && onDelete && (
            <button
              onClick={() => { onDelete(habit.id); onClose() }}
              style={styles.deleteBtn}
            >
              Eliminar
            </button>
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
  sheet: { width: '100%', maxWidth: 480, background: 'var(--surface-raised)', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: '10px 20px 24px', boxShadow: '0 -8px 30px rgba(0,0,0,0.4)', maxHeight: '85vh', overflowY: 'auto' },
  handle: { width: 36, height: 4, borderRadius: 2, background: 'var(--thread-dim)', margin: '4px auto 16px' },
  title: { fontFamily: 'var(--font-display)', fontSize: 20, margin: '0 0 14px', fontWeight: 500 },
  label: { fontSize: 11, color: 'var(--ink-muted)', display: 'block', margin: '10px 0 4px' },
  input: { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--ink)', fontSize: 14 },
  textarea: { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--ink)', fontSize: 14, fontFamily: 'inherit', resize: 'none' },
  actions: { display: 'flex', gap: 10, marginTop: 16 },
  deleteBtn: { padding: '12px 14px', borderRadius: 10, border: '1px solid var(--slip-rust)', background: 'transparent', color: 'var(--slip-rust)', fontSize: 13, cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer' },
  saveBtn: { flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: 'var(--focus-teal)', color: '#0d1f1d', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
}
