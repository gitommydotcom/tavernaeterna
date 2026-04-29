import { useState, useEffect } from 'react'
import {
  statModStr, STAT_LABELS,
  SAVES_LIST, SKILLS_LIST,
  calculateSaveBonus, calculateSkillBonus, bonusStr,
} from '../../data/characters'
import { lookupSpell, lookupTrait, lookupWithGroqFallback } from '../../lib/srd'
import { uploadImage } from '../../lib/cloudinary'
import ClassicCharacterSheet from './ClassicCharacterSheet'
import { ArrowLeft, Trash2, Edit3, Check, X, Plus, Minus, Sword, Book, Upload, Loader, Pencil, FileText, Layers } from 'lucide-react'

/* ── SRD Item modal ─────────────────────────────────────────── */
function ItemModal({ item, onClose }) {
  const [rolled, setRolled] = useState(null)
  const [srdEntry, setSrdEntry] = useState(null)
  const [loadingDesc, setLoadingDesc] = useState(false)

  useEffect(() => {
    if (!item) return
    setSrdEntry(null)
    if (item.kind === 'spell') {
      const hit = lookupSpell(item.name)
      if (hit) { setSrdEntry({ source: 'srd', data: hit }); return }
      setLoadingDesc(true)
      lookupWithGroqFallback(item.name, 'spell').then(res => setSrdEntry(res)).catch(() => {}).finally(() => setLoadingDesc(false))
    } else if (item.kind === 'trait' || item.kind === 'ability' || item.kind === 'feature') {
      const hit = lookupTrait(item.name)
      if (hit) { setSrdEntry({ source: 'srd', data: hit }); return }
      setLoadingDesc(true)
      lookupWithGroqFallback(item.name, 'trait').then(res => setSrdEntry(res)).catch(() => {}).finally(() => setLoadingDesc(false))
    }
  }, [item?.name, item?.kind])

  if (!item) return null

  function rollAttack() {
    const d20 = Math.floor(Math.random() * 20) + 1
    const bonus = parseInt(item.bonus) || 0
    const total = d20 + bonus
    const dmgStr = item.damage || '1d6'
    const match = dmgStr.match(/(\d+)d(\d+)([+-]\d+)?/)
    let dmg = 0
    if (match) {
      const [, n, s, mod] = match
      for (let i = 0; i < +n; i++) dmg += Math.floor(Math.random() * +s) + 1
      if (mod) dmg += parseInt(mod)
    } else dmg = Math.floor(Math.random() * 6) + 1
    setRolled({ d20, total, dmg, isCrit: d20 === 20, isMiss: d20 === 1 })
  }

  const kc = { attack: { bg: '#450a0a', color: '#f87171', border: '#7f1d1d' }, spell: { bg: '#1e1040', color: '#a78bfa', border: '#3730a3' }, trait: { bg: '#082f49', color: '#38bdf8', border: '#0369a1' }, equipment: { bg: '#1e2235', color: '#94a3b8', border: '#334155' } }[item.kind] || { bg: '#1e2235', color: '#94a3b8', border: '#334155' }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>{item.name}</h3>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 8px', borderRadius: 999, marginTop: 4, display: 'inline-block', background: kc.bg, color: kc.color, border: `1px solid ${kc.border}` }}>
              {item.kind === 'attack' ? '⚔ Attacco' : item.kind === 'spell' ? '✨ Incantesimo' : item.kind === 'trait' ? '🌟 Tratto' : '🎒 Oggetto'}
            </span>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {item.kind === 'attack' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: '1rem' }}>
              {[{ l: 'Bonus', v: item.bonus }, { l: 'Danno', v: item.damage }, { l: 'Tipo', v: item.type || '—' }].map(s => (
                <div key={s.l} className="stat-box"><div style={{ fontSize: '0.6rem', color: '#64748b', marginBottom: 3 }}>{s.l}</div><div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{s.v}</div></div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginBottom: '0.75rem' }} onClick={rollAttack}><Sword size={15} /> Tira Attacco</button>
            {rolled && (
              <div style={{ background: rolled.isCrit ? '#1a0d00' : rolled.isMiss ? '#0d0505' : '#0d0f18', border: `1px solid ${rolled.isCrit ? '#d97706' : rolled.isMiss ? '#7f1d1d' : '#252840'}`, borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                {rolled.isCrit && <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>⚡ CRITICO!</div>}
                {rolled.isMiss && <div style={{ fontSize: '1.2rem', marginBottom: 4, color: '#ef4444' }}>💀 Fallimento critico!</div>}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                  <div><div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Colpire</div><div style={{ fontSize: '2rem', fontWeight: 900, color: rolled.isCrit ? '#f59e0b' : rolled.isMiss ? '#ef4444' : '#f1f5f9' }}>{rolled.total}</div><div style={{ fontSize: '0.7rem', color: '#475569' }}>({rolled.d20}+{parseInt(item.bonus) || 0})</div></div>
                  {!rolled.isMiss && <div><div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Danno</div><div style={{ fontSize: '2rem', fontWeight: 900, color: '#ef4444' }}>{rolled.isCrit ? rolled.dmg * 2 : rolled.dmg}</div>{rolled.isCrit && <div style={{ fontSize: '0.7rem', color: '#f59e0b' }}>×2</div>}</div>}
                </div>
              </div>
            )}
          </div>
        )}

        {item.kind === 'spell' && (
          loadingDesc ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: '0.875rem', padding: '1rem 0' }}><Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Ricerca nel Manuale…</div>
          : srdEntry ? (
            <div>
              {srdEntry.data.scuola && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '0.875rem' }}><span style={{ background: '#1e1040', color: '#a78bfa', border: '1px solid #3730a3', borderRadius: 6, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 }}>{srdEntry.data.scuola}</span>{srdEntry.source === 'ai' && <span style={{ background: '#082f49', color: '#38bdf8', border: '1px solid #0369a1', borderRadius: 6, padding: '2px 8px', fontSize: '0.65rem', fontWeight: 600 }}>✦ AI</span>}</div>}
              {(srdEntry.data.tempo || srdEntry.data.gittata || srdEntry.data.durata || srdEntry.data.componenti) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: '0.875rem' }}>
                  {[{ l: 'Tempo di lancio', v: srdEntry.data.tempo }, { l: 'Gittata', v: srdEntry.data.gittata }, { l: 'Durata', v: srdEntry.data.durata }, { l: 'Componenti', v: srdEntry.data.componenti }].filter(x => x.v).map(x => (
                    <div key={x.l} style={{ background: '#0d0f18', border: '1px solid #1e2235', borderRadius: 6, padding: '0.4rem 0.6rem' }}>
                      <div style={{ fontSize: '0.58rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{x.l}</div>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 500 }}>{x.v}</div>
                    </div>
                  ))}
                </div>
              )}
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.75, margin: 0 }}>{srdEntry.data.description || srdEntry.data.desc}</p>
            </div>
          ) : <p style={{ color: '#475569', fontStyle: 'italic', fontSize: '0.875rem' }}>Descrizione non trovata nel Manuale.</p>
        )}

        {(item.kind === 'trait' || item.kind === 'ability') && (
          loadingDesc ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: '0.875rem', padding: '1rem 0' }}><Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Ricerca…</div>
          : srdEntry ? <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.75, margin: 0 }}>{srdEntry.data.description || item.text || item.name}</p>
          : <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.75, margin: 0 }}>{item.text || item.name}</p>
        )}

        {item.kind === 'equipment' && <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.75, margin: 0 }}>{item.text || 'Oggetto nell\'inventario del personaggio.'}</p>}
      </div>
    </div>
  )
}

