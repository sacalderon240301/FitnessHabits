// Barras divergentes: arriba de la línea = hábitos buenos, abajo = recaídas.
// Mismo par de colores que ya usa el resto de la app para "bueno"/"malo"
// (thread-gold / slip-rust), con etiqueta de valor directa en cada barra.

const BAR_HALF_HEIGHT = 46

export default function NetHabitScoreChart({ data }) {
  const { total, byDay } = data
  const maxAbs = Math.max(1, ...byDay.map((d) => Math.abs(d.net)))

  return (
    <div>
      <div style={styles.totalRow}>
        <span style={{ ...styles.totalValue, color: total > 0 ? 'var(--thread-gold)' : total < 0 ? 'var(--slip-rust)' : 'var(--ink)' }}>
          {total > 0 ? `+${total}` : total}
        </span>
        <span style={styles.totalLabel}>balance neto — últimos 7 días</span>
      </div>

      <div style={styles.chart}>
        {byDay.map((d) => {
          const isPositive = d.net >= 0
          const barHeight = (Math.abs(d.net) / maxAbs) * BAR_HALF_HEIGHT
          return (
            <div key={d.date} style={styles.col}>
              <span style={{
                ...styles.netLabel,
                color: d.net > 0 ? 'var(--thread-gold)' : d.net < 0 ? 'var(--slip-rust)' : 'var(--ink-muted)',
              }}>
                {d.net > 0 ? `+${d.net}` : d.net}
              </span>
              <div style={styles.barTrack}>
                <div style={styles.halfTop}>
                  <div style={{ ...styles.barUp, height: isPositive ? barHeight : 0 }} />
                </div>
                <div style={styles.zeroLine} />
                <div style={styles.halfBottom}>
                  <div style={{ ...styles.barDown, height: !isPositive ? barHeight : 0 }} />
                </div>
              </div>
              <span style={styles.dayLabel}>{d.label}</span>
            </div>
          )
        })}
      </div>

      <div style={styles.legend}>
        <LegendDot color="var(--thread-gold)" label="Hábitos buenos" />
        <LegendDot color="var(--slip-rust)" label="Recaídas" />
      </div>
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <span style={styles.legendItem}>
      <span style={{ ...styles.legendDot, background: color }} />
      {label}
    </span>
  )
}

const styles = {
  totalRow: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 },
  totalValue: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500 },
  totalLabel: { fontSize: 12, color: 'var(--ink-muted)' },
  chart: { display: 'flex', justifyContent: 'space-between', gap: 4 },
  col: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 },
  netLabel: { fontFamily: 'var(--font-mono)', fontSize: 10.5, marginBottom: 2 },
  barTrack: { display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' },
  halfTop: { height: BAR_HALF_HEIGHT, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%' },
  halfBottom: { height: BAR_HALF_HEIGHT, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', width: '100%' },
  barUp: { width: 14, background: 'var(--thread-gold)', borderRadius: '4px 4px 0 0', minHeight: 0 },
  barDown: { width: 14, background: 'var(--slip-rust)', borderRadius: '0 0 4px 4px', minHeight: 0 },
  zeroLine: { width: '100%', height: 2, background: 'var(--thread-dim)', flexShrink: 0 },
  dayLabel: { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-muted)', marginTop: 6, textTransform: 'uppercase' },
  legend: { display: 'flex', gap: 16, marginTop: 16, justifyContent: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--ink-muted)' },
  legendDot: { width: 8, height: 8, borderRadius: 4, display: 'inline-block' },
}
