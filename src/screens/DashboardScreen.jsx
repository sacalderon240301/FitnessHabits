import { useState } from 'react'
import { Dumbbell, ListChecks, CalendarClock, Gauge, Droplet, Users, Scale, ChevronRight, Check } from 'lucide-react'
import { useExerciseLogs } from '../hooks/useExerciseLogs'
import { useGoodHabitsList } from '../hooks/useGoodHabitsList'
import { useAllGoodHabitEvents } from '../hooks/useAllGoodHabitEvents'
import { useBodyWeight } from '../hooks/useBodyWeight'
import { todayIso, toDayKey } from '../lib/date'

const TODAY_LABEL = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })

export default function DashboardScreen({ onNavigate }) {
  const { logs, loading: loadingLogs } = useExerciseLogs()
  const { habits, loading: loadingHabits } = useGoodHabitsList()
  const { events, loading: loadingEvents } = useAllGoodHabitEvents()
  const { latest: latestWeight, loading: loadingWeight, logWeight } = useBodyWeight()

  const [editingWeight, setEditingWeight] = useState(false)
  const [weightInput, setWeightInput] = useState('')

  const today = todayIso()
  const exercisesToday = loadingLogs ? null : logs.filter((l) => l.session_date === today).length
  const habitsDoneToday = loadingHabits || loadingEvents
    ? null
    : habits.filter((h) => events.some((e) => e.habit_id === h.id && toDayKey(e.occurred_at) === today)).length
  const habitsTotal = habits.length

  const openWeightEditor = () => {
    setWeightInput(latestWeight ? String(latestWeight.weight_kg) : '')
    setEditingWeight(true)
  }

  const saveWeight = () => {
    const value = parseFloat(weightInput.replace(',', '.'))
    if (!Number.isNaN(value) && value > 0) logWeight(value)
    setEditingWeight(false)
  }

  const weightAgeLabel = (log) => {
    if (!log) return null
    const daysAgo = Math.round((new Date(today) - new Date(log.logged_date)) / 86_400_000)
    if (daysAgo <= 0) return 'hoy'
    if (daysAgo === 1) return 'ayer'
    return `hace ${daysAgo} días`
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <span style={styles.date}>{capitalize(TODAY_LABEL)}</span>
        <h1 style={styles.greeting}>Hoy</h1>
      </div>

      <div style={styles.scroll}>
        {/* Entrenamiento */}
        <button style={styles.ctaCard} onClick={() => onNavigate('ejercicio', 'ejercicios')}>
          <div style={styles.ctaIconWrap}><Dumbbell size={20} color="var(--thread-gold)" /></div>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <span style={styles.ctaTitle}>Entrenar</span>
            <span style={styles.ctaSubtitle}>
              {exercisesToday === null ? 'Cargando...' : exercisesToday > 0
                ? `${exercisesToday} ejercicio${exercisesToday === 1 ? '' : 's'} registrado${exercisesToday === 1 ? '' : 's'} hoy`
                : 'Nada registrado todavía hoy'}
            </span>
          </div>
          <ChevronRight size={18} color="var(--ink-muted)" />
        </button>

        {/* Hábitos */}
        <button style={styles.card} onClick={() => onNavigate('habitos', 'buenos')}>
          <div style={styles.iconWrap}><ListChecks size={19} color="var(--ink-muted)" /></div>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <span style={styles.cardTitle}>Hábitos</span>
            <span style={styles.cardSubtitle}>
              {habitsDoneToday === null
                ? 'Cargando...'
                : habitsTotal === 0
                  ? 'Todavía no tienes hábitos buenos creados'
                  : `${habitsDoneToday} de ${habitsTotal} cumplidos hoy`}
            </span>
          </div>
          <ChevronRight size={18} color="var(--ink-muted)" />
        </button>

        {/* Peso */}
        <div style={styles.card}>
          <div style={styles.iconWrap}><Scale size={19} color="var(--ink-muted)" /></div>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <span style={styles.cardTitle}>Peso</span>
            {!editingWeight ? (
              <span style={styles.cardSubtitle}>
                {loadingWeight
                  ? 'Cargando...'
                  : latestWeight
                    ? `${latestWeight.weight_kg} kg · ${weightAgeLabel(latestWeight)}`
                    : 'Sin registrar todavía'}
              </span>
            ) : (
              <div style={styles.weightInputRow}>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  autoFocus
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveWeight()}
                  placeholder="kg"
                  style={styles.weightInput}
                />
                <button onClick={saveWeight} style={styles.weightSaveBtn} aria-label="Guardar peso">
                  <Check size={15} />
                </button>
              </div>
            )}
          </div>
          {!editingWeight && (
            <button onClick={openWeightEditor} style={styles.updateLink}>Actualizar</button>
          )}
        </div>

        {/* Accesos secundarios reales */}
        <div style={styles.grid}>
          <button style={styles.tile} onClick={() => onNavigate('planificador')}>
            <CalendarClock size={18} color="var(--ink-muted)" />
            <span style={styles.tileLabel}>Mi día</span>
          </button>
          <button style={styles.tile} onClick={() => onNavigate('kpis')}>
            <Gauge size={18} color="var(--ink-muted)" />
            <span style={styles.tileLabel}>KPIs</span>
          </button>
        </div>

        {/* Lo que viene (agua, grupos) — honesto: todavía no existe */}
        <div style={styles.comingSoonBox}>
          <span style={styles.comingSoonLabel}>Próximamente</span>
          <div style={styles.comingSoonGrid}>
            <div style={styles.comingSoonTile}>
              <Droplet size={16} color="var(--focus-teal)" />
              <span style={styles.comingSoonText}>Agua</span>
            </div>
            <div style={styles.comingSoonTile}>
              <Users size={16} color="var(--focus-teal)" />
              <span style={styles.comingSoonText}>Grupos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const styles = {
  wrap: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
  header: { padding: '22px 20px 14px', display: 'flex', flexDirection: 'column', gap: 2 },
  date: { fontSize: 13, color: 'var(--ink-muted)' },
  greeting: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500, margin: 0 },
  scroll: { flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 12 },
  ctaCard: {
    display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
    background: 'var(--surface-raised)', border: 'none', borderRadius: 18, padding: 16, cursor: 'pointer',
  },
  ctaIconWrap: {
    width: 42, height: 42, borderRadius: 12, background: 'var(--thread-gold-soft)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  ctaTitle: { display: 'block', fontSize: 16, fontWeight: 600, color: 'var(--ink)' },
  ctaSubtitle: { display: 'block', fontSize: 12.5, color: 'var(--ink-muted)', marginTop: 2 },
  card: {
    display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
    background: 'var(--surface-raised)', border: 'none', borderRadius: 18, padding: 16, cursor: 'pointer',
  },
  iconWrap: {
    width: 38, height: 38, borderRadius: 10, background: 'var(--surface)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardTitle: { display: 'block', fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' },
  cardSubtitle: { display: 'block', fontSize: 12.5, color: 'var(--ink-muted)', marginTop: 2 },
  updateLink: {
    background: 'transparent', border: 'none', color: 'var(--thread-gold)',
    fontSize: 12.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
  },
  weightInputRow: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 },
  weightInput: {
    width: 72, background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '6px 8px', color: 'var(--ink)', fontSize: 13,
  },
  weightSaveBtn: {
    width: 28, height: 28, borderRadius: 8, border: 'none', background: 'var(--thread-gold)',
    color: '#221703', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 },
  tile: {
    display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
    background: 'var(--surface-raised)', border: 'none', borderRadius: 14, padding: 13, cursor: 'pointer',
  },
  tileLabel: { fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' },
  comingSoonBox: {
    border: '1px dashed var(--border)', borderRadius: 16, padding: 14,
    display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4,
  },
  comingSoonLabel: {
    fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase',
    letterSpacing: 0.4, color: 'var(--focus-teal)', alignSelf: 'flex-start',
    border: '1px solid var(--focus-teal)', borderRadius: 999, padding: '3px 10px',
  },
  comingSoonGrid: { display: 'flex', gap: 18 },
  comingSoonTile: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: 0.75 },
  comingSoonText: { fontSize: 11.5, color: 'var(--ink-muted)' },
}
