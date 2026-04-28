import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useIsMobile } from '../../hooks/useIsMobile'
import { Plus, Trash2, Edit3, Check, X, BookOpen, User, MapPin, Package, FileText, Calendar, ArrowLeft } from 'lucide-react'

const ENTRY_TYPES = [
  { id: 'sessione', label: 'Sessione', icon: BookOpen, color: '#7c3aed', bg: '#1e1040', border: '#3730a3' },
  { id: 'png', label: 'PNG', icon: User, color: '#0891b2', bg: '#082f49', border: '#0e4f6e' },
  { id: 'luogo', label: 'Luogo', icon: MapPin, color: '#16a34a', bg: '#052e16', border: '#166534' },
  { id: 'bottino', label: 'Bottino', icon: Package, color: '#d97706', bg: '#451a03', border: '#78350f' },
  { id: 'nota', label: 'Nota', icon: FileText, color: '#64748b', bg: '#1e2235', border: '#334155' },
]

function getType(id) { return ENTRY_TYPES.find(t => t.id === id) || ENTRY_TYPES[4] }

export default function DiaryPage() {
  const { isDM } = useAuth()
  const isMobile = useIsMobile()
  const [entries, setEntries] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', content: '', type: 'nota' })

  useEffect(() => {
    loadEntries()
    const sub = supabase
      .channel('diary-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diary_entries' }, () => loadEntries())
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [])

  async function loadEntries() {
    const { data } = await supabase.from('diary_entries').select('*').order('created_at', { ascending: false })
    if (data) {
      setEntries(data)
      if (!selected && data.length > 0) setSelected(data[0])
    }
    setLoading(false)
  }

  async function createEntry() {
    const { data } = await supabase
      .from('diary_entries')
      .insert({ title: 'Nuova Voce', content: '', type: 'nota' })
      .select()
      .single()
    if (data) {
      setEntries(prev => [data, ...prev])
      setSelected(data)
      setEditForm({ title: data.title, content: data.content, type: data.type })
      setEditing(true)
    }
  }

  async function saveEntry() {
    if (!selected) return
    const updates = { ...editForm, updated_at: new Date().toISOString() }
    await supabase.from('diary_entries').update(updates).eq('id', selected.id)
    const updated = { ...selected, ...updates }
    setEntries(prev => prev.map(e => e.id === selected.id ? updated : e))
    setSelected(updated)
    setEditing(false)
  }

  async function deleteEntry(id) {
    if (!confirm('Eliminare questa voce?')) return
    await supabase.from('diary_entries').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
    if (selected?.id === id) setSelected(entries.find(e => e.id !== id) || null)
  }

  function startEdit(entry) {
    setEditForm({ title: entry.title, content: entry.content, type: entry.type })
    setEditing(true)
  }

  const filtered = filter === 'all' ? entries : entries.filter(e => e.type === filter)

  if (loading) return <div style={{ color: '#64748b', padding: '2rem' }}>Caricamento diario…</div>

  // On mobile: show detail panel when an entry is selected
  const showDetail = !isMobile || (isMobile && selected)
  const showList = !isMobile || (isMobile && !selected)

  return (
    <div className="fade-in" style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 3rem)', overflow: 'hidden' }}>

      {/* Left: entry list */}
      {showList && <div style={{ width: isMobile ? '100%' : 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9' }}>Diario</h1>
          <button className="btn btn-primary btn-sm" onClick={createEntry}>
            <Plus size={14} /> Nuova
          </button>
        </div>

        {/* Type filters */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600,
              border: `1px solid ${filter === 'all' ? '#7c3aed' : '#252840'}`,
              background: filter === 'all' ? '#1e1040' : 'transparent',
              color: filter === 'all' ? '#a78bfa' : '#64748b', cursor: 'pointer',
            }}
          >Tutti</button>
          {ENTRY_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              style={{
                padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600,
                border: `1px solid ${filter === t.id ? t.border : '#252840'}`,
                background: filter === t.id ? t.bg : 'transparent',
                color: filter === t.id ? t.color : '#64748b', cursor: 'pointer',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Entries */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filtered.length === 0 && (
            <p style={{ color: '#475569', fontSize: '0.8rem', fontStyle: 'italic', padding: '1rem 0' }}>
              {entries.length === 0 ? 'Nessuna voce nel diario.' : 'Nessuna voce in questa categoria.'}
            </p>
          )}
          {filtered.map(entry => {
            const type = getType(entry.type)
            const Icon = type.icon
            const isSelected = selected?.id === entry.id
            return (
              <div
                key={entry.id}
                onClick={() => { setSelected(entry); setEditing(false); }}

                style={{
                  padding: '0.75rem', borderRadius: 8, cursor: 'pointer',
                  background: isSelected ? '#1e2235' : 'transparent',
                  border: `1px solid ${isSelected ? '#252840' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: type.bg, border: `1px solid ${type.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <Icon size={13} color={type.color} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.title}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={10} />
                      {new Date(entry.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    {entry.content && (
                      <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {entry.content}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>}

      {/* Right: entry content */}
      {showDetail && <div className="card" style={{ flex: 1, overflow: 'auto', padding: isMobile ? '1rem' : '1.5rem', display: 'flex', flexDirection: 'column' }}>
        {!selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1rem' }}>
            <BookOpen size={48} color="#252840" />
            <p style={{ color: '#64748b' }}>Seleziona una voce o creane una nuova.</p>
          </div>
        ) : editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                className="input"
                value={editForm.title}
                onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Titolo…"
                style={{ flex: 1, fontSize: '1.1rem', fontWeight: 700 }}
                autoFocus
              />
              <select
                className="select"
                value={editForm.type}
                onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))}
                style={{ width: 120 }}
              >
                {ENTRY_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <textarea
              className="textarea"
              value={editForm.content}
              onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))}
              placeholder="Scrivi qui le note della sessione, la descrizione del PNG, del luogo o del tesoro trovato…"
              style={{ flex: 1, minHeight: 300, lineHeight: 1.7 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={saveEntry}><Check size={15} /> Salva</button>
              <button className="btn btn-secondary" onClick={() => setEditing(false)}><X size={15} /> Annulla</button>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1 }}>
            {/* Back button on mobile */}
            {isMobile && (
              <button className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem', alignSelf: 'flex-start' }} onClick={() => setSelected(null)}>
                <ArrowLeft size={14} /> Indietro
              </button>
            )}

            {/* Entry header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                {(() => {
                  const type = getType(selected.type)
                  const Icon = type.icon
                  return (
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: type.bg, border: `1px solid ${type.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} color={type.color} />
                    </div>
                  )
                })()}
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#f1f5f9' }}>{selected.title}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={11} />
                      {new Date(selected.created_at).toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <span style={{ fontSize: '0.7rem', padding: '1px 8px', borderRadius: 999, background: getType(selected.type).bg, color: getType(selected.type).color, border: `1px solid ${getType(selected.type).border}`, fontWeight: 600 }}>
                      {getType(selected.type).label}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => startEdit(selected)}>
                  <Edit3 size={13} /> Modifica
                </button>
                {isDM && (
                  <button className="btn btn-danger btn-sm" onClick={() => deleteEntry(selected.id)}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            {selected.content ? (
              <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {selected.content}
              </div>
            ) : (
              <div style={{ color: '#475569', fontStyle: 'italic', fontSize: '0.875rem' }}>
                Nessun contenuto. Clicca "Modifica" per aggiungere note.
              </div>
            )}
          </div>
        )}
      </div>}
    </div>
  )
}
