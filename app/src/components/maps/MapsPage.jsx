import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { uploadImage } from '../../lib/cloudinary'
import { Plus, Grid, Trash2, Upload, X, Map, ChevronDown } from 'lucide-react'

export default function MapsPage() {
  const { isDM } = useAuth()
  const [maps, setMaps] = useState([])
  const [activeMapId, setActiveMapId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddToken, setShowAddToken] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showMapPicker, setShowMapPicker] = useState(false)

  const activeMap = maps.find(m => m.id === activeMapId)
  const broadcastRef = useRef(null)

  useEffect(() => {
    loadMaps()
    const channel = supabase.channel('maps-live', { config: { broadcast: { self: false } } })
    channel
      .on('broadcast', { event: 'map-update' }, ({ payload }) => {
        setMaps(prev => prev.map(m => m.id === payload.id ? { ...m, ...payload.updates } : m))
      })
      .on('broadcast', { event: 'map-list-change' }, () => loadMaps())
      .subscribe()
    broadcastRef.current = channel
    return () => supabase.removeChannel(channel)
  }, [])

  async function loadMaps() {
    const { data } = await supabase.from('maps').select('*').order('created_at', { ascending: false })
    if (data) {
      setMaps(data)
      setActiveMapId(id => id ?? (data[0]?.id ?? null))
    }
    setLoading(false)
  }

  async function createMap(name) {
    const { data } = await supabase.from('maps').insert({ name, tokens: [] }).select().single()
    if (data) {
      setMaps(prev => [data, ...prev])
      setActiveMapId(data.id)
      broadcastRef.current?.send({ type: 'broadcast', event: 'map-list-change', payload: {} })
    }
  }

  async function deleteMap(id) {
    if (!confirm('Eliminare questa mappa?')) return
    await supabase.from('maps').delete().eq('id', id)
    setMaps(prev => {
      const next = prev.filter(m => m.id !== id)
      if (activeMapId === id) setActiveMapId(next[0]?.id ?? null)
      return next
    })
    broadcastRef.current?.send({ type: 'broadcast', event: 'map-list-change', payload: {} })
  }

  async function updateMap(id, updates) {
    setMaps(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))
    broadcastRef.current?.send({ type: 'broadcast', event: 'map-update', payload: { id, updates } })
    await supabase.from('maps').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
  }

  async function handleImageUpload(file) {
    if (!activeMap || !file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      await updateMap(activeMap.id, { image_url: url })
    } catch (e) { alert('Errore caricamento: ' + e.message) }
    setUploading(false)
  }

  function addToken(tokenData) {
    if (!activeMap) return
    // x/y stored as fractions (0-1) so position is consistent across all screen sizes
    const tokens = [...(activeMap.tokens || []), { ...tokenData, id: `t_${Date.now()}`, x: 0.5, y: 0.5 }]
    updateMap(activeMap.id, { tokens })
    setShowAddToken(false)
  }

  function removeToken(tokenId) {
    if (!activeMap) return
    updateMap(activeMap.id, { tokens: activeMap.tokens.filter(t => t.id !== tokenId) })
  }

  // Receives the full updated tokens array from MapCanvas (avoids stale activeMap.tokens)
  function saveTokens(allTokens) {
    if (!activeMap) return
    updateMap(activeMap.id, { tokens: allTokens })
  }

  if (loading) return <div style={{ color: '#64748b', padding: '2rem' }}>Caricamento mappe…</div>

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 3rem)', overflow: 'hidden', gap: 8 }}>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>

        {/* Map picker */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMapPicker(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#161929', border: '1px solid #252840', borderRadius: 8, padding: '0.4rem 0.75rem', color: '#f1f5f9', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, minWidth: 130 }}
          >
            <Map size={14} color="#a78bfa" />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
              {activeMap?.name ?? 'Nessuna mappa'}
            </span>
            <ChevronDown size={13} color="#64748b" />
          </button>
          {showMapPicker && (
            <div style={{ position: 'absolute', top: '110%', left: 0, zIndex: 50, background: '#161929', border: '1px solid #252840', borderRadius: 8, minWidth: 180, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
              {maps.length === 0 && <div style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#475569', fontStyle: 'italic' }}>Nessuna mappa</div>}
              {maps.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.5rem 0.75rem', cursor: 'pointer', background: m.id === activeMapId ? '#1e1040' : 'transparent' }}
                  onClick={() => { setActiveMapId(m.id); setShowMapPicker(false) }}>
                  <Map size={12} color={m.id === activeMapId ? '#a78bfa' : '#64748b'} />
                  <span style={{ flex: 1, fontSize: '0.8rem', color: m.id === activeMapId ? '#f1f5f9' : '#94a3b8' }}>{m.name}</span>
                  {isDM && <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#475569' }} onClick={e => { e.stopPropagation(); deleteMap(m.id) }}><Trash2 size={11} /></button>}
                </div>
              ))}
              {isDM && (
                <div style={{ borderTop: '1px solid #1e2235', padding: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.75rem' }} onClick={() => { createMap(`Mappa ${maps.length + 1}`); setShowMapPicker(false) }}>
                    <Plus size={12} /> Nuova mappa
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {activeMap && isDM && (
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => updateMap(activeMap.id, { grid_enabled: !activeMap.grid_enabled })}>
              <Grid size={13} /> Griglia {activeMap.grid_enabled ? 'ON' : 'OFF'}
            </button>

            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
              <Upload size={13} /> {uploading ? 'Caricamento…' : 'Immagine'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e.target.files[0])} disabled={uploading} />
            </label>

            <button className="btn btn-secondary btn-sm" onClick={() => setShowAddToken(true)}>
              <Plus size={13} /> Token
            </button>
          </>
        )}

        {/* Token list inline */}
        {activeMap?.tokens?.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginLeft: 'auto' }}>
            {activeMap.tokens.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#161929', border: '1px solid #252840', borderRadius: 6, padding: '2px 8px 2px 4px' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: t.color || '#7c3aed', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', fontWeight: 700, color: '#fff' }}>
                  {t.avatar_url ? <img src={t.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : (t.name || '?').slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t.name}</span>
                {isDM && <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1, color: '#475569', display: 'flex' }} onClick={() => removeToken(t.id)}><X size={10} /></button>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Canvas ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', minHeight: 0 }}>
        {!activeMap ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '1rem' }}>
            <Map size={48} color="#252840" />
            <p style={{ color: '#64748b' }}>Nessuna mappa selezionata.</p>
            {isDM && <button className="btn btn-primary" onClick={() => createMap('Prima Mappa')}><Plus size={16} /> Crea Mappa</button>}
          </div>
        ) : (
          <MapCanvas map={activeMap} isDM={isDM} onSaveTokens={saveTokens} />
        )}
      </div>

      {showAddToken && isDM && (
        <AddTokenModal onAdd={addToken} onClose={() => setShowAddToken(false)} />
      )}

      {/* Close map picker on outside click */}
      {showMapPicker && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowMapPicker(false)} />}
    </div>
  )
}

// Token positions: fractions (0–1) of the canvas world div.
// The world div has the same aspect ratio as the image on every device,
// so a given fraction always maps to the same visual point on the map.
// Zoom/pan are purely visual — stored positions are invariant.

function MapCanvas({ map, isDM, onSaveTokens }) {
  const outerRef = useRef(null)
  // Refs used inside native event handlers / animation frames (avoid stale closures)
  const zoomRef = useRef(1)
  const panRef = useRef({ x: 0, y: 0 })
  const worldSizeRef = useRef({ w: 0, h: 0 })
  const draggingRef = useRef(null)  // { tokenId, startCX, startCY, startFX, startFY }
  const panningRef = useRef(null)   // { startCX, startCY, startPX, startPY }
  const pinchRef = useRef(null)     // { dist }
  const saveTimeout = useRef(null)
  const ratioRef = useRef(16 / 9)

  const [worldSize, setWorldSize] = useState({ w: 0, h: 0 })
  const [tokens, setTokens] = useState(map.tokens || [])
  const [activeDragId, setActiveDragId] = useState(null)
  const [isPanning, setIsPanning] = useState(false)
  const [tr, setTr] = useState({ zoom: 1, panX: 0, panY: 0 })

  // Apply a new zoom+pan, clamping so the map always fills the viewport
  function clampAndApply(newZoom, newPanX, newPanY) {
    const outer = outerRef.current
    if (!outer) return
    const ow = outer.clientWidth
    const oh = outer.clientHeight
    const { w: W, h: H } = worldSizeRef.current
    if (W * newZoom >= ow) newPanX = Math.min(0, Math.max(ow - W * newZoom, newPanX))
    else newPanX = (ow - W * newZoom) / 2
    if (H * newZoom >= oh) newPanY = Math.min(0, Math.max(oh - H * newZoom, newPanY))
    else newPanY = (oh - H * newZoom) / 2
    zoomRef.current = newZoom
    panRef.current = { x: newPanX, y: newPanY }
    setTr({ zoom: newZoom, panX: newPanX, panY: newPanY })
  }

  // Fit the world to the viewport at zoom=1, centered
  function fitToViewport(ratio) {
    const outer = outerRef.current
    if (!outer) return
    const pw = outer.clientWidth
    const ph = outer.clientHeight
    if (!pw || !ph) return
    let w, h
    if (pw / ph > ratio) { h = ph; w = Math.floor(ph * ratio) }
    else { w = pw; h = Math.floor(pw / ratio) }
    worldSizeRef.current = { w, h }
    setWorldSize({ w, h })
    const panX = (pw - w) / 2
    const panY = (ph - h) / 2
    zoomRef.current = 1
    panRef.current = { x: panX, y: panY }
    setTr({ zoom: 1, panX, panY })
  }

  useEffect(() => {
    const outer = outerRef.current
    if (!outer) return
    const obs = new ResizeObserver(() => fitToViewport(ratioRef.current))
    obs.observe(outer)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    ratioRef.current = 16 / 9
    fitToViewport(16 / 9)
  }, [map.id]) // eslint-disable-line

  useEffect(() => {
    if (!draggingRef.current) setTokens(map.tokens || [])
  }, [map.tokens]) // eslint-disable-line

  function handleImgLoad(e) {
    const r = e.target.naturalWidth / e.target.naturalHeight
    if (r > 0 && isFinite(r)) { ratioRef.current = r; fitToViewport(r) }
  }

  // Wheel zoom (must be non-passive to preventDefault)
  useEffect(() => {
    const outer = outerRef.current
    if (!outer) return
    const onWheel = (e) => {
      e.preventDefault()
      const rect = outer.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      const factor = e.deltaY < 0 ? 1.12 : 0.89
      const z = zoomRef.current, p = panRef.current
      const newZoom = Math.max(1, Math.min(6, z * factor))
      const wx = (sx - p.x) / z
      const wy = (sy - p.y) / z
      clampAndApply(newZoom, sx - wx * newZoom, sy - wy * newZoom)
    }
    outer.addEventListener('wheel', onWheel, { passive: false })
    return () => outer.removeEventListener('wheel', onWheel)
  }, [])

  function getPos(e) { return e.touches?.[0] ?? e }

  function startTokenDrag(e, tokenId) {
    if (!isDM) return
    e.preventDefault(); e.stopPropagation()
    const token = tokens.find(t => t.id === tokenId)
    if (!token) return
    const { clientX, clientY } = getPos(e)
    draggingRef.current = { tokenId, startCX: clientX, startCY: clientY, startFX: token.x ?? 0.5, startFY: token.y ?? 0.5 }
    setActiveDragId(tokenId)
  }

  function startMapPan(e) {
    if (e.touches?.length >= 2) return
    e.preventDefault()
    const { clientX, clientY } = getPos(e)
    panningRef.current = { startCX: clientX, startCY: clientY, startPX: panRef.current.x, startPY: panRef.current.y }
    setIsPanning(true)
  }

  function onMove(e) {
    e.preventDefault()

    // Pinch zoom (2 fingers)
    if (e.touches?.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
      if (pinchRef.current) {
        const factor = dist / pinchRef.current.dist
        const rect = outerRef.current.getBoundingClientRect()
        const sx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left
        const sy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top
        const z = zoomRef.current, p = panRef.current
        const newZoom = Math.max(1, Math.min(6, z * factor))
        const wx = (sx - p.x) / z, wy = (sy - p.y) / z
        clampAndApply(newZoom, sx - wx * newZoom, sy - wy * newZoom)
      }
      pinchRef.current = { dist }
      draggingRef.current = null; setActiveDragId(null)
      panningRef.current = null; setIsPanning(false)
      return
    }

    // Token drag
    if (draggingRef.current) {
      const d = draggingRef.current
      const { clientX, clientY } = getPos(e)
      const { w: W, h: H } = worldSizeRef.current
      const z = zoomRef.current
      let fx = d.startFX + (clientX - d.startCX) / (W * z)
      let fy = d.startFY + (clientY - d.startCY) / (H * z)
      if (map.grid_enabled) {
        const gs = map.grid_size || 50
        fx = Math.round(fx * W / gs) * gs / W
        fy = Math.round(fy * H / gs) * gs / H
      }
      fx = Math.max(0, Math.min(1, fx)); fy = Math.max(0, Math.min(1, fy))
      setTokens(prev => prev.map(t => t.id === d.tokenId ? { ...t, x: fx, y: fy } : t))
      return
    }

    // Map pan
    if (panningRef.current) {
      const p = panningRef.current
      const { clientX, clientY } = getPos(e)
      clampAndApply(zoomRef.current, p.startPX + clientX - p.startCX, p.startPY + clientY - p.startCY)
    }
  }

  function onEnd() {
    if (draggingRef.current) {
      draggingRef.current = null; setActiveDragId(null)
      setTokens(current => {
        clearTimeout(saveTimeout.current)
        saveTimeout.current = setTimeout(() => onSaveTokens(current), 300)
        return current
      })
    }
    panningRef.current = null; setIsPanning(false)
    pinchRef.current = null
  }

  function zoomBy(factor) {
    const outer = outerRef.current
    if (!outer) return
    const z = zoomRef.current, p = panRef.current
    const sx = outer.clientWidth / 2, sy = outer.clientHeight / 2
    const newZoom = Math.max(1, Math.min(6, z * factor))
    const wx = (sx - p.x) / z, wy = (sy - p.y) / z
    clampAndApply(newZoom, sx - wx * newZoom, sy - wy * newZoom)
  }

  const gs = map.grid_size || 50
  const tokenSize = 44

  return (
    <div
      ref={outerRef}
      style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: '#111420', borderRadius: 12, border: '1px solid #252840', minHeight: 0,
        cursor: activeDragId ? 'grabbing' : isPanning ? 'grabbing' : tr.zoom > 1 ? 'grab' : 'default',
        userSelect: 'none', touchAction: 'none',
      }}
      onMouseDown={startMapPan}
      onMouseMove={onMove}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      onTouchStart={e => {
        if (e.touches.length === 2) {
          pinchRef.current = { dist: Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY) }
        } else { startMapPan(e) }
      }}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
    >
      {/* World: fixed aspect-ratio div, CSS-transformed for zoom/pan */}
      {worldSize.w > 0 && (
        <div style={{
          position: 'absolute', left: 0, top: 0,
          width: worldSize.w, height: worldSize.h,
          transformOrigin: '0 0',
          transform: `translate(${tr.panX}px,${tr.panY}px) scale(${tr.zoom})`,
          willChange: 'transform',
        }}>
          {map.image_url ? (
            <img src={map.image_url} alt={map.name} onLoad={handleImgLoad}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill', display: 'block', pointerEvents: 'none' }}
              draggable={false} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#252840', gap: 12 }}>
              <Map size={64} />
              <p style={{ color: '#475569', fontSize: '0.875rem' }}>{isDM ? "Carica un'immagine per questa mappa" : 'Nessuna immagine caricata'}</p>
            </div>
          )}

          {map.grid_enabled && (
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
              backgroundSize: `${gs}px ${gs}px`,
            }} />
          )}

          {tokens.map(token => {
            const fx = (token.x >= 0 && token.x <= 1) ? token.x : 0.5
            const fy = (token.y >= 0 && token.y <= 1) ? token.y : 0.5
            return (
              <div key={token.id}
                className={`map-token ${activeDragId === token.id ? 'dragging' : ''} ${token.is_enemy ? 'enemy' : ''}`}
                style={{
                  position: 'absolute', left: `${fx * 100}%`, top: `${fy * 100}%`,
                  width: tokenSize, height: tokenSize, transform: 'translate(-50%, -50%)',
                  fontSize: '0.7rem', overflow: 'hidden', padding: 0,
                  background: token.avatar_url ? 'transparent' : `radial-gradient(circle at 35% 35%, ${token.color || '#7c3aed'}dd, ${token.color || '#7c3aed'}88)`,
                  border: `2px solid ${token.color || '#7c3aed'}`,
                  cursor: isDM ? 'grab' : 'default',
                }}
                onMouseDown={e => startTokenDrag(e, token.id)}
                onTouchStart={e => startTokenDrag(e, token.id)}
                title={token.name}
              >
                {token.avatar_url
                  ? <img src={token.avatar_url} alt={token.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} draggable={false} />
                  : (token.initials || (token.name || '?').slice(0, 2).toUpperCase())
                }
              </div>
            )
          })}
        </div>
      )}

      {/* Zoom controls overlay */}
      <div
        style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 10 }}
        onMouseDown={e => e.stopPropagation()}
      >
        {[['＋', 1.3], ['⤢', null], ['－', 0.77]].map(([label, factor]) => (
          <button key={label}
            onClick={() => factor ? zoomBy(factor) : fitToViewport(ratioRef.current)}
            style={{
              width: 30, height: 30, background: 'rgba(13,15,24,0.85)', border: '1px solid #252840',
              borderRadius: 6, color: '#94a3b8', cursor: 'pointer', fontSize: label === '⤢' ? '0.65rem' : '1rem',
              fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
            title={factor === 1.3 ? 'Zoom in' : factor === null ? 'Fit' : 'Zoom out'}
          >{label}</button>
        ))}
      </div>
    </div>
  )
}

