import { WeaveMark } from '../data/motionIcons'

export default function ComingSoon({ title, description }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.mascot}><WeaveMark /></div>
      <h2 style={styles.title}>{title}</h2>
      <p style={styles.description}>{description}</p>
      <span style={styles.badge}>Próximamente</span>
    </div>
  )
}

const styles = {
  wrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', padding: '60px 32px',
  },
  mascot: { width: 80, height: 80, opacity: 0.85, marginBottom: 16 },
  title: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, margin: '0 0 8px' },
  description: { color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.5, maxWidth: 280 },
  badge: {
    marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 11,
    color: 'var(--thread-gold)', border: '1px solid var(--thread-gold)',
    borderRadius: 999, padding: '4px 12px',
  },
}
