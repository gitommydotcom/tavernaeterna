import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useIsMobile } from '../../hooks/useIsMobile'
import { PRESET_MONSTERS, CONDITIONS } from '../../data/characters'
import { Plus, SkipForward, Shield, X, Trash2, Dice6, ChevronUp, ChevronDown, Search } from 'lucide-react'

const DICE = [4, 6, 8, 10, 12, 20, 100]

function rollDie(sides) { return Math.floor(Math.random() * sides) + 1 }

export default function CombatPage() {
  const { isDM, profile } = useAuth()
  const myCharacterId = profile?.character_id || null
  const isMobile = useIsMobile()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [rollLog, setRollLog] = useState([])
  const [modifier, setModifier] = useState(0)
  const [showDice, setShowDice] = useState(false)
  const sessionRef = useRef(null)

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  useEffect(() => {
    loadSession()
    const sub = supabase
      .channel('combat-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'combat_sessions' }, payload => {
        const row = payload.new || payload.old
        if (!row) return

        // INSERT di una nuova sessione attiva: la mostro a tutti
        if (payload.eventType === 'INSERT') {
          if (row.is_active) {
            setSession(row); sessionRef.current = row
          }
          return
        }

        // UPDATE: se è la sessione che sto guardando, aggiorno; se diventa
        // inattiva, la rimuovo dalla vista
        if (payload.eventType === 'UPDATE') {
          if (sessionRef.current && sessionRef.current.id === row.id) {
            if (row.is_active === false) {
              setSession(null); sessionRef.current = null
            } else {
              setSession(row); sessionRef.current = row
            }
          } else if (row.is_active && !sessionRef.current) {
            setSession(row); sessionRef.current = row
          }
          return
        }

        if (payload.eventType === 'DELETE') {
          if (sessionRef.current && sessionRef.current.id === row.id) {
            setSession(null); sessionRef.current = null
          }
        }
      })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          // ricarica per assicurarsi di partire allineati
          loadSession()
        }
      })
    return () => supabase.removeChannel(sub)
  }, [])

  async function loadSession() {
    const { data } = await supabase
      .from('combat_sessions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (data) { setSession(data); sessionRef.current = data }
    setLoading(false)
  }

  async function updateSession(updates) {
    const s = sessionRef.current
    if (!s) return
    const { data } = await supabase
      .from('combat_sessions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', s.id)
      .select()
      .single()
    if (data) { setSession(data); sessionRef.current = data }
  }

  async function newCombat() {
    const { data } = await supabase
      .from('combat_sessions')
      .insert({ is_active: true, round: 1, current_turn: 0, participants: [], log: [] })
      .select()
      .single()
    if (data) { setSession(data); sessionRef.current = data }
  }

  async function endCombat() {
    if (!confirm('Terminare il combattimento?')) return
    await supabase.from('combat_sessions').update({ is_active: false }).eq('id', session.id)
    setSession(null); sessionRef.current = null
  }

  function nextTurn() {
    const s = sessionRef.current
    if (!s?.participants?.length) return
    const parts = s.participants
    const nextIdx = (s.current_turn + 1) % parts.length
    const newRound = nextIdx === 0 ? s.round + 1 : s.round
    updateSession({ current_turn: nextIdx, round: newRound })
  }

  function addParticipant(p) {
    const s = sessionRef.current
    const participants = [...(s?.participants || []), { ...p, id: `p_${Date.now()}` }]
    const sorted = [...participants].sort((a, b) => b.initiative - a.initiative)
    updateSession({ participants: sorted })
    setShowAddModal(false)
  }

  async function updateParticipant(id, updates) {
    const s = sessionRef.current
    if (!s) return
    const participants = s.participants.map(p => p.id === id ? { ...p, ...updates } : p)
    updateSession({ participants })
    // Sync HP back to characters table
    const p = s.participants.find(p => p.id === id)
    if (p?.char_id && 'hp_current' in updates) {
      const { data } = await supabase.from('characters').select('data').eq('id', p.char_id).single()
      if (data) {
        const charUpdated = { ...data.data, hp_current: updates.hp_current }
        await supabase.from('characters').update({ data: charUpdated, updated_at: new Date().toISOString() }).eq('id', p.char_id)
      }
    }
  }

  function moveParticipant(id, dir) {
    const s = sessionRef.current
    if (!s) return
    const parts = [...s.participants]
    const idx = parts.findIndex(p => p.id === id)
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= parts.length) return
    ;[parts[idx], parts[newIdx]] = [parts[newIdx], parts[idx]]
    let ct = s.current_turn
    if (ct === idx) ct = newIdx
    else if (ct === newIdx) ct = idx
    updateSession({ participants: parts, current_turn: ct })
  }

  function removeParticipant(id) {
    const s = sessionRef.current
    if (!s) return
    const participants = s.participants.filter(p => p.id !== id)
    const currentTurn = Math.min(s.current_turn, Math.max(0, participants.length - 1))
    updateSession({ participants, current_turn: currentTurn })
  }

  function toggleCondition(participantId, condition) {
    const s = sessionRef.current
    if (!s) return
    const p = s.participants.find(p => p.id === participantId)
    if (!p) return
    const conditions = p.conditions || []
    const newConditions = conditions.includes(condition)
      ? conditions.filter(c => c !== condition)
      : [...conditions, condition]
    updateParticipant(participantId, { conditions: newConditions })
  }

  function handleRoll(sides) {
    const result = rollDie(sides)
    const total = result + modifier
    setRollLog(prev => [{ sides, result, modifier, total, ts: Date.now() }, ...prev].slice(0, 12))
  }

  function rollInitiativa() {
    const s = sessionRef.current
    if (!s?.participants?.length) return
    const participants = s.participants.map(p => ({
      ...p,
      initiative: rollDie(20) + (parseInt(p.initiative_bonus) || 0),
    }))
    const sorted = [...participants].sort((a, b) => b.initiative - a.initiative)
    updateSession({ participants: sorted, current_turn: 0 })
  }

  if (loading) return <div style={{ color: '#64748b', padding: '2rem' }}>Caricamento…</div>

  if (!session) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
      <div style={{ fontSize: 48 }}>⚔️</div>
      <h2 style={{ color: '#f1f5f9', margin: 0 }}>Nessun combattimento attivo</h2>
      <p style={{ color: '#64748b', margin: 0 }}>Inizia un nuovo scontro</p>
      {isDM && <button className="btn btn-primary" onClick={newCombat}><Plus size={16} /> Nuovo Combattimento</button>}
    </div>
  )

  const participants = session.participants || []
  const current = participants[session.current_turn]

  return (
    <div className="fade-in" style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 3rem)', overflow: 'hidden' }}>

      {/* Main combat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.875rem', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: '#1e1040', border: '1px solid #3730a3', borderRadius: 8, padding: '0.5rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Round</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a78bfa', lineHeight: 1 }}>{session.round}</div>
            </div>
            {current && (
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Turno di</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>{current.name}</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {isDM && (
              <>
                {!isMobile && (
                  <button className="btn btn-secondary btn-sm" onClick={rollInitiativa} disabled={participants.length === 0}>
                    <Dice6 size={14} /> Tira Iniziativa
                  </button>
                )}
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(true)}>
                  <Plus size={14} /> {!isMobile && 'Aggiungi'}
                </button>
                <button className="btn btn-primary btn-sm" onClick={nextTurn} disabled={participants.length === 0}>
                  <SkipForward size={15} /> {!isMobile && 'Prossimo Turno'}
                </button>
                {isMobile && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowDice(v => !v)}>
                    <Dice6 size={14} />
                  </button>
                )}
                <button className="btn btn-danger btn-sm" onClick={endCombat}>{isMobile ? '✕' : 'Fine'}</button>
              </>
            )}
            {!isDM && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Solo il DM controlla</span>}
          </div>
        </div>

        {/* Mobile dice panel inline */}
        {isMobile && showDice && (
          <div className="card" style={{ padding: '0.875rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="section-title" style={{ margin: 0 }}>Dadi</span>
              {isDM && <button className="btn btn-secondary btn-sm" onClick={rollInitiativa} disabled={participants.length === 0}><Dice6 size={13} /> Iniziativa</button>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
              {DICE.map(d => (
                <button key={d} className="dice-btn" onClick={() => handleRoll(d)} style={{ padding: '0.3rem 0' }}>
                  <span style={{ fontSize: '0.75rem' }}>d{d}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input className="input" type="number" value={modifier} onChange={e => setModifier(+e.target.value)} style={{ width: 70, textAlign: 'center' }} placeholder="Mod" />
              {rollLog[0] && (
                <div style={{ flex: 1, background: '#1e1040', border: '1px solid #3730a3', borderRadius: 6, padding: '4px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>d{rollLog[0].sides}</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9' }}>{rollLog[0].total}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Turn order indicator */}
        {participants.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0, flexWrap: 'wrap' }}>
            {participants.map((p, idx) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: idx === session.current_turn ? '#1e1040' : '#0d0f18',
                border: `1px solid ${idx === session.current_turn ? '#7c3aed' : '#1e2235'}`,
                borderRadius: 6, padding: '3px 8px', fontSize: '0.72rem',
                color: idx === session.current_turn ? '#a78bfa' : '#64748b',
                fontWeight: idx === session.current_turn ? 700 : 400,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || '#7c3aed', flexShrink: 0, display: 'inline-block' }} />
                {idx + 1}. {p.name}
              </div>
            ))}
          </div>
        )}

        {/* Participants list */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {participants.length === 0 && (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem', fontSize: '0.875rem' }}>
              Nessun partecipante. {isDM ? 'Clicca "Aggiungi" per iniziare.' : ''}
            </div>
          )}
          {participants.map((p, idx) => (
            <ParticipantRow
              key={p.id}
              participant={p}
              isActive={idx === session.current_turn}
              isDM={isDM}
              isOwnCharacter={!isDM && myCharacterId && p.char_id === myCharacterId}
              isFirst={idx === 0}
              isLast={idx === participants.length - 1}
              onUpdate={(updates) => updateParticipant(p.id, updates)}
              onRemove={() => removeParticipant(p.id)}
              onToggleCondition={(cond) => toggleCondition(p.id, cond)}
              onMoveUp={() => moveParticipant(p.id, -1)}
              onMoveDown={() => moveParticipant(p.id, 1)}
            />
          ))}
        </div>
      </div>

      {/* Right panel: Dice roller (desktop only) */}
      {!isMobile && <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div className="section-title">Dadi</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, marginBottom: '0.75rem' }}>
            {DICE.map(d => (
              <button key={d} className="dice-btn" onClick={() => handleRoll(d)}>
                <span style={{ fontSize: '0.9rem' }}>⬡</span>
                <span>d{d}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap' }}>Modificatore</label>
            <input className="input" type="number" value={modifier} onChange={e => setModifier(+e.target.value)} style={{ textAlign: 'center', width: '100%' }} />
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="section-title">Ultimi Tiri</div>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {rollLog.length === 0 && <p style={{ color: '#475569', fontSize: '0.75rem', fontStyle: 'italic' }}>Nessun tiro ancora.</p>}
            {rollLog.map((r, i) => (
              <div key={r.ts} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: i === 0 ? '#1e1040' : '#0d0f18',
                border: `1px solid ${i === 0 ? '#3730a3' : '#1e2235'}`,
                borderRadius: 6, padding: '6px 8px',
              }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>d{r.sides}{r.modifier !== 0 ? ` ${r.modifier > 0 ? '+' : ''}${r.modifier}` : ''}</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: r.result === r.sides ? '#f59e0b' : r.result === 1 ? '#ef4444' : '#f1f5f9' }}>{r.total}</span>
                <span style={{ fontSize: '0.65rem', color: '#475569' }}>({r.result})</span>
              </div>
            ))}
          </div>
        </div>
      </div>}

      {showAddModal && <AddParticipantModal onAdd={addParticipant} onClose={() => setShowAddModal(false)} />}
    </div>
  )
}

