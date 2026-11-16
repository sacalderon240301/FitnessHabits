import { useState } from 'react'
import { useGoodHabitsList } from '../hooks/useGoodHabitsList'
import HabitsListView from '../components/HabitsListView'
import HabitFormModal from '../components/HabitFormModal'
import GoodHabitDetail from './GoodHabitDetail'

export default function BuenosScreen() {
  const { habits, loading, addHabit, updateHabit, deleteHabit } = useGoodHabitsList()
  const [selectedId, setSelectedId] = useState(null)
  const [creating, setCreating] = useState(false)

  const selectedHabit = habits.find((h) => h.id === selectedId)

  if (selectedHabit) {
    return (
      <GoodHabitDetail
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
        emptyLabel="Todavía no tienes hábitos positivos registrados. Crea el primero."
        createLabel="Nuevo hábito positivo"
      />

      {creating && (
        <HabitFormModal
          kind="good"
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
