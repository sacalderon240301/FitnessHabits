import { useEffect, useState } from 'react'
import { Dumbbell, ListChecks, CalendarClock, Gauge, Droplet, Users, Scale, ChevronRight, ChevronLeft, Check, Trophy } from 'lucide-react'
import { useExerciseLogs } from '../hooks/useExerciseLogs'
import { useGoodHabitsList } from '../hooks/useGoodHabitsList'
import { useAllGoodHabitEvents } from '../hooks/useAllGoodHabitEvents'
import { useBodyWeight } from '../hooks/useBodyWeight'
import { useWaterLog, DAILY_GOAL } from '../hooks/useWaterLog'
import { useGymGroups } from '../hooks/useGymGroups'
import { useGroupChallenges } from '../hooks/useGroupChallenges'
import { supabase, isDemoMode } from '../lib/supabase'
import { todayIso, toDayKey, addDays } from '../lib/date'

function dateLabel(dateKey) {
  const label = new Date(dateKey + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function DashboardScreen({ onNavigate }) {
  const { logs, loading: loadingLogs } = useExerciseLogs()
  const { habits, loading: loadingHabits } = useGoodHabitsList()
  const { events, loading: loadingEvents } = useAllGoodHabitEvents()
  const { logs: weightLogs, loading: loadingWeight, logWeight } = useBodyWeight()
  const { logs: waterLogs, streak: waterStreak, loading: loadingWater } = useWaterLog()
  const { groups, loading: loadingGroups } = useGymGroups()
  const firstGroup = groups[0]
  const { challenges, progress, loading: loadingChallenges } = useGroupChallenges(firstGroup?.id)

  const [myUserId, setMyUserId] = useState(isDemoMode ? 'demo-me' : null)
  useEffect(() => {
    if (isDemoMode) return
    supabase.auth.getUser().then(({ data }) => setMyUserId(data?.user?.id ?? null))
  }, [])

  const [selectedDate, setSelectedDate] = useState(todayIso())
  const isToday = selectedDate === todayIso()

  const [editingWeight, setEditingWeight] = useState(false)
  const [weightInput, setWeightInput] = useState('')

  const exercisesOnDate = loadingLogs ? null : logs.filter((l) => l.session_date === selectedDate).length
  const habitsDoneOnDate = loadingHabits || loadingEvents
    ? null
    : habits.filter((h) => events.some((e) => e.habit_id === h.id && toDayKey(e.occurred_at) === selectedDate)).length
  const habitsTotal = habits.length
  const weightOnDate = loadingWeight ? undefined : weightLogs.find((l) => l.logged_date === selectedDate) ?? null
  const glassesOnDate = loadingWater ? null : waterLogs.find((l) => l.logged_date === selectedDate)?.glasses ?? 0

  const openWeightEditor = () => {
    setWeightInput(weightOnDate ? String(weightOnDate.weight_kg) : '')
    setEditingWeight(true)
  }

  const saveWeight = () => {
    const value = parseFloat(weightInput.replace(',', '.'))
    if (!Number.isNaN(value) && value > 0) logWeight(value, selectedDate)
    setEditingWeight(false)
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.dateNav}>
          <button onClick={() => setSelectedDate((d) => addDays(d, -1))} style={styles.dateNavBtn} aria-label="Día anterior">
            <ChevronLeft size={18} />
          </button>
          <span style={styles.date}>{dateLabel(selectedDate)}</span>
          <button onClick={() => setSelectedDate((d) => addDays(d, 1))} style={styles.dateNavBtn} aria-label="Día siguiente">
            <ChevronRight size={18} />
          </button>
        </div>
        <div style={styles.greetingRow}>
          <h1 style={styles.greeting}>{isToday ? 'Hoy' : 'Viendo este día'}</h1>
          {!isToday && (
            <button onClick={() => setSelectedDate(todayIso())} style={styles.todayBtn}>Volver a hoy</button>
          )}
        </div>
      </div>

      <div style={styles.scroll}>
        {/* Entrenamiento */}
        <button style={styles.ctaCard} onClick={() => onNavigate('ejercicio', 'ejercicios')}>
          <div style={styles.ctaIconWrap}><Dumbbell size={20} color="var(--thread-gold)" /></div>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <span style={styles.ctaTitle}>Entrenar</span>
            <span style={styles.ctaSubtitle}>
              {exercisesOnDate === null ? 'Cargando...' : exercisesOnDate > 0
                ? `${exercisesOnDate} ejercicio${exercisesOnDate === 1 ? '' : 's'} registrado${exercisesOnDate === 1 ? '' : 's'}${isToday ? ' hoy' : ' ese día'}`
                : `Nada registrado ${isToday ? 'todavía hoy' : 'ese día'}`}
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
              {habitsDoneOnDate === null
                ? 'Cargando...'
                : habitsTotal === 0
                  ? 'Todavía no tienes hábitos buenos creados'
                  : `${habitsDoneOnDate} de ${habitsTotal} cumplidos${isToday ? ' hoy' : ' ese día'}`}
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
                {weightOnDate === undefined
                  ? 'Cargando...'
                  : weightOnDate
                    ? `${weightOnDate.weight_kg} kg`
                    : `Sin registrar ${isToday ? 'todavía' : 'ese día'}`}
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

        {/* Agua */}
        <button style={styles.card} onClick={() => onNavigate('agua')}>
          <div style={styles.iconWrap}><Droplet size={19} color="var(--focus-teal)" /></div>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <span style={styles.cardTitle}>Agua</span>
            <span style={styles.cardSubtitle}>
              {glassesOnDate === null
                ? 'Cargando...'
                : isToday
                  ? `${glassesOnDate} / ${DAILY_GOAL} vasos hoy · racha de ${waterStreak} día${waterStreak === 1 ? '' : 's'}`
                  : `${glassesOnDate} / ${DAILY_GOAL} vasos ese día`}
            </span>
          </div>
          <ChevronRight size={18} color="var(--ink-muted)" />
        </button>

        {/* Retos semanales del grupo (checklist) */}
        {!loadingGroups && firstGroup && (
          <div style={styles.card}>
            <div style={styles.iconWrap}><Trophy size={19} color="var(--thread-gold)" /></div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <span style={styles.cardTitle}>Retos de la semana</span>
              {loadingChallenges ? (
                <span style={styles.cardSubtitle}>Cargando...</span>
              ) : challenges.length === 0 ? (
                <span style={styles.cardSubtitle}>Sin retos esta semana en {firstGroup.name}</span>
              ) : (
                <div style={styles.challengeChecklist}>
                  {challenges.map((c) => {
                    const myValue = progress.find((p) => p.challenge_id === c.id && p.user_id === myUserId)?.total_value ?? 0
                    const done = myValue >= c.target_value
                    return (
                      <div key={c.id} style={styles.challengeRow}>
                        <div style={{ ...styles.miniCheck, background: done ? 'var(--thread-gold)' : 'transparent' }}>
                          {done && <Check size={10} color="#221703" />}
                        </div>
                        <span style={styles.challengeRowText}>{c.title} · {myValue}/{c.target_value} {c.base_label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <button onClick={() => onNavigate('grupos')} style={{ background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Ver grupos">
              <ChevronRight size={18} color="var(--ink-muted)" />
            </button>
          </div>
        )}

        {/* Accesos secundarios reales */}
        <div style={styles.grid}>
          <button style={styles.tile} onClick={() => onNavigate('grupos')}>
            <Users size={18} color="var(--ink-muted)" />
            <span style={styles.tileLabel}>Grupos</span>
          </button>
          <button style={styles.tile} onClick={() => onNavigate('planificador')}>
            <CalendarClock size={18} color="var(--ink-muted)" />
            <span style={styles.tileLabel}>Mi día</span>
          </button>
          <button style={styles.tile} onClick={() => onNavigate('kpis')}>
            <Gauge size={18} color="var(--ink-muted)" />
            <span style={styles.tileLabel}>KPIs</span>
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrap: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
  header: { padding: '18px 20px 14px', display: 'flex', flexDirection: 'column', gap: 6 },
  dateNav: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  dateNavBtn: {
    width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)',
    color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  date: { fontSize: 13, color: 'var(--ink-muted)', textAlign: 'center', minWidth: 150 },
  greetingRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500, margin: 0 },
  todayBtn: {
    border: '1px solid var(--thread-gold)', color: 'var(--thread-gold)', background: 'var(--thread-gold-soft)',
    borderRadius: 999, padding: '6px 12px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
  },
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
  challengeChecklist: { display: 'flex', flexDirection: 'column', gap: 5, marginTop: 3 },
  challengeRow: { display: 'flex', alignItems: 'center', gap: 7 },
  miniCheck: { width: 15, height: 15, borderRadius: 4, border: '1.4px solid var(--border)', flexShrink: 0 },
  challengeRowText: { fontSize: 12, color: 'var(--ink-muted)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10 },
  tile: {
    display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
    background: 'var(--surface-raised)', border: 'none', borderRadius: 14, padding: 13, cursor: 'pointer',
  },
  tileLabel: { fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' },
}
