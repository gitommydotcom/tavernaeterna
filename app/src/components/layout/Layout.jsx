import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useIsMobile'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { Menu, Shield } from 'lucide-react'

export default function Layout({ children }) {
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0d0f18' }}>
      {/* Desktop sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile drawer backdrop */}
      {isMobile && drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* Mobile sidebar drawer */}
      {isMobile && (
        <div style={{
          position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <Sidebar onClose={() => setDrawerOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile header */}
        {isMobile && (
          <header style={{
            position: 'sticky', top: 0, zIndex: 30,
            background: 'rgba(17,20,32,0.95)',
            borderBottom: '1px solid #1e2235',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem',
          }}>
            <button
              onClick={() => setDrawerOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, display: 'flex' }}
            >
              <Menu size={22} />
            </button>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={14} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9' }}>La Taverna</span>
            </Link>
          </header>
        )}

        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: isHome ? 0 : (isMobile ? '1rem' : '1.5rem'),
          paddingBottom: isMobile ? 'calc(70px + env(safe-area-inset-bottom))' : (isHome ? 0 : '1.5rem'),
        }}>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      {isMobile && <BottomNav />}
    </div>
  )
}
