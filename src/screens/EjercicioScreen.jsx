import { useState } from 'react'
import { Home } from 'lucide-react'
import SubTabs from '../components/SubTabs'
import CalendarScreen from './CalendarScreen'
import TrotarScreen from './TrotarScreen'
import ExercisesScreen from './ExercisesScreen'

const TABS = [
  { id: 'calendario', label: 'Calendario' },
  { id: 'trotar', label: 'Trotar' },
  { id: 'ejercicios', label: 'Ejercicios' },
]

export default function EjercicioScreen({ initialTab = 'calendario', onGoHome }) {
  const [tab, setTab] = useState(initialTab)

  return (
    <>
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, margin: 0 }}>
          Ejercicio
        </h1>
        <button onClick={onGoHome} style={homeBtnStyle} aria-label="Volver al menú">
          <Home size={18} />
        </button>
      </div>

      <SubTabs tabs={TABS} active={tab} onChange={setTab} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {tab === 'calendario' && <CalendarScreen />}
        {tab === 'trotar' && <TrotarScreen />}
        {tab === 'ejercicios' && <ExercisesScreen />}
      </div>
    </>
  )
}

const homeBtnStyle = {
  width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--surface)', color: 'var(--ink-muted)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
}
