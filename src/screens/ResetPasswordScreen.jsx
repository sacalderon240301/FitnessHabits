import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Se muestra cuando Supabase redirige de vuelta después de que el usuario
// abrió el link de "olvidé mi contraseña" (evento PASSWORD_RECOVERY).
export default function ResetPasswordScreen({ onDone }) {
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) { setError('Mínimo 6 caracteres.'); return }
    setStatus('loading')
    setError(null)
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) { setError(err.message); setStatus('idle'); return }
    onDone()
  }

  return (
    <div style={styles.wrap}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Elige tu nueva contraseña</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={styles.input}
          minLength={6}
          autoFocus
        />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.submitBtn} disabled={status === 'loading'}>
          {status === 'loading' ? 'Guardando...' : 'Guardar contraseña'}
        </button>
      </form>
    </div>
  )
}

const styles = {
  wrap: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 20px' },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
    padding: 20, maxWidth: 380, width: '100%', margin: '0 auto',
  },
  title: { fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, margin: '0 0 14px', color: 'var(--ink)' },
  input: { width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--ink)', fontSize: 14 },
  error: { color: 'var(--slip-rust)', fontSize: 12.5, marginTop: 10 },
  submitBtn: {
    width: '100%', marginTop: 16, padding: '13px', borderRadius: 12, border: 'none',
    background: 'var(--focus-teal)', color: '#0d1f1d', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
}
