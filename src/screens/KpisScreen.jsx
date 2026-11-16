import { useMemo } from 'react'
import { Home } from 'lucide-react'
import { useKpiData } from '../hooks/useKpiData'
import { computeICF, computeNetHabitScore, computeFrictionAnalysis, computeActiveDaysThisWeek, computePlanCompliance, computeSedentaryStats } from '../lib/kpiStats'
import RadarChart from '../components/kpis/RadarChart'
import NetHabitScoreChart from '../components/kpis/NetHabitScoreChart'
import FrictionInsight from '../components/kpis/FrictionInsight'
import PlanComplianceChart from '../components/kpis/PlanComplianceChart'
import SedentaryIndicator from '../components/kpis/SedentaryIndicator'

export default function KpisScreen({ onGoHome }) {
  const data = useKpiData()

  const icf = useMemo(() => computeICF(data), [data])
  const sedentary = useMemo(() => computeSedentaryStats(data), [data])
  const netScore = useMemo(() => computeNetHabitScore(data), [data])
  const friction = useMemo(() => computeFrictionAnalysis(data), [data])
  const activeDays = useMemo(() => computeActiveDaysThisWeek(data), [data])
  const compliance = useMemo(() => computePlanCompliance(data), [data])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={styles.title}>KPIs</h1>
        <button onClick={onGoHome} style={styles.homeBtn} aria-label="Volver al menú">
          <Home size={18} />
        </button>
      </div>
      <p style={styles.subtitle}>Cómo se ve tu semana y tu mes, en números.</p>

      <div style={{ padding: '16px 20px 90px', flex: 1, overflowY: 'auto' }}>
        {data.isDemoMode && <div style={styles.demoBadge}>Modo demo · datos locales</div>}

        {data.loading ? (
          <p style={{ color: 'var(--ink-muted)' }}>Cargando...</p>
        ) : (
          <>
            <div style={styles.statChip}>
              <span style={styles.statChipValue}>{activeDays}/7</span>
              <span style={styles.statChipLabel}>días activos esta semana (ejercicio o hábito bueno)</span>
            </div>

            <Card title="Índice de Consistencia Física" subtitle="Días entrenados esta semana por entorno, sobre una meta de 3 días c/u">
              <RadarChart axes={icf} />
            </Card>

            <Card title="Sedentarismo" subtitle="El otro lado de la moneda: días sin moverte y racha actual sin entrenar">
              <SedentaryIndicator data={sedentary} />
            </Card>

            <Card title="Balance de hábitos" subtitle="Hábitos buenos completados menos recaídas registradas, por día">
              <NetHabitScoreChart data={netScore} />
            </Card>

            <Card title="Fricción: ejercicio y recaídas" subtitle="¿Los días sin ejercicio son también los días que más recaes?">
              <FrictionInsight data={friction} />
            </Card>

            <Card title="Cumplimiento del plan" subtitle="De los bloques que ya pasaron esta semana, cuántos marcaste como hechos">
              <PlanComplianceChart data={compliance} />
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

function Card({ title, subtitle, children }) {
  return (
    <section style={styles.card}>
      <h2 style={styles.cardTitle}>{title}</h2>
      {subtitle && <p style={styles.cardSubtitle}>{subtitle}</p>}
      {children}
    </section>
  )
}

const styles = {
  title: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, margin: 0 },
  subtitle: { padding: '4px 20px 0', color: 'var(--ink-muted)', fontSize: 13, margin: 0 },
  homeBtn: {
    width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--surface)', color: 'var(--ink-muted)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  demoBadge: {
    display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 11,
    color: 'var(--focus-teal)', background: 'var(--focus-teal-soft)',
    border: '1px solid var(--focus-teal)', borderRadius: 999, padding: '3px 10px', marginBottom: 14,
  },
  statChip: {
    display: 'flex', alignItems: 'baseline', gap: 8, background: 'var(--surface)',
    border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', marginBottom: 16,
  },
  statChipValue: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, color: 'var(--thread-gold)' },
  statChipLabel: { fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.4 },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
    padding: '16px 16px 18px', marginBottom: 14,
  },
  cardTitle: { fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500, color: 'var(--ink)', margin: 0 },
  cardSubtitle: { fontSize: 12, color: 'var(--ink-muted)', margin: '4px 0 14px', lineHeight: 1.4 },
}
