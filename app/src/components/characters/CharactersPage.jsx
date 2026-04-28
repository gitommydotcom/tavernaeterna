import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { DEFAULT_CHARACTERS, ensureProficiencies } from '../../data/characters'
import { useAuth } from '../../hooks/useAuth'
import CharacterSheet from './CharacterSheet'
import { Plus, X } from 'lucide-react'

export default function CharactersPage() {
  const { isDM } = useAuth()
  const [characters, setCharacters] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchParams] = useSearchParams()
  const pendingWritesRef = useRef(new Map()) // id → timestamp di ultima scrittura locale

  useEffect(() => {
    loadCharacters()

    const sub = supabase
      .channel('characters-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'characters' }, payload => {
        // Aggiornamento granulare per evitare flicker e sovrascritture di stato locale
        const row = payload.new || payload.old
        if (!row) return
        const id = row.id

        // Ignora gli echo delle nostre stesse scritture per ~1s, per non sovrascrivere
        // edit ravvicinati con dati momentaneamente stantii.
        const lastWrite = pendingWritesRef.current.get(id)
        if (lastWrite && Date.now() - lastWrite < 1000) return

        if (payload.eventType === 'DELETE') {
          setCharacters(prev => prev.filter(c => c.id !== id))
          setSelected(prev => (prev?.id === id ? null : prev))
          return
        }
        const fresh = ensureProficiencies(payload.new.data)
        setCharacters(prev => {
          const exists = prev.some(c => c.id === id)
          return exists ? prev.map(c => (c.id === id ? fresh : c)) : [...prev, fresh]
        })
        setSelected(prev => (prev?.id === id ? fresh : prev))
      })
      .subscribe()

    return () => supabase.removeChannel(sub)
  }, [])

  async function loadCharacters() {
    const { data, error } = await supabase.from('characters').select('*')
    if (error) {
      // Prima volta: seed con personaggi di default
      await seedDefaultCharacters()
      return
    }
    if (data.length === 0) {
      await seedDefaultCharacters()
      return
    }
    let chars = data.map(r => ensureProficiencies(r.data))
    // one-time name fix: Tsegof → Tserof
    const mago = chars.find(c => c.id === 'tsegof' && c.name === 'Tsegof')
    if (mago) {
      const fixed = { ...mago, name: 'Tserof' }
      chars = chars.map(c => c.id === 'tsegof' ? fixed : c)
      await supabase.from('characters').update({ data: fixed }).eq('id', 'tsegof')
    }
    setCharacters(chars)
    setLoading(false)
    // Auto-open from URL param ?open=id
    const openId = searchParams.get('open')
    if (openId) {
      const found = chars.find(c => c.id === openId)
      if (found) setSelected(found)
    }
  }

  async function seedDefaultCharacters() {
    const inserts = DEFAULT_CHARACTERS.map(c => ({ id: c.id, data: c }))
    await supabase.from('characters').upsert(inserts)
    setCharacters(DEFAULT_CHARACTERS)
    setLoading(false)
  }

  async function updateCharacter(id, updates) {
    pendingWritesRef.current.set(id, Date.now())
    let nextChar = null
    setCharacters(prev => {
      const next = prev.map(c => {
        if (c.id !== id) return c
        nextChar = { ...c, ...updates }
        return nextChar
      })
      return next
    })
    setSelected(prev => (prev?.id === id ? { ...prev, ...updates } : prev))
    if (!nextChar) return
    const { error } = await supabase
      .from('characters')
      .update({ data: nextChar, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) console.error('Errore salvataggio personaggio:', error)
  }

  async function addCharacter(newChar) {
    const char = { ...newChar, id: `char_${Date.now()}`, initials: newChar.name.slice(0, 2).toUpperCase() }
    await supabase.from('characters').insert({ id: char.id, data: char })
    setCharacters(prev => [...prev, char])
    setShowAddModal(false)
  }

  async function deleteCharacter(id) {
    if (!confirm('Eliminare questo personaggio?')) return
    await supabase.from('characters').delete().eq('id', id)
    setCharacters(prev => prev.filter(c => c.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <p style={{ color: '#64748b' }}>Caricamento personaggi…</p>
    </div>
  )

  if (selected) return (
    <CharacterSheet
      character={selected}
      isDM={isDM}
      onUpdate={(updates) => updateCharacter(selected.id, updates)}
      onBack={() => setSelected(null)}
      onDelete={isDM ? () => deleteCharacter(selected.id) : null}
    />
  )

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Personaggi</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0' }}>{characters.length} avventurieri nel gruppo</p>
        </div>
        {isDM && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Aggiungi
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {characters.map(char => (
          <CharacterCard key={char.id} character={char} onClick={() => setSelected(char)} />
        ))}
      </div>

      {showAddModal && <AddCharacterModal onAdd={addCharacter} onClose={() => setShowAddModal(false)} />}
    </div>
  )
}

function CharacterCard({ character: c, onClick }) {
  const hpPct = Math.max(0, Math.min(100, (c.hp_current / c.hp_max) * 100))
  const hpColor = hpPct > 60 ? '#22c55e' : hpPct > 25 ? '#f59e0b' : '#ef4444'

  return (
    <div className="card-hover" onClick={onClick} style={{ padding: '1.25rem', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: '1rem' }}>
        {/* Avatar */}
        {c.avatar_url ? (
          <img src={c.avatar_url} alt={c.name} style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover', flexShrink: 0, border: `2px solid ${c.color}55` }} />
        ) : (
          <div style={{
            width: 52, height: 52, borderRadius: 12, flexShrink: 0,
            background: `linear-gradient(135deg, ${c.color}cc, ${c.color}66)`,
            border: `2px solid ${c.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 700, color: '#fff',
          }}>
            {c.initials || c.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {c.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
            {c.race} · {c.class} {c.level}
          </div>
          {c.alignment && <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 1 }}>{c.alignment}</div>}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '0.875rem' }}>
        {[
          { label: 'PF', value: `${c.hp_current}/${c.hp_max}` },
          { label: 'CA', value: c.ac },
          { label: 'INI', value: c.initiative },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: '#0d0f18', border: '1px solid #1e2235', borderRadius: 6, padding: '0.35rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f1f5f9', marginTop: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* HP bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Punti Ferita</span>
          <span style={{ fontSize: '0.65rem', color: hpColor, fontWeight: 600 }}>{hpPct.toFixed(0)}%</span>
        </div>
        <div className="hp-bar-bg">
          <div className="hp-bar-fill" style={{ width: `${hpPct}%`, background: hpColor }} />
        </div>
      </div>
    </div>
  )
}

function AddCharacterModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    name: '', race: '', class: '', level: 1,
    hp_current: 10, hp_max: 10, ac: 10,
    initiative: '+0', speed: '9 m', alignment: '',
    color: '#7c3aed', notes: '', description: '',
    stats: { for: 10, des: 10, cos: 10, int: 10, sag: 10, car: 10 },
    saves: [], skills: [], attacks: [], spells: null, equipment: [], traits: [],
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Nuovo Personaggio</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Nome *</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nome del personaggio" />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Razza</label>
              <input className="input" value={form.race} onChange={e => setForm(p => ({ ...p, race: e.target.value }))} placeholder="Umano, Elfo…" />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Classe</label>
              <input className="input" value={form.class} onChange={e => setForm(p => ({ ...p, class: e.target.value }))} placeholder="Guerriero, Mago…" />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Livello</label>
              <input className="input" type="number" min={1} max={20} value={form.level} onChange={e => setForm(p => ({ ...p, level: +e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>PF Max</label>
              <input className="input" type="number" min={1} value={form.hp_max} onChange={e => setForm(p => ({ ...p, hp_max: +e.target.value, hp_current: +e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Classe Armatura</label>
              <input className="input" type="number" min={1} value={form.ac} onChange={e => setForm(p => ({ ...p, ac: +e.target.value }))} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Colore token</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} style={{ width: 40, height: 32, borderRadius: 6, border: '1px solid #252840', background: 'transparent', cursor: 'pointer' }} />
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{form.color}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Annulla</button>
          <button
            className="btn btn-primary"
            onClick={() => form.name.trim() && onAdd(form)}
            disabled={!form.name.trim()}
            style={{ flex: 1 }}
          >
            Crea Personaggio
          </button>
        </div>
      </div>
    </div>
  )
}
