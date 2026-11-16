// Fila de 7 días (hoy a la derecha) coloreada activo/sedentario, más la
// racha actual sin entrenar. Mismo lenguaje de columnas que
// NetHabitScoreChart, pero pensado como alerta (escala de color) en vez de
// comparación neutral.

function streakColor(streak) {
  if (streak <= 1) return 'var(--focus-teal)'
  if (streak <= 3) return 'var(--thread-gold)'
  return 'var(--slip-rust)'
}

export default function SedentaryIndicator({ data }) {
  const { sedentaryDaysThisWeek, activeDaysThisWeek, windowDays, currentStreak, streakCapped, byDay } = data
  const color = streakColor(currentStreak)

  return (
    <div>
      <div style={styles.streakRow}>
        <span style={{ ...styles.streakValue, color }}>
          {currentStreak}{streakCapped ? '+' : ''}
        </span>
        <span style={styles.streakLabel}>
          {currentStreak === 0
            ? 'Entrenaste hoy — sin días sedentarios seguidos'
            : `día${currentStreak === 1 ? '' : 's'} seguido${currentStreak === 1 ? '' : 's'} sin entrenar`}
        </span>
      </div>

      <div style={styles.week}>
        {byDay.map((d) => (
          <div key={d.date} style={styles.col}>
            <div style={{ ...styles.cell, background: d.active ? 'var(--focus-teal)' : 'var(--surface)', borderColor: d.active ? 'var(--focus-teal)' : 'var(--border)' }} />
            <span style={styles.dayLabel}>{d.label}</span>
          </div>
        ))}
      </div>

      <p style={styles.summary}>
        {sedentaryDaysThisWeek} de {windowDays} días sin ejercicio esta semana · {activeDaysThisWeek} activos
      </p>
    </div>
  )
}

const styles = {
  streakRow: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 },
  streakValue: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500 },
  streakLabel: { fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.4 },
  week: { display: 'flex', justifyContent: 'space-between', gap: 4, marginBottom: 10 },
  col: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0, gap: 6 },
  cell: { width: '100%', aspectRatio: '1', borderRadius: 8, border: '1px solid' },
  dayLabel: { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-muted)', textTransform: 'uppercase' },
  summary: { fontSize: 12, color: 'var(--ink-muted)', margin: 0, textAlign: 'center' },
}
