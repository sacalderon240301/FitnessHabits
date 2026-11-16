// Compara qué tan seguido faltó ejercicio en días con recaída vs. sin
// recaída. Es una correlación simple (no causalidad) sobre los últimos 30
// días — con muy pocas recaídas registradas, no se muestra nada engañoso.

export default function FrictionInsight({ data }) {
  if (!data.hasEnoughData) {
    return (
      <p style={styles.empty}>
        Todavía no hay suficientes recaídas registradas en los últimos 30 días
        (van {data.slipDaysCount}, se necesitan al menos 3) para buscar un patrón
        acá — y esa es buena noticia.
      </p>
    )
  }

  const { pctNoExerciseOnSlipDays, pctNoExerciseOnNonSlipDays, slipDaysCount } = data
  const diff = pctNoExerciseOnSlipDays - pctNoExerciseOnNonSlipDays

  return (
    <div>
      <p style={styles.insight}>
        {diff >= 15 ? (
          <>
            En días con <strong style={{ color: 'var(--slip-rust)' }}>recaída</strong>, el{' '}
            <strong>{pctNoExerciseOnSlipDays}%</strong> fueron días sin ejercicio — vs.{' '}
            <strong>{pctNoExerciseOnNonSlipDays}%</strong> en días sin recaída. Parece haber
            relación: cuando te saltas el ejercicio, es más probable que recaigas.
          </>
        ) : (
          <>
            No hay todavía una relación clara entre saltarte el ejercicio y recaer
            ({pctNoExerciseOnSlipDays}% vs {pctNoExerciseOnNonSlipDays}%).
          </>
        )}
      </p>

      <div style={styles.bars}>
        <BarRow label="Días con recaída" pct={pctNoExerciseOnSlipDays} color="var(--slip-rust)" />
        <BarRow label="Días sin recaída" pct={pctNoExerciseOnNonSlipDays} color="var(--focus-teal)" />
      </div>

      <p style={styles.caption}>% sin ejercicio registrado · últimos 30 días · {slipDaysCount} días con recaída</p>
    </div>
  )
}

function BarRow({ label, pct, color }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <div style={styles.track}>
        <div style={{ ...styles.fill, width: `${pct}%`, background: color }} />
      </div>
      <span style={{ ...styles.rowValue, color }}>{pct}%</span>
    </div>
  )
}

const styles = {
  empty: { color: 'var(--ink-muted)', fontSize: 13.5, lineHeight: 1.6 },
  insight: { fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink)', margin: '0 0 16px' },
  bars: { display: 'flex', flexDirection: 'column', gap: 10 },
  row: { display: 'flex', alignItems: 'center', gap: 10 },
  rowLabel: { fontSize: 12, color: 'var(--ink-muted)', width: 108, flexShrink: 0 },
  track: { flex: 1, height: 8, borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--border)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  rowValue: { fontFamily: 'var(--font-mono)', fontSize: 12, width: 36, textAlign: 'right', flexShrink: 0 },
  caption: { fontSize: 10.5, color: 'var(--ink-muted)', marginTop: 12, textAlign: 'center' },
}
