import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage from './components/auth/LoginPage'
import Layout from './components/layout/Layout'
import HomePage from './components/home/HomePage'
import CharactersPage from './components/characters/CharactersPage'
import CombatPage from './components/combat/CombatPage'
import MapsPage from './components/maps/MapsPage'
import DiaryPage from './components/diary/DiaryPage'
import DMToolsPage from './components/dm/DMToolsPage'

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0d0f18' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #252840', borderTopColor: '#7c3aed', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#64748b', fontSize: 14 }}>Caricamento…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function App() {
  const { user, loading, isDM } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <LoginPage />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/personaggi" element={<CharactersPage />} />
        <Route path="/combattimento" element={<CombatPage />} />
        <Route path="/mappe" element={<MapsPage />} />
        <Route path="/diario" element={<DiaryPage />} />
        <Route path="/dm" element={isDM ? <DMToolsPage /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
