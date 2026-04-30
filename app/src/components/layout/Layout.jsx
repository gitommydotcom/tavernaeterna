import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useIsMobile'
import Sidebar from './Sidebar'
import { Menu, Shield } from 'lucide-react'

export default function Layout({ children }) {
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="lt-layout" style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: '#0d0f18' }}>
      {/* Desktop sidebar */}
      {!isMobile && <div className="lt-sidebar"><Sidebar /></div>}

      {/* Mobile drawer backdrop */}
      {isMobile && drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="lt-drawer-backdrop"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* Mobile sidebar drawer */}
      {isMobile && (
        <div className="lt-sidebar lt-sidebar-mobile" style={{
          position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <Sidebar onClose={() => setDrawerOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="lt-content" style={{ flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile header */}
        {isMobile && (
          <header className="lt-mobile-header" style={{
            flexShrink: 0,
            background: 'rgba(17,20,32,0.95)',
            borderBottom: '1px solid #1e2235',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', gap: 12,
            padding: 'calc(env(safe-area-inset-top) + 0.5rem) 1rem 0.75rem',
          }}>
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Apri menu"
              style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, cursor: 'pointer', color: '#a78bfa', padding: '6px 8px', display: 'flex', alignItems: 'center' }}
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

        <main className="lt-main" style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          padding: isHome ? 0 : (isMobile ? '1rem' : '1.5rem'),
          paddingBottom: isHome ? 0 : (isMobile ? 'calc(env(safe-area-inset-bottom) + 1.5rem)' : '1.5rem'),
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
