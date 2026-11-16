import { useState } from 'react'
import { Home } from 'lucide-react'
import SubTabs from '../components/SubTabs'
import MalosScreen from './MalosScreen'
import BuenosScreen from './BuenosScreen'
import HabitsCalendarScreen from './HabitsCalendarScreen'

const TABS = [
  { id: 'malos', label: 'Malos' },
  { id: 'buenos', label: 'Buenos' },
  { id: 'calendario', label: 'Calendario' },
]

export default function HabitosScreen({ initialTab = 'malos', onGoHome }) {
  const [tab, setTab] = useState(initialTab)

  return (
    <>
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, margin: 0 }}>
          Hábitos
        </h1>
        <button onClick={onGoHome} style={homeBtnStyle} aria-label="Volver al menú">
          <Home size={18} />
        </button>
      </div>

      <SubTabs tabs={TABS} active={tab} onChange={setTab} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {tab === 'malos' && <MalosScreen />}
        {tab === 'buenos' && <BuenosScreen />}
        {tab === 'calendario' && <HabitsCalendarScreen />}
      </div>
    </>
  )
}

const homeBtnStyle = {
  width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--surface)', color: 'var(--ink-muted)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
}
