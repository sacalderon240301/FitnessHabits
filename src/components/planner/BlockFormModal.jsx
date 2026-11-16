import { useState } from 'react'
import { planCategories } from '../../data/planCategories'

export default function BlockFormModal({ block, suggestedStart, onClose, onSubmit, onDelete }) {
  const [isFlexible, setIsFlexible] = useState(block?.is_flexible ?? false)
  const [startTime, setStartTime] = useState(block?.start_time ?? suggestedStart ?? '')
  const [endTime, setEndTime] = useState(block?.end_time ?? '')
  const [activity, setActivity] = useState(block?.activity ?? '')
  const [category, setCategory] = useState(block?.category ?? planCategories[0].id)
  const [flexibleLabel, setFlexibleLabel] = useState(block?.flexible_label ?? '')

  const handleSubmit = () => {
    if (!startTime || !endTime) return
    if (isFlexible) {
      if (!flexibleLabel.trim()) return
      onSubmit({ start_time: startTime, end_time: endTime, is_flexible: true, flexible_label: flexibleLabel.trim(), activity: null, category: null })
    } else {
      if (!activity.trim()) return
      onSubmit({ start_time: startTime, end_time: endTime, is_flexible: false, activity: activity.trim(), category, flexible_label: null })
    }
    onClose()
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.handle} />
        <h2 style={styles.title}>{block ? 'Editar bloque' : 'Nuevo bloque'}</h2>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Hora inicio</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Hora fin</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={styles.input} />
          </div>
        </div>

        <div style={styles.toggle}>
          <button
            onClick={() => setIsFlexible(false)}
            style={{ ...styles.toggleBtn, ...(!isFlexible ? styles.toggleBtnActive : {}) }}
          >
            Actividad definida
          </button>
          <button
            onClick={() => setIsFlexible(true)}
            style={{ ...styles.toggleBtn, ...(isFlexible ? styles.toggleBtnActiveMuted : {}) }}
          >
            Bloque flexible
          </button>
        </div>

        {isFlexible ? (
          <>
            <label style={styles.label}>¿Para qué es este bloque?</label>
            <input
              value={flexibleLabel}
              onChange={(e) => setFlexibleLabel(e.target.value)}
              placeholder="Ej: Libre, Estudio, lo que salga de trabajo..."
              style={styles.input}
            />
          </>
        ) : (
          <>
            <label style={styles.label}>Actividad</label>
            <input
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="Ej: Leer, ordenar la casa, pendientes"
              style={styles.input}
            />

            <label style={styles.label}>Categoría</label>
            <div style={styles.categoryGrid}>
              {planCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    ...styles.categoryChip,
                    borderColor: category === cat.id ? cat.color : 'var(--border)',
                    color: category === cat.id ? cat.color : 'var(--ink-muted)',
                    background: category === cat.id ? `${cat.color}22` : 'transparent',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </>
        )}

        <div style={styles.actions}>
          {block && onDelete && (
            <button onClick={() => { onDelete(block.id); onClose() }} style={styles.deleteBtn}>Eliminar</button>
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
  title: { fontFamily: 'var(--font-display)', fontSize: 19, margin: '0 0 14px', fontWeight: 500, color: 'var(--ink)' },
  row: { display: 'flex', gap: 10, marginBottom: 12 },
  field: { flex: 1 },
  label: { fontSize: 11, color: 'var(--ink-muted)', display: 'block', margin: '10px 0 4px' },
  input: { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--ink)', fontSize: 14 },
  toggle: { display: 'flex', gap: 8, marginBottom: 4 },
  toggleBtn: { flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink-muted)', fontSize: 12.5, cursor: 'pointer' },
  toggleBtnActive: { borderColor: 'var(--thread-gold)', color: 'var(--thread-gold)', background: 'var(--thread-gold-soft)' },
  toggleBtnActiveMuted: { borderColor: 'var(--ink-muted)', color: 'var(--ink)', background: 'var(--surface-raised)' },
  categoryGrid: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  categoryChip: { padding: '6px 12px', borderRadius: 999, border: '1px solid', fontSize: 12, cursor: 'pointer' },
  actions: { display: 'flex', gap: 8, marginTop: 18 },
  deleteBtn: { padding: '12px 14px', borderRadius: 10, border: '1px solid var(--slip-rust)', background: 'transparent', color: 'var(--slip-rust)', fontSize: 13, cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer' },
  saveBtn: { flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: 'var(--focus-teal)', color: '#0d1f1d', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
}
