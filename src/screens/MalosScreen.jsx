import { useState } from 'react'
import { useBadHabitsList } from '../hooks/useBadHabitsList'
import HabitsListView from '../components/HabitsListView'
import HabitFormModal from '../components/HabitFormModal'
import BadHabitDetail from './BadHabitDetail'

export default function MalosScreen() {
  const { habits, loading, addHabit, updateHabit, deleteHabit } = useBadHabitsList()
  const [selectedId, setSelectedId] = useState(null)
  const [creating, setCreating] = useState(false)

  const selectedHabit = habits.find((h) => h.id === selectedId)

  if (selectedHabit) {
    return (
      <BadHabitDetail
        habit={selectedHabit}
        onBack={() => setSelectedId(null)}
        onUpdate={updateHabit}
        onDelete={deleteHabit}
      />
    )
  }

  if (loading) {
    return <div style={{ padding: 40, color: 'var(--ink-muted)' }}>Cargando...</div>
  }

  return (
    <>
      <HabitsListView
        habits={habits}
        onSelect={(h) => setSelectedId(h.id)}
        onCreate={() => setCreating(true)}
        emptyLabel="Todavía no tienes hábitos registrados. Crea el primero."
        createLabel="Nuevo hábito a dejar"
      />

      {creating && (
        <HabitFormModal
          kind="bad"
          habit={null}
          onClose={() => setCreating(false)}
          onSubmit={async (payload) => {
            const created = await addHabit(payload)
            if (created) setSelectedId(created.id)
          }}
        />
      )}
    </>
  )
}
