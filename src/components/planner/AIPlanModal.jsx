import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { generateDayPlan } from '../../lib/aiPlanner'
import { categoryColor, categoryLabel } from '../../data/planCategories'

export default function AIPlanModal({ date, onClose, onSave }) {
  const [text, setText] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | preview | saving
  const [error, setError] = useState(null)
  const [blocks, setBlocks] = useState([])

  const handleGenerate = async () => {
    if (!text.trim()) return
    setStatus('loading')
    setError(null)
    const result = await generateDayPlan({ text: text.trim(), date })
    if (result.error) {
      setError(result.error)
      setStatus('idle')
      return
    }
    setBlocks(result.blocks.map((b, i) => ({ ...b, _key: i })))
    setStatus('preview')
  }

  const removeBlock = (key) => setBlocks((prev) => prev.filter((b) => b._key !== key))

  const handleSave = async () => {
    setStatus('saving')
    const payloads = blocks.map(({ _key, ...b }) => b)
    await onSave(payloads)
    onClose()
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.handle} />
        <div style={styles.titleRow}>
          <Sparkles size={17} color="var(--thread-gold)" />
          <h2 style={styles.title}>Generar plan con IA</h2>
        </div>

        {status !== 'preview' && (
          <>
            <p style={styles.hint}>
              Cuéntame en texto libre qué quieres hacer ese día — horarios si los tienes,
              o solo lo que se te ocurra. Yo lo organizo en bloques.
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ej: Me levanto a las 5, desayuno rápido, de 6 a 7:30 voy al parque a hacer barras. A las 9 tengo un bloque de estudio, como una hora y media. En la tarde tengo un bloque libre para lo que salga de trabajo..."
              style={styles.textarea}
              disabled={status === 'loading'}
            />
            {error && <p style={styles.error}>{error}</p>}
            <button
              style={{ ...styles.generateBtn, ...(status === 'loading' || !text.trim() ? styles.btnDisabled : {}) }}
              onClick={handleGenerate}
              disabled={status === 'loading' || !text.trim()}
            >
              {status === 'loading' ? 'Organizando tu día...' : 'Generar plan'}
            </button>
          </>
        )}

        {status === 'preview' && (
          <>
            <p style={styles.hint}>
              Revisa lo que armé. Puedes quitar los bloques que no quieras antes de guardar.
            </p>
            <div style={styles.list}>
              {blocks.map((b) => {
                const color = b.is_flexible ? 'var(--ink-muted)' : categoryColor(b.category)
                return (
                  <div key={b._key} style={{ ...styles.row, borderLeftColor: color }}>
                    <div style={styles.timeCol}>
                      <span style={styles.timeStart}>{b.start_time}</span>
                      <span style={styles.timeEnd}>{b.end_time}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={styles.activity}>{b.is_flexible ? b.flexible_label : b.activity}</h4>
                      {!b.is_flexible && <span style={{ ...styles.categoryTag, color, borderColor: color }}>{categoryLabel(b.category)}</span>}
                    </div>
                    <button style={styles.removeBtn} onClick={() => removeBlock(b._key)} aria-label="Quitar bloque">
                      <X size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
            {blocks.length === 0 && <p style={styles.hint}>Quitaste todos los bloques — no hay nada que guardar.</p>}
            <div style={styles.actions}>
              <button style={styles.cancelBtn} onClick={() => setStatus('idle')}>Volver a escribir</button>
              <button
                style={{ ...styles.saveBtn, ...(blocks.length === 0 || status === 'saving' ? styles.btnDisabled : {}) }}
                onClick={handleSave}
                disabled={blocks.length === 0 || status === 'saving'}
              >
                {status === 'saving' ? 'Guardando...' : `Guardar ${blocks.length} bloque${blocks.length === 1 ? '' : 's'}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 },
  sheet: { width: '100%', maxWidth: 480, background: 'var(--surface-raised)', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: '10px 20px 24px', boxShadow: '0 -8px 30px rgba(0,0,0,0.4)', maxHeight: '85vh', overflowY: 'auto' },
  handle: { width: 36, height: 4, borderRadius: 2, background: 'var(--thread-dim)', margin: '4px auto 16px' },
  titleRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  title: { fontFamily: 'var(--font-display)', fontSize: 19, margin: 0, fontWeight: 500, color: 'var(--ink)' },
  hint: { fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.5, margin: '0 0 12px' },
  textarea: {
    width: '100%', minHeight: 140, background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '10px 12px', color: 'var(--ink)', fontSize: 14, fontFamily: 'inherit',
    resize: 'vertical', lineHeight: 1.5,
  },
  error: { color: 'var(--slip-rust)', fontSize: 12.5, marginTop: 10 },
  generateBtn: {
    width: '100%', marginTop: 14, padding: '13px', borderRadius: 12, border: 'none',
    background: 'var(--thread-gold)', color: '#241a08', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  list: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 },
  row: {
    display: 'flex', gap: 12, alignItems: 'center', background: 'var(--surface)',
    border: '1px solid var(--border)', borderLeft: '4px solid', borderRadius: 12, padding: '10px 12px',
  },
  timeCol: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 46, flexShrink: 0 },
  timeStart: { fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' },
  timeEnd: { fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-muted)' },
  activity: { fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 500, margin: '0 0 4px', color: 'var(--ink)' },
  categoryTag: {
    fontSize: 10, fontFamily: 'var(--font-mono)', border: '1px solid', borderRadius: 999,
    padding: '1px 7px', textTransform: 'uppercase', letterSpacing: 0.3,
  },
  removeBtn: {
    width: 26, height: 26, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent',
    color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  actions: { display: 'flex', gap: 8, marginTop: 6 },
  cancelBtn: { flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer' },
  saveBtn: { flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: 'var(--focus-teal)', color: '#0d1f1d', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
}
