import { toDayKey } from '../../lib/date'

function formatDate(dateKey) {
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function habitName(habits, habitId) {
  return habits.find((h) => h.id === habitId)?.name ?? 'Hábito'
}

export default function HabitDayDetailSheet({ date, goodEvents, badEvents, goodHabits, badHabits, onClose }) {
  const dayGood = goodEvents.filter((e) => toDayKey(e.occurred_at) === date)
  const daySlips = badEvents.filter((e) => toDayKey(e.occurred_at) === date && e.event_type === 'slip')
  const dayReplacements = badEvents.filter((e) => toDayKey(e.occurred_at) === date && e.event_type !== 'slip')

  const isEmpty = dayGood.length === 0 && daySlips.length === 0 && dayReplacements.length === 0

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.handle} />
        <h2 style={styles.title}>{formatDate(date)}</h2>

        {isEmpty ? (
          <p style={styles.empty}>No hay registros este día.</p>
        ) : (
          <div style={styles.list}>
            {dayGood.map((e) => (
              <Row key={e.id} time={formatTime(e.occurred_at)} color="var(--focus-teal)" label={habitName(goodHabits, e.habit_id)} sub="Hoy sí lo hice" note={e.note} />
            ))}
            {dayReplacements.map((e) => (
              <Row key={e.id} time={formatTime(e.occurred_at)} color="var(--thread-gold)" label={habitName(badHabits, e.habit_id)} sub={`Reemplazo: ${e.activity ?? '—'}`} note={e.note} />
            ))}
            {daySlips.map((e) => (
              <Row key={e.id} time={formatTime(e.occurred_at)} color="var(--slip-rust)" label={habitName(badHabits, e.habit_id)} sub="Recaída" note={e.note} />
            ))}
          </div>
        )}

        <button onClick={onClose} style={styles.closeBtn}>Cerrar</button>
      </div>
    </div>
  )
}

function Row({ time, color, label, sub, note }) {
  return (
    <div style={styles.row}>
      <span style={{ ...styles.dot, background: color }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={styles.rowHead}>
          <span style={styles.rowLabel}>{label}</span>
          <span style={styles.rowTime}>{time}</span>
        </div>
        <span style={{ ...styles.rowSub, color }}>{sub}</span>
        {note && <p style={styles.note}>{note}</p>}
      </div>
    </div>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 },
  sheet: { width: '100%', maxWidth: 480, background: 'var(--surface-raised)', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: '10px 20px 24px', boxShadow: '0 -8px 30px rgba(0,0,0,0.4)', maxHeight: '75vh', overflowY: 'auto' },
  handle: { width: 36, height: 4, borderRadius: 2, background: 'var(--thread-dim)', margin: '4px auto 16px' },
  title: { fontFamily: 'var(--font-display)', fontSize: 18, margin: '0 0 14px', fontWeight: 500, color: 'var(--ink)', textTransform: 'capitalize' },
  empty: { color: 'var(--ink-muted)', fontSize: 14, textAlign: 'center', padding: '20px 10px' },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  row: { display: 'flex', gap: 10, alignItems: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, flexShrink: 0 },
  rowHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rowLabel: { fontSize: 14, fontWeight: 500, color: 'var(--ink)' },
  rowTime: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-muted)', flexShrink: 0 },
  rowSub: { fontSize: 12.5, display: 'block', marginTop: 2 },
  note: { fontSize: 12, color: 'var(--ink-muted)', margin: '3px 0 0', lineHeight: 1.4 },
  closeBtn: { width: '100%', marginTop: 18, padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer' },
}
