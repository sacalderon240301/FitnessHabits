import { useMemo, useState } from 'react'
import { Search, Plus, ChevronRight, Check, Dumbbell } from 'lucide-react'
import { muscleGroups, muscleGroupLabel, exerciseLocations, locationLabel } from '../../data/exerciseCatalog'

/**
 * `multiSelect` + `onAddMultiple`: en vez de cerrar al tocar un ejercicio,
 * se van marcando varios y se agregan todos de una — pensado para armar
 * un día completo sin ir y volver uno por uno (Change Request #2).
 */
export default function ExerciseCatalogBrowser({ catalog, onSelect, onCreateNew, multiSelect = false, onAddMultiple }) {
  const [activeGroup, setActiveGroup] = useState('todos')
  const [activeLocation, setActiveLocation] = useState('todos')
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return catalog.filter((ex) => {
      if (activeGroup !== 'todos' && ex.muscleGroup !== activeGroup) return false
      if (activeLocation !== 'todos' && ex.defaultLocation !== activeLocation) return false
      if (q && !ex.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [catalog, activeGroup, activeLocation, query])

  const toggleSelected = (ex) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(ex.id)) next.delete(ex.id)
      else next.add(ex.id)
      return next
    })
  }

  const handleCardTap = (ex) => (multiSelect ? toggleSelected(ex) : onSelect(ex))

  const handleAddSelected = () => {
    const selected = catalog.filter((ex) => selectedIds.has(ex.id))
    onAddMultiple(selected)
    setSelectedIds(new Set())
  }

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
          Todos los músculos
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

      <div style={styles.chipRow}>
        <button
          onClick={() => setActiveLocation('todos')}
          style={{ ...styles.chip, ...(activeLocation === 'todos' ? styles.chipActiveAlt : {}) }}
        >
          Donde sea
        </button>
        {exerciseLocations.map((loc) => (
          <button
            key={loc.id}
            onClick={() => setActiveLocation(loc.id)}
            style={{ ...styles.chip, ...(activeLocation === loc.id ? styles.chipActiveAlt : {}) }}
          >
            {loc.label}
          </button>
        ))}
      </div>

      <div style={styles.list}>
        {filtered.length === 0 && <p style={styles.empty}>No hay ejercicios que coincidan.</p>}
        {filtered.map((ex) => {
          const selected = selectedIds.has(ex.id)
          return (
            <button key={ex.id} style={{ ...styles.card, ...(selected ? styles.cardSelected : {}) }} onClick={() => handleCardTap(ex)}>
              {ex.photoUrl ? (
                <img src={ex.photoUrl} alt="" style={styles.thumb} />
              ) : (
                <div style={styles.thumbPlaceholder}><Dumbbell size={16} color="var(--ink-muted)" /></div>
              )}
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <span style={styles.meta}>{muscleGroupLabel(ex.muscleGroup)} · {locationLabel(ex.defaultLocation)}{ex.isCustom ? ' · tuyo' : ''}</span>
                <h3 style={styles.name}>{ex.name}</h3>
              </div>
              {multiSelect ? (
                <div style={{ ...styles.checkbox, ...(selected ? styles.checkboxChecked : {}) }}>
                  {selected && <Check size={13} color="#221703" />}
                </div>
              ) : (
                <ChevronRight size={18} color="var(--ink-muted)" style={{ flexShrink: 0 }} />
              )}
            </button>
          )
        })}
      </div>

      {multiSelect && selectedIds.size > 0 && (
        <div style={styles.addBar}>
          <button onClick={handleAddSelected} style={styles.addBarBtn}>
            Añadir {selectedIds.size} ejercicio{selectedIds.size === 1 ? '' : 's'}
          </button>
        </div>
      )}
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
  chipRow: { display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 8 },
  chip: {
    flexShrink: 0, padding: '7px 12px', borderRadius: 999, border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--ink-muted)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  chipActive: { borderColor: 'var(--thread-gold)', color: 'var(--thread-gold)', background: 'var(--thread-gold-soft)' },
  chipActiveAlt: { borderColor: 'var(--focus-teal)', color: 'var(--focus-teal)', background: 'var(--focus-teal-soft)' },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  empty: { color: 'var(--ink-muted)', fontSize: 13.5, textAlign: 'center', padding: '20px 10px' },
  card: {
    display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
  },
  cardSelected: { borderColor: 'var(--thread-gold)', background: 'var(--thread-gold-soft)' },
  thumb: { width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 },
  thumbPlaceholder: {
    width: 40, height: 40, borderRadius: 8, background: 'var(--surface-raised)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  meta: { fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase', color: 'var(--ink-muted)', letterSpacing: 0.4 },
  name: { fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500, margin: '3px 0 0', color: 'var(--ink)' },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, border: '1.6px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkboxChecked: { background: 'var(--thread-gold)', borderColor: 'var(--thread-gold)' },
  addBar: {
    position: 'sticky', bottom: 0, margin: '10px -4px -4px', padding: '10px 4px calc(10px + env(safe-area-inset-bottom))',
    background: 'var(--surface-raised)', borderTop: '1px solid var(--border)',
  },
  addBarBtn: {
    width: '100%', display: 'block',
    padding: '13px', borderRadius: 12, border: 'none', background: 'var(--thread-gold)',
    color: '#221703', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
}
