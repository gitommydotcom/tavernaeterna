import { NavLink, Link } from 'react-router-dom'
import { Home, Users, Swords, Map, BookOpen, LogOut, Shield, Crown, X, Wrench } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/personaggi', icon: Users, label: 'Personaggi' },
  { to: '/combattimento', icon: Swords, label: 'Combattimento' },
  { to: '/mappe', icon: Map, label: 'Mappe' },
  { to: '/diario', icon: BookOpen, label: 'Diario' },
]

export default function Sidebar({ onClose }) {
  const { user, profile, isDM, signOut } = useAuth()
  const initials = (profile?.username || user?.email || '?').slice(0, 2).toUpperCase()

  return (
    <aside style={{
      width: 220, minWidth: 220, height: '100dvh',
      background: '#111420', borderRight: '1px solid #1e2235',
      display: 'flex', flexDirection: 'column',
      padding: 'calc(1rem + env(safe-area-inset-top)) 0.75rem calc(1rem + env(safe-area-inset-bottom))',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
    }}>
      {/* Logo + close button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.25rem 0.5rem', marginBottom: '1.5rem' }}>
        <Link to="/" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flex: 1, minWidth: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={18} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9', lineHeight: 1.2 }}>La Taverna</div>
            <div style={{ fontSize: '0.65rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>D&D 5e</div>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4, display: 'flex', flexShrink: 0 }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div className="section-title" style={{ paddingLeft: '0.5rem' }}>Navigazione</div>
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
        {isDM && (
          <>
            <div className="section-title" style={{ paddingLeft: '0.5rem', marginTop: '0.75rem' }}>Master</div>
            <NavLink
              to="/dm"
              onClick={onClose}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Wrench size={17} />
              Strumenti DM
            </NavLink>
          </>
        )}
      </nav>

      {/* User */}
      <div style={{ borderTop: '1px solid #1e2235', paddingTop: '1rem', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.5rem', borderRadius: 8, marginBottom: 6 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: isDM ? 'linear-gradient(135deg, #d97706, #b45309)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700, color: '#fff',
          }}>
            {isDM ? <Crown size={14} /> : initials}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile?.username || user?.email?.split('@')[0]}
            </div>
            <div style={{ fontSize: '0.65rem', color: isDM ? '#d97706' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              {isDM ? '⚔ Dungeon Master' : '🎲 Giocatore'}
            </div>
          </div>
        </div>
        <button className="nav-item" onClick={signOut} style={{ color: '#64748b', width: '100%' }}>
          <LogOut size={15} /> Esci
        </button>
      </div>
    </aside>
  )
}
