import { ArrowLeft } from 'lucide-react'

export default function DetailHeader({ title, description, isDemoMode, onBack, onEdit }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.topRow}>
        <button onClick={onBack} style={styles.backBtn} aria-label="Volver">
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          {isDemoMode && <div style={styles.demoBadge}>Modo demo · datos locales</div>}
        </div>
        {onEdit && <button onClick={onEdit} style={styles.editBtn}>Editar</button>}
      </div>
      <h1 style={styles.name}>{title}</h1>
      {description && <p style={styles.description}>{description}</p>}
    </div>
  )
}

const styles = {
  wrap: { padding: '16px 20px 8px' },
  topRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  backBtn: {
    width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--surface)', color: 'var(--ink)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  demoBadge: {
    display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 11,
    color: 'var(--focus-teal)', background: 'var(--focus-teal-soft)',
    border: '1px solid var(--focus-teal)', borderRadius: 999, padding: '3px 10px',
  },
  editBtn: {
    flexShrink: 0, background: 'transparent', border: '1px solid var(--border)',
    color: 'var(--ink-muted)', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer',
  },
  name: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, margin: '0 0 0 42px' },
  description: { color: 'var(--ink-muted)', fontSize: 14, margin: '8px 0 0 42px', lineHeight: 1.5 },
}
