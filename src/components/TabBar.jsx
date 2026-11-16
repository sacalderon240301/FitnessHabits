import { Home, Dumbbell, ListChecks, MoreHorizontal } from 'lucide-react'

const TABS = [
  { id: 'dashboard', label: 'Hoy', Icon: Home },
  { id: 'ejercicio', label: 'Entrenar', Icon: Dumbbell },
  { id: 'habitos', label: 'Hábitos', Icon: ListChecks },
  { id: 'mas', label: 'Más', Icon: MoreHorizontal },
]

export default function TabBar({ active, onChange }) {
  return (
    <nav style={styles.bar}>
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={styles.tab}
            aria-current={isActive}
          >
            <Icon
              size={20}
              strokeWidth={isActive ? 2.4 : 1.8}
              color={isActive ? 'var(--thread-gold)' : 'var(--ink-muted)'}
            />
            <span
              style={{
                ...styles.label,
                color: isActive ? 'var(--ink)' : 'var(--ink-muted)',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

const styles = {
  bar: {
    display: 'flex',
    borderTop: '1px solid var(--border)',
    background: 'var(--surface)',
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  tab: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    padding: '10px 0 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer',
  },
  label: {
    fontSize: 11,
  },
}
