import { Check, Clock, Timer, X } from 'lucide-react'

const OPTIONS = [
  { value: 'done', label: 'Lo hice, tal como estaba planeado', Icon: Check, color: 'var(--focus-teal)' },
  { value: 'done_different_time', label: 'Lo hice, pero en otro horario', Icon: Clock, color: 'var(--thread-gold)' },
  { value: 'done_shorter', label: 'Lo hice, pero por menos tiempo', Icon: Timer, color: 'var(--plan-orange)' },
]

export default function BlockStatusSheet({ block, onClose, onSetStatus }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.handle} />
        <h2 style={styles.title}>{block.is_flexible ? block.flexible_label : block.activity}</h2>
        <p style={styles.subtitle}>¿Cómo te fue con este bloque?</p>

        <div style={styles.options}>
          {OPTIONS.map(({ value, label, Icon, color }) => {
            const active = block.status === value
            return (
              <button
                key={value}
                style={{
                  ...styles.option,
                  borderColor: active ? color : 'var(--border)',
                  background: active ? `${color}18` : 'var(--surface)',
                }}
                onClick={() => { onSetStatus(value); onClose() }}
              >
                <Icon size={17} color={color} />
                <span style={{ color: active ? color : 'var(--ink)' }}>{label}</span>
              </button>
            )
          })}
        </div>

        {block.status && (
          <button style={styles.clearBtn} onClick={() => { onSetStatus(null); onClose() }}>
            <X size={13} /> Quitar marca
          </button>
        )}

        <button onClick={onClose} style={styles.cancelBtn}>Cerrar</button>
      </div>
    </div>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 },
  sheet: { width: '100%', maxWidth: 480, background: 'var(--surface-raised)', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: '10px 20px 24px', boxShadow: '0 -8px 30px rgba(0,0,0,0.4)', maxHeight: '85vh', overflowY: 'auto' },
  handle: { width: 36, height: 4, borderRadius: 2, background: 'var(--thread-dim)', margin: '4px auto 16px' },
  title: { fontFamily: 'var(--font-display)', fontSize: 18, margin: '0 0 4px', fontWeight: 500, color: 'var(--ink)' },
  subtitle: { fontSize: 12.5, color: 'var(--ink-muted)', margin: '0 0 16px' },
  options: { display: 'flex', flexDirection: 'column', gap: 8 },
  option: {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
    border: '1px solid', borderRadius: 12, padding: '13px 14px', fontSize: 13.5, cursor: 'pointer',
  },
  clearBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%',
    background: 'transparent', border: 'none', color: 'var(--ink-muted)', fontSize: 12.5,
    padding: '10px 0 0', cursor: 'pointer',
  },
  cancelBtn: {
    width: '100%', marginTop: 14, padding: '12px', borderRadius: 10, border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer',
  },
}
