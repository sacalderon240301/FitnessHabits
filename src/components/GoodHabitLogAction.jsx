export default function GoodHabitLogAction({ onLog }) {
  return (
    <div style={styles.bar}>
      <button onClick={onLog} style={styles.btn}>Hoy sí lo hice</button>
    </div>
  )
}

const styles = {
  bar: {
    position: 'sticky', bottom: 0, padding: '14px 20px calc(14px + env(safe-area-inset-bottom))',
    background: 'linear-gradient(to top, var(--bg) 60%, transparent)',
  },
  btn: {
    width: '100%', padding: '15px', borderRadius: 14, border: 'none',
    background: 'var(--thread-gold)', color: '#221703', fontSize: 15, fontWeight: 700,
    cursor: 'pointer', boxShadow: '0 4px 16px rgba(227, 166, 62, 0.25)',
  },
}
