import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useIsMobile } from '../../hooks/useIsMobile'
import { uploadImage, cloudinaryUrl } from '../../lib/cloudinary'
import {
  Plus, Trash2, Edit3, Check, X, BookOpen, User, MapPin, Package, FileText,
  Calendar, ArrowLeft, ArrowUp, ArrowDown, ImagePlus, Loader,
} from 'lucide-react'

const ENTRY_TYPES = [
  { id: 'sessione', label: 'Sessione', icon: BookOpen, color: '#7c3aed', bg: '#1e1040', border: '#3730a3' },
  { id: 'png', label: 'PNG', icon: User, color: '#0891b2', bg: '#082f49', border: '#0e4f6e' },
  { id: 'luogo', label: 'Luogo', icon: MapPin, color: '#16a34a', bg: '#052e16', border: '#166534' },
  { id: 'bottino', label: 'Bottino', icon: Package, color: '#d97706', bg: '#451a03', border: '#78350f' },
  { id: 'nota', label: 'Nota', icon: FileText, color: '#64748b', bg: '#1e2235', border: '#334155' },
]

function getType(id) { return ENTRY_TYPES.find(t => t.id === id) || ENTRY_TYPES[4] }

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function formatLongDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

function formatShortDate(iso) {
  if (!iso) return null
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DiaryPage() {
  const { isDM } = useAuth()
  const isMobile = useIsMobile()
  const [entries, setEntries] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [sortMode, setSortMode] = useState('date_desc')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', content: '', type: 'nota', event_date: todayIso(), images: [] })
  const [uploadingImage, setUploadingImage] = useState(false)
  // true once we confirm new columns exist in DB
  const [hasNewSchema, setHasNewSchema] = useState(false)

  useEffect(() => {
    loadEntries()
    const sub = supabase
      .channel('diary-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diary_entries' }, () => loadEntries())
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [])

  async function loadEntries() {
    // Always order by created_at — safe regardless of schema version
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Errore caricamento diario:', error)
      setLoading(false)
      return
    }

    if (data) {
      const normalized = data.map(e => ({
        ...e,
        images: e.images || [],
        event_date: e.event_date || null,
        sort_order: e.sort_order ?? null,
      }))

      // Detect if migration has run (sort_order column present in at least one row or schema)
      const migrated = data.length === 0
        ? false
        : Object.prototype.hasOwnProperty.call(data[0], 'sort_order')
      setHasNewSchema(migrated)
      if (migrated) setSortMode('manual')

      setEntries(normalized)
      if (selected) {
        const fresh = normalized.find(e => e.id === selected.id)
        if (fresh) setSelected(fresh)
      }
    }
    setLoading(false)
  }

  async function createEntry() {
    const baseInsert = { title: 'Nuova Voce', content: '', type: 'nota' }
    const fullInsert = hasNewSchema
      ? { ...baseInsert, event_date: todayIso(), sort_order: (entries.length > 0 ? Math.min(...entries.map(e => e.sort_order ?? 0)) - 1 : 0), images: [] }
      : baseInsert

    const { data, error } = await supabase
      .from('diary_entries')
      .insert(fullInsert)
      .select()
      .single()

    if (error || !data) {
      // Fallback: try base insert only
      const { data: fallback } = await supabase
        .from('diary_entries')
        .insert(baseInsert)
        .select()
        .single()
      if (!fallback) return
      const entry = { ...fallback, images: [], event_date: null, sort_order: null }
      setEntries(prev => [entry, ...prev])
      setSelected(entry)
      setEditForm({ title: entry.title, content: entry.content || '', type: entry.type, event_date: todayIso(), images: [] })
      setEditing(true)
      return
    }

    const entry = { ...data, images: data.images || [], event_date: data.event_date || null }
    setEntries(prev => [entry, ...prev])
    setSelected(entry)
    setEditForm({ title: entry.title, content: entry.content || '', type: entry.type, event_date: entry.event_date || todayIso(), images: entry.images })
    setEditing(true)
  }

  async function saveEntry() {
    if (!selected) return
    const baseUpdates = {
      title: editForm.title.trim() || 'Senza titolo',
      content: editForm.content,
      type: editForm.type,
      updated_at: new Date().toISOString(),
    }
    const fullUpdates = hasNewSchema
      ? { ...baseUpdates, event_date: editForm.event_date || null, images: editForm.images || [] }
      : baseUpdates

    const { error } = await supabase.from('diary_entries').update(fullUpdates).eq('id', selected.id)

    if (error && hasNewSchema) {
      // Retry without new columns
      await supabase.from('diary_entries').update(baseUpdates).eq('id', selected.id)
    }

    const updated = { ...selected, ...fullUpdates }
    setEntries(prev => prev.map(e => e.id === selected.id ? updated : e))
    setSelected(updated)
    setEditing(false)
  }

  async function deleteEntry(id) {
    if (!confirm('Eliminare questa voce?')) return
    await supabase.from('diary_entries').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  function startEdit(entry) {
    setEditForm({
      title: entry.title,
      content: entry.content || '',
      type: entry.type,
      event_date: entry.event_date || todayIso(),
      images: entry.images || [],
    })
    setEditing(true)
  }

  async function handleAddImage(file) {
    if (!file) return
    setUploadingImage(true)
    try {
      const url = await uploadImage(file)
      setEditForm(p => ({ ...p, images: [...(p.images || []), url] }))
    } catch (e) {
      alert('Errore caricamento immagine: ' + e.message)
    }
    setUploadingImage(false)
  }

  function removeImage(idx) {
    setEditForm(p => ({ ...p, images: (p.images || []).filter((_, i) => i !== idx) }))
  }

  async function moveEntry(entry, dir) {
    if (!hasNewSchema) return
    const list = sortedEntries
    const idx = list.findIndex(e => e.id === entry.id)
    const targetIdx = idx + dir
    if (targetIdx < 0 || targetIdx >= list.length) return
    const other = list[targetIdx]
    const a = entry.sort_order ?? idx
    const b = other.sort_order ?? targetIdx
    setEntries(prev => prev.map(e => {
      if (e.id === entry.id) return { ...e, sort_order: b }
      if (e.id === other.id) return { ...e, sort_order: a }
      return e
    }))
    await Promise.all([
      supabase.from('diary_entries').update({ sort_order: b }).eq('id', entry.id),
      supabase.from('diary_entries').update({ sort_order: a }).eq('id', other.id),
    ])
  }

  const filtered = useMemo(
    () => filter === 'all' ? entries : entries.filter(e => e.type === filter),
    [entries, filter]
  )

  const sortedEntries = useMemo(() => {
    const arr = [...filtered]
    if (sortMode === 'manual' && hasNewSchema) {
      arr.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    } else if (sortMode === 'event_asc') {
      arr.sort((a, b) => (a.event_date || a.created_at || '').localeCompare(b.event_date || b.created_at || ''))
    } else {
      // date_desc (default)
      arr.sort((a, b) => (b.event_date || b.created_at || '').localeCompare(a.event_date || a.created_at || ''))
    }
    return arr
  }, [filtered, sortMode, hasNewSchema])

  if (loading) return <div style={{ color: '#64748b', padding: '2rem' }}>Caricamento diario…</div>

  const showDetail = !isMobile || (isMobile && selected)
  const showList = !isMobile || (isMobile && !selected)

  return (
    <div className="fade-in" style={{ display: 'flex', gap: '1rem', minHeight: 'calc(100dvh - 6rem)', overflow: 'hidden' }}>

      {/* Left: entry list */}
      {showList && <div style={{ width: isMobile ? '100%' : 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', overflow: 'hidden', minHeight: 0 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9' }}>Diario</h1>
          <button className="btn btn-primary btn-sm" onClick={createEntry}>
            <Plus size={14} /> Nuova
          </button>
        </div>

        {/* Sort selector */}
        <select
          className="select"
          value={sortMode}
          onChange={e => setSortMode(e.target.value)}
          style={{ fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}
        >
          {hasNewSchema && <option value="manual">Ordine manuale</option>}
          <option value="date_desc">Recenti prima</option>
          <option value="event_asc">Cronologico</option>
        </select>

        {/* Type filters */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button onClick={() => setFilter('all')} style={{
            padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600,
            border: `1px solid ${filter === 'all' ? '#7c3aed' : '#252840'}`,
            background: filter === 'all' ? '#1e1040' : 'transparent',
            color: filter === 'all' ? '#a78bfa' : '#64748b', cursor: 'pointer',
          }}>Tutti</button>
          {ENTRY_TYPES.map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)} style={{
              padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600,
              border: `1px solid ${filter === t.id ? t.border : '#252840'}`,
              background: filter === t.id ? t.bg : 'transparent',
              color: filter === t.id ? t.color : '#64748b', cursor: 'pointer',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Entries */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sortedEntries.length === 0 && (
            <p style={{ color: '#475569', fontSize: '0.8rem', fontStyle: 'italic', padding: '1rem 0' }}>
              {entries.length === 0 ? 'Nessuna voce nel diario.' : 'Nessuna voce in questa categoria.'}
            </p>
          )}
          {sortedEntries.map((entry, idx) => {
            const type = getType(entry.type)
            const Icon = type.icon
            const isSelected = selected?.id === entry.id
            const canMove = sortMode === 'manual' && hasNewSchema
            const dateLabel = formatShortDate(entry.event_date) ||
              new Date(entry.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
            return (
              <div key={entry.id} onClick={() => { setSelected(entry); setEditing(false) }} style={{
                padding: '0.65rem 0.75rem', borderRadius: 8, cursor: 'pointer',
                background: isSelected ? '#1e2235' : 'transparent',
                border: `1px solid ${isSelected ? '#252840' : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: type.bg, border: `1px solid ${type.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <Icon size={13} color={type.color} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.title}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={10} />
                      {dateLabel}
                      {(entry.images || []).length > 0 && (
                        <span style={{ marginLeft: 4, color: '#94a3b8', fontSize: '0.65rem' }}>📷 {entry.images.length}</span>
                      )}
                    </div>
                    {entry.content && (
                      <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {entry.content}
                      </div>
                    )}
                  </div>
                  {canMove && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                      <button className="btn-icon" disabled={idx === 0} onClick={() => moveEntry(entry, -1)} style={{ padding: 2, opacity: idx === 0 ? 0.3 : 1 }}>
                        <ArrowUp size={12} />
                      </button>
                      <button className="btn-icon" disabled={idx === sortedEntries.length - 1} onClick={() => moveEntry(entry, 1)} style={{ padding: 2, opacity: idx === sortedEntries.length - 1 ? 0.3 : 1 }}>
                        <ArrowDown size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>}

      {/* Right: entry detail / editor */}
      {showDetail && <div className="card" style={{ flex: 1, minWidth: 0, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: isMobile ? '1rem' : '1.5rem', display: 'flex', flexDirection: 'column' }}>
        {!selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1rem' }}>
            <BookOpen size={48} color="#252840" />
            <p style={{ color: '#64748b' }}>Seleziona una voce o creane una nuova.</p>
          </div>
        ) : editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                className="input"
                value={editForm.title}
                onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Titolo…"
                style={{ flex: 1, minWidth: 180, fontSize: '1.1rem', fontWeight: 700 }}
                autoFocus
              />
              <select
                className="select"
                value={editForm.type}
                onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))}
                style={{ width: 130 }}
              >
                {ENTRY_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>

            {/* Date (only if schema supports it) */}
            {hasNewSchema && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={12} /> Data dell'evento
                </label>
                <input
                  className="input"
                  type="date"
                  value={editForm.event_date || ''}
                  onChange={e => setEditForm(p => ({ ...p, event_date: e.target.value }))}
                  style={{ width: 180 }}
                />
                <span style={{ fontSize: '0.7rem', color: '#475569', fontStyle: 'italic' }}>Puoi inserire date passate.</span>
              </div>
            )}

            {/* Images (only if schema supports it) */}
            {hasNewSchema && (
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Immagini
                  <label className="btn btn-secondary btn-sm" style={{ cursor: uploadingImage ? 'wait' : 'pointer' }}>
                    {uploadingImage ? <Loader size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <ImagePlus size={12} />}
                    {uploadingImage ? 'Caricamento…' : 'Aggiungi'}
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => { handleAddImage(e.target.files[0]); e.target.value = '' }}
                      disabled={uploadingImage} />
                  </label>
                </div>
                {(editForm.images || []).length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
                    {editForm.images.map((url, i) => (
                      <div key={i} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden', border: '1px solid #252840' }}>
                        <img src={cloudinaryUrl(url, { width: 240, height: 240 })} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: 6, padding: 4, cursor: 'pointer', display: 'flex' }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#475569', fontSize: '0.75rem', fontStyle: 'italic', margin: 0 }}>Nessuna immagine allegata.</p>
                )}
              </div>
            )}

            <textarea
              className="textarea"
              value={editForm.content}
              onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))}
              placeholder="Scrivi qui le note della sessione, la descrizione del PNG, del luogo o del tesoro trovato…"
              style={{ flex: 1, minHeight: 220, lineHeight: 1.7 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={saveEntry}><Check size={15} /> Salva</button>
              <button className="btn btn-secondary" onClick={() => setEditing(false)}><X size={15} /> Annulla</button>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1 }}>
            {isMobile && (
              <button className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }} onClick={() => setSelected(null)}>
                <ArrowLeft size={14} /> Indietro
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 8 }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={11} />
                      {selected.event_date
                        ? formatLongDate(selected.event_date)
                        : new Date(selected.created_at).toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
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

            {/* Images */}
            {(selected.images || []).length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, marginBottom: '1.25rem' }}>
                {selected.images.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display: 'block', aspectRatio: '1/1', borderRadius: 10, overflow: 'hidden', border: '1px solid #252840' }}>
                    <img src={cloudinaryUrl(url, { width: 320, height: 320 })} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </a>
                ))}
              </div>
            )}

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
