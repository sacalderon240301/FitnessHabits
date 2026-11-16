import { useMemo, useState } from 'react'
import { useAllGoodHabitEvents } from '../hooks/useAllGoodHabitEvents'
import { useAllBadHabitEvents } from '../hooks/useAllBadHabitEvents'
import { useGoodHabitsList } from '../hooks/useGoodHabitsList'
import { useBadHabitsList } from '../hooks/useBadHabitsList'
import { buildHabitsDayMap } from '../lib/habitsCalendar'
import HabitsCalendar from '../components/habits/HabitsCalendar'
import HabitDayDetailSheet from '../components/habits/HabitDayDetailSheet'
import { todayIso } from '../lib/date'

export default function HabitsCalendarScreen() {
  const { events: goodEvents, loading: l1 } = useAllGoodHabitEvents()
  const { events: badEvents, loading: l2 } = useAllBadHabitEvents()
  const { habits: goodHabits, loading: l3 } = useGoodHabitsList()
  const { habits: badHabits, loading: l4 } = useBadHabitsList()

  const [selectedDay, setSelectedDay] = useState(null)

  const dayMap = useMemo(() => buildHabitsDayMap({ goodEvents, badEvents }), [goodEvents, badEvents])
  const loading = l1 || l2 || l3 || l4

  return (
    <div style={{ padding: '16px 20px 90px' }}>
      {loading ? (
        <p style={{ color: 'var(--ink-muted)' }}>Cargando...</p>
      ) : (
        <>
          <HabitsCalendar dayMap={dayMap} onSelectDay={setSelectedDay} />

          <button style={styles.todayBtn} onClick={() => setSelectedDay(todayIso())}>
            Ver el día de hoy
          </button>
        </>
      )}

      {selectedDay && (
        <HabitDayDetailSheet
          date={selectedDay}
          goodEvents={goodEvents}
          badEvents={badEvents}
          goodHabits={goodHabits}
          badHabits={badHabits}
          onClose={() => setSelectedDay(null)}
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
}
