import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { generateStory } from '../../lib/groq'
import { uploadImage, cloudinaryUrl } from '../../lib/cloudinary'
import { DEFAULT_CHARACTERS } from '../../data/characters'
import { useNavigate } from 'react-router-dom'
import {
  Shield, Sword, Sparkles, BookOpen, Map, ChevronDown,
  Edit3, Check, X, Upload, Calendar, User,
  MapPin, Package, FileText, Wand2, Zap, RotateCcw
} from 'lucide-react'
import { improveStory } from '../../lib/groq'

/* ── Stars background ─────────────────────────────────────── */
function Stars() {
  const stars = useRef(
    Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.8 + 0.4,
      delay: Math.random() * 4,
      dur: Math.random() * 3 + 2,
    }))
  ).current

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {stars.map(s => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            borderRadius: '50%', background: '#fff',
            animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  )
}

/* ── Section wrapper ──────────────────────────────────────── */
function Section({ id, title, subtitle, children, style }) {
  return (
    <section id={id} style={{ padding: '5rem 1.5rem', maxWidth: 1100, margin: '0 auto', ...style }}>
      {title && (
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>{title}</h2>
          {subtitle && <p style={{ color: '#64748b', marginTop: 8, fontSize: '0.95rem' }}>{subtitle}</p>}
          <div style={{ width: 48, height: 3, background: 'linear-gradient(90deg, #7c3aed, #0891b2)', borderRadius: 999, margin: '1rem auto 0' }} />
        </div>
      )}
      {children}
    </section>
  )
}

/* ── Character class icon ─────────────────────────────────── */
function ClassIcon({ cls, size = 16 }) {
  if (cls === 'Guerriero') return <Sword size={size} />
  if (cls === 'Mago') return <Zap size={size} />
  return <Sparkles size={size} />
}

