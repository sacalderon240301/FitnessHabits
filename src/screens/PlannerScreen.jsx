import { useMemo, useState } from 'react'
import { Plus, Home, Sparkles } from 'lucide-react'
import { useDayPlanBlocks } from '../hooks/useDayPlanBlocks'
import { addDays, todayIso } from '../lib/date'
import DayTimeline from '../components/planner/DayTimeline'
import BlockFormModal from '../components/planner/BlockFormModal'
import BlockStatusSheet from '../components/planner/BlockStatusSheet'
import AIPlanModal from '../components/planner/AIPlanModal'

function formatDateLabel(dateKey) {
  const d = new Date(dateKey + 'T00:00:00')
  const today = todayIso()
  const tomorrow = addDays(today, 1)
  const yesterday = addDays(today, -1)
  // Siempre mostramos la fecha explícita al lado de "Hoy"/"Mañana" — con
  // solo la palabra relativa era fácil confundirse sobre a qué día
  // realmente aplicaba el plan (ej. armando el plan de mañana de noche).
  const dayMonth = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
  if (dateKey === today) return `Hoy · ${dayMonth}`
  if (dateKey === tomorrow) return `Mañana · ${dayMonth}`
  if (dateKey === yesterday) return `Ayer · ${dayMonth}`
  return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function PlannerScreen({ onGoHome }) {
  const [date, setDate] = useState(() => todayIso())
  const { blocks, loading, error, addBlock, addBlocks, updateBlock, deleteBlock, isDemoMode } = useDayPlanBlocks(date)
  const [editingBlock, setEditingBlock] = useState(undefined) // undefined = closed, null = creating, obj = editing
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [statusBlock, setStatusBlock] = useState(null)

  const suggestedStart = useMemo(() => {
    if (blocks.length === 0) return ''
    return blocks[blocks.length - 1].end_time
  }, [blocks])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={styles.title}>Organiza tu día</h1>
        <button onClick={onGoHome} style={styles.homeBtn} aria-label="Volver al menú">
          <Home size={18} />
        </button>
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        {isDemoMode && <div style={styles.demoBadge}>Modo demo · datos locales</div>}
        <div style={styles.dateNav}>
          <button onClick={() => setDate((d) => addDays(d, -1))} style={styles.navBtn} aria-label="Día anterior">‹</button>
          <span style={styles.dateLabel}>{formatDateLabel(date)}</span>
          <button onClick={() => setDate((d) => addDays(d, 1))} style={styles.navBtn} aria-label="Día siguiente">›</button>
        </div>
        {date !== todayIso() && (
          <button style={styles.todayLink} onClick={() => setDate(todayIso())}>Volver a hoy</button>
        )}
      </div>

      <div style={{ padding: '16px 20px 90px', flex: 1, overflowY: 'auto' }}>
        {error && <p style={styles.errorBanner}>No se pudo guardar: {error}</p>}
        {loading ? (
          <p style={{ color: 'var(--ink-muted)' }}>Cargando...</p>
        ) : (
          <DayTimeline blocks={blocks} onEditBlock={setEditingBlock} onOpenStatus={setStatusBlock} />
        )}
      </div>

      <div style={styles.fabWrap}>
        <button style={styles.fabSecondary} onClick={() => setAiModalOpen(true)}>
          <Sparkles size={16} /> Generar con IA
        </button>
        <button style={styles.fab} onClick={() => setEditingBlock(null)}>
          <Plus size={16} /> Agregar bloque
        </button>
      </div>

      {editingBlock !== undefined && (
        <BlockFormModal
          block={editingBlock}
          suggestedStart={suggestedStart}
          onClose={() => setEditingBlock(undefined)}
          onSubmit={(payload) => (editingBlock ? updateBlock(editingBlock.id, payload) : addBlock(payload))}
          onDelete={editingBlock ? deleteBlock : undefined}
        />
      )}

      {aiModalOpen && (
        <AIPlanModal
          date={date}
          onClose={() => setAiModalOpen(false)}
          onSave={addBlocks}
        />
      )}

      {statusBlock && (
        <BlockStatusSheet
          block={statusBlock}
          onClose={() => setStatusBlock(null)}
          onSetStatus={(status) => updateBlock(statusBlock.id, { status })}
        />
      )}
    </div>
  )
}

const styles = {
  title: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, margin: 0 },
  homeBtn: {
    width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--surface)', color: 'var(--ink-muted)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  demoBadge: {
    display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 11,
    color: 'var(--focus-teal)', background: 'var(--focus-teal-soft)',
    border: '1px solid var(--focus-teal)', borderRadius: 999, padding: '3px 10px', marginBottom: 12,
  },
  dateNav: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 },
  navBtn: {
    background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink)',
    width: 32, height: 32, borderRadius: 8, fontSize: 16, cursor: 'pointer',
  },
  dateLabel: {
    fontFamily: 'var(--font-display)', fontSize: 18, textTransform: 'capitalize',
    minWidth: 180, textAlign: 'center', color: 'var(--ink)',
  },
  todayLink: {
    display: 'block', margin: '8px auto 0', background: 'transparent', border: 'none',
    color: 'var(--focus-teal)', fontSize: 12.5, cursor: 'pointer', textDecoration: 'underline',
  },
  errorBanner: {
    color: 'var(--slip-rust)', background: 'var(--slip-rust-soft)', border: '1px solid var(--slip-rust)',
    borderRadius: 10, padding: '10px 12px', fontSize: 12.5, marginBottom: 12,
  },
  fabWrap: {
    position: 'sticky', bottom: 0, display: 'flex', gap: 8,
    padding: '14px 20px calc(14px + env(safe-area-inset-bottom))',
    background: 'linear-gradient(to top, var(--bg) 60%, transparent)',
  },
  fabSecondary: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '15px', borderRadius: 14, border: '1px solid var(--thread-gold)', background: 'var(--thread-gold-soft)',
    color: 'var(--thread-gold)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
  fab: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '15px', borderRadius: 14, border: 'none', background: 'var(--focus-teal)',
    color: '#0d1f1d', fontSize: 14, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(79, 166, 156, 0.25)',
  },
}
