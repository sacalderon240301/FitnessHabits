const TYPES = [
  { id: 'trote', label: 'Trote', color: 'var(--focus-teal)' },
  { id: 'parque', label: 'Parque', color: 'var(--thread-gold)' },
  { id: 'casa', label: 'Casa', color: 'var(--slip-rust)' },
  { id: 'gym', label: 'Gym', color: 'var(--plan-tan)' },
]

export default function TypeFilterChips({ active, onToggle }) {
  return (
    <div style={styles.row}>
      {TYPES.map(({ id, label, color }) => {
        const isActive = active.includes(id)
        return (
          <button
            key={id}
            onClick={() => onToggle(id)}
            style={{
              ...styles.chip,
              borderColor: isActive ? color : 'var(--border)',
              color: isActive ? color : 'var(--ink-muted)',
              background: isActive ? `${color}22` : 'transparent',
            }}
          >
            <span style={{ ...styles.dot, background: color, opacity: isActive ? 1 : 0.35 }} />
            {label}
          </button>
        )
      })}
    </div>
  )
}

const styles = {
  row: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  chip: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
    borderRadius: 999, border: '1px solid', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
}
