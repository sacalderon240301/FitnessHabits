export default function StatsPanel({ stats }) {
  const { streak, daysSinceSlip, totalReplacements } = stats

  return (
    <div style={styles.grid}>
      <Stat
        value={streak}
        label={streak === 1 ? 'día seguido' : 'días seguidos'}
        accent="gold"
      />
      <Stat
        value={daysSinceSlip ?? '—'}
        label="desde la última recaída"
        accent="teal"
      />
      <Stat
        value={totalReplacements}
        label="reemplazos totales"
        accent="muted"
      />
    </div>
  )
}

function Stat({ value, label, accent }) {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.value, color: colors[accent] }}>{value}</div>
      <div style={styles.label}>{label}</div>
    </div>
  )
}

const colors = {
  gold: 'var(--thread-gold)',
  teal: 'var(--focus-teal)',
  muted: 'var(--ink)',
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '14px 8px',
    textAlign: 'center',
  },
  value: {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    fontWeight: 500,
    lineHeight: 1,
  },
  label: {
    marginTop: 6,
    fontSize: 11,
    color: 'var(--ink-muted)',
    lineHeight: 1.3,
  },
}
