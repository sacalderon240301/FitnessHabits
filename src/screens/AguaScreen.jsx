import { useState } from 'react'
import { Home, Flame, Plus, Droplet } from 'lucide-react'
import { useWaterLog, DAILY_GOAL } from '../hooks/useWaterLog'
import { todayIso, addDays } from '../lib/date'

export default function AguaScreen({ onGoHome }) {
  const { logs, todayGlasses, streak, loading, addGlasses, setGlasses } = useWaterLog()
  const [manualInput, setManualInput] = useState('')

  const liters = (todayGlasses * 0.25).toFixed(2)

  const handleBottleTap = (index) => {
    setGlasses(todayGlasses === index + 1 ? index : index + 1)
  }

  const handleManualAdd = () => {
    const value = parseInt(manualInput, 10)
    if (!Number.isNaN(value) && value !== 0) addGlasses(value)
    setManualInput('')
  }

  const week = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(todayIso(), -(6 - i))
    const glasses = logs.find((l) => l.logged_date === date)?.glasses ?? 0
    const label = new Date(date + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'narrow' })
    return { date, label, done: glasses >= DAILY_GOAL }
  })

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h1 style={styles.title}>Agua</h1>
        <button onClick={onGoHome} style={styles.homeBtn} aria-label="Volver al menú">
          <Home size={18} />
        </button>
      </div>

      <div style={styles.scroll}>
        {loading ? (
          <p style={{ color: 'var(--ink-muted)' }}>Cargando...</p>
        ) : (
          <>
            <div style={styles.streakCard}>
              <Flame size={26} color="var(--slip-rust)" />
              <div>
                <span style={styles.streakValue}>{streak} día{streak === 1 ? '' : 's'} seguido{streak === 1 ? '' : 's'}</span>
                <span style={styles.streakSubtitle}>cumpliendo tu meta diaria</span>
              </div>
            </div>

            <div style={styles.bottlesCard}>
              <div style={{ textAlign: 'center' }}>
                <span style={styles.countValue}>{todayGlasses} / {DAILY_GOAL}</span>
                <span style={styles.countLabel}>vasos · {liters} L</span>
              </div>

              <div style={styles.bottleRow}>
                {Array.from({ length: DAILY_GOAL }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handleBottleTap(i)}
                    style={styles.bottleBtn}
                    aria-label={`Marcar ${i + 1} vaso${i === 0 ? '' : 's'}`}
                  >
                    <Droplet
                      size={26}
                      color="var(--focus-teal)"
                      fill={i < todayGlasses ? 'var(--focus-teal)' : 'none'}
                    />
                  </button>
                ))}
              </div>

              <div style={styles.manualRow}>
                <input
                  type="number"
                  inputMode="numeric"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
                  placeholder="Vasos a agregar"
                  style={styles.manualInput}
                />
                <button onClick={handleManualAdd} style={styles.manualBtn}>
                  <Plus size={14} />
                  Agregar
                </button>
              </div>
            </div>

            <div style={styles.weekCard}>
              <span style={styles.weekTitle}>Esta semana</span>
              <div style={styles.weekRow}>
                {week.map((d) => (
                  <div key={d.date} style={styles.weekDay}>
                    <div style={{ ...styles.weekDot, background: d.done ? 'var(--focus-teal)' : 'var(--surface)' }} />
                    <span style={styles.weekLabel}>{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  wrap: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
  header: { padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, margin: 0 },
  homeBtn: {
    width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--surface)', color: 'var(--ink-muted)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  scroll: { flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 },
  streakCard: {
    display: 'flex', alignItems: 'center', gap: 14,
    background: 'var(--surface-raised)', borderRadius: 16, padding: 16,
  },
  streakValue: { display: 'block', fontSize: 16, fontWeight: 600, color: 'var(--ink)' },
  streakSubtitle: { display: 'block', fontSize: 12.5, color: 'var(--ink-muted)', marginTop: 2 },
  bottlesCard: {
    background: 'var(--surface-raised)', borderRadius: 18, padding: 18,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
  },
  countValue: { display: 'block', fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--ink)' },
  countLabel: { display: 'block', fontSize: 12.5, color: 'var(--ink-muted)' },
  bottleRow: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  bottleBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 },
  manualRow: { display: 'flex', gap: 8, width: '100%' },
  manualInput: {
    flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '10px 12px', color: 'var(--ink)', fontSize: 13.5,
  },
  manualBtn: {
    display: 'flex', alignItems: 'center', gap: 6, border: '1px solid var(--border)',
    borderRadius: 10, padding: '10px 14px', background: 'transparent', color: 'var(--ink)',
    fontSize: 13, cursor: 'pointer', flexShrink: 0,
  },
  weekCard: { background: 'var(--surface-raised)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  weekTitle: { fontSize: 14, fontWeight: 600, color: 'var(--ink)' },
  weekRow: { display: 'flex', justifyContent: 'space-between' },
  weekDay: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  weekDot: { width: 22, height: 22, borderRadius: '50%' },
  weekLabel: { fontSize: 11, color: 'var(--ink-muted)' },
}
