export default function DayWeave({ days }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.row}>
        {days.map((day, i) => (
          <div key={day.key} style={styles.slot}>
            {i > 0 && <div style={styles.thread} />}
            <div
              style={{
                ...styles.node,
                ...(day.state === 'replacement' ? styles.nodeReplacement : {}),
                ...(day.state === 'slip' ? styles.nodeSlip : {}),
                ...(day.isToday ? styles.nodeToday : {}),
              }}
              title={day.key}
            />
          </div>
        ))}
      </div>
      <div style={styles.labelRow}>
        {days.map((day) => (
          <span
            key={day.key}
            style={{
              ...styles.label,
              ...(day.isToday ? { color: 'var(--ink)', fontWeight: 600 } : {}),
            }}
          >
            {day.label}
          </span>
        ))}
      </div>
    </div>
  )
}

const styles = {
  wrap: { width: '100%' },
  row: { display: 'flex', alignItems: 'center' },
  slot: { flex: 1, display: 'flex', alignItems: 'center', position: 'relative' },
  thread: {
    position: 'absolute',
    left: '-50%',
    width: '100%',
    height: 2,
    background: 'var(--thread-dim)',
    zIndex: 0,
  },
  node: {
    width: 14,
    height: 14,
    borderRadius: 6,
    background: 'transparent',
    border: '2px solid var(--thread-dim)',
    margin: '0 auto',
    zIndex: 1,
    transition: 'transform 0.25s ease, background 0.25s ease, border-color 0.25s ease',
  },
  nodeReplacement: {
    background: 'var(--thread-gold)',
    borderColor: 'var(--thread-gold)',
    transform: 'scale(1.15)',
  },
  nodeSlip: {
    background: 'transparent',
    borderColor: 'var(--slip-rust)',
  },
  nodeToday: {
    boxShadow: '0 0 0 3px var(--surface), 0 0 0 4px var(--ink-muted)',
  },
  labelRow: {
    display: 'flex',
    marginTop: 6,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--ink-muted)',
    textTransform: 'uppercase',
  },
}
