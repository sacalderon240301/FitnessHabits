export default function GoodStatsPanel({ stats }) {
  const { streak, bestStreak, totalDone } = stats

  return (
    <div style={styles.grid}>
      <Stat value={streak} label={streak === 1 ? 'día seguido' : 'días seguidos'} />
      <Stat value={bestStreak} label="mejor racha" />
      <Stat value={totalDone} label="veces registrado" />
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div style={styles.card}>
      <div style={styles.value}>{value}</div>
      <div style={styles.label}>{label}</div>
    </div>
  )
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '14px 8px', textAlign: 'center',
  },
  value: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, lineHeight: 1, color: 'var(--thread-gold)' },
  label: { marginTop: 6, fontSize: 11, color: 'var(--ink-muted)', lineHeight: 1.3 },
}
