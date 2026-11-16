import { useMemo, useState } from 'react'
import { Footprints, Dumbbell, ChevronRight } from 'lucide-react'
import { useActivitySessions } from '../hooks/useActivitySessions'
import { useExerciseCatalog } from '../hooks/useExerciseCatalog'
import { useExerciseLogs } from '../hooks/useExerciseLogs'
import { buildUnifiedDayMap } from '../lib/unifiedCalendar'
import TypeFilterChips from '../components/exercise/TypeFilterChips'
import UnifiedCalendar from '../components/exercise/UnifiedCalendar'
import DayExerciseSheet from '../components/exercises/DayExerciseSheet'
import DayDetailModal from '../components/outdoor/DayDetailModal'
import { todayIso } from '../lib/date'

function formatDate(dateKey) {
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function CalendarScreen() {
  const { sessions: troteSessions, addSession: addTroteSession } = useActivitySessions()
  const { catalog } = useExerciseCatalog()
  const { logs: exerciseLogs, addLog, updateLog, deleteLog } = useExerciseLogs()

  const [activeTypes, setActiveTypes] = useState(['trote', 'parque', 'casa', 'gym'])
  const [chooserDate, setChooserDate] = useState(null)
  const [troteDay, setTroteDay] = useState(null)
  const [exerciseDay, setExerciseDay] = useState(null)

  const dayMap = useMemo(
    () => buildUnifiedDayMap({ activitySessions: troteSessions, exerciseLogs }),
    [troteSessions, exerciseLogs]
  )

  const toggleType = (type) => {
    setActiveTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const summariesFor = (date) => {
    const troteMatches = troteSessions.filter((s) => s.session_date === date)
    const trote = troteMatches.length
      ? troteMatches.map((s) => `${s.distance_km ?? '—'}km · ${s.duration_min ?? '—'}min`).join(' · ')
      : 'Sin registro'

    const exMatches = exerciseLogs.filter((l) => l.session_date === date)
    const ejercicio = exMatches.length ? `${exMatches.length} ejercicio${exMatches.length === 1 ? '' : 's'} registrado${exMatches.length === 1 ? '' : 's'}` : 'Sin registro'

    return { trote, ejercicio }
  }

  const summaries = chooserDate ? summariesFor(chooserDate) : null

  return (
    <div style={{ padding: '16px 20px 90px' }}>
      <TypeFilterChips active={activeTypes} onToggle={toggleType} />

      <div style={{ marginTop: 16 }}>
        <UnifiedCalendar dayMap={dayMap} activeTypes={activeTypes} onSelectDay={setChooserDate} />
      </div>

      <button style={styles.todayBtn} onClick={() => setChooserDate(todayIso())}>
        Registrar el día de hoy
      </button>

      {chooserDate && summaries && (
        <div style={styles.overlay} onClick={() => setChooserDate(null)}>
          <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div style={styles.handle} />
            <h2 style={styles.title}>{formatDate(chooserDate)}</h2>

            <button style={styles.row} onClick={() => { setTroteDay(chooserDate); setChooserDate(null) }}>
              <div style={{ ...styles.iconWrap, background: 'var(--focus-teal-soft)' }}>
                <Footprints size={18} color="var(--focus-teal)" />
              </div>
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <h4 style={styles.rowTitle}>Trote</h4>
                <p style={styles.rowSummary}>{summaries.trote}</p>
              </div>
              <ChevronRight size={18} color="var(--ink-muted)" />
            </button>

            <button style={styles.row} onClick={() => { setExerciseDay(chooserDate); setChooserDate(null) }}>
              <div style={{ ...styles.iconWrap, background: 'var(--thread-gold-soft)' }}>
                <Dumbbell size={18} color="var(--thread-gold)" />
              </div>
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <h4 style={styles.rowTitle}>Ejercicio</h4>
                <p style={styles.rowSummary}>{summaries.ejercicio}</p>
              </div>
              <ChevronRight size={18} color="var(--ink-muted)" />
            </button>

            <button onClick={() => setChooserDate(null)} style={styles.closeBtn}>Cerrar</button>
          </div>
        </div>
      )}

      {troteDay && (
        <DayDetailModal
          dateKey={troteDay}
          existingSessions={troteSessions.filter((s) => s.session_date === troteDay)}
          onClose={() => setTroteDay(null)}
          onAdd={addTroteSession}
        />
      )}

      {exerciseDay && (
        <DayExerciseSheet
          date={exerciseDay}
          catalog={catalog}
          logsForDate={exerciseLogs.filter((l) => l.session_date === exerciseDay)}
          onAddLog={addLog}
          onUpdateLog={updateLog}
          onDeleteLog={deleteLog}
          onClose={() => setExerciseDay(null)}
        />
      )}
    </div>
  )
}

const styles = {
  todayBtn: {
    width: '100%', marginTop: 14, padding: '13px', borderRadius: 12, border: '1px dashed var(--border)',
    background: 'transparent', color: 'var(--ink-muted)', fontSize: 13, cursor: 'pointer',
  },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 },
  sheet: { width: '100%', maxWidth: 480, background: 'var(--surface-raised)', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: '10px 20px 24px', boxShadow: '0 -8px 30px rgba(0,0,0,0.4)' },
  handle: { width: 36, height: 4, borderRadius: 2, background: 'var(--thread-dim)', margin: '4px auto 16px' },
  title: { fontFamily: 'var(--font-display)', fontSize: 19, margin: '0 0 14px', fontWeight: 500, color: 'var(--ink)', textTransform: 'capitalize' },
  row: {
    display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
    padding: 12, marginBottom: 8, cursor: 'pointer',
  },
  iconWrap: { width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowTitle: { fontFamily: 'var(--font-display)', fontSize: 14.5, fontWeight: 500, margin: '0 0 2px', color: 'var(--ink)' },
  rowSummary: { fontSize: 12, color: 'var(--ink-muted)', margin: 0 },
  closeBtn: { width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer', marginTop: 4 },
}
