// Radar de 4 ejes para el Índice de Consistencia Física. Cada vértice lleva
// su propio color (mismo mapeo que ya usa UnifiedCalendar para estos 4
// tipos de actividad) y una etiqueta de texto directa al lado — así la
// identidad de cada eje nunca depende solo del color.

const ANGLES = [-90, 0, 90, 180] // top, right, bottom, left
const LABEL_POS = [
  { anchor: 'middle', dx: 0, dy: -10 },
  { anchor: 'start', dx: 10, dy: 4 },
  { anchor: 'middle', dx: 0, dy: 24 },
  { anchor: 'end', dx: -10, dy: 4 },
]

function polar(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

function ringPoints(cx, cy, r) {
  return ANGLES.map((a) => polar(cx, cy, r, a).join(',')).join(' ')
}

export default function RadarChart({ axes }) {
  const cx = 100
  const cy = 106
  const radius = 58

  const dataPolygon = axes.map((axis, i) => polar(cx, cy, radius * (axis.value / 100), ANGLES[i]).join(',')).join(' ')

  return (
    <svg viewBox="0 0 200 212" width="100%" height="100%">
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <polygon key={r} points={ringPoints(cx, cy, radius * r)} fill="none" stroke="var(--border)" strokeWidth="1" />
      ))}
      {ANGLES.map((a, i) => {
        const [x, y] = polar(cx, cy, radius, a)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />
      })}

      <polygon
        points={dataPolygon}
        fill="var(--thread-gold)" fillOpacity="0.18"
        stroke="var(--thread-gold)" strokeWidth="2" strokeLinejoin="round"
      />

      {axes.map((axis, i) => {
        const [x, y] = polar(cx, cy, radius * (axis.value / 100), ANGLES[i])
        return <circle key={axis.id} cx={x} cy={y} r="4.5" fill={axis.color} stroke="var(--surface)" strokeWidth="2" />
      })}

      {axes.map((axis, i) => {
        const [x, y] = polar(cx, cy, radius, ANGLES[i])
        const pos = LABEL_POS[i]
        return (
          <text
            key={axis.id}
            x={x + pos.dx} y={y + pos.dy}
            textAnchor={pos.anchor}
            fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--ink)"
          >
            {axis.label}
            <tspan x={x + pos.dx} dy="12" fill="var(--ink-muted)" fontSize="9.5">
              {axis.count} {axis.count === 1 ? 'día' : 'días'}
            </tspan>
          </text>
        )
      })}
    </svg>
  )
}
