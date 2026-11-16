// Barra apilada de un solo segmento por estado: cumplido, en otro horario,
// menos tiempo, no cumplido. Mismo esquema de color que ya usa la app para
// cada variante (ver DayTimeline/BlockStatusSheet).

const SEGMENTS = [
  { key: 'doneCount', label: 'Cumplido', color: 'var(--focus-teal)' },
  { key: 'differentTimeCount', label: 'Otro horario', color: 'var(--thread-gold)' },
  { key: 'shorterCount', label: 'Menos tiempo', color: 'var(--plan-orange)' },
  { key: 'notDoneCount', label: 'No cumplido', color: 'var(--slip-rust)', derivedNotDone: true },
]

export default function PlanComplianceChart({ data }) {
  if (!data.hasData) {
    return (
      <p style={styles.empty}>
        Todavía no hay bloques del planificador cuya hora ya haya pasado esta
        semana — vuelve cuando tengas algunos marcados.
      </p>
    )
  }

  const { pct, totalCount } = data

  return (
    <div>
      <div style={styles.totalRow}>
        <span style={{ ...styles.totalValue, color: pct >= 70 ? 'var(--focus-teal)' : pct >= 40 ? 'var(--thread-gold)' : 'var(--slip-rust)' }}>
          {pct}%
        </span>
        <span style={styles.totalLabel}>de {totalCount} bloque{totalCount === 1 ? '' : 's'} cumplidos, últimos 7 días</span>
      </div>

      <div style={styles.track}>
        <Segment count={data.doneCount} total={totalCount} color="var(--focus-teal)" first />
        <Segment count={data.differentTimeCount} total={totalCount} color="var(--thread-gold)" />
        <Segment count={data.shorterCount} total={totalCount} color="var(--plan-orange)" />
        <Segment count={data.notDoneCount} total={totalCount} color="var(--slip-rust)" last />
      </div>

      <div style={styles.legend}>
        {SEGMENTS.map(({ key, label, color }) => (
          <span key={key} style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: color }} />
            {label} · {data[key]}
          </span>
        ))}
      </div>
    </div>
  )
}

function Segment({ count, total, color, first, last }) {
  if (count === 0) return null
  const pct = (count / total) * 100
  return (
    <div
      style={{
        width: `${pct}%`, height: '100%', background: color,
        borderTopLeftRadius: first ? 6 : 0, borderBottomLeftRadius: first ? 6 : 0,
        borderTopRightRadius: last ? 6 : 0, borderBottomRightRadius: last ? 6 : 0,
      }}
    />
  )
}

const styles = {
  empty: { color: 'var(--ink-muted)', fontSize: 13.5, lineHeight: 1.6 },
  totalRow: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  totalValue: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500 },
  totalLabel: { fontSize: 12, color: 'var(--ink-muted)' },
  track: { display: 'flex', width: '100%', height: 10, borderRadius: 6, overflow: 'hidden', background: 'var(--surface-raised)', border: '1px solid var(--border)' },
  legend: { display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 14 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' },
  legendDot: { width: 8, height: 8, borderRadius: 4, display: 'inline-block', flexShrink: 0 },
}
