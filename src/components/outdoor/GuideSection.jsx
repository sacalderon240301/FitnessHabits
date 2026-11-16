import { outdoorGuide } from '../../data/outdoorGuide'

export default function GuideSection() {
  return (
    <div style={styles.wrap}>
      {outdoorGuide.map((item) => (
        <div key={item.id} style={styles.card}>
          <div style={styles.illustration}>
            <item.Illustration />
          </div>
          <div style={styles.content}>
            <span style={styles.category}>{item.category}</span>
            <h3 style={styles.cardTitle}>{item.title}</h3>
            <p style={styles.tip}>{item.tip}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: {
    display: 'flex',
    gap: 14,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: 14,
  },
  illustration: {
    width: 64,
    height: 64,
    flexShrink: 0,
  },
  content: { flex: 1, minWidth: 0 },
  category: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    textTransform: 'uppercase',
    color: 'var(--ink-muted)',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    fontWeight: 500,
    margin: '2px 0 6px',
  },
  tip: {
    fontSize: 13,
    color: 'var(--ink-muted)',
    lineHeight: 1.5,
    margin: 0,
  },
}
