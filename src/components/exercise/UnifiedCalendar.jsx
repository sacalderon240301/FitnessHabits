import { useMemo, useState } from 'react'
import { buildMonthCells, isoDate } from '../../lib/unifiedCalendar'

const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const DOT_COLOR = { trote: 'var(--focus-teal)', parque: 'var(--thread-gold)', casa: 'var(--slip-rust)', gym: 'var(--plan-tan)' }

export default function UnifiedCalendar({ dayMap, activeTypes, onSelectDay }) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  const cells = useMemo(() => buildMonthCells(cursor.year, cursor.month), [cursor])
  const todayKey = isoDate(new Date())

  const goPrev = () => setCursor(({ year, month }) => (month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }))
  const goNext = () => setCursor(({ year, month }) => (month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }))

  return (
    <div>
      <div style={styles.header}>
        <button onClick={goPrev} style={styles.navBtn} aria-label="Mes anterior">‹</button>
        <span style={styles.monthLabel}>{MONTH_NAMES[cursor.month]} {cursor.year}</span>
        <button onClick={goNext} style={styles.navBtn} aria-label="Mes siguiente">›</button>
      </div>

      <div style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((w) => <span key={w} style={styles.weekdayLabel}>{w}</span>)}
      </div>

      <div style={styles.grid}>
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />
          const key = isoDate(date)
          const day = dayMap.get(key)
          const isToday = key === todayKey
          const visibleTypes = activeTypes.filter((t) => day?.[t])

          return (
            <button
              key={key}
              onClick={() => onSelectDay(key)}
              style={{ ...styles.dayCell, ...(isToday ? styles.dayCellToday : {}) }}
            >
              <span style={styles.dayNumber}>{date.getDate()}</span>
              <div style={styles.dots}>
                {visibleTypes.map((t) => (
                  <span key={t} style={{ ...styles.dot, background: DOT_COLOR[t] }} />
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 12 },
  navBtn: { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink)', width: 32, height: 32, borderRadius: 8, fontSize: 16, cursor: 'pointer' },
  monthLabel: { fontFamily: 'var(--font-display)', fontSize: 16, textTransform: 'capitalize', minWidth: 140, textAlign: 'center', color: 'var(--ink)' },
  weekdayRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 },
  weekdayLabel: { textAlign: 'center', fontSize: 11, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 },
  dayCell: {
    aspectRatio: '1', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
    color: 'var(--ink)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 3, cursor: 'pointer', padding: 0,
  },
  dayCellToday: { borderColor: 'var(--ink-muted)' },
  dayNumber: { fontSize: 12, fontFamily: 'var(--font-mono)' },
  dots: { display: 'flex', gap: 2, minHeight: 5 },
  dot: { width: 5, height: 5, borderRadius: 3 },
}
