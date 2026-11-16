import { useState } from 'react'

const EFFORT_LABELS = ['Muy suave', 'Suave', 'Moderado', 'Duro', 'Al límite']

function formatDateLabel(dateKey) {
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
}

function SessionCard({ session }) {
  const pace = session.distance_km && session.duration_min
    ? (session.duration_min / session.distance_km).toFixed(1)
    : null

  return (
    <div style={styles.sessionCard}>
      <div style={styles.sessionHeaderRow}>
        <span
          style={{
            ...styles.typeTag,
            color: session.activity_type === 'trote' ? 'var(--focus-teal)' : 'var(--thread-gold)',
            borderColor: session.activity_type === 'trote' ? 'var(--focus-teal)' : 'var(--thread-gold)',
          }}
        >
          {session.activity_type === 'trote' ? 'Trote' : 'Parque'}
        </span>
        {session.perceived_effort && (
          <span style={styles.effortLabel}>{EFFORT_LABELS[session.perceived_effort - 1]}</span>
        )}
      </div>
      <div style={styles.statsRow}>
        {session.distance_km != null && (
          <span style={styles.statItem}><b>{session.distance_km}</b> km</span>
        )}
        {session.duration_min != null && (
          <span style={styles.statItem}><b>{session.duration_min}</b> min</span>
        )}
        {pace && <span style={styles.statItem}><b>{pace}</b> min/km</span>}
      </div>
      {session.note && <p style={styles.note}>{session.note}</p>}
    </div>
  )
}

export default function DayDetailModal({ dateKey, existingSessions, onClose, onAdd }) {
  const [showForm, setShowForm] = useState(existingSessions.length === 0)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [effort, setEffort] = useState(null)
  const [note, setNote] = useState('')

  const handleSubmit = () => {
    onAdd({
      activity_type: 'trote',
      session_date: dateKey,
      distance_km: distance ? parseFloat(distance) : null,
      duration_min: duration ? parseInt(duration, 10) : null,
      perceived_effort: effort,
      note,
    })
    onClose()
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.handle} />
        <h2 style={styles.title}>{formatDateLabel(dateKey)}</h2>

        {existingSessions.length > 0 && (
          <div style={styles.sessionList}>
            {existingSessions.map((s) => <SessionCard key={s.id} session={s} />)}
          </div>
        )}

        {!showForm && (
          <button style={styles.addMoreBtn} onClick={() => setShowForm(true)}>
            + Agregar sesión
          </button>
        )}

        {showForm && (
          <>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Distancia (km)</label>
                <input
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="5.2"
                  inputMode="decimal"
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Duración (min)</label>
                <input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                  inputMode="numeric"
                  style={styles.input}
                />
              </div>
            </div>

            <label style={styles.label}>Esfuerzo percibido</label>
            <div style={styles.effortRow}>
              {EFFORT_LABELS.map((label, i) => (
                <button
                  key={label}
                  onClick={() => setEffort(i + 1)}
                  title={label}
                  style={{
                    ...styles.effortDot,
                    ...(effort === i + 1 ? styles.effortDotActive : {}),
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nota opcional (ruta, cómo te sentiste...)"
              style={styles.textarea}
              rows={2}
            />

            <div style={styles.actions}>
              <button onClick={onClose} style={styles.cancelBtn}>Cancelar</button>
              <button onClick={handleSubmit} style={styles.saveBtn}>Guardar</button>
            </div>
          </>
        )}

        {!showForm && (
          <button onClick={onClose} style={styles.closeBtn}>Cerrar</button>
        )}
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50,
  },
  sheet: {
    width: '100%', maxWidth: 480, background: 'var(--surface-raised)',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: '10px 20px 24px', boxShadow: '0 -8px 30px rgba(0,0,0,0.4)',
    maxHeight: '85vh', overflowY: 'auto',
  },
  handle: { width: 36, height: 4, borderRadius: 2, background: 'var(--thread-dim)', margin: '4px auto 16px' },
  title: {
    fontFamily: 'var(--font-display)', fontSize: 20, margin: '0 0 14px',
    fontWeight: 500, textTransform: 'capitalize',
  },
  sessionList: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 },
  sessionCard: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '12px 14px',
  },
  sessionHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  typeTag: {
    fontSize: 11, fontWeight: 600, border: '1px solid', borderRadius: 999,
    padding: '2px 10px', fontFamily: 'var(--font-mono)',
  },
  effortLabel: { fontSize: 11, color: 'var(--ink-muted)' },
  statsRow: { display: 'flex', gap: 14, fontFamily: 'var(--font-mono)', fontSize: 13 },
  statItem: { color: 'var(--ink-muted)' },
  note: { fontSize: 13, color: 'var(--ink-muted)', margin: '8px 0 0', lineHeight: 1.4 },
  addMoreBtn: {
    width: '100%', background: 'transparent', border: '1px dashed var(--border)',
    color: 'var(--ink-muted)', borderRadius: 10, padding: '10px', fontSize: 13,
    cursor: 'pointer', marginBottom: 6,
  },
  typeToggle: { display: 'flex', gap: 8, marginBottom: 14 },
  typeBtn: {
    flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--border)',
    background: 'var(--surface)', color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer',
  },
  typeBtnActiveTeal: { borderColor: 'var(--focus-teal)', color: 'var(--focus-teal)', background: 'var(--focus-teal-soft)' },
  typeBtnActiveGold: { borderColor: 'var(--thread-gold)', color: 'var(--thread-gold)', background: 'var(--thread-gold-soft)' },
  row: { display: 'flex', gap: 10, marginBottom: 10 },
  field: { flex: 1 },
  label: { fontSize: 11, color: 'var(--ink-muted)', display: 'block', marginBottom: 4 },
  input: {
    width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '10px 12px', color: 'var(--ink)', fontSize: 14,
  },
  effortRow: { display: 'flex', gap: 6, marginBottom: 12 },
  effortDot: {
    width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--border)',
    background: 'var(--surface)', color: 'var(--ink-muted)', fontSize: 12, cursor: 'pointer',
  },
  effortDotActive: { borderColor: 'var(--thread-gold)', color: 'var(--thread-gold)', background: 'var(--thread-gold-soft)' },
  textarea: {
    width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '10px 12px', color: 'var(--ink)', fontSize: 14,
    fontFamily: 'inherit', resize: 'none', marginBottom: 16,
  },
  actions: { display: 'flex', gap: 10 },
  cancelBtn: {
    flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer',
  },
  saveBtn: {
    flex: 2, padding: '12px', borderRadius: 10, border: 'none',
    background: 'var(--focus-teal)', color: '#0d1f1d', fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  closeBtn: {
    width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer', marginTop: 4,
  },
}