/* ── Entry type meta ──────────────────────────────────────── */
const TYPE_META = {
  sessione: { icon: BookOpen, color: '#7c3aed', bg: '#1e1040', border: '#3730a3', label: 'Sessione' },
  png:      { icon: User,     color: '#0891b2', bg: '#082f49', border: '#0e4f6e', label: 'PNG' },
  luogo:    { icon: MapPin,   color: '#16a34a', bg: '#052e16', border: '#166534', label: 'Luogo' },
  bottino:  { icon: Package,  color: '#d97706', bg: '#451a03', border: '#78350f', label: 'Bottino' },
  nota:     { icon: FileText, color: '#64748b', bg: '#1e2235', border: '#334155', label: 'Nota' },
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const { isDM } = useAuth()
  const [campaign, setCampaign] = useState({ name: 'La Taverna', tagline: "L'avventura ha inizio...", hero_image_url: null, story_narrative: '' })
  const [characters, setCharacters] = useState([])
  const [maps, setMaps] = useState([])
  const [diaryEntries, setDiaryEntries] = useState([])
  const [editingHero, setEditingHero] = useState(false)
  const [heroForm, setHeroForm] = useState({ name: '', tagline: '' })
  const [editingStory, setEditingStory] = useState(false)
  const [storyInput, setStoryInput] = useState('')
  const [originalStory, setOriginalStory] = useState('')
  const [loadingAi, setLoadingAi] = useState(false)
  const navigate = useNavigate()
  const [uploadingHero, setUploadingHero] = useState(false)
  const [lightboxMap, setLightboxMap] = useState(null)

  useEffect(() => {
    loadAll()

    const sub = supabase
      .channel('campaign-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaign' }, payload => {
        if (payload.new) setCampaign(payload.new)
      })
      .subscribe()

    return () => supabase.removeChannel(sub)
  }, [])

  async function loadAll() {
    const [campRes, charRes, mapsRes, diaryRes] = await Promise.all([
      supabase.from('campaign').select('*').limit(1).single(),
      supabase.from('characters').select('*').limit(6),
      supabase.from('maps').select('*').order('created_at', { ascending: false }).limit(6),
      supabase.from('diary_entries').select('*').order('created_at', { ascending: false }).limit(5),
    ])
    if (campRes.data) setCampaign(campRes.data)
    if (charRes.data) setCharacters(charRes.data.map(r => r.data))
    if (mapsRes.data) setMaps(mapsRes.data)
    if (diaryRes.data) setDiaryEntries(diaryRes.data)
  }

  async function saveCampaign(updates) {
    const newCamp = { ...campaign, ...updates, updated_at: new Date().toISOString() }
    setCampaign(newCamp)
    if (campaign.id) {
      await supabase.from('campaign').update(updates).eq('id', campaign.id)
    } else {
      const { data } = await supabase.from('campaign').insert(updates).select().single()
      if (data) setCampaign(data)
    }
  }

  async function handleHeroImageUpload(file) {
    setUploadingHero(true)
    try {
      const url = await uploadImage(file)
      await saveCampaign({ hero_image_url: url })
    } catch (e) { alert('Errore caricamento: ' + e.message) }
    setUploadingHero(false)
  }

  async function handleImproveStory() {
    if (!storyInput.trim()) return
    setLoadingAi(true)
    setOriginalStory(storyInput)
    try {
      const improved = await improveStory(storyInput)
      setStoryInput(improved)
    } catch (e) { alert('Errore Groq: ' + e.message) }
    setLoadingAi(false)
  }

  const party = characters.length > 0 ? characters : DEFAULT_CHARACTERS

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f18', overflowX: 'hidden' }}>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Background */}
        {campaign.hero_image_url ? (
          <img src={cloudinaryUrl(campaign.hero_image_url, { width: 1400, height: 900 })} alt="Hero"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 40%, #1a0533 0%, #0d0f18 50%, #0a1628 100%)' }} />
        )}
        {!campaign.hero_image_url && <Stars />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(13,15,24,0.2) 0%, rgba(13,15,24,0.5) 60%, #0d0f18 100%)' }} />
        <div style={{ position: 'absolute', top: '20%', left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '25%', right: '20%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(8,145,178,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Content */}
        <div style={{ position: 'relative', textAlign: 'center', padding: '6rem 2rem 4rem', maxWidth: 760, zIndex: 1, width: '100%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 999, padding: '0.4rem 1rem', marginBottom: '1.5rem' }}>
            <Shield size={14} color="#a78bfa" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Campagna D&D 5a Edizione</span>
          </div>

          {/* Title editing */}
          {editingHero ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', marginBottom: '1.5rem' }}>
              <input style={{ background: 'rgba(13,15,24,0.8)', border: '1px solid #7c3aed', borderRadius: 8, padding: '0.75rem 1rem', color: '#f1f5f9', fontSize: '2rem', fontWeight: 800, textAlign: 'center', width: '100%', maxWidth: 500, outline: 'none' }}
                value={heroForm.name} onChange={e => setHeroForm(p => ({ ...p, name: e.target.value }))} placeholder="Nome campagna" autoFocus />
              <input style={{ background: 'rgba(13,15,24,0.8)', border: '1px solid #252840', borderRadius: 8, padding: '0.5rem 1rem', color: '#94a3b8', fontSize: '1rem', textAlign: 'center', width: '100%', maxWidth: 400, outline: 'none', fontStyle: 'italic' }}
                value={heroForm.tagline} onChange={e => setHeroForm(p => ({ ...p, tagline: e.target.value }))} placeholder="Tagline..." />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => { saveCampaign({ name: heroForm.name, tagline: heroForm.tagline }); setEditingHero(false) }}><Check size={14} /> Salva</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditingHero(false)}><X size={14} /> Annulla</button>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: 'clamp(2.8rem, 10vw, 5.5rem)', fontWeight: 900, color: '#f1f5f9', lineHeight: 1.05, margin: '0 0 0.75rem', textShadow: '0 4px 30px rgba(0,0,0,0.5)', letterSpacing: '-0.02em' }}>
                {campaign.name}
              </h1>
              {campaign.tagline && (
                <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>"{campaign.tagline}"</p>
              )}
            </div>
          )}

          {/* Story section */}
          {editingStory ? (
            <div style={{ textAlign: 'left' }}>
              <textarea
                className="textarea"
                value={storyInput}
                onChange={e => { setStoryInput(e.target.value); setOriginalStory('') }}
                rows={8}
                placeholder="Scrivi il racconto della vostra avventura…"
                autoFocus
                style={{ fontSize: '0.95rem', lineHeight: 1.8, fontStyle: 'italic', background: 'rgba(13,15,24,0.85)', backdropFilter: 'blur(4px)' }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="btn btn-primary btn-sm" onClick={() => { saveCampaign({ story_narrative: storyInput }); setEditingStory(false); setOriginalStory('') }}>
                  <Check size={14} /> Salva
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditingStory(false); setOriginalStory('') }}>
                  <X size={14} /> Annulla
                </button>
                {originalStory && (
                  <button className="btn btn-secondary btn-sm" onClick={() => { setStoryInput(originalStory); setOriginalStory('') }}>
                    <RotateCcw size={13} /> Torna all'originale
                  </button>
                )}
                <button className="btn btn-secondary btn-sm" onClick={handleImproveStory} disabled={loadingAi || !storyInput.trim()} style={{ marginLeft: 'auto' }}>
                  {loadingAi
                    ? <><span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⚡</span> Elaborazione…</>
                    : <><Wand2 size={13} /> Riscrivi in chiave fantasy</>}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {campaign.story_narrative ? (
                <div style={{ background: 'rgba(13,15,24,0.6)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, padding: 'clamp(1rem, 3vw, 1.75rem)', backdropFilter: 'blur(4px)', marginBottom: '1.5rem', textAlign: 'left' }}>
                  <div style={{ color: '#cbd5e1', lineHeight: 1.9, fontSize: 'clamp(0.875rem, 1.5vw, 1rem)', whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
                    {campaign.story_narrative}
                  </div>
                </div>
              ) : isDM ? (
                <p style={{ color: '#475569', fontStyle: 'italic', marginBottom: '1.5rem' }}>Nessun racconto ancora. Scrivi la storia della campagna.</p>
              ) : null}

              {isDM && (
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => { setStoryInput(campaign.story_narrative || ''); setOriginalStory(''); setEditingStory(true) }}>
                    <Edit3 size={13} /> {campaign.story_narrative ? 'Modifica storia' : 'Scrivi storia'}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setHeroForm({ name: campaign.name, tagline: campaign.tagline || '' }); setEditingHero(true) }}>
                    <Edit3 size={13} /> Modifica titolo
                  </button>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                    <Upload size={13} /> {uploadingHero ? 'Caricamento…' : 'Cambia immagine'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleHeroImageUpload(e.target.files[0])} disabled={uploadingHero} />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        <a href="#gruppo" style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', color: '#64748b', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, animation: 'bounce 2s ease infinite' }}>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Scorri</span>
          <ChevronDown size={20} />
        </a>
      </section>

      {/* ── GRUPPO ──────────────────────────────────────────── */}
      <Section id="gruppo" title="Il Gruppo" subtitle="Gli avventurieri che sfidano il destino">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {party.map(char => <CharacterHeroCard key={char.id} character={char} onClick={() => navigate(`/personaggi?open=${char.id}`)} />)}
        </div>
      </Section>

      {/* ── MAPPE ───────────────────────────────────────────── */}
      {maps.length > 0 && (
        <Section id="mappe" title="Mappe" subtitle="I luoghi dell'avventura">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {maps.filter(m => m.image_url).map(m => (
              <div
                key={m.id}
                onClick={() => setLightboxMap(m)}
                style={{
                  aspectRatio: '16/10',
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: '1px solid #252840',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.25)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <img src={cloudinaryUrl(m.image_url, { width: 600, height: 375 })} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,15,24,0.8) 0%, transparent 50%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>{m.name}</div>
                </div>
              </div>
            ))}
          </div>
          {maps.every(m => !m.image_url) && (
            <p style={{ textAlign: 'center', color: '#475569', fontStyle: 'italic' }}>Nessuna mappa con immagine ancora. Caricane una dalla sezione Mappe.</p>
          )}
        </Section>
      )}

      {/* ── DIARIO ──────────────────────────────────────────── */}
      {diaryEntries.length > 0 && (
        <Section id="diario" title="Diario di Viaggio" subtitle="Gli ultimi capitoli dell'avventura">
          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div style={{ position: 'absolute', left: 'clamp(20px, 4vw, 28px)', top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, #7c3aed, #0891b2)', borderRadius: 999 }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {diaryEntries.map((entry, i) => {
                const meta = TYPE_META[entry.type] || TYPE_META.nota
                const Icon = meta.icon
                return (
                  <div key={entry.id} style={{ display: 'flex', gap: 'clamp(1rem, 4vw, 2rem)', alignItems: 'flex-start', animation: `fadeIn 0.4s ${i * 0.08}s both` }}>
                    {/* Icon circle */}
                    <div style={{
                      width: 'clamp(40px, 8vw, 56px)', height: 'clamp(40px, 8vw, 56px)',
                      borderRadius: '50%', flexShrink: 0,
                      background: meta.bg, border: `2px solid ${meta.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 1,
                    }}>
                      <Icon size={18} color={meta.color} />
                    </div>
                    {/* Content */}
                    <div className="card" style={{ flex: 1, padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>{entry.title}</span>
                        <span style={{ fontSize: '0.65rem', padding: '1px 8px', borderRadius: 999, background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, fontWeight: 600 }}>{meta.label}</span>
                        <span style={{ fontSize: '0.7rem', color: '#475569', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={11} />
                          {new Date(entry.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {entry.content && (
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.7, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                          {entry.content}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Section>
      )}

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '3rem 1rem', borderTop: '1px solid #1e2235', color: '#334155', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
          <Shield size={14} color="#3730a3" />
          <span style={{ fontWeight: 600, color: '#475569' }}>La Taverna</span>
        </div>
        D&D 5a Edizione · Powered by Supabase, Groq & Cloudinary
      </footer>

      {/* Map lightbox */}
      {lightboxMap && (
        <div onClick={() => setLightboxMap(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <button onClick={() => setLightboxMap(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 8 }}>
            <X size={28} />
          </button>
          <img src={lightboxMap.image_url} alt={lightboxMap.name} style={{ maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

/* ── Character card for home ──────────────────────────────── */
function CharacterHeroCard({ character: c, onClick }) {
  const hpPct = Math.max(0, Math.min(100, (c.hp_current / c.hp_max) * 100))
  const hpColor = hpPct > 60 ? '#22c55e' : hpPct > 25 ? '#f59e0b' : '#ef4444'
  const highestStat = c.stats ? Object.entries(c.stats).sort((a, b) => b[1] - a[1])[0] : null

  return (
    <div onClick={onClick} style={{
      background: 'linear-gradient(145deg, #161929, #1a1d2e)',
      border: `1px solid ${c.color}33`,
      borderRadius: 16,
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
      cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 60px ${c.color}22`; e.currentTarget.style.borderColor = `${c.color}66` }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${c.color}33` }}
    >
      {/* Color banner */}
      <div style={{ height: 6, background: `linear-gradient(90deg, ${c.color}, ${c.color}88)` }} />

      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: '1.25rem' }}>
          {c.avatar_url ? (
            <img src={c.avatar_url} alt={c.name} style={{ width: 60, height: 60, borderRadius: 14, flexShrink: 0, objectFit: 'cover', border: `2px solid ${c.color}55`, boxShadow: `0 4px 16px ${c.color}33` }} />
          ) : (
            <div style={{
              width: 60, height: 60, borderRadius: 14, flexShrink: 0,
              background: `linear-gradient(135deg, ${c.color}cc, ${c.color}44)`,
              border: `2px solid ${c.color}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem', fontWeight: 800, color: '#fff',
              boxShadow: `0 4px 16px ${c.color}33`,
            }}>
              {c.initials}
            </div>
          )}
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>{c.name}</h3>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 3 }}>{c.race} · {c.class} {c.level}</div>
            {c.alignment && <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 1 }}>{c.alignment}</div>}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
          {[{ l: 'PF', v: `${c.hp_current}/${c.hp_max}` }, { l: 'CA', v: c.ac }, { l: 'INI', v: c.initiative }].map(s => (
            <div key={s.l} style={{ flex: 1, background: '#0d0f18', borderRadius: 8, padding: '0.4rem', textAlign: 'center', border: '1px solid #1e2235' }}>
              <div style={{ fontSize: '0.55rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', marginTop: 1 }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* HP bar */}
        <div className="hp-bar-bg" style={{ marginBottom: '1rem' }}>
          <div className="hp-bar-fill" style={{ width: `${hpPct}%`, background: hpColor }} />
        </div>

        {/* Highest stat highlight */}
        {highestStat && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#64748b' }}>
            <ClassIcon cls={c.class} size={13} />
            <span>Punto di forza: <strong style={{ color: c.color }}>
              {{ for: 'Forza', des: 'Destrezza', cos: 'Costituzione', int: 'Intelligenza', sag: 'Saggezza', car: 'Carisma' }[highestStat[0]]} {highestStat[1]}
            </strong></span>
          </div>
        )}
      </div>
    </div>
  )
}