function AddTokenModal({ onAdd, onClose }) {
  const [tab, setTab] = useState('personaggio')
  const [custom, setCustom] = useState({ name: '', color: '#ef4444', is_enemy: true })
  const [characters, setCharacters] = useState([])

  useEffect(() => {
    supabase.from('characters').select('*').then(({ data }) => {
      if (data) setCharacters(data.map(r => r.data))
    })
  }, [])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Aggiungi Token</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: '1rem', background: '#0d0f18', borderRadius: 8, padding: 3 }}>
          {['personaggio', 'personalizzato'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '0.4rem', borderRadius: 6, border: 'none',
              background: tab === t ? '#161929' : 'transparent',
              color: tab === t ? '#f1f5f9' : '#64748b',
              fontSize: '0.75rem', cursor: 'pointer', fontWeight: tab === t ? 600 : 400,
            }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>

        {tab === 'personaggio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {characters.length === 0 && <p style={{ color: '#475569', fontSize: '0.8rem', fontStyle: 'italic' }}>Caricamento…</p>}
            {characters.map(char => (
              <button key={char.id} onClick={() => onAdd({ name: char.name, color: char.color, initials: char.initials, avatar_url: char.avatar_url || null, is_enemy: false })} style={{
                display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                background: '#0d0f18', border: '1px solid #252840', borderRadius: 8, padding: '0.625rem', cursor: 'pointer',
              }}>
                {char.avatar_url
                  ? <img src={char.avatar_url} alt={char.name} style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: `1px solid ${char.color}55`, flexShrink: 0 }} />
                  : <div style={{ width: 32, height: 32, borderRadius: 8, background: char.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{char.initials}</div>
                }
                <span style={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 500 }}>{char.name}</span>
              </button>
            ))}
          </div>
        )}

        {tab === 'personalizzato' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Nome</label>
              <input className="input" value={custom.name} onChange={e => setCustom(p => ({ ...p, name: e.target.value }))} placeholder="Goblin Boss, Trappola…" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Colore</label>
                <input type="color" value={custom.color} onChange={e => setCustom(p => ({ ...p, color: e.target.value }))} style={{ width: '100%', height: 36, borderRadius: 6, border: '1px solid #252840', background: 'transparent', cursor: 'pointer' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Tipo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <input type="checkbox" id="is_enemy_tok" checked={custom.is_enemy} onChange={e => setCustom(p => ({ ...p, is_enemy: e.target.checked }))} />
                  <label htmlFor="is_enemy_tok" style={{ fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>Nemico</label>
                </div>
              </div>
            </div>
            <button className="btn btn-primary" disabled={!custom.name.trim()}
              onClick={() => onAdd({ ...custom, initials: custom.name.slice(0, 2).toUpperCase() })}>
              Aggiungi Token
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
