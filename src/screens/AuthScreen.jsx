import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { WeaveMark } from '../data/motionIcons'

export default function AuthScreen() {
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const switchMode = (next) => {
    setMode(next)
    setError(null)
    setMessage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || (mode !== 'forgot' && !password)) return
    setStatus('loading')
    setError(null)
    setMessage(null)

    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (err) { setError(err.message); setStatus('idle'); return }
      // onAuthStateChange en App.jsx se encarga de entrar a la app
    } else if (mode === 'signup') {
      const { error: err } = await supabase.auth.signUp({ email: email.trim(), password })
      if (err) { setError(err.message); setStatus('idle'); return }
      setMessage('Cuenta creada. Si tu proyecto pide confirmar el correo, revisa tu bandeja y luego inicia sesión.')
      setMode('login')
      setStatus('idle')
    } else if (mode === 'forgot') {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      })
      if (err) { setError(err.message); setStatus('idle'); return }
      setMessage('Si ese correo tiene cuenta, te mandamos un link para elegir una contraseña nueva.')
      setStatus('idle')
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.mascot}><WeaveMark /></div>
        <h1 style={styles.title}>Hábitos</h1>
        <p style={styles.subtitle}>Cada quien ve y guarda solo lo suyo.</p>
      </div>

      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.cardTitle}>
          {mode === 'login' && 'Iniciar sesión'}
          {mode === 'signup' && 'Crear cuenta'}
          {mode === 'forgot' && 'Recuperar contraseña'}
        </h2>

        <label style={styles.label}>Correo</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          style={styles.input}
          autoFocus
        />

        {mode !== 'forgot' && (
          <>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              minLength={6}
            />
          </>
        )}

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.message}>{message}</p>}

        <button type="submit" style={styles.submitBtn} disabled={status === 'loading'}>
          {status === 'loading' ? 'Un momento...' : (
            mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Crear cuenta' : 'Enviar link'
          )}
        </button>

        <div style={styles.links}>
          {mode === 'login' && (
            <>
              <button type="button" style={styles.linkBtn} onClick={() => switchMode('signup')}>Crear cuenta</button>
              <button type="button" style={styles.linkBtn} onClick={() => switchMode('forgot')}>Olvidé mi contraseña</button>
            </>
          )}
          {mode !== 'login' && (
            <button type="button" style={styles.linkBtn} onClick={() => switchMode('login')}>Volver a iniciar sesión</button>
          )}
        </div>
      </form>
    </div>
  )
}

const styles = {
  wrap: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 20px', overflowY: 'auto' },
  header: { textAlign: 'center', marginBottom: 24 },
  mascot: { width: 64, height: 64, margin: '0 auto 10px' },
  title: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500, margin: 0 },
  subtitle: { color: 'var(--ink-muted)', fontSize: 13, margin: '8px 0 0' },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
    padding: 20, maxWidth: 380, width: '100%', margin: '0 auto',
  },
  cardTitle: { fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, margin: '0 0 14px', color: 'var(--ink)' },
  label: { fontSize: 11, color: 'var(--ink-muted)', display: 'block', margin: '10px 0 4px' },
  input: { width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--ink)', fontSize: 14 },
  error: { color: 'var(--slip-rust)', fontSize: 12.5, marginTop: 10 },
  message: { color: 'var(--focus-teal)', fontSize: 12.5, marginTop: 10, lineHeight: 1.5 },
  submitBtn: {
    width: '100%', marginTop: 16, padding: '13px', borderRadius: 12, border: 'none',
    background: 'var(--focus-teal)', color: '#0d1f1d', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
  links: { display: 'flex', justifyContent: 'space-between', marginTop: 14, flexWrap: 'wrap', gap: 8 },
  linkBtn: { background: 'transparent', border: 'none', color: 'var(--focus-teal)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', padding: 0 },
}
