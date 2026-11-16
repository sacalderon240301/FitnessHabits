import { ArrowLeft, Ban, Heart, CalendarDays, Dumbbell, CalendarClock, Gauge } from 'lucide-react'

const SECTIONS = [
  {
    Icon: Ban,
    title: 'Hábitos que quiero dejar',
    body: [
      'Crea un hábito por cada cosa que quieres dejar atrás. Cuando sientas el impulso, regístralo.',
      'Cada registro puede ser una "Recaída" (si caíste en el hábito) o un "Reemplazo" (si en su lugar hiciste otra actividad — la app te sugiere alternativas si las guardaste al crear el hábito).',
      'Entre más reemplazos y menos recaídas registres con el tiempo, mejor se ve tu progreso.',
    ],
  },
  {
    Icon: Heart,
    title: 'Hábitos positivos',
    body: [
      'Crea un hábito por cada cosa que quieres construir (tomar agua, leer, etc.).',
      'Cada vez que lo cumplas, dale a "Hoy sí lo hice". La app arma tu racha y el historial automáticamente.',
    ],
  },
  {
    Icon: CalendarDays,
    title: 'Calendario de hábitos',
    body: [
      'Dentro de Hábitos, la pestaña Calendario muestra todos tus registros del mes en una sola vista.',
      'Punto teal = hábito bueno cumplido, punto dorado = reemplazo, punto rojizo = recaída. Toca cualquier día para ver el detalle.',
    ],
  },
  {
    Icon: Dumbbell,
    title: 'Ejercicio',
    body: [
      'Trotar sigue aparte (distancia y tiempo), y todo lo demás — casa, parque y gimnasio — comparte un mismo catálogo de ejercicios por grupo muscular, buscable desde la pestaña Catálogo.',
      'Cada vez que registras un ejercicio eliges dónde lo hiciste (casa, parque, gimnasio o algo tuyo) y anotas las repeticiones (o segundos) de cada serie por separado, no un total.',
      'Arma Rutinas para registrar varios ejercicios juntos en una sesión, y entra al detalle de cualquier ejercicio para ver tu historial y tu progreso de peso o repeticiones en el tiempo.',
      'Si no encuentras un ejercicio en el catálogo, créalo con "Agregar ejercicio" — queda disponible para rutinas y registros igual que los demás.',
    ],
  },
  {
    Icon: CalendarClock,
    title: 'Organiza tu día',
    body: [
      'Arma bloques de tiempo para un día específico: define la actividad y su categoría, o márcalo como bloque flexible si todavía no sabes qué harás.',
      'También puedes generar un plan completo con IA a partir de una descripción de tu día.',
      'Cuando el bloque ya pasó, márcalo como hecho, hecho en otro horario, hecho más corto, o sin marcar si no lo cumpliste — eso alimenta el KPI de cumplimiento del plan.',
    ],
  },
  {
    Icon: Gauge,
    title: 'KPIs',
    body: [
      'Índice de Consistencia Física: qué tanto entrenaste esta semana en cada entorno, contra una meta de 3 días.',
      'Sedentarismo: el otro lado — cuántos días sin ejercicio llevas seguidos y cuántos hubo esta semana.',
      'Balance de hábitos, fricción (¿los días sin ejercicio son también los que más recaes?) y cumplimiento del plan.',
    ],
  },
]

export default function ManualScreen({ onBack }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn} aria-label="Volver">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={styles.title}>Manual de uso</h1>
          <p style={styles.subtitle}>Cómo sacarle provecho a cada sección de la app.</p>
        </div>
      </div>

      <div style={{ padding: '4px 20px 90px', flex: 1, overflowY: 'auto' }}>
        {SECTIONS.map(({ Icon, title, body }) => (
          <section key={title} style={styles.card}>
            <div style={styles.cardHead}>
              <div style={styles.iconWrap}><Icon size={18} color="var(--thread-gold)" /></div>
              <h2 style={styles.cardTitle}>{title}</h2>
            </div>
            {body.map((p, i) => (
              <p key={i} style={styles.paragraph}>{p}</p>
            ))}
          </section>
        ))}

        <p style={styles.footer}>
          El "Modo demo" (cuando aparece la insignia correspondiente) guarda todo en este dispositivo,
          sin necesidad de cuenta — útil para probar la app antes de conectarla a tu cuenta real.
        </p>
      </div>
    </div>
  )
}

const styles = {
  header: { padding: '20px 20px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 },
  backBtn: {
    width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--surface)', color: 'var(--ink-muted)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 2,
  },
  title: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, margin: 0 },
  subtitle: { color: 'var(--ink-muted)', fontSize: 13, margin: '4px 0 0' },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
    padding: '16px 16px 18px', marginBottom: 12,
  },
  cardHead: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  iconWrap: {
    width: 32, height: 32, borderRadius: 9, background: 'var(--thread-gold-soft)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardTitle: { fontFamily: 'var(--font-display)', fontSize: 15.5, fontWeight: 500, color: 'var(--ink)', margin: 0 },
  paragraph: { fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.55, margin: '0 0 8px' },
  footer: { fontSize: 12, color: 'var(--ink-muted)', textAlign: 'center', lineHeight: 1.5, margin: '8px 6px 0' },
}
