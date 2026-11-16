import { useMemo, useState } from 'react'
import { useGoodHabitEvents } from '../hooks/useGoodHabitEvents'
import { buildGoodHabitWeave, computeGoodHabitStats } from '../lib/goodHabitStats'
import DetailHeader from '../components/DetailHeader'
import DayWeave from '../components/DayWeave'
import GoodStatsPanel from '../components/GoodStatsPanel'
import GoodHabitLogAction from '../components/GoodHabitLogAction'
import GoodHabitLogModal from '../components/GoodHabitLogModal'
import HabitFormModal from '../components/HabitFormModal'
import HabitEventHistoryList from '../components/HabitEventHistoryList'

export default function GoodHabitDetail({ habit, onBack, onUpdate, onDelete }) {
  const { events, loading, error, logDone, updateEvent, deleteEvent, isDemoMode } = useGoodHabitEvents(habit.id)
  const [showLogModal, setShowLogModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [editing, setEditing] = useState(false)

  const days = useMemo(() => buildGoodHabitWeave(events, 14), [events])
  const stats = useMemo(() => computeGoodHabitStats(events), [events])

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
            <GoodStatsPanel stats={stats} />
          </section>

          <section style={{ padding: '12px 20px 8px' }}>
            <h3 style={styles.historyTitle}>Historial</h3>
            <HabitEventHistoryList events={events} variant="good" onEdit={setEditingEvent} onDelete={deleteEvent} />
          </section>
        </>
      )}

      <div style={{ flex: 1 }} />

      <GoodHabitLogAction onLog={() => setShowLogModal(true)} />

      {showLogModal && (
        <GoodHabitLogModal
          onClose={() => setShowLogModal(false)}
          onSubmit={logDone}
        />
      )}

      {editingEvent && (
        <GoodHabitLogModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSubmit={(payload) => updateEvent(editingEvent.id, payload)}
          onDelete={deleteEvent}
        />
      )}

      {editing && (
        <HabitFormModal
          kind="good"
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
