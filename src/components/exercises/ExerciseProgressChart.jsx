// Línea de progreso minimalista hecha a mano (mismo espíritu que RadarChart
// y NetHabitScoreChart — sin librería externa), un punto por sesión
// registrada de este ejercicio.

const WIDTH = 300
const HEIGHT = 120
const PAD_X = 16
const PAD_Y = 18

function formatShortDate(dateKey) {
  const d = new Date(dateKey + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

export default function ExerciseProgressChart({ points, unit, color = 'var(--thread-gold)' }) {
  if (points.length < 2) {
    return (
      <p style={styles.empty}>
        {points.length === 0
          ? 'Todavía no hay registros de este ejercicio.'
          : `Última marca: ${points[0].value}${unit}. Registra al menos una sesión más para ver tu progreso en el tiempo.`}
      </p>
    )
  }

  const values = points.map((p) => p.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1

  const innerW = WIDTH - PAD_X * 2
  const innerH = HEIGHT - PAD_Y * 2

  const coords = points.map((p, i) => {
    const x = PAD_X + (i / (points.length - 1)) * innerW
    const y = PAD_Y + innerH - ((p.value - min) / range) * innerH
    return { x, y, ...p }
  })

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height={HEIGHT}>
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="3.5" fill="var(--surface)" stroke={color} strokeWidth="2" />
        ))}
        <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="4.5" fill={color} />
      </svg>
      <div style={styles.footerRow}>
        <span style={styles.dateLabel}>{formatShortDate(coords[0].date)}</span>
        <span style={styles.valueLabel}>Última: {coords[coords.length - 1].value}{unit}</span>
        <span style={styles.dateLabel}>{formatShortDate(coords[coords.length - 1].date)}</span>
      </div>
    </div>
  )
}

const styles = {
  empty: { color: 'var(--ink-muted)', fontSize: 13, lineHeight: 1.5, margin: 0 },
  footerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  dateLabel: { fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-muted)' },
  valueLabel: { fontSize: 12, fontWeight: 600, color: 'var(--ink)' },
}
