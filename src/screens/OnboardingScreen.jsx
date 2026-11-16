import { ListChecks, Footprints, Dumbbell, CalendarClock, Gauge, HelpCircle } from 'lucide-react'
import { WeaveMark } from '../data/motionIcons'

const SERVICES = [
  {
    id: 'habitos',
    branch: 'habitos',
    tab: null,
    Icon: ListChecks,
    title: 'Hábitos',
    description: 'Lo que quieres dejar atrás y lo que ya estás construyendo, con calendario y seguimiento.',
  },
  {
    id: 'trotar',
    branch: 'ejercicio',
    tab: 'trotar',
    Icon: Footprints,
    title: 'Rutinas de correr',
    description: 'Calendario de tus trotes, con técnica y consejos.',
  },
  {
    id: 'ejercicios',
    branch: 'ejercicio',
    tab: 'ejercicios',
    Icon: Dumbbell,
    title: 'Ejercicios',
    description: 'Parque, casa y gimnasio — dominadas, rutina de cuerpo libre y pesas, todo en un solo lugar.',
  },
  {
    id: 'planificador',
    branch: 'planificador',
    tab: null,
    Icon: CalendarClock,
    title: 'Organiza tu día',
    description: 'Planea mañana en bloques de tiempo — actividad definida o libre.',
  },
  {
    id: 'kpis',
    branch: 'kpis',
    tab: null,
    Icon: Gauge,
    title: 'KPIs',
    description: 'Consistencia física, balance de hábitos y patrones entre ejercicio y recaídas.',
  },
]

export default function OnboardingScreen({ onSelect, userEmail, onLogout, onOpenManual }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.mascot}><WeaveMark /></div>
        <h1 style={styles.title}>Hábitos</h1>
        <p style={styles.subtitle}>
          Tu asistente personal de seguimiento. Un lugar para lo que quieres
          dejar atrás, y para lo bueno que ya estás construyendo.
        </p>
      </div>

      <div style={styles.list}>
        {SERVICES.map(({ id, branch, tab, Icon, title, description }) => (
          <button
            key={id}
            style={styles.card}
            onClick={() => onSelect(branch, tab)}
          >
            <div style={styles.iconWrap}><Icon size={20} color="var(--thread-gold)" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
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

      <p style={styles.footer}>Puedes cambiar de sección cuando quieras desde la navegación inferior.</p>

      {onLogout && (
        <div style={styles.account}>
          {userEmail && <span style={styles.accountEmail}>{userEmail}</span>}
          <button style={styles.logoutBtn} onClick={onLogout}>Cerrar sesión</button>
        </div>
      )}
    </div>
  )
}

const styles = {
  wrap: {
    flex: 1, display: 'flex', flexDirection: 'column',
    padding: '40px 20px 24px', overflowY: 'auto',
  },
  header: { textAlign: 'center', marginBottom: 28 },
  mascot: { width: 84, height: 84, margin: '0 auto 12px' },
  title: { fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 500, margin: 0 },
  subtitle: { color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.6, margin: '10px auto 0', maxWidth: 320 },
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
  footer: { textAlign: 'center', color: 'var(--ink-muted)', fontSize: 12, marginTop: 20 },
  account: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)',
  },
  accountEmail: { fontSize: 11.5, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' },
  logoutBtn: {
    background: 'transparent', border: 'none', color: 'var(--slip-rust)',
    fontSize: 12.5, cursor: 'pointer', textDecoration: 'underline',
  },
}
