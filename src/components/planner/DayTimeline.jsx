import { Check, Clock, Timer, Circle } from 'lucide-react'
import { categoryColor, categoryLabel } from '../../data/planCategories'

const STATUS_META = {
  done: { Icon: Check, color: 'var(--focus-teal)' },
  done_different_time: { Icon: Clock, color: 'var(--thread-gold)' },
  done_shorter: { Icon: Timer, color: 'var(--plan-orange)' },
}

function durationLabel(start, end) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let minutes = (eh * 60 + em) - (sh * 60 + sm)
  if (minutes < 0) minutes += 24 * 60 // cruza medianoche
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

export default function DayTimeline({ blocks, onEditBlock, onOpenStatus }) {
  if (blocks.length === 0) {
    return (
      <div style={styles.empty}>
        <p>Todavía no has planeado este día.</p>
      </div>
    )
  }

  return (
    <div style={styles.list}>
      {blocks.map((block) => {
        const color = block.is_flexible ? 'var(--ink-muted)' : categoryColor(block.category)
        const statusMeta = block.status ? STATUS_META[block.status] : null
        const StatusIcon = statusMeta?.Icon ?? Circle
        const statusColor = statusMeta?.color ?? 'var(--thread-dim)'
        return (
          <div
            key={block.id}
            style={{
              ...styles.row,
              borderLeftColor: color,
              borderStyle: block.is_flexible ? 'dashed' : 'solid',
              borderLeftWidth: block.is_flexible ? 3 : 4,
            }}
          >
            <button style={styles.mainArea} onClick={() => onEditBlock(block)}>
              <div style={styles.timeCol}>
                <span style={styles.timeStart}>{block.start_time}</span>
                <span style={styles.timeEnd}>{block.end_time}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={styles.activity}>
                  {block.is_flexible ? block.flexible_label : block.activity}
                </h4>
                <div style={styles.metaRow}>
                  {!block.is_flexible && (
                    <span style={{ ...styles.categoryTag, color, borderColor: color }}>
                      {categoryLabel(block.category)}
                    </span>
                  )}
                  <span style={styles.duration}>{durationLabel(block.start_time, block.end_time)}</span>
                </div>
              </div>
            </button>

            <button
              style={{ ...styles.statusBtn, borderColor: block.status ? statusColor : 'var(--border)' }}
              onClick={() => onOpenStatus(block)}
              aria-label="Marcar cumplimiento del bloque"
            >
              <StatusIcon size={16} color={statusColor} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

const styles = {
  empty: {
    padding: '40px 20px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: 14,
  },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  row: {
    display: 'flex', gap: 8, alignItems: 'center', width: '100%',
    background: 'var(--surface)', border: '1px solid var(--border)', borderLeftStyle: 'solid',
    borderRadius: 12, padding: '8px 10px 8px 14px',
  },
  mainArea: {
    display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: 0, textAlign: 'left',
    background: 'transparent', border: 'none', padding: '4px 0', cursor: 'pointer',
  },
  timeCol: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 46, flexShrink: 0 },
  timeStart: { fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--ink)' },
  timeEnd: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-muted)' },
  activity: { fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500, margin: '0 0 5px', color: 'var(--ink)' },
  metaRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  categoryTag: {
    fontSize: 10.5, fontFamily: 'var(--font-mono)', border: '1px solid', borderRadius: 999,
    padding: '1px 8px', textTransform: 'uppercase', letterSpacing: 0.3,
  },
  duration: { fontSize: 11.5, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' },
  statusBtn: {
    width: 34, height: 34, borderRadius: 10, border: '1px solid', background: 'var(--surface-raised)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
}
