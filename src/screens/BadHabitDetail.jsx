import { useMemo, useState } from 'react'
import { useBadHabitEvents } from '../hooks/useBadHabitEvents'
import { buildDayWeave, computeStats } from '../lib/stats'
import DetailHeader from '../components/DetailHeader'
import DayWeave from '../components/DayWeave'
import StatsPanel from '../components/StatsPanel'
import LogActions from '../components/LogActions'
import LogModal from '../components/LogModal'
import HabitFormModal from '../components/HabitFormModal'
import HabitEventHistoryList from '../components/HabitEventHistoryList'

export default function BadHabitDetail({ habit, onBack, onUpdate, onDelete }) {
  const { events, loading, error, logEvent, updateEvent, deleteEvent, isDemoMode } = useBadHabitEvents(habit.id)
  const [modalMode, setModalMode] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [editing, setEditing] = useState(false)

  const days = useMemo(() => buildDayWeave(events, 14), [events])
  const stats = useMemo(() => computeStats(events), [events])

  return (
    <>
      <DetailHeader
        title={habit.name}
        description={habit.description}
        isDemoMode={isDemoMode}
        onBack={onBack}
        onEdit={() => setEditing(true)}
      />

      {loading ? (
        <div style={{ padding: 40, color: 'var(--ink-muted)' }}>Cargando...</div>
      ) : error ? (
        <div style={{ padding: 40, color: 'var(--slip-rust)' }}>Algo falló hablando con Supabase: {error}</div>
      ) : (
        <>
          <section style={{ padding: '20px 20px 8px' }}>
            <DayWeave days={days} />
          </section>

          <section style={{ padding: '20px 20px 8px' }}>
            <StatsPanel stats={stats} />
          </section>

          <section style={{ padding: '12px 20px 8px' }}>
            <h3 style={styles.historyTitle}>Historial</h3>
            <HabitEventHistoryList events={events} variant="bad" onEdit={setEditingEvent} onDelete={deleteEvent} />
          </section>
        </>
      )}

      <div style={{ flex: 1 }} />

      <LogActions
        onReplacement={() => setModalMode('replacement')}
        onSlip={() => setModalMode('slip')}
      />

      {modalMode && (
        <LogModal
          mode={modalMode}
          suggestions={habit.replacement_suggestions ?? []}
          onClose={() => setModalMode(null)}
          onSubmit={logEvent}
        />
      )}

      {editingEvent && (
        <LogModal
          mode={editingEvent.event_type}
          suggestions={habit.replacement_suggestions ?? []}
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSubmit={(payload) => updateEvent(editingEvent.id, payload)}
          onDelete={deleteEvent}
        />
      )}

      {editing && (
        <HabitFormModal
          kind="bad"
          habit={habit}
          onClose={() => setEditing(false)}
          onSubmit={(payload) => onUpdate(habit.id, payload)}
          onDelete={(id) => { onDelete(id); onBack() }}
        />
      )}
    </>
  )
}

const styles = {
  historyTitle: { fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500, color: 'var(--ink)', margin: '0 0 10px' },
}
