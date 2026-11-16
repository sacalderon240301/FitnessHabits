import { CalendarClock, Gauge, Droplet, HelpCircle, LogOut } from 'lucide-react'

const ITEMS = [
  { id: 'planificador', Icon: CalendarClock, title: 'Mi día', description: 'Planea mañana en bloques de tiempo — actividad definida o libre.' },
  { id: 'kpis', Icon: Gauge, title: 'KPIs', description: 'Consistencia física, balance de hábitos y patrones entre ejercicio y recaídas.' },
  { id: 'agua', Icon: Droplet, title: 'Agua', description: 'Tus vasos de hoy, racha, y el resumen de la semana.' },
]

export default function MasScreen({ onNavigate, userEmail, onLogout, onOpenManual }) {
  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>Más</h1>

      <div style={styles.list}>
        {ITEMS.map(({ id, Icon, title, description }) => (
          <button key={id} style={styles.card} onClick={() => onNavigate(id)}>
            <div style={styles.iconWrap}><Icon size={20} color="var(--thread-gold)" /></div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <h3 style={styles.cardTitle}>{title}</h3>
              <p style={styles.cardDescription}>{description}</p>
            </div>
          </button>
        ))}
      </div>

      <button style={styles.manualBtn} onClick={onOpenManual}>
        <HelpCircle size={16} />
        ¿Cómo funciona esto?
      </button>

      {onLogout && (
        <div style={styles.account}>
          {userEmail && <span style={styles.accountEmail}>{userEmail}</span>}
          <button style={styles.logoutBtn} onClick={onLogout}>
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

const styles = {
  wrap: { flex: 1, display: 'flex', flexDirection: 'column', padding: '22px 20px 24px', overflowY: 'auto' },
  title: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, margin: '0 0 16px' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: {
    display: 'flex', gap: 14, alignItems: 'flex-start', textAlign: 'left',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 14, padding: 14, cursor: 'pointer',
  },
  iconWrap: {
    width: 38, height: 38, borderRadius: 10, background: 'var(--thread-gold-soft)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardTitle: { fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500, color: 'var(--ink)', margin: '2px 0 4px' },
  cardDescription: { fontSize: 12.5, color: 'var(--ink-muted)', lineHeight: 1.45, margin: 0 },
  manualBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', marginTop: 14, padding: '12px', borderRadius: 12,
    border: '1px dashed var(--border)', background: 'transparent',
    color: 'var(--ink-muted)', fontSize: 13, cursor: 'pointer',
  },
  account: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)',
  },
  accountEmail: { fontSize: 11.5, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'transparent', border: 'none', color: 'var(--slip-rust)',
    fontSize: 12.5, cursor: 'pointer', textDecoration: 'underline',
  },
}
