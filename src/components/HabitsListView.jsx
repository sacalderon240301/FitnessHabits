import { ChevronRight, Plus } from 'lucide-react'

export default function HabitsListView({ habits, onSelect, onCreate, emptyLabel, createLabel }) {
  return (
    <div style={styles.wrap}>
      {habits.length === 0 && (
        <p style={styles.empty}>{emptyLabel}</p>
      )}

      <div style={styles.list}>
        {habits.map((habit) => (
          <button key={habit.id} style={styles.card} onClick={() => onSelect(habit)}>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <h3 style={styles.name}>{habit.name}</h3>
              {habit.description && <p style={styles.description}>{habit.description}</p>}
            </div>
            <ChevronRight size={18} color="var(--ink-muted)" style={{ flexShrink: 0 }} />
          </button>
        ))}
      </div>

      <button style={styles.createBtn} onClick={onCreate}>
        <Plus size={16} />
        {createLabel}
      </button>
    </div>
  )
}

const styles = {
  wrap: { padding: '16px 20px 24px' },
  empty: { color: 'var(--ink-muted)', fontSize: 14, textAlign: 'center', padding: '30px 10px' },
  list: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 },
  card: {
    display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
  },
  name: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500, margin: 0 },
  description: { fontSize: 12.5, color: 'var(--ink-muted)', margin: '4px 0 0', lineHeight: 1.4 },
  createBtn: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '13px', borderRadius: 12, border: '1px dashed var(--border)',
    background: 'transparent', color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer',
  },
}
