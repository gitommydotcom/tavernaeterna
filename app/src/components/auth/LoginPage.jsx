import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Shield, Sword, BookOpen } from 'lucide-react'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (tab === 'login') {
      const err = await signIn(email, password)
      if (err) setError(err.message === 'Invalid login credentials'
        ? 'Email o password non corretti.' : err.message)
    } else {
      if (!username.trim()) { setError('Inserisci un nome utente.'); setLoading(false); return }
      const err = await signUp(email, password, username)
      if (err) setError(err.message)
      else setSuccess('Registrazione completata! Controlla la tua email per confermare l\'account, poi accedi.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f18', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      {/* Background decoration */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(8,145,178,0.05) 0%, transparent 70%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={24} color="#fff" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>La Taverna</h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>La tua piattaforma per D&D</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '1.75rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#0d0f18', borderRadius: 8, padding: 3, marginBottom: '1.5rem' }}>
            {['login', 'register'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess('') }}
                style={{
                  flex: 1, padding: '0.5rem', borderRadius: 6, border: 'none',
                  background: tab === t ? '#161929' : 'transparent',
                  color: tab === t ? '#f1f5f9' : '#64748b',
                  fontWeight: tab === t ? 600 : 400,
                  fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                {t === 'login' ? 'Accedi' : 'Registrati'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tab === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Nome Avventuriero
                </label>
                <input className="input" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Come ti chiami?" required />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email
              </label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="la@tua.email" required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Password
              </label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>

            {error && (
              <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '0.75rem', color: '#fca5a5', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ background: '#052e16', border: '1px solid #166534', borderRadius: 8, padding: '0.75rem', color: '#86efac', fontSize: '0.875rem' }}>
                {success}
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Caricamento…' : tab === 'login' ? 'Entra nella Taverna' : 'Crea Account'}
            </button>
          </form>

          {tab === 'login' && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#0d0f18', borderRadius: 8, border: '1px solid #1e2235' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Sword size={14} color="#7c3aed" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Info DM</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Dopo la registrazione, il DM deve eseguire la query SQL nel pannello Supabase per ottenere i privilegi DM. Vedi <code style={{ color: '#94a3b8' }}>supabase_setup.sql</code>.
              </p>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.75rem', marginTop: '1.5rem' }}>
          D&D 5a Edizione · La Taverna v0.1
        </p>
      </div>
    </div>
  )
}
