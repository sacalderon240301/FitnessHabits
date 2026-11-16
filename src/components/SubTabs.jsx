export default function SubTabs({ tabs, active, onChange }) {
  return (
    <div style={styles.tabRow}>
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          style={{ ...styles.tabBtn, ...(active === id ? styles.tabBtnActive : {}) }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

const styles = {
  tabRow: {
    display: 'flex', gap: 8, padding: '10px 20px 0', borderBottom: '1px solid var(--border)',
  },
  tabBtn: {
    flex: 1, background: 'transparent', border: 'none', color: 'var(--ink-muted)',
    padding: '10px 0', fontSize: 13, cursor: 'pointer', borderBottom: '2px solid transparent',
  },
  tabBtnActive: { color: 'var(--ink)', borderBottomColor: 'var(--thread-gold)', fontWeight: 600 },
}
