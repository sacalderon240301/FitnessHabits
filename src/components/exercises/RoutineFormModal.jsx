import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { exerciseLocations } from '../../data/exerciseCatalog'
import ExerciseCatalogBrowser from './ExerciseCatalogBrowser'

export default function RoutineFormModal({ routine, catalog, onClose, onSubmit, onDelete }) {
  const [name, setName] = useState(routine?.name ?? '')
  const [location, setLocation] = useState(routine?.location ?? '')
  const [exerciseIds, setExerciseIds] = useState(routine?.exercise_ids ?? [])
  const [picking, setPicking] = useState(false)

  const selectedExercises = exerciseIds.map((id) => catalog.find((e) => e.id === id)).filter(Boolean)

  const addExercise = (ex) => {
    setExerciseIds((prev) => (prev.includes(ex.id) ? prev : [...prev, ex.id]))
    setPicking(false)
  }
  const removeExercise = (id) => setExerciseIds((prev) => prev.filter((x) => x !== id))

  const handleSubmit = () => {
    if (!name.trim() || exerciseIds.length === 0) return
    onSubmit({ name: name.trim(), location: location || null, exercise_ids: exerciseIds })
    onClose()
  }

  if (picking) {
    return (
      <div style={styles.overlay} onClick={() => setPicking(false)}>
        <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
          <div style={styles.handle} />
          <h2 style={styles.title}>Agregar ejercicio</h2>
          <ExerciseCatalogBrowser catalog={catalog} onSelect={addExercise} />
          <button onClick={() => setPicking(false)} style={styles.cancelBtn}>Volver</button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.handle} />
        <h2 style={styles.title}>{routine ? 'Editar rutina' : 'Nueva rutina'}</h2>

        <label style={styles.label}>Nombre de la rutina</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Empuje (pecho/hombro/tríceps)"
          style={styles.input}
        />

        <label style={styles.label}>Entorno sugerido (opcional)</label>
        <div style={styles.toggle}>
          {exerciseLocations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setLocation(location === loc.id ? '' : loc.id)}
              style={{ ...styles.toggleBtn, ...(location === loc.id ? styles.toggleBtnActive : {}) }}
            >
              {loc.label}
            </button>
          ))}
        </div>

        <label style={styles.label}>Ejercicios</label>
        <div style={styles.exerciseList}>
          {selectedExercises.length === 0 && <p style={styles.emptyHint}>Todavía no agregaste ejercicios.</p>}
          {selectedExercises.map((ex) => (
            <div key={ex.id} style={styles.exerciseRow}>
              <span style={styles.exerciseName}>{ex.name}</span>
              <button onClick={() => removeExercise(ex.id)} style={styles.removeBtn} aria-label="Quitar">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <button onClick={() => setPicking(true)} style={styles.addBtn}>
          <Plus size={14} /> Agregar ejercicio
        </button>

        <div style={styles.actions}>
          {routine && onDelete && (
            <button onClick={() => { onDelete(routine.id); onClose() }} style={styles.deleteBtn}>
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
  title: { fontFamily: 'var(--font-display)', fontSize: 20, margin: '0 0 14px', fontWeight: 500, color: 'var(--ink)' },
  label: { fontSize: 11, color: 'var(--ink-muted)', display: 'block', margin: '10px 0 4px' },
  input: { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--ink)', fontSize: 14 },
  toggle: { display: 'flex', gap: 8 },
  toggleBtn: { flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink-muted)', fontSize: 12.5, cursor: 'pointer' },
  toggleBtnActive: { borderColor: 'var(--thread-gold)', color: 'var(--thread-gold)', background: 'var(--thread-gold-soft)' },
  exerciseList: { display: 'flex', flexDirection: 'column', gap: 8 },
  emptyHint: { color: 'var(--ink-muted)', fontSize: 12.5, margin: '4px 0' },
  exerciseRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px',
  },
  exerciseName: { fontSize: 13.5, color: 'var(--ink)' },
  removeBtn: {
    width: 28, height: 28, flexShrink: 0, borderRadius: 8, border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer',
  },
  addBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', background: 'transparent',
    border: '1px dashed var(--border)', color: 'var(--ink-muted)', borderRadius: 10,
    padding: '10px 12px', fontSize: 13, cursor: 'pointer', marginTop: 10,
  },
  actions: { display: 'flex', gap: 10, marginTop: 18 },
  deleteBtn: { padding: '12px 14px', borderRadius: 10, border: '1px solid var(--slip-rust)', background: 'transparent', color: 'var(--slip-rust)', fontSize: 13, cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer' },
  saveBtn: { flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: 'var(--plan-brown)', color: 'var(--plan-tan)', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
}