function hpStatusLabel(pct) {
  if (pct >= 90) return 'Illeso'
  if (pct >= 60) return 'Lievemente ferito'
  if (pct >= 35) return 'Ferito'
  if (pct >= 10) return 'Gravemente ferito'
  if (pct > 0) return 'In fin di vita'
  return 'Abbattuto'
}

function ParticipantRow({ participant: p, isActive, isDM, isOwnCharacter, isFirst, isLast, onUpdate, onRemove, onToggleCondition, onMoveUp, onMoveDown }) {
  const [editingHP, setEditingHP] = useState(false)
  const [hpInput, setHpInput] = useState('')
  const [showConditions, setShowConditions] = useState(false)
  const [hpDelta, setHpDelta] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(p.avatar_url || null)
  const isMobile = useIsMobile()

  // Carica avatar del personaggio collegato (cache locale per evitare query ripetute)
  useEffect(() => {
    if (avatarUrl || !p.char_id) return
    let cancelled = false
    supabase.from('characters').select('data').eq('id', p.char_id).single()
      .then(({ data }) => {
        if (cancelled) return
        if (data?.data?.avatar_url) setAvatarUrl(data.data.avatar_url)
      })
    return () => { cancelled = true }
  }, [p.char_id, avatarUrl])

  const hpCurrent = p.hp_current ?? p.hp_max
  const hpPct = Math.max(0, Math.min(100, (hpCurrent / p.hp_max) * 100))
  const hpColor = hpPct > 60 ? '#22c55e' : hpPct > 25 ? '#f59e0b' : '#ef4444'
  const isDead = hpCurrent <= 0

  // Privacy: solo DM e proprietario del PG vedono i numeri esatti.
  // Tutti gli altri vedono lo stato qualitativo (barra senza numero).
  const canSeeExactHP = isDM || isOwnCharacter
  const canEditHP = isDM

  function submitHP(e) {
    e?.preventDefault()
    const val = parseInt(hpInput)
    if (!isNaN(val)) onUpdate({ hp_current: Math.max(0, Math.min(p.hp_max, val)) })
    setEditingHP(false)
  }

  function applyDelta(e) {
    e.preventDefault()
    const val = parseInt(hpDelta)
    if (!isNaN(val)) onUpdate({ hp_current: Math.max(0, Math.min(p.hp_max, hpCurrent + val)) })
    setHpDelta('')
  }

  return (
    <div className={`card ${isActive ? 'participant-active' : ''}`} style={{ padding: '0.75rem 1rem', opacity: isDead ? 0.5 : 1, transition: 'opacity 0.2s' }}>
      <div className="participant-row" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

        {/* Initiative badge */}
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: isActive ? '#1e1040' : '#0d0f18',
          border: `2px solid ${isActive ? '#7c3aed' : p.is_enemy ? '#ef444433' : '#252840'}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: '0.5rem', color: '#64748b', lineHeight: 1 }}>INI</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isActive ? '#a78bfa' : '#f1f5f9', lineHeight: 1 }}>{p.initiative}</div>
        </div>

        {/* Avatar/cerchio del partecipante */}
        {avatarUrl ? (
          <img src={avatarUrl} alt={p.name}
            style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, objectFit: 'cover', border: `2px solid ${p.color || '#7c3aed'}` }} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: p.color || '#7c3aed', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>
            {(p.name || '?').slice(0, 2).toUpperCase()}
          </div>
        )}

        <div style={{ flex: 1, overflow: 'hidden', minWidth: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: isDead ? '#ef4444' : '#f1f5f9' }}>
              {p.name} {isDead && '💀'}
            </span>
            {p.is_enemy && <span className="badge" style={{ background: '#450a0a', color: '#f87171', border: '1px solid #7f1d1d' }}>Nemico</span>}
            {isActive && <span className="badge" style={{ background: '#1e1040', color: '#a78bfa', border: '1px solid #3730a3' }}>Turno</span>}
          </div>
          {p.conditions?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 3 }}>
              {p.conditions.map(c => (
                <span key={c} className="condition-tag">
                  {c}
                  {isDM && <button onClick={() => onToggleCondition(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex' }}><X size={8} /></button>}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* AC — visibile solo a DM e proprietario del PG */}
        {canSeeExactHP && (
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '0.55rem', color: '#64748b', textTransform: 'uppercase' }}>CA</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8' }}>{p.ac}</div>
          </div>
        )}

        {/* HP */}
        <div style={{ minWidth: 90, flexShrink: 0 }}>
          {editingHP && canEditHP ? (
            <form onSubmit={submitHP} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <input className="input" type="number" value={hpInput} onChange={e => setHpInput(e.target.value)} style={{ width: 60, fontSize: '0.85rem', fontWeight: 700 }} autoFocus onBlur={submitHP} />
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>/{p.hp_max}</span>
            </form>
          ) : canSeeExactHP ? (
            <div style={{ cursor: canEditHP ? 'pointer' : 'default', padding: '2px 4px', borderRadius: 4 }}
              onClick={() => { if (canEditHP) { setHpInput(hpCurrent.toString()); setEditingHP(true) } }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: hpColor }}>{hpCurrent}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>/{p.hp_max}</span>
              </div>
              <div className="hp-bar-bg" style={{ width: 80, marginTop: 2 }}>
                <div className="hp-bar-fill" style={{ width: `${hpPct}%`, background: hpColor }} />
              </div>
            </div>
          ) : (
            // Privacy: solo barra qualitativa + etichetta stato
            <div style={{ padding: '2px 4px' }}>
              <div style={{ fontSize: '0.7rem', color: hpColor, fontWeight: 600 }}>{hpStatusLabel(hpPct)}</div>
              <div className="hp-bar-bg" style={{ width: 80, marginTop: 2 }}>
                <div className="hp-bar-fill" style={{ width: `${hpPct}%`, background: hpColor }} />
              </div>
            </div>
          )}
        </div>

        {/* Quick HP delta — hidden on mobile (moved to second row) */}
        {isDM && !editingHP && !isMobile && (
          <form onSubmit={applyDelta} style={{ display: 'flex', gap: 3, alignItems: 'center', flexShrink: 0 }}>
            <input className="input" type="number" placeholder="±" value={hpDelta} onChange={e => setHpDelta(e.target.value)} style={{ width: 52, textAlign: 'center', fontSize: '0.8rem', padding: '0.25rem 0.4rem' }} />
            <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.4rem' }}>✓</button>
          </form>
        )}

        {isDM && !isMobile && (
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            <button className="btn-icon" onClick={onMoveUp} disabled={isFirst} style={{ opacity: isFirst ? 0.3 : 1 }}><ChevronUp size={14} /></button>
            <button className="btn-icon" onClick={onMoveDown} disabled={isLast} style={{ opacity: isLast ? 0.3 : 1 }}><ChevronDown size={14} /></button>
            <button className="btn-icon" onClick={() => setShowConditions(v => !v)}><Shield size={14} /></button>
            <button className="btn-icon" onClick={onRemove}><Trash2 size={14} /></button>
          </div>
        )}
      </div>

      {/* Mobile second row: delta + buttons */}
      {isDM && isMobile && !editingHP && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8, paddingTop: 8, borderTop: '1px solid #1e2235', alignItems: 'center' }}>
          <form onSubmit={applyDelta} style={{ display: 'flex', gap: 4, alignItems: 'center', flex: 1 }}>
            <input className="input" type="number" placeholder="±PF" value={hpDelta} onChange={e => setHpDelta(e.target.value)} style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem' }} />
            <button type="submit" className="btn btn-secondary btn-sm">✓</button>
          </form>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn-icon" onClick={onMoveUp} disabled={isFirst} style={{ opacity: isFirst ? 0.3 : 1 }}><ChevronUp size={14} /></button>
            <button className="btn-icon" onClick={onMoveDown} disabled={isLast} style={{ opacity: isLast ? 0.3 : 1 }}><ChevronDown size={14} /></button>
            <button className="btn-icon" onClick={() => setShowConditions(v => !v)}><Shield size={14} /></button>
            <button className="btn-icon" onClick={onRemove}><Trash2 size={14} /></button>
          </div>
        </div>
      )}

      {showConditions && isDM && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #1e2235' }}>
          <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: 6, fontWeight: 600 }}>CONDIZIONI</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {CONDITIONS.map(c => {
              const active = p.conditions?.includes(c)
              return (
                <button key={c} onClick={() => onToggleCondition(c)} style={{
                  padding: '2px 8px', borderRadius: 4, border: `1px solid ${active ? '#78350f' : '#252840'}`,
                  background: active ? '#451a03' : 'transparent',
                  color: active ? '#fbbf24' : '#94a3b8',
                  fontSize: '0.7rem', cursor: 'pointer', fontWeight: active ? 600 : 400,
                }}>{c}</button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function AddParticipantModal({ onAdd, onClose }) {
  const [tab, setTab] = useState('personaggio')
  const [characters, setCharacters] = useState([])
  const [monsterSearch, setMonsterSearch] = useState('')
  const [form, setForm] = useState({ name: '', hp_max: 10, ac: 10, initiative: 10, initiative_bonus: 0, is_enemy: false, color: '#7c3aed' })

  useEffect(() => {
    supabase.from('characters').select('*').then(({ data }) => {
      if (data?.length) setCharacters(data.map(r => r.data))
    })
  }, [])

  function fromCharacter(char) {
    onAdd({
      name: char.name,
      hp_max: char.hp_max,
      hp_current: char.hp_current,
      ac: char.ac,
      initiative: rollDie(20) + (parseInt(char.initiative) || 0),
      initiative_bonus: parseInt(char.initiative) || 0,
      is_enemy: false,
      color: char.color,
      char_id: char.id,
      avatar_url: char.avatar_url || null,
    })
  }

  function fromMonster(monster) {
    onAdd({
      name: monster.name,
      hp_max: monster.hp_max,
      hp_current: monster.hp_max,
      ac: monster.ac,
      initiative: rollDie(20) + (monster.initiative_bonus || 0),
      initiative_bonus: monster.initiative_bonus || 0,
      is_enemy: true,
      color: monster.color || '#ef4444',
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Aggiungi al Combattimento</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: '1rem', background: '#0d0f18', borderRadius: 8, padding: 3 }}>
          {['personaggio', 'mostro', 'manuale'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '0.4rem', borderRadius: 6, border: 'none',
              background: tab === t ? '#161929' : 'transparent',
              color: tab === t ? '#f1f5f9' : '#64748b',
              fontSize: '0.8rem', fontWeight: tab === t ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>

        {tab === 'personaggio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {characters.length === 0 && <p style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>Caricamento personaggi…</p>}
            {characters.map(char => (
              <button key={char.id} onClick={() => fromCharacter(char)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#0d0f18', border: '1px solid #252840', borderRadius: 8, padding: '0.75rem',
                cursor: 'pointer', transition: 'border-color 0.15s', textAlign: 'left',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#252840'}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: char.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>
                  {char.initials}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>{char.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{char.race} · {char.class} {char.level} · PF {char.hp_current}/{char.hp_max} · CA {char.ac}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === 'mostro' && (
          <>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input className="input" value={monsterSearch} onChange={e => setMonsterSearch(e.target.value)}
                placeholder={`Cerca tra ${PRESET_MONSTERS.length} mostri…`}
                style={{ paddingLeft: 32, width: '100%' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, maxHeight: '50vh', overflow: 'auto' }}>
              {PRESET_MONSTERS
                .filter(m => !monsterSearch || m.name.toLowerCase().includes(monsterSearch.toLowerCase()))
                .map(m => (
                  <button key={m.name} onClick={() => fromMonster(m)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    background: '#0d0f18', border: '1px solid #252840', borderRadius: 8, padding: '0.625rem 0.75rem',
                    cursor: 'pointer', transition: 'border-color 0.15s', textAlign: 'left',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#252840'}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>{m.name}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>PF {m.hp_max} · CA {m.ac}</span>
                  </button>
                ))}
            </div>
          </>
        )}

        {tab === 'manuale' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Nome *</label>
                <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nome" />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Iniziativa</label>
                <input className="input" type="number" value={form.initiative} onChange={e => setForm(p => ({ ...p, initiative: +e.target.value, initiative_bonus: +e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>PF Max</label>
                <input className="input" type="number" min={1} value={form.hp_max} onChange={e => setForm(p => ({ ...p, hp_max: +e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>CA</label>
                <input className="input" type="number" min={1} value={form.ac} onChange={e => setForm(p => ({ ...p, ac: +e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="is_enemy" checked={form.is_enemy} onChange={e => setForm(p => ({ ...p, is_enemy: e.target.checked }))} />
              <label htmlFor="is_enemy" style={{ fontSize: '0.85rem', color: '#cbd5e1', cursor: 'pointer' }}>È un nemico</label>
              <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} style={{ marginLeft: 'auto', width: 36, height: 28, borderRadius: 4, border: '1px solid #252840', background: 'transparent', cursor: 'pointer' }} />
            </div>
            <button className="btn btn-primary" onClick={() => form.name.trim() && onAdd({ ...form, hp_current: form.hp_max })} disabled={!form.name.trim()}>
              Aggiungi
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
