import { useState } from 'react'
import { Home, Users, Plus, LogIn, ChevronRight } from 'lucide-react'
import { useGymGroups } from '../hooks/useGymGroups'
import GroupDetailScreen from './GroupDetailScreen'

export default function GruposScreen({ onGoHome }) {
  const { groups, loading, error, createGroup, joinGroup } = useGymGroups()
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [mode, setMode] = useState(null) // null | 'create' | 'join'
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)

  if (selectedGroupId) {
    return (
      <GroupDetailScreen
        groupId={selectedGroupId}
        groups={groups}
        onBack={() => setSelectedGroupId(null)}
      />
    )
  }

  const handleSubmit = async () => {
    if (!input.trim() || busy) return
    setBusy(true)
    if (mode === 'create') {
      const created = await createGroup(input.trim())
      if (created) setSelectedGroupId(created.id)
    } else {
      const joined = await joinGroup(input.trim())
      if (joined) setSelectedGroupId(joined.id)
    }
    setBusy(false)
    setInput('')
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h1 style={styles.title}>Grupos</h1>
        <button onClick={onGoHome} style={styles.homeBtn} aria-label="Volver al menú">
          <Home size={18} />
        </button>
      </div>

      <div style={styles.scroll}>
        <p style={styles.intro}>
          Un grupo es solo para progreso de gym — tus hábitos siguen siendo personales.
          Máximo 4 integrantes.
        </p>

        {loading ? (
          <p style={{ color: 'var(--ink-muted)' }}>Cargando...</p>
        ) : groups.length === 0 ? (
          <p style={styles.empty}>Todavía no estás en ningún grupo.</p>
        ) : (
          <div style={styles.list}>
            {groups.map((g) => (
              <button key={g.id} style={styles.card} onClick={() => setSelectedGroupId(g.id)}>
                <div style={styles.iconWrap}><Users size={19} color="var(--thread-gold)" /></div>
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <span style={styles.cardTitle}>{g.name}</span>
                  <span style={styles.cardSubtitle}>{g.memberCount} / {g.maxMembers} integrantes · {g.code}</span>
                </div>
                <ChevronRight size={18} color="var(--ink-muted)" />
              </button>
            ))}
          </div>
        )}

        {mode === null ? (
          <div style={styles.actionsRow}>
            <button style={styles.actionBtn} onClick={() => setMode('create')}>
              <Plus size={15} /> Crear grupo
            </button>
            <button style={styles.actionBtn} onClick={() => setMode('join')}>
              <LogIn size={15} /> Unirme con código
            </button>
          </div>
        ) : (
          <div style={styles.formCard}>
            <label style={styles.label}>{mode === 'create' ? 'Nombre del grupo' : 'Código del grupo'}</label>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'create' ? 'Ej: Los Tanques' : 'Ej: GYM-7F3K'}
              style={styles.input}
              autoFocus
            />
            {error && <p style={styles.errorText}>{error}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => { setMode(null); setInput('') }} style={styles.cancelBtn}>Cancelar</button>
              <button onClick={handleSubmit} style={styles.submitBtn} disabled={busy}>
                {busy ? 'Un momento...' : mode === 'create' ? 'Crear' : 'Unirme'}
              </button>
            </div>
          </div>
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
  scroll: { flex: 1, minHeight: 0, overflowY: 'auto', padding: '14px 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 },
  intro: { fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.5, margin: 0 },
  empty: { color: 'var(--ink-muted)', fontSize: 13.5, textAlign: 'center', padding: '16px 0' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: {
    display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
    background: 'var(--surface-raised)', border: 'none', borderRadius: 16, padding: 14, cursor: 'pointer',
  },
  iconWrap: {
    width: 38, height: 38, borderRadius: 10, background: 'var(--thread-gold-soft)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardTitle: { display: 'block', fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' },
  cardSubtitle: { display: 'block', fontSize: 12, color: 'var(--ink-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' },
  actionsRow: { display: 'flex', gap: 10 },
  actionBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: '12px', borderRadius: 12, border: '1px dashed var(--border)',
    background: 'transparent', color: 'var(--ink-muted)', fontSize: 13, cursor: 'pointer',
  },
  formCard: { background: 'var(--surface-raised)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column' },
  label: { fontSize: 11, color: 'var(--ink-muted)', display: 'block', marginBottom: 6 },
  input: { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--ink)', fontSize: 14 },
  errorText: { color: 'var(--slip-rust)', fontSize: 12.5, margin: '8px 0 0' },
  cancelBtn: { flex: 1, padding: '11px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-muted)', fontSize: 13, cursor: 'pointer' },
  submitBtn: { flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: 'var(--thread-gold)', color: '#221703', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
}