/* ── Clickable row ──────────────────────────────────────────── */
function Clickable({ children, item, onSelect, style }) {
  return (
    <button onClick={() => onSelect(item)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: '#0d0f18', border: '1px solid #1e2235', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.1s, background 0.1s', ...style }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = '#0f1020' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2235'; e.currentTarget.style.background = '#0d0f18' }}>
      {children}
    </button>
  )
}

/* ── Section card ───────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: '1rem' }}>
      {title && <div className="section-title">{title}</div>}
      {children}
    </div>
  )
}

/* ── Small add-row input ────────────────────────────────────── */
function AddRow({ placeholder, onAdd, fields }) {
  const [vals, setVals] = useState(fields ? Object.fromEntries(fields.map(f => [f.key, ''])) : { value: '' })

  function submit() {
    if (fields) {
      if (!vals[fields[0].key].trim()) return
      onAdd(vals)
      setVals(Object.fromEntries(fields.map(f => [f.key, ''])))
    } else {
      if (!vals.value.trim()) return
      onAdd(vals.value.trim())
      setVals({ value: '' })
    }
  }

  if (!fields) return (
    <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
      <input className="input" style={{ flex: 1, fontSize: '0.8rem', padding: '0.3rem 0.6rem' }} placeholder={placeholder} value={vals.value}
        onChange={e => setVals({ value: e.target.value })}
        onKeyDown={e => e.key === 'Enter' && submit()} />
      <button className="btn btn-secondary btn-sm" onClick={submit}><Plus size={12} /></button>
    </div>
  )

  return (
    <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
      {fields.map(f => (
        <input key={f.key} className="input" style={{ flex: f.flex || 1, fontSize: '0.8rem', padding: '0.3rem 0.6rem', minWidth: f.minWidth || 60 }}
          placeholder={f.label} value={vals[f.key]}
          onChange={e => setVals(p => ({ ...p, [f.key]: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && submit()} />
      ))}
      <button className="btn btn-secondary btn-sm" onClick={submit}><Plus size={12} /></button>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
export default function CharacterSheet({ character: c, isDM, onUpdate, onBack, onDelete }) {
  const [editingHP, setEditingHP] = useState(false)
  const [hpInput, setHpInput] = useState('')
  const [hpDelta, setHpDelta] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesInput, setNotesInput] = useState(c.notes || '')
  const [spellSlots, setSpellSlots] = useState(c.spells?.slots_used || {})
  const [selectedItem, setSelectedItem] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [view, setView] = useState(() => {
    try { return localStorage.getItem('lt_sheet_view') || 'moderna' } catch { return 'moderna' }
  })

  function setViewPersist(v) {
    setView(v)
    try { localStorage.setItem('lt_sheet_view', v) } catch {}
  }

  const hpPct = Math.max(0, Math.min(100, (c.hp_current / c.hp_max) * 100))
  const hpColor = hpPct > 60 ? '#22c55e' : hpPct > 25 ? '#f59e0b' : '#ef4444'

  function submitHP(e) {
    e?.preventDefault()
    const val = parseInt(hpInput)
    if (!isNaN(val)) onUpdate({ hp_current: Math.max(0, Math.min(c.hp_max, val)) })
    setEditingHP(false)
  }

  function applyDelta(e) {
    e.preventDefault()
    const val = parseInt(hpDelta)
    if (!isNaN(val)) onUpdate({ hp_current: Math.max(0, Math.min(c.hp_max, (c.hp_current || 0) + val)) })
    setHpDelta('')
  }

  function toggleSpellSlot(level) {
    const used = spellSlots[level] || 0
    const max = c.spells?.slots_max?.[level] || 0
    const newUsed = used >= max ? 0 : used + 1
    const newSlots = { ...spellSlots, [level]: newUsed }
    setSpellSlots(newSlots)
    onUpdate({ spells: { ...c.spells, slots_used: newSlots } })
  }

  async function handleAvatarUpload(file) {
    setUploadingAvatar(true)
    try { const url = await uploadImage(file); onUpdate({ avatar_url: url }) }
    catch (e) { alert('Errore: ' + e.message) }
    setUploadingAvatar(false)
  }

  // ── Edit helpers ──────────────────────────────────────────
  function removeEquipment(i) { onUpdate({ equipment: c.equipment.filter((_, idx) => idx !== i) }) }
  function addEquipment(v) { onUpdate({ equipment: [...(c.equipment || []), v] }) }
  function removeTrait(i) { onUpdate({ traits: c.traits.filter((_, idx) => idx !== i) }) }
  function addTrait(v) { onUpdate({ traits: [...(c.traits || []), v] }) }
  function removeCantrip(i) { onUpdate({ spells: { ...c.spells, cantrips: c.spells.cantrips.filter((_, idx) => idx !== i) } }) }
  function addCantrip(v) { onUpdate({ spells: { ...c.spells, cantrips: [...(c.spells?.cantrips || []), v] } }) }
  function removeSpell(i) { onUpdate({ spells: { ...c.spells, spells: c.spells.spells.filter((_, idx) => idx !== i) } }) }
  function addSpell(vals) {
    const sp = { name: vals.name.trim(), level: parseInt(vals.level) || 1, desc: vals.desc || '' }
    onUpdate({ spells: { ...c.spells, spells: [...(c.spells?.spells || []), sp] } })
  }
  function removeAttack(i) { onUpdate({ attacks: c.attacks.filter((_, idx) => idx !== i) }) }
  function addAttack(vals) {
    const a = { name: vals.name.trim(), bonus: vals.bonus || '+0', damage: vals.damage || '1d6', type: vals.type || '' }
    onUpdate({ attacks: [...(c.attacks || []), a] })
  }
  function updateStat(key, val) { onUpdate({ stats: { ...c.stats, [key]: parseInt(val) || 10 } }) }
  function updateCombatField(key, val) { onUpdate({ [key]: key === 'ac' || key === 'hp_max' || key === 'passive_perception' ? parseInt(val) || 0 : val }) }

  function toggleSaveProf(saveKey) {
    const list = c.save_proficiencies || []
    const next = list.includes(saveKey) ? list.filter(k => k !== saveKey) : [...list, saveKey]
    onUpdate({ save_proficiencies: next })
  }
  function toggleSkillProf(skillKey) {
    const list = c.skill_proficiencies || []
    const next = list.includes(skillKey) ? list.filter(k => k !== skillKey) : [...list, skillKey]
    onUpdate({ skill_proficiencies: next })
  }
  function toggleSkillExpertise(skillKey) {
    const list = c.skill_expertise || []
    const next = list.includes(skillKey) ? list.filter(k => k !== skillKey) : [...list, skillKey]
    onUpdate({ skill_expertise: next })
  }

  const editBadge = editMode
    ? { background: '#1e1040', color: '#a78bfa', border: '1px solid #3730a3' }
    : { background: '#1e2235', color: '#94a3b8', border: '1px solid #252840' }

  if (view === 'classica') {
    return (
      <ClassicCharacterSheet
        character={c}
        isDM={isDM}
        onUpdate={onUpdate}
        onBack={onBack}
        onDelete={onDelete}
        view={view}
        onChangeView={setViewPersist}
      />
    )
  }

  return (
    <div className="fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        {/* Row 1: back + avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button className="btn-icon" onClick={onBack}><ArrowLeft size={18} /></button>

          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {c.avatar_url
              ? <img src={c.avatar_url} alt={c.name} style={{ width: 72, height: 72, borderRadius: 14, objectFit: 'cover', border: `2px solid ${c.color}55` }} />
              : <div style={{ width: 72, height: 72, borderRadius: 14, background: `linear-gradient(135deg, ${c.color}cc, ${c.color}66)`, border: `2px solid ${c.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{c.initials || c.name.slice(0, 2).toUpperCase()}</div>
            }
            <label style={{ position: 'absolute', inset: 0, borderRadius: 14, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0, transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
              {uploadingAvatar ? <Loader size={18} color="#fff" style={{ animation: 'spin 0.8s linear infinite' }} /> : <Upload size={18} color="#fff" />}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleAvatarUpload(e.target.files[0])} disabled={uploadingAvatar} />
            </label>
          </div>

          {editMode ? (
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <input className="input" defaultValue={c.name}
                onBlur={e => { const v = e.target.value.trim(); if (v) onUpdate({ name: v, initials: v.slice(0, 2).toUpperCase() }) }}
                style={{ fontSize: '0.95rem', fontWeight: 700, padding: '0.25rem 0.5rem' }} placeholder="Nome personaggio" />
              <input className="input" defaultValue={c.player_name || ''}
                onBlur={e => onUpdate({ player_name: e.target.value.trim() })}
                style={{ fontSize: '0.78rem', padding: '0.2rem 0.5rem' }} placeholder="Nome del giocatore" />
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <input className="input" defaultValue={c.race} onBlur={e => onUpdate({ race: e.target.value })} style={{ width: 80, fontSize: '0.72rem', padding: '0.2rem 0.4rem' }} placeholder="Razza" />
                <input className="input" defaultValue={c.class} onBlur={e => onUpdate({ class: e.target.value })} style={{ width: 85, fontSize: '0.72rem', padding: '0.2rem 0.4rem' }} placeholder="Classe" />
                <input className="input" defaultValue={c.alignment || ''} onBlur={e => onUpdate({ alignment: e.target.value })} style={{ width: 120, fontSize: '0.72rem', padding: '0.2rem 0.4rem' }} placeholder="Allineamento" />
                <input className="input" type="number" min={1} max={20} defaultValue={c.level} onBlur={e => onUpdate({ level: parseInt(e.target.value) || 1 })} style={{ width: 50, fontSize: '0.72rem', padding: '0.2rem 0.4rem' }} placeholder="Liv." />
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 700, color: '#f1f5f9' }}>{c.name}</h1>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', marginTop: 2 }}>{c.race} · {c.class} {c.level}{c.alignment ? ` · ${c.alignment}` : ''}</p>
              {c.player_name && <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.72rem', fontStyle: 'italic' }}>Giocato da {c.player_name}</p>}
            </div>
          )}
        </div>

        {/* Row 2: action buttons */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#0d0f18', borderRadius: 6, padding: 2, border: '1px solid #252840' }}>
            <button onClick={() => setViewPersist('moderna')} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4,
              background: view === 'moderna' ? '#1e1040' : 'transparent',
              color: view === 'moderna' ? '#a78bfa' : '#64748b',
              border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
            }}>
              <Layers size={11} /> Moderna
            </button>
            <button onClick={() => setViewPersist('classica')} style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4,
              background: view === 'classica' ? '#1e1040' : 'transparent',
              color: view === 'classica' ? '#a78bfa' : '#64748b',
              border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
            }}>
              <FileText size={11} /> Classica
            </button>
          </div>
          <button onClick={() => setEditMode(v => !v)} style={{ ...editBadge, display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.15s' }}>
            <Pencil size={12} /> {editMode ? 'Fine modifica' : 'Modifica scheda'}
          </button>
          {isDM && onDelete && <button className="btn btn-danger btn-sm" onClick={onDelete}><Trash2 size={13} /> Elimina</button>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* HP & Combat */}
          <Section title="Combattimento">
            <div style={{ background: '#0d0f18', border: `1px solid ${hpColor}33`, borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Punti Ferita</span>
                <button className="btn-icon" style={{ padding: 2 }} onClick={() => { setHpInput(String(c.hp_current ?? 0)); setEditingHP(true) }}><Edit3 size={12} /></button>
              </div>
              {editingHP ? (
                <form onSubmit={submitHP} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input className="input" type="number" value={hpInput} onChange={e => setHpInput(e.target.value)} style={{ width: 80, fontSize: '1rem', fontWeight: 700 }} autoFocus />
                  <span style={{ color: '#64748b' }}>/ {c.hp_max}</span>
                  <button type="submit" className="btn-icon"><Check size={14} /></button>
                  <button type="button" className="btn-icon" onClick={() => setEditingHP(false)}><X size={14} /></button>
                </form>
              ) : (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: hpColor, lineHeight: 1 }}>{c.hp_current}</span>
                  {editMode ? (
                    <span style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 3 }}>
                      / <input type="number" defaultValue={c.hp_max} onBlur={e => { const v = parseInt(e.target.value); if (v > 0) onUpdate({ hp_max: v }) }} style={{ width: 48, background: 'transparent', border: 'none', borderBottom: '1px solid #3730a3', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center', outline: 'none', padding: '0 2px' }} /> Max
                    </span>
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '1rem' }}>/ {c.hp_max}</span>
                  )}
                </div>
              )}
              <div className="hp-bar-bg" style={{ marginTop: 8, marginBottom: 8 }}><div className="hp-bar-fill" style={{ width: `${hpPct}%`, background: hpColor }} /></div>
              {!editingHP && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => onUpdate({ hp_current: Math.max(0, c.hp_current - 1) })} style={{ padding: '0.2rem 0.5rem' }}><Minus size={12} /></button>
                  <form onSubmit={applyDelta} style={{ flex: 1, display: 'flex', gap: 4 }}>
                    <input className="input" type="number" placeholder="±0" value={hpDelta} onChange={e => setHpDelta(e.target.value)} style={{ textAlign: 'center', fontSize: '0.8rem' }} />
                    <button type="submit" className="btn btn-secondary btn-sm">OK</button>
                  </form>
                  <button className="btn btn-secondary btn-sm" onClick={() => onUpdate({ hp_current: Math.min(c.hp_max, c.hp_current + 1) })} style={{ padding: '0.2rem 0.5rem' }}><Plus size={12} /></button>
                </div>
              )}
            </div>

            {editMode ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {[{ k: 'ac', l: 'CA', type: 'number' }, { k: 'initiative', l: 'Iniziativa', type: 'text' }, { k: 'speed', l: 'Velocità', type: 'text' }, { k: 'passive_perception', l: 'Perc.', type: 'number' }].map(f => (
                  <div key={f.k} className="stat-box">
                    <div style={{ fontSize: '0.58rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{f.l}</div>
                    <input type={f.type} defaultValue={c[f.k]} onBlur={e => updateCombatField(f.k, e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #3730a3', color: '#f1f5f9', fontSize: '0.9rem', fontWeight: 700, textAlign: 'center', outline: 'none', padding: '2px 0' }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {[{ l: 'CA', v: c.ac }, { l: 'Iniziativa', v: c.initiative }, { l: 'Velocità', v: c.speed }, { l: 'Perc.', v: c.passive_perception }].map(s => (
                  <div key={s.l} className="stat-box">
                    <div style={{ fontSize: '0.58rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{s.l}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>{s.v}</div>
                  </div>
                ))}
              </div>
            )}
            {editMode ? (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#94a3b8' }}>
                Bonus Competenza: +<input type="number" defaultValue={c.proficiency_bonus ?? 2} onBlur={e => onUpdate({ proficiency_bonus: parseInt(e.target.value) || 2 })} style={{ width: 32, background: 'transparent', border: 'none', borderBottom: '1px solid #3730a3', color: '#a78bfa', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', outline: 'none', padding: '0 2px' }} />
              </div>
            ) : c.proficiency_bonus ? (
              <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#94a3b8' }}>Bonus Competenza: <strong style={{ color: '#a78bfa' }}>+{c.proficiency_bonus}</strong></div>
            ) : null}
          </Section>

          {/* Stats */}
          <Section title="Caratteristiche">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {Object.entries(STAT_LABELS).map(([key, label]) => {
                const val = c.stats?.[key] ?? 10
                return (
                  <div key={key} className="stat-box" style={{ padding: '0.75rem 0.5rem' }}>
                    <div style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                    {editMode
                      ? <input type="number" defaultValue={val} onBlur={e => updateStat(key, e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #3730a3', color: '#f1f5f9', fontSize: '1.3rem', fontWeight: 800, textAlign: 'center', outline: 'none', padding: '2px 0', lineHeight: 1 }} />
                      : <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{val}</div>
                    }
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a78bfa', marginTop: 2 }}>{statModStr(val)}</div>
                  </div>
                )
              })}
            </div>
          </Section>

          {/* Saves */}
          <Section title="Tiri Salvezza">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px' }}>
              {SAVES_LIST.map(s => {
                const isProf = (c.save_proficiencies || []).includes(s.key)
                const bonus = calculateSaveBonus(c, s.key)
                return (
                  <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', padding: '4px 0', borderBottom: '1px solid #1e2235' }}>
                    <button
                      onClick={() => editMode && toggleSaveProf(s.key)}
                      title={editMode ? 'Toggle competenza' : ''}
                      style={{
                        width: 14, height: 14, borderRadius: '50%',
                        border: `2px solid ${isProf ? '#7c3aed' : '#3a4055'}`,
                        background: isProf ? '#7c3aed' : 'transparent',
                        cursor: editMode ? 'pointer' : 'default',
                        padding: 0, flexShrink: 0,
                      }}
                    />
                    <span style={{ color: '#cbd5e1', flex: 1 }}>{s.label}</span>
                    <span style={{ color: '#a78bfa', fontWeight: 700, minWidth: 28, textAlign: 'right' }}>{bonusStr(bonus)}</span>
                  </div>
                )
              })}
            </div>
            {editMode && (
              <p style={{ fontSize: '0.68rem', color: '#475569', marginTop: 6, marginBottom: 0, fontStyle: 'italic' }}>Clicca il cerchio per attivare/disattivare la competenza.</p>
            )}
          </Section>

          {/* Skills */}
          <Section title="Abilità">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
              {SKILLS_LIST.map(s => {
                const isProf = (c.skill_proficiencies || []).includes(s.key)
                const isExpert = (c.skill_expertise || []).includes(s.key)
                const bonus = calculateSkillBonus(c, s.key)
                return (
                  <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', padding: '4px 0', borderBottom: '1px solid #1e2235' }}>
                    <button
                      onClick={() => editMode && toggleSkillProf(s.key)}
                      title={editMode ? 'Toggle competenza' : ''}
                      style={{
                        width: 14, height: 14, borderRadius: '50%',
                        border: `2px solid ${isProf ? '#7c3aed' : '#3a4055'}`,
                        background: isProf ? '#7c3aed' : 'transparent',
                        cursor: editMode ? 'pointer' : 'default',
                        padding: 0, flexShrink: 0,
                      }}
                    />
                    {editMode ? (
                      <button
                        onClick={() => toggleSkillExpertise(s.key)}
                        title="Toggle expertise (×2)"
                        style={{
                          width: 14, height: 14, borderRadius: 3,
                          border: `2px solid ${isExpert ? '#f59e0b' : '#3a4055'}`,
                          background: isExpert ? '#f59e0b' : 'transparent',
                          cursor: 'pointer', padding: 0, flexShrink: 0,
                        }}
                      />
                    ) : isExpert ? (
                      <span title="Expertise" style={{ width: 14, height: 14, borderRadius: 3, background: '#f59e0b', flexShrink: 0 }} />
                    ) : null}
                    <span style={{ color: '#cbd5e1', flex: 1 }}>
                      {s.label} <span style={{ fontSize: '0.66rem', color: '#475569', textTransform: 'uppercase' }}>({STAT_LABELS[s.stat]})</span>
                    </span>
                    <span style={{ color: isProf ? '#a78bfa' : '#94a3b8', fontWeight: 700, minWidth: 28, textAlign: 'right' }}>{bonusStr(bonus)}</span>
                  </div>
                )
              })}
            </div>
            {editMode && (
              <p style={{ fontSize: '0.68rem', color: '#475569', marginTop: 6, marginBottom: 0, fontStyle: 'italic' }}>Cerchio = competenza · Quadrato giallo = expertise (×2)</p>
            )}
          </Section>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Attacks */}
          {(c.attacks?.length > 0 || editMode) && (
            <Section title="⚔ Attacchi">
              {c.attacks?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: editMode ? 4 : 0 }}>
                  {!editMode && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 80px 70px', gap: 4, marginBottom: 4, paddingLeft: 10 }}>
                      {['Arma', 'Bonus', 'Danno', 'Tipo'].map(h => <div key={h} style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>)}
                    </div>
                  )}
                  {c.attacks.map((a, i) => editMode ? (
                    <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center', background: '#0d0f18', borderRadius: 6, padding: '4px 8px' }}>
                      <span style={{ flex: 2, fontSize: '0.8rem', color: '#f1f5f9' }}>{a.name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#22c55e', width: 45 }}>{a.bonus}</span>
                      <span style={{ fontSize: '0.75rem', color: '#f59e0b', width: 55 }}>{a.damage}</span>
                      <button className="btn-icon" style={{ padding: 2 }} onClick={() => removeAttack(i)}><X size={12} color="#ef4444" /></button>
                    </div>
                  ) : (
                    <Clickable key={i} item={{ ...a, kind: 'attack' }} onSelect={setSelectedItem}>
                      <span style={{ fontSize: '0.8rem', color: '#f1f5f9', fontWeight: 500, flex: 1 }}>{a.name}</span>
                      <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 700, width: 60, textAlign: 'center' }}>{a.bonus}</span>
                      <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700, width: 80, textAlign: 'center' }}>{a.damage}</span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', width: 70, textAlign: 'right' }}>{a.type}</span>
                    </Clickable>
                  ))}
                </div>
              )}
              {editMode && (
                <AddRow placeholder="" fields={[
                  { key: 'name', label: 'Nome arma', flex: 3 },
                  { key: 'bonus', label: 'Bonus', minWidth: 50 },
                  { key: 'damage', label: 'Danno', minWidth: 55 },
                  { key: 'type', label: 'Tipo', minWidth: 60 },
                ]} onAdd={addAttack} />
              )}
              {!editMode && <p style={{ fontSize: '0.7rem', color: '#475569', marginTop: 8, marginBottom: 0, fontStyle: 'italic' }}>Clicca per tirare i dadi</p>}
            </Section>
          )}

          {/* Spells */}
          {(c.spells || editMode) && (
            <Section title="✨ Incantesimi">
              {c.spells && (
                <>
                  {editMode ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: '0.875rem' }}>
                      <div className="stat-box">
                        <div style={{ fontSize: '0.58rem', color: '#64748b', textTransform: 'uppercase', marginBottom: 3 }}>Caratt</div>
                        <input defaultValue={c.spells.ability} onBlur={e => onUpdate({ spells: { ...c.spells, ability: e.target.value } })}
                          style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #3730a3', color: '#a78bfa', fontWeight: 700, textAlign: 'center', outline: 'none', fontSize: '0.85rem' }} />
                      </div>
                      <div className="stat-box">
                        <div style={{ fontSize: '0.58rem', color: '#64748b', textTransform: 'uppercase', marginBottom: 3 }}>Bonus Att.</div>
                        <input defaultValue={c.spells.attack_bonus} onBlur={e => onUpdate({ spells: { ...c.spells, attack_bonus: e.target.value } })}
                          style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #3730a3', color: '#22c55e', fontWeight: 700, textAlign: 'center', outline: 'none', fontSize: '0.85rem' }} />
                      </div>
                      <div className="stat-box">
                        <div style={{ fontSize: '0.58rem', color: '#64748b', textTransform: 'uppercase', marginBottom: 3 }}>CD</div>
                        <input type="number" defaultValue={c.spells.save_dc} onBlur={e => onUpdate({ spells: { ...c.spells, save_dc: parseInt(e.target.value) || 10 } })}
                          style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #3730a3', color: '#f59e0b', fontWeight: 700, textAlign: 'center', outline: 'none', fontSize: '0.85rem' }} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 12, marginBottom: '0.875rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                      <span style={{ color: '#94a3b8' }}>Caratt: <strong style={{ color: '#a78bfa' }}>{c.spells.ability}</strong></span>
                      <span style={{ color: '#94a3b8' }}>Bonus: <strong style={{ color: '#22c55e' }}>{c.spells.attack_bonus}</strong></span>
                      <span style={{ color: '#94a3b8' }}>CD: <strong style={{ color: '#f59e0b' }}>{c.spells.save_dc}</strong></span>
                    </div>
                  )}

                  {/* Edit slot massimi per livello */}
                  {editMode && (
                    <div style={{ marginBottom: '0.875rem', padding: '0.5rem', background: '#0d0f18', borderRadius: 6, border: '1px solid #1e2235' }}>
                      <div style={{ fontSize: '0.62rem', color: '#64748b', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Slot massimi per livello</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                        {[1, 2, 3, 4, 5].map(lv => (
                          <div key={lv} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>L{lv}</span>
                            <input
                              type="number" min={0} max={9}
                              defaultValue={c.spells.slots_max?.[lv] || 0}
                              onBlur={e => {
                                const v = parseInt(e.target.value) || 0
                                const nextMax = { ...(c.spells.slots_max || {}) }
                                if (v > 0) nextMax[lv] = v
                                else delete nextMax[lv]
                                onUpdate({ spells: { ...c.spells, slots_max: nextMax } })
                              }}
                              style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #3730a3', color: '#a78bfa', fontWeight: 700, textAlign: 'center', outline: 'none', fontSize: '0.85rem' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Slots */}
                  {!editMode && c.spells.slots_max && Object.entries(c.spells.slots_max).map(([level, max]) => {
                    const used = spellSlots[level] || 0
                    return (
                      <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', width: 50 }}>Liv. {level}</span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {Array.from({ length: max }).map((_, i) => (
                            <button key={i} onClick={() => toggleSpellSlot(level)} style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${i < used ? '#7c3aed' : '#252840'}`, background: i < used ? '#7c3aed' : 'transparent', cursor: 'pointer', padding: 0 }} />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{used}/{max}</span>
                      </div>
                    )
                  })}

                  {/* Cantrips */}
                  {(c.spells.cantrips?.length > 0 || editMode) && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: 6, fontWeight: 600 }}>TRUCCHETTI</div>
                      {c.spells.cantrips?.map((s, i) => editMode ? (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span style={{ flex: 1, fontSize: '0.8rem', color: '#cbd5e1' }}>{s}</span>
                          <button className="btn-icon" style={{ padding: 2 }} onClick={() => removeCantrip(i)}><X size={12} color="#ef4444" /></button>
                        </div>
                      ) : (
                        <Clickable key={i} item={{ name: s, kind: 'spell' }} onSelect={setSelectedItem} style={{ marginBottom: 3 }}>
                          <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>∞</span>
                          <span style={{ fontSize: '0.8rem', color: '#cbd5e1', flex: 1, marginLeft: 8 }}>{s}</span>
                          <Book size={11} color="#475569" />
                        </Clickable>
                      ))}
                      {editMode && <AddRow placeholder="Aggiungi trucchetto…" onAdd={addCantrip} />}
                    </div>
                  )}

                  {/* Spells by level */}
                  {[1, 2, 3, 4, 5].map(lv => {
                    const lvSpells = c.spells?.spells?.filter(s => s.level === lv) || []
                    if (!lvSpells.length && !editMode) return null
                    if (!lvSpells.length && editMode && lv > 3) return null
                    return (
                      <div key={lv} style={{ marginBottom: '0.625rem' }}>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: 4, fontWeight: 600 }}>LIVELLO {lv}</div>
                        {lvSpells.map((s, i) => editMode ? (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                            <span style={{ flex: 1, fontSize: '0.8rem', color: '#cbd5e1' }}>{s.name}</span>
                            <button className="btn-icon" style={{ padding: 2 }} onClick={() => removeSpell(c.spells.spells.indexOf(s))}><X size={12} color="#ef4444" /></button>
                          </div>
                        ) : (
                          <Clickable key={i} item={{ ...s, kind: 'spell' }} onSelect={setSelectedItem} style={{ marginBottom: 3 }}>
                            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500, flex: 1 }}>{s.name}</span>
                            <Book size={11} color="#475569" />
                          </Clickable>
                        ))}
                        {editMode && (
                          <AddRow placeholder="" fields={[
                            { key: 'name', label: `Incantesimo liv.${lv}`, flex: 3 },
                            { key: 'level', label: String(lv), minWidth: 1 },
                          ]} onAdd={v => addSpell({ ...v, level: lv })} />
                        )}
                      </div>
                    )
                  })}
                </>
              )}
              {!c.spells && editMode && (
                <button className="btn btn-secondary btn-sm" onClick={() => onUpdate({ spells: { ability: 'INT', attack_bonus: '+0', save_dc: 10, slots_used: {}, slots_max: { 1: 2 }, cantrips: [], spells: [] } })}>
                  <Plus size={12} /> Abilita incantesimi
                </button>
              )}
              {!editMode && <p style={{ fontSize: '0.7rem', color: '#475569', marginTop: 8, marginBottom: 0, fontStyle: 'italic' }}>Clicca per la descrizione completa</p>}
            </Section>
          )}

          {/* Equipment */}
          {(c.equipment?.length > 0 || editMode) && (
            <Section title="🎒 Equipaggiamento">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {c.equipment?.map((item, i) => editMode ? (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#d97706', fontSize: '0.7rem' }}>◆</span>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1', flex: 1 }}>{item}</span>
                    <button className="btn-icon" style={{ padding: 2 }} onClick={() => removeEquipment(i)}><X size={12} color="#ef4444" /></button>
                  </div>
                ) : (
                  <Clickable key={i} item={{ name: item, kind: 'equipment', text: item }} onSelect={setSelectedItem}>
                    <span style={{ color: '#d97706', fontSize: '0.7rem', marginRight: 6 }}>◆</span>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1', flex: 1 }}>{item}</span>
                  </Clickable>
                ))}
              </div>
              {editMode && <AddRow placeholder="Aggiungi oggetto…" onAdd={addEquipment} />}
            </Section>
          )}

          {/* Traits */}
          {(c.traits?.length > 0 || editMode) && (
            <Section title="🌟 Tratti e Privilegi">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {c.traits?.map((t, i) => editMode ? (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.8rem', color: '#a78bfa', flex: 1 }}>{t}</span>
                    <button className="btn-icon" style={{ padding: 2 }} onClick={() => removeTrait(i)}><X size={12} color="#ef4444" /></button>
                  </div>
                ) : (
                  <Clickable key={i} item={{ name: t, kind: 'trait', text: t }} onSelect={setSelectedItem}>
                    <span style={{ fontSize: '0.8rem', color: '#a78bfa', flex: 1 }}>{t}</span>
                    <Book size={11} color="#475569" />
                  </Clickable>
                ))}
              </div>
              {editMode && <AddRow placeholder="Aggiungi tratto…" onAdd={addTrait} />}
              {!editMode && <p style={{ fontSize: '0.7rem', color: '#475569', marginTop: 8, marginBottom: 0, fontStyle: 'italic' }}>Clicca per i dettagli</p>}
            </Section>
          )}

          {/* Notes */}
          <Section title="📝 Note">
            {editMode ? (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Descrizione</div>
                <textarea
                  className="textarea"
                  defaultValue={c.description || ''}
                  onBlur={e => onUpdate({ description: e.target.value })}
                  rows={3}
                  placeholder="Descrizione del personaggio…"
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
            ) : c.description ? (
              <p style={{ fontSize: '0.825rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '0.75rem', fontStyle: 'italic' }}>{c.description}</p>
            ) : null}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Note personali</span>
              {!editingNotes && <button className="btn-icon" onClick={() => { setNotesInput(c.notes || ''); setEditingNotes(true) }}><Edit3 size={12} /></button>}
            </div>
            {editingNotes ? (
              <div>
                <textarea className="textarea" value={notesInput} onChange={e => setNotesInput(e.target.value)} rows={4} placeholder="Note sul personaggio…" autoFocus />
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => { onUpdate({ notes: notesInput }); setEditingNotes(false) }}>Salva</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditingNotes(false)}>Annulla</button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: c.notes ? '#cbd5e1' : '#475569', fontStyle: c.notes ? 'normal' : 'italic', lineHeight: 1.6, margin: 0 }}>
                {c.notes || 'Nessuna nota. Clicca ✏ per aggiungere.'}
              </p>
            )}
          </Section>
        </div>
      </div>

      {selectedItem && <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  )
}
