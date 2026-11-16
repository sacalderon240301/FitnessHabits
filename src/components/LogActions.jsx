export default function LogActions({ onReplacement, onSlip }) {
  return (
    <div style={styles.bar}>
      <button onClick={onSlip} style={styles.slipBtn}>
        Hoy recaí
      </button>
      <button onClick={onReplacement} style={styles.replacementBtn}>
        Hice algo distinto
      </button>
    </div>
  )
}

const styles = {
  bar: {
    position: 'sticky',
    bottom: 0,
    display: 'flex',
    gap: 10,
    padding: '14px 20px calc(14px + env(safe-area-inset-bottom))',
    background: 'linear-gradient(to top, var(--bg) 60%, transparent)',
  },
  slipBtn: {
    flex: 1,
    padding: '15px',
    borderRadius: 14,
    border: '1px solid var(--slip-rust)',
    background: 'var(--slip-rust-soft)',
    color: 'var(--slip-rust)',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  replacementBtn: {
    flex: 1.4,
    padding: '15px',
    borderRadius: 14,
    border: 'none',
    background: 'var(--focus-teal)',
    color: '#0d1f1d',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(79, 166, 156, 0.25)',
  },
}
