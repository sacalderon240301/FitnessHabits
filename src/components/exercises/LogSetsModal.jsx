import { useState } from 'react'
import { todayIso } from '../../lib/date'
import { rowsFromSets, cleanSetRows } from '../../lib/setRows'
import { exerciseLocations } from '../../data/exerciseCatalog'
import SetsEditor from './SetsEditor'

export default function LogSetsModal({ exercise, date, existingLog, onClose, onSubmit, onDelete }) {
  const isTime = exercise.tracking === 'time'
  const [sessionDate, setSessionDate] = useState(existingLog?.session_date ?? date ?? todayIso())
  const [location, setLocation] = useState(existingLog?.location ?? exercise.defaultLocation ?? 'casa')
  const [customLocation, setCustomLocation] = useState(
    exerciseLocations.some((l) => l.id === (existingLog?.location ?? exercise.defaultLocation)) ? '' : (existingLog?.location ?? '')
  )
  const [usingCustomLocation, setUsingCustomLocation] = useState(
    !exerciseLocations.some((l) => l.id === (existingLog?.location ?? exercise.defaultLocation ?? 'casa'))
  )
  const [rows, setRows] = useState(() => rowsFromSets(existingLog?.sets))
  const [note, setNote] = useState(existingLog?.note ?? '')

  const handleSubmit = () => {
    const finalLocation = usingCustomLocation ? customLocation.trim() : location
    if (!finalLocation) return

    const cleanSets = cleanSetRows(rows, { isTime, trackWeight: exercise.trackWeight })
    if (cleanSets.length === 0) return

    onSubmit({
      exercise_id: exercise.id,
      session_date: sessionDate,
      location: finalLocation,
      sets: cleanSets,
      note: note.trim() || null,
    })
    onClose()
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.handle} />
        <h2 style={styles.title}>{exercise.name}</h2>

        <label style={styles.label}>Fecha</label>
        <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} style={styles.input} />

        <label style={styles.label}>Dónde lo hiciste</label>
        <div style={styles.toggle}>
          {exerciseLocations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => { setLocation(loc.id); setUsingCustomLocation(false) }}
              style={{ ...styles.toggleBtn, ...(!usingCustomLocation && location === loc.id ? styles.toggleBtnActive : {}) }}
            >
              {loc.label}
            </button>
          ))}
          <button
            onClick={() => setUsingCustomLocation(true)}
            style={{ ...styles.toggleBtn, ...(usingCustomLocation ? styles.toggleBtnActive : {}) }}
          >
            Otro
          </button>
        </div>
        {usingCustomLocation && (
          <input
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            placeholder="Ej: Airbnb, oficina..."
            style={{ ...styles.input, marginTop: 8 }}
          />
        )}

        <label style={{ ...styles.label, marginTop: 14 }}>Series</label>
        <SetsEditor rows={rows} onChange={setRows} isTime={isTime} trackWeight={exercise.trackWeight} />

        <label style={{ ...styles.label, marginTop: 14 }}>Nota (opcional)</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} style={styles.textarea} rows={2} placeholder="Cómo te sentiste, técnica, etc." />

        <div style={styles.actions}>
          {existingLog && onDelete && (
            <button onClick={() => { onDelete(existingLog.id); onClose() }} style={styles.deleteBtn}>Eliminar</button>
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
  sheet: { width: '100%', maxWidth: 480, background: 'var(--surface-raised)', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: '10px 20px 24px', boxShadow: '0 -8px 30px rgba(0,0,0,0.4)', maxHeight: '88vh', overflowY: 'auto' },
  handle: { width: 36, height: 4, borderRadius: 2, background: 'var(--thread-dim)', margin: '4px auto 16px' },
  title: { fontFamily: 'var(--font-display)', fontSize: 19, margin: '0 0 14px', fontWeight: 500, color: 'var(--ink)' },
  label: { fontSize: 11, color: 'var(--ink-muted)', display: 'block', margin: '10px 0 4px' },
  input: { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--ink)', fontSize: 14 },
  toggle: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  toggleBtn: { flex: '1 0 70px', padding: '9px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink-muted)', fontSize: 12.5, cursor: 'pointer' },
  toggleBtnActive: { borderColor: 'var(--thread-gold)', color: 'var(--thread-gold)', background: 'var(--thread-gold-soft)' },
  textarea: { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--ink)', fontSize: 14, fontFamily: 'inherit', resize: 'none' },
  actions: { display: 'flex', gap: 8, marginTop: 18 },
  deleteBtn: { padding: '12px 14px', borderRadius: 10, border: '1px solid var(--slip-rust)', background: 'transparent', color: 'var(--slip-rust)', fontSize: 13, cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer' },
  saveBtn: { flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: 'var(--plan-brown)', color: 'var(--plan-tan)', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
}
