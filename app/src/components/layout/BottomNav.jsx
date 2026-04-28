import { NavLink } from 'react-router-dom'
import { Home, Users, Swords, Map, BookOpen, Wrench } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const NAV = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/personaggi', icon: Users, label: 'Personaggi' },
  { to: '/combattimento', icon: Swords, label: 'Combattimento' },
  { to: '/mappe', icon: Map, label: 'Mappe' },
  { to: '/diario', icon: BookOpen, label: 'Diario' },
]

export default function BottomNav() {
  const { isDM } = useAuth()
  const items = isDM ? [...NAV, { to: '/dm', icon: Wrench, label: 'DM' }] : NAV
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
      background: 'rgba(17,20,32,0.97)',
      borderTop: '1px solid #1e2235',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
      backdropFilter: 'blur(12px)',
    }}>
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '0.6rem 0.25rem',
            color: isActive ? '#a78bfa' : '#475569',
            textDecoration: 'none',
            gap: 3,
            transition: 'color 0.15s',
            fontSize: '0.58rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          })}
        >
          {({ isActive }) => (
            <>
              <div style={{
                padding: '0.3rem 0.6rem', borderRadius: 8,
                background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                transition: 'background 0.15s',
              }}>
                <Icon size={20} />
              </div>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
