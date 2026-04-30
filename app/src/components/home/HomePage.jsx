import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { uploadImage, cloudinaryUrl } from '../../lib/cloudinary'
import { improveStory } from '../../lib/groq'
import { Edit3, Check, X, Upload, Wand2, RotateCcw, ChevronDown, BookOpen } from 'lucide-react'

/* ── Stelle animate (sfondo) ────────────────────────────────── */
function Stars() {
  const stars = useRef(
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.6 + 0.4,
      delay: Math.random() * 4,
      dur: Math.random() * 3 + 2,
    }))
  ).current

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size,
          borderRadius: '50%', background: '#fff',
          animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  )
}

/* ── HomePage: hero unico full-focus, mobile-first ──────────── */
export default function HomePage() {
  const { isDM } = useAuth()
  const [campaign, setCampaign] = useState({ name: 'La Taverna', tagline: "L'avventura ha inizio...", hero_image_url: null, story_narrative: '' })
  const [editingHero, setEditingHero] = useState(false)
  const [heroForm, setHeroForm] = useState({ name: '', tagline: '' })
  const [editingStory, setEditingStory] = useState(false)
  const [storyInput, setStoryInput] = useState('')
  const [originalStory, setOriginalStory] = useState('')
  const [loadingAi, setLoadingAi] = useState(false)
  const [uploadingHero, setUploadingHero] = useState(false)
  const [showStory, setShowStory] = useState(false)

  useEffect(() => {
    loadCampaign()
    const sub = supabase
      .channel('campaign-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaign' }, payload => {
        if (payload.new) setCampaign(payload.new)
      })
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [])

  async function loadCampaign() {
    const { data } = await supabase.from('campaign').select('*').limit(1).single()
    if (data) setCampaign(data)
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
    if (!file) return
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

  return (
    <div className="hp-root">
      {/* HERO — fullscreen, focus assoluto */}
      <section className="hp-hero">
        {/* Immagine di sfondo o gradient + stelle */}
        {campaign.hero_image_url ? (
          <img src={cloudinaryUrl(campaign.hero_image_url, { width: 1600, height: 1000 })} alt="Hero" className="hp-bg-image" />
        ) : (
          <>
            <div className="hp-bg-gradient" />
            <Stars />
          </>
        )}

        {/* Overlay scuro solo in basso per leggibilità */}
        <div className="hp-overlay" />

        {/* Contenuto in basso */}
        <div className="hp-content">
          {/* Titolo + tagline */}
          {editingHero ? (
            <div className="hp-edit-block">
              <input
                className="hp-edit-title"
                value={heroForm.name}
                onChange={e => setHeroForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Nome campagna" autoFocus
              />
              <input
                className="hp-edit-tagline"
                value={heroForm.tagline}
                onChange={e => setHeroForm(p => ({ ...p, tagline: e.target.value }))}
                placeholder="Tagline..."
              />
              <div className="hp-edit-actions">
                <button className="btn btn-primary btn-sm" onClick={() => { saveCampaign({ name: heroForm.name, tagline: heroForm.tagline }); setEditingHero(false) }}>
                  <Check size={14} /> Salva
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditingHero(false)}>
                  <X size={14} /> Annulla
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="hp-title">{campaign.name}</h1>
              {campaign.tagline && <p className="hp-tagline">"{campaign.tagline}"</p>}
            </>
          )}

          {/* CTA: leggi la storia (toggle) */}
          {!editingHero && !editingStory && campaign.story_narrative && (
            <button className="hp-cta" onClick={() => setShowStory(s => !s)}>
              <BookOpen size={14} />
              <span>{showStory ? 'Nascondi la storia' : 'Leggi la storia'}</span>
              <ChevronDown size={14} style={{ transform: showStory ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
          )}

          {/* Storia (mostrata su richiesta) */}
          {!editingHero && !editingStory && showStory && campaign.story_narrative && (
            <div className="hp-story-card">
              <p className="hp-story-text">{campaign.story_narrative}</p>
            </div>
          )}

          {/* Editor storia */}
          {editingStory && (
            <div className="hp-story-editor">
              <textarea
                className="textarea"
                value={storyInput}
                onChange={e => { setStoryInput(e.target.value); setOriginalStory('') }}
                rows={8}
                placeholder="Scrivi il racconto della vostra avventura…"
                autoFocus
                style={{ fontSize: '0.95rem', lineHeight: 1.7, fontStyle: 'italic' }}
              />
              <div className="hp-edit-actions">
                <button className="btn btn-primary btn-sm" onClick={() => { saveCampaign({ story_narrative: storyInput }); setEditingStory(false); setOriginalStory('') }}>
                  <Check size={14} /> Salva
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditingStory(false); setOriginalStory('') }}>
                  <X size={14} /> Annulla
                </button>
                {originalStory && (
                  <button className="btn btn-secondary btn-sm" onClick={() => { setStoryInput(originalStory); setOriginalStory('') }}>
                    <RotateCcw size={13} /> Originale
                  </button>
                )}
                <button className="btn btn-secondary btn-sm" onClick={handleImproveStory} disabled={loadingAi || !storyInput.trim()}>
                  {loadingAi ? <>⚡ Elaborazione…</> : <><Wand2 size={13} /> Riscrivi in fantasy</>}
                </button>
              </div>
            </div>
          )}

          {/* Azioni DM (sempre minimali) */}
          {isDM && !editingHero && !editingStory && (
            <div className="hp-dm-actions">
              <button className="hp-dm-btn" onClick={() => { setStoryInput(campaign.story_narrative || ''); setOriginalStory(''); setEditingStory(true); setShowStory(true) }}>
                <Edit3 size={12} /> {campaign.story_narrative ? 'Modifica storia' : 'Scrivi storia'}
              </button>
              <button className="hp-dm-btn" onClick={() => { setHeroForm({ name: campaign.name, tagline: campaign.tagline || '' }); setEditingHero(true) }}>
                <Edit3 size={12} /> Modifica titolo
              </button>
              <label className="hp-dm-btn" style={{ cursor: 'pointer' }}>
                <Upload size={12} /> {uploadingHero ? 'Caricamento…' : 'Cambia sfondo'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleHeroImageUpload(e.target.files[0])} disabled={uploadingHero} />
              </label>
            </div>
          )}
        </div>

      </section>

      <style>{`
        .hp-root {
          position: relative;
          min-height: 100dvh;
          background: #0d0f18;
          overflow-x: hidden;
        }

        .hp-hero {
          position: relative;
          min-height: 100dvh;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          overflow: hidden;
          padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom);
        }

        .hp-bg-image {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center;
          z-index: 0;
        }

        .hp-bg-gradient {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 30% 30%, rgba(124,58,237,0.25) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 70%, rgba(8,145,178,0.18) 0%, transparent 50%),
            linear-gradient(135deg, #1a0533 0%, #0d0f18 50%, #0a1628 100%);
          z-index: 0;
        }

        .hp-overlay {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 55%;
          background: linear-gradient(to bottom,
            rgba(13,15,24,0) 0%,
            rgba(13,15,24,0.55) 55%,
            rgba(13,15,24,0.92) 100%);
          z-index: 1;
          pointer-events: none;
        }

        .hp-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 760px;
          padding: 1.5rem 1.25rem 2.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .hp-title {
          margin: 0;
          font-size: clamp(2.6rem, 13vw, 6rem);
          font-weight: 900;
          color: #f1f5f9;
          line-height: 1;
          letter-spacing: -0.025em;
          text-shadow: 0 4px 30px rgba(0,0,0,0.6);
          word-wrap: break-word;
          background: linear-gradient(135deg, #f1f5f9 0%, #c4b5fd 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hp-tagline {
          margin: 0;
          font-size: clamp(0.95rem, 3.5vw, 1.4rem);
          color: #cbd5e1;
          font-style: italic;
          font-weight: 300;
          line-height: 1.4;
          max-width: 560px;
          text-shadow: 0 2px 12px rgba(0,0,0,0.5);
        }

        .hp-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(124,58,237,0.2);
          border: 1px solid rgba(124,58,237,0.45);
          color: #c4b5fd;
          padding: 0.65rem 1.25rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(8px);
          margin-top: 1rem;
        }
        .hp-cta:hover {
          background: rgba(124,58,237,0.35);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(124,58,237,0.25);
        }
        .hp-cta:active { transform: translateY(0); }

        .hp-story-card {
          width: 100%;
          background: rgba(13,15,24,0.65);
          border: 1px solid rgba(124,58,237,0.25);
          border-radius: 14px;
          padding: clamp(1rem, 4vw, 1.75rem);
          backdrop-filter: blur(8px);
          margin-top: 0.5rem;
          text-align: left;
          animation: fadeInUp 0.35s ease;
        }
        .hp-story-text {
          margin: 0;
          color: #e2e8f0;
          font-size: clamp(0.9rem, 2.2vw, 1.05rem);
          line-height: 1.85;
          font-style: italic;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .hp-story-editor {
          width: 100%;
          text-align: left;
          margin-top: 1rem;
        }

        .hp-edit-block {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          width: 100%;
          max-width: 500px;
          align-items: center;
        }
        .hp-edit-title {
          background: rgba(13,15,24,0.85);
          border: 1px solid #7c3aed;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: #f1f5f9;
          font-size: clamp(1.4rem, 5vw, 2rem);
          font-weight: 800;
          text-align: center;
          width: 100%;
          outline: none;
        }
        .hp-edit-tagline {
          background: rgba(13,15,24,0.85);
          border: 1px solid #252840;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          color: #94a3b8;
          font-size: 0.95rem;
          text-align: center;
          width: 100%;
          outline: none;
          font-style: italic;
        }
        .hp-edit-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 8px;
        }

        .hp-dm-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 1.5rem;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .hp-dm-actions:hover { opacity: 1; }

        .hp-dm-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(13,15,24,0.7);
          border: 1px solid #252840;
          color: #94a3b8;
          padding: 0.35rem 0.8rem;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          backdrop-filter: blur(8px);
        }
        .hp-dm-btn:hover { color: #f1f5f9; border-color: #7c3aed; }

        /* Mobile tweaks */
        @media (max-width: 640px) {
          .hp-content {
            padding: 1.25rem 1rem 2rem;
            gap: 0.6rem;
          }
          .hp-title { letter-spacing: -0.02em; }
          .hp-cta { padding: 0.6rem 1.1rem; font-size: 0.8rem; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
