import { useMemo, useState } from 'react'
import { useActivitySessions } from '../hooks/useActivitySessions'
import { computeOutdoorStats } from '../lib/outdoorStats'
import { todayIso } from '../lib/date'
import ActivityCalendar from '../components/outdoor/ActivityCalendar'
import DayDetailModal from '../components/outdoor/DayDetailModal'
import GuideSection from '../components/outdoor/GuideSection'

export default function TrotarScreen() {
  const { sessions, loading, error, addSession, isDemoMode } = useActivitySessions()
  const [selectedDay, setSelectedDay] = useState(null)

  const stats = useMemo(() => computeOutdoorStats(sessions), [sessions])

  if (loading) return <div style={{ padding: 40, color: 'var(--ink-muted)' }}>Cargando...</div>
  if (error) {
    return <div style={{ padding: 40, color: 'var(--slip-rust)' }}>Algo falló hablando con Supabase: {error}</div>
  }

  return (
    <>
      <div style={{ padding: '16px 20px 8px' }}>
        {isDemoMode && <div style={styles.demoBadge}>Modo demo · datos locales</div>}
        <div style={styles.statsRow}>
          <Stat value={stats.sessionCount} label="sesiones este mes" />
          <Stat value={stats.totalKm} label="km este mes" />
        </div>
      </div>

      <div style={{ padding: '16px 20px 8px' }}>
        <ActivityCalendar
          sessions={sessions}
          onSelectDay={(key, daySessions) => setSelectedDay({ key, sessions: daySessions })}
        />
      </div>

      <div style={{ padding: '8px 20px 90px' }}>
        <h2 style={styles.sectionTitle}>Guía y técnica</h2>
        <GuideSection />
      </div>

      <div style={styles.fabWrap}>
        <button
          style={styles.fab}
          onClick={() => setSelectedDay({ key: todayIso(), sessions: sessions.filter((s) => s.session_date === todayIso()) })}
        >
          + Registrar trote de hoy
        </button>
      </div>

      {selectedDay && (
        <DayDetailModal
          dateKey={selectedDay.key}
          existingSessions={selectedDay.sessions}
          onClose={() => setSelectedDay(null)}
          onAdd={addSession}
        />
      )}
    </>
  )
}

function Stat({ value, label }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  )
}

const styles = {
  demoBadge: {
    display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 11,
    color: 'var(--focus-teal)', background: 'var(--focus-teal-soft)',
    border: '1px solid var(--focus-teal)', borderRadius: 999, padding: '3px 10px', marginBottom: 12,
  },
  statsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  statCard: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '14px 8px', textAlign: 'center',
  },
  statValue: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500, color: 'var(--focus-teal)' },
  statLabel: { marginTop: 4, fontSize: 11, color: 'var(--ink-muted)' },
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500, margin: '10px 0 12px' },
  fabWrap: {
    position: 'sticky', bottom: 0, padding: '14px 20px calc(14px + env(safe-area-inset-bottom))',
    background: 'linear-gradient(to top, var(--bg) 60%, transparent)',
  },
  fab: {
    width: '100%', padding: '15px', borderRadius: 14, border: 'none',
    background: 'var(--focus-teal)', color: '#0d1f1d', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', boxShadow: '0 4px 16px rgba(79, 166, 156, 0.25)',
  },
}
