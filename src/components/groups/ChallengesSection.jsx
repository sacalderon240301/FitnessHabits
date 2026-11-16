import { useState } from 'react'
import { Plus, Check, ThumbsUp } from 'lucide-react'
import { useGroupChallenges } from '../../hooks/useGroupChallenges'

const AVATAR_COLORS = ['var(--thread-gold)', 'var(--focus-teal)', 'var(--slip-rust)', 'var(--plan-blue)']

export default function ChallengesSection({ groupId, members, myUserId }) {
  const { challenges, equivalences, progress, loading, createChallenge, proposeEquivalence, toggleVote, logProgress } = useGroupChallenges(groupId)

  const [creatingChallenge, setCreatingChallenge] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newUnit, setNewUnit] = useState('km')
  const [newTarget, setNewTarget] = useState('')

  const [logging, setLogging] = useState(null) // challenge id
  const [logAmount, setLogAmount] = useState('')
  const [logEquivId, setLogEquivId] = useState('base')

  const [proposing, setProposing] = useState(null) // challenge id
  const [eqLabel, setEqLabel] = useState('')
  const [eqFactor, setEqFactor] = useState('')

  const progressFor = (challengeId, userId) => progress.find((p) => p.challenge_id === challengeId && p.user_id === userId)?.total_value ?? 0
  const equivalencesFor = (challengeId) => equivalences.filter((e) => e.challenge_id === challengeId)

  const handleCreateChallenge = async () => {
    if (!newTitle.trim() || !newTarget) return
    await createChallenge(newTitle.trim(), newUnit.trim() || 'unidades', parseFloat(newTarget))
    setCreatingChallenge(false)
    setNewTitle(''); setNewTarget(''); setNewUnit('km')
  }

  const handleLog = async (challengeId) => {
    const amount = parseFloat(logAmount)
    if (Number.isNaN(amount) || amount <= 0) return
    const factor = logEquivId === 'base' ? 1 : equivalences.find((e) => e.id === logEquivId)?.factor ?? 1
    await logProgress(challengeId, amount * factor)
    setLogging(null); setLogAmount(''); setLogEquivId('base')
  }

  const handlePropose = async (challengeId) => {
    const factor = parseFloat(eqFactor)
    if (!eqLabel.trim() || Number.isNaN(factor) || factor <= 0) return
    await proposeEquivalence(challengeId, eqLabel.trim(), factor)
    setProposing(null); setEqLabel(''); setEqFactor('')
  }

  if (loading) return <p style={{ color: 'var(--ink-muted)', fontSize: 13 }}>Cargando retos...</p>

  return (
    <div style={styles.wrap}>
      <span style={styles.sectionTitle}>Retos de la semana</span>

      {challenges.length === 0 && !creatingChallenge && (
        <p style={styles.empty}>Todavía no hay retos esta semana.</p>
      )}

      {challenges.map((c) => {
        const myValue = progressFor(c.id, myUserId)
        const done = myValue >= c.target_value
        const equivs = equivalencesFor(c.id)
        return (
          <div key={c.id} style={styles.challengeCard}>
            <div style={styles.challengeHead}>
              <div style={{ ...styles.checkBox, background: done ? 'var(--thread-gold)' : 'transparent' }}>
                {done && <Check size={12} color="#221703" />}
              </div>
              <div style={{ flex: 1 }}>
                <span style={styles.challengeTitle}>{c.title}</span>
                <span style={styles.challengeTarget}>Meta: {c.target_value} {c.base_label}</span>
              </div>
            </div>

            <div style={styles.memberBars}>
              {members.map((m, i) => {
                const value = progressFor(c.id, m.userId)
                const pct = Math.min(100, (value / c.target_value) * 100)
                return (
                  <div key={m.userId} style={styles.memberRow}>
                    <div style={{ ...styles.memberAvatar, background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                      {(m.isMe ? 'Tú' : m.displayName)[0].toUpperCase()}
                    </div>
                    <span style={styles.memberName}>{m.isMe ? 'Tú' : m.displayName}</span>
                    <div style={styles.barTrack}><div style={{ ...styles.barFill, width: `${pct}%` }} /></div>
                    <span style={styles.memberValue}>{value} {c.base_label}</span>
                  </div>
                )
              })}
            </div>

            {logging === c.id ? (
              <div style={styles.inlineForm}>
                <input
                  type="number" inputMode="decimal" value={logAmount} onChange={(e) => setLogAmount(e.target.value)}
                  placeholder="Cantidad" style={styles.smallInput} autoFocus
                />
                <select value={logEquivId} onChange={(e) => setLogEquivId(e.target.value)} style={styles.select}>
                  <option value="base">{c.base_label}</option>
                  {equivs.map((eq) => <option key={eq.id} value={eq.id}>{eq.label}</option>)}
                </select>
                <button onClick={() => handleLog(c.id)} style={styles.smallSubmitBtn}>Sumar</button>
              </div>
            ) : (
              <button onClick={() => setLogging(c.id)} style={styles.textBtn}>+ Registrar avance</button>
            )}

            <div style={styles.equivWrap}>
              <span style={styles.equivTitle}>Equivalencias votadas</span>
              {equivs.length === 0 && <span style={styles.equivEmpty}>Solo {c.base_label} por ahora.</span>}
              {equivs.map((eq) => {
                const voted = eq.votes.includes(myUserId)
                const approved = eq.votes.length >= Math.ceil(members.length / 2)
                return (
                  <div key={eq.id} style={styles.equivRow}>
                    <span style={styles.equivLabel}>{eq.label} = {eq.factor} {c.base_label}</span>
                    <button onClick={() => toggleVote(eq.id, voted)} style={{ ...styles.voteBtn, ...(voted ? styles.voteBtnActive : {}) }}>
                      <ThumbsUp size={11} /> {eq.votes.length}
                    </button>
                    <span style={{ ...styles.statusChip, color: approved ? 'var(--focus-teal)' : 'var(--ink-muted)' }}>
                      {approved ? 'Aprobado' : 'Votando'}
                    </span>
                  </div>
                )
              })}

              {proposing === c.id ? (
                <div style={styles.inlineForm}>
                  <input value={eqLabel} onChange={(e) => setEqLabel(e.target.value)} placeholder="Ej: 1 km bici" style={styles.smallInput} />
                  <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>=</span>
                  <input type="number" inputMode="decimal" value={eqFactor} onChange={(e) => setEqFactor(e.target.value)} placeholder={c.base_label} style={styles.smallInput} />
                  <button onClick={() => handlePropose(c.id)} style={styles.smallSubmitBtn}>Enviar</button>
                </div>
              ) : (
                <button onClick={() => setProposing(c.id)} style={styles.textBtn}>+ Proponer equivalencia</button>
              )}
            </div>
          </div>
        )
      })}

      {creatingChallenge ? (
        <div style={styles.challengeCard}>
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ej: Cardio semanal" style={styles.input} autoFocus />
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="Unidad (ej: km)" style={{ ...styles.input, flex: 1 }} />
            <input type="number" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} placeholder="Meta" style={{ ...styles.input, flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setCreatingChallenge(false)} style={styles.cancelBtn}>Cancelar</button>
            <button onClick={handleCreateChallenge} style={styles.smallSubmitBtn}>Crear reto</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setCreatingChallenge(true)} style={styles.newChallengeBtn}>
          <Plus size={14} /> Nuevo reto de la semana
        </button>
      )}
    </div>
  )
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: 'var(--ink)' },
  empty: { fontSize: 12.5, color: 'var(--ink-muted)' },
  challengeCard: { background: 'var(--surface-raised)', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 },
  challengeHead: { display: 'flex', alignItems: 'center', gap: 10 },
  checkBox: { width: 20, height: 20, borderRadius: 6, border: '1.6px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  challengeTitle: { display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' },
  challengeTarget: { display: 'block', fontSize: 11.5, color: 'var(--ink-muted)' },
  memberBars: { display: 'flex', flexDirection: 'column', gap: 7 },
  memberRow: { display: 'flex', alignItems: 'center', gap: 8 },
  memberAvatar: { width: 20, height: 20, borderRadius: '50%', color: '#1a1406', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  memberName: { fontSize: 11.5, color: 'var(--ink)', width: 46, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  barTrack: { flex: 1, height: 6, borderRadius: 4, background: 'var(--surface)', overflow: 'hidden' },
  barFill: { height: '100%', background: 'var(--focus-teal)' },
  memberValue: { fontSize: 11, color: 'var(--ink-muted)', width: 50, textAlign: 'right', flexShrink: 0 },
  textBtn: { alignSelf: 'flex-start', background: 'transparent', border: 'none', color: 'var(--thread-gold)', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 },
  inlineForm: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  smallInput: { flex: 1, minWidth: 70, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 9px', color: 'var(--ink)', fontSize: 12.5 },
  select: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 9px', color: 'var(--ink)', fontSize: 12.5 },
  smallSubmitBtn: { background: 'var(--thread-gold)', color: '#221703', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', flexShrink: 0 },
  equivWrap: { display: 'flex', flexDirection: 'column', gap: 7, borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 2 },
  equivTitle: { fontSize: 11, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: 0.3, fontFamily: 'var(--font-mono)' },
  equivEmpty: { fontSize: 12, color: 'var(--ink-muted)' },
  equivRow: { display: 'flex', alignItems: 'center', gap: 8 },
  equivLabel: { flex: 1, fontSize: 12.5, color: 'var(--ink)' },
  voteBtn: { display: 'flex', alignItems: 'center', gap: 4, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-muted)', borderRadius: 999, padding: '4px 9px', fontSize: 11.5, cursor: 'pointer' },
  voteBtnActive: { borderColor: 'var(--focus-teal)', color: 'var(--focus-teal)', background: 'var(--focus-teal-soft)' },
  statusChip: { fontSize: 11, fontWeight: 600, width: 56, textAlign: 'right' },
  input: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 11px', color: 'var(--ink)', fontSize: 13.5 },
  cancelBtn: { flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-muted)', fontSize: 12.5, cursor: 'pointer' },
  newChallengeBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: '11px', borderRadius: 12, border: '1px dashed var(--border)',
    background: 'transparent', color: 'var(--ink-muted)', fontSize: 13, cursor: 'pointer',
  },
}
