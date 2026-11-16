import { useMemo, useState } from 'react'
import { Search, Plus, ChevronRight, Dumbbell } from 'lucide-react'
import { muscleGroups, muscleGroupLabel, locationLabel } from '../../data/exerciseCatalog'

export default function ExerciseCatalogBrowser({ catalog, onSelect, onCreateNew }) {
  const [activeGroup, setActiveGroup] = useState('todos')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return catalog.filter((ex) => {
      if (activeGroup !== 'todos' && ex.muscleGroup !== activeGroup) return false
      if (q && !ex.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [catalog, activeGroup, query])

  return (
    <div>
      <div style={styles.searchRow}>
        <div style={styles.searchWrap}>
          <Search size={15} color="var(--ink-muted)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ejercicio o máquina..."
            style={styles.searchInput}
          />
        </div>
        {onCreateNew && (
          <button onClick={onCreateNew} style={styles.quickAddBtn} aria-label="Agregar ejercicio nuevo">
            <Plus size={18} />
          </button>
        )}
      </div>

      <div style={styles.chipRow}>
        <button
          onClick={() => setActiveGroup('todos')}
          style={{ ...styles.chip, ...(activeGroup === 'todos' ? styles.chipActive : {}) }}
        >
          Todos
        </button>
        {muscleGroups.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGroup(g.id)}
            style={{ ...styles.chip, ...(activeGroup === g.id ? styles.chipActive : {}) }}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div style={styles.list}>
        {filtered.length === 0 && <p style={styles.empty}>No hay ejercicios que coincidan.</p>}
        {filtered.map((ex) => (
          <button key={ex.id} style={styles.card} onClick={() => onSelect(ex)}>
            {ex.photoUrl ? (
              <img src={ex.photoUrl} alt="" style={styles.thumb} />
            ) : (
              <div style={styles.thumbPlaceholder}><Dumbbell size={16} color="var(--ink-muted)" /></div>
            )}
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <span style={styles.meta}>{muscleGroupLabel(ex.muscleGroup)} · {locationLabel(ex.defaultLocation)}{ex.isCustom ? ' · tuyo' : ''}</span>
              <h3 style={styles.name}>{ex.name}</h3>
            </div>
            <ChevronRight size={18} color="var(--ink-muted)" style={{ flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  )
}

const styles = {
  searchRow: { display: 'flex', gap: 8, marginBottom: 10 },
  searchWrap: {
    flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)',
    border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px',
  },
  quickAddBtn: {
    flexShrink: 0, width: 40, borderRadius: 10, border: 'none',
    background: 'var(--thread-gold)', color: '#221703',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  searchInput: { flex: 1, background: 'transparent', border: 'none', color: 'var(--ink)', fontSize: 14 },
  chipRow: { display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 12 },
  chip: {
    flexShrink: 0, padding: '7px 12px', borderRadius: 999, border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--ink-muted)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  chipActive: { borderColor: 'var(--thread-gold)', color: 'var(--thread-gold)', background: 'var(--thread-gold-soft)' },
  list: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 },
  empty: { color: 'var(--ink-muted)', fontSize: 13.5, textAlign: 'center', padding: '20px 10px' },
  card: {
    display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
  },
  thumb: { width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 },
  thumbPlaceholder: {
    width: 40, height: 40, borderRadius: 8, background: 'var(--surface-raised)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  meta: { fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink-muted)', letterSpacing: 0.4 },
  name: { fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500, margin: '3px 0 0', color: 'var(--ink)' },
}
