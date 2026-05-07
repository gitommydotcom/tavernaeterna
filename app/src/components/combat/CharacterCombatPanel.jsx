import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Sword, Sparkles, Loader, Dice6, Package, Star, MessageSquare, Send } from 'lucide-react'

function rollDie(sides) { return Math.floor(Math.random() * sides) + 1 }

function rollDamage(damageStr, crit = false) {
  const m = (damageStr || '').match(/(\d+)d(\d+)([+-]\d+)?/)
  if (!m) return { total: rollDie(6), rolls: [] }
  const [, n, sides, mod] = m
  const dice = parseInt(n)
  const sd = parseInt(sides)
  const rolls = []
  const totalDice = crit ? dice * 2 : dice
  for (let i = 0; i < totalDice; i++) rolls.push(rollDie(sd))
  const sum = rolls.reduce((s, r) => s + r, 0) + (mod ? parseInt(mod) : 0)
  return { total: sum, rolls }
}

const TAB_LABELS = [
  { id: 'attacks', label: 'Attacchi', icon: Sword },
  { id: 'spells', label: 'Magie', icon: Sparkles },
  { id: 'equipment', label: 'Equip.', icon: Package },
  { id: 'traits', label: 'Abilità', icon: Star },
  { id: 'action', label: 'Azione', icon: MessageSquare },
]

export default function CharacterCombatPanel({ characterId, onResult }) {
  const [character, setCharacter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('attacks')
  const [lastRoll, setLastRoll] = useState(null)
  const [actionText, setActionText] = useState('')

  useEffect(() => {
    let cancelled = false
    if (!characterId) { setCharacter(null); setLoading(false); return }
    setLoading(true)
    supabase.from('characters').select('data').eq('id', characterId).single()
      .then(({ data }) => {
        if (cancelled) return
        setCharacter(data?.data || null)
        setLoading(false)
      })

    const sub = supabase
      .channel(`char-combat-${characterId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'characters', filter: `id=eq.${characterId}` },
        payload => { if (!cancelled && payload.new?.data) setCharacter(payload.new.data) })
      .subscribe()
    return () => { cancelled = true; supabase.removeChannel(sub) }
  }, [characterId])

  function reportRoll(text) {
    setLastRoll({ text, ts: Date.now() })
    if (onResult) onResult(text)
  }

  function performAttack(attack) {
    const d20 = rollDie(20)
    const bonus = parseInt(attack.bonus) || 0
    const total = d20 + bonus
    const isCrit = d20 === 20
    const isMiss = d20 === 1
    const dmg = rollDamage(attack.damage, isCrit)
    const text = isMiss
      ? `🗡 ${attack.name}: 1 (fallimento critico!)`
      : isCrit
        ? `🗡 ${attack.name}: COLPISCE ${total} (CRITICO!) — danni ${dmg.total}${attack.type ? ' ' + attack.type : ''}`
        : `🗡 ${attack.name}: ${total} per colpire — danni ${dmg.total}${attack.type ? ' ' + attack.type : ''}`
    reportRoll(text)
  }

  function castSpell(spell) {
    reportRoll(`✨ Lancia ${spell.name}${spell.level != null ? ` (liv. ${spell.level})` : ''}`)
  }

  function castCantrip(name) {
    reportRoll(`✨ Lancia ${name} (trucchetto)`)
  }

  function useEquipment(item) {
    reportRoll(`🎒 Usa ${item}`)
  }

  function useTrait(trait) {
    reportRoll(`🌟 Usa abilità: ${trait}`)
  }

  function sendAction() {
    const t = actionText.trim()
    if (!t) return
    reportRoll(`📢 ${character?.name || 'Giocatore'}: ${t}`)
    setActionText('')
  }

  if (loading) return (
    <div className="card" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
      <Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} color="#64748b" />
      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Caricamento azioni…</span>
    </div>
  )

  if (!character) return null

  const attacks = character.attacks || []
  const cantrips = character.spells?.cantrips || []
  const spells = character.spells?.spells || []
  const equipment = character.equipment || []
  const traits = character.traits || []

  const tabStyle = (id) => ({
    flex: 1, padding: '4px 6px', borderRadius: 4, border: 'none', cursor: 'pointer',
    background: tab === id ? '#1e1040' : 'transparent',
    color: tab === id ? '#a78bfa' : '#64748b',
    fontSize: '0.68rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
  })

  return (
    <div className="card" style={{ padding: '0.875rem', border: '1px solid #3730a3' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Sword size={14} color="#a78bfa" />
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Le tue azioni — {character.name}
        </span>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 8, background: '#0d0f18', borderRadius: 6, padding: 2 }}>
        {TAB_LABELS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={tabStyle(id)}>
            <Icon size={10} /> {label}
          </button>
        ))}
      </div>

      {/* Attacks */}
      {tab === 'attacks' && (
        attacks.length === 0
          ? <p style={{ color: '#475569', fontSize: '0.78rem', fontStyle: 'italic', margin: '4px 0' }}>Nessun attacco. Aggiungili dalla tua scheda.</p>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {attacks.map((a, i) => (
                <button key={i} onClick={() => performAttack(a)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  background: '#0d0f18', border: '1px solid #1e2235', borderRadius: 6,
                  padding: '6px 10px', cursor: 'pointer', textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = '#0f1020' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2235'; e.currentTarget.style.background = '#0d0f18' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f5f9' }}>{a.name}</span>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      {a.bonus} per colpire · {a.damage}{a.type ? ' ' + a.type : ''}
                    </span>
                  </div>
                  <Dice6 size={14} color="#7c3aed" />
                </button>
              ))}
            </div>
      )}

      {/* Spells */}
      {tab === 'spells' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflow: 'auto' }}>
          {cantrips.length === 0 && spells.length === 0 && (
            <p style={{ color: '#475569', fontSize: '0.78rem', fontStyle: 'italic', margin: '4px 0' }}>Nessun incantesimo nella scheda.</p>
          )}
          {cantrips.length > 0 && (
            <>
              <div style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Trucchetti</div>
              {cantrips.map((name, i) => (
                <button key={`c${i}`} onClick={() => castCantrip(name)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  background: '#0d0f18', border: '1px solid #1e2235', borderRadius: 6,
                  padding: '5px 10px', cursor: 'pointer', textAlign: 'left',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#a78bfa'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2235'}>
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{name}</span>
                  <Sparkles size={12} color="#a78bfa" />
                </button>
              ))}
            </>
          )}
          {spells.length > 0 && (
            <>
              <div style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginTop: 4 }}>Magie</div>
              {spells.map((s, i) => (
                <button key={`s${i}`} onClick={() => castSpell(s)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  background: '#0d0f18', border: '1px solid #1e2235', borderRadius: 6,
                  padding: '5px 10px', cursor: 'pointer', textAlign: 'left',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#a78bfa'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2235'}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{s.name}</span>
                    {s.level != null && <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Livello {s.level}</span>}
                  </div>
                  <Sparkles size={12} color="#a78bfa" />
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Equipment */}
      {tab === 'equipment' && (
        equipment.length === 0
          ? <p style={{ color: '#475569', fontSize: '0.78rem', fontStyle: 'italic', margin: '4px 0' }}>Nessun equipaggiamento nella scheda.</p>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 240, overflow: 'auto' }}>
              {equipment.map((item, i) => (
                <button key={i} onClick={() => useEquipment(item)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  background: '#0d0f18', border: '1px solid #1e2235', borderRadius: 6,
                  padding: '6px 10px', cursor: 'pointer', textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#d97706'; e.currentTarget.style.background = '#0f1020' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2235'; e.currentTarget.style.background = '#0d0f18' }}>
                  <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{item}</span>
                  <Package size={13} color="#d97706" />
                </button>
              ))}
            </div>
      )}

      {/* Traits / Abilities */}
      {tab === 'traits' && (
        traits.length === 0
          ? <p style={{ color: '#475569', fontSize: '0.78rem', fontStyle: 'italic', margin: '4px 0' }}>Nessun tratto o abilità nella scheda.</p>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 240, overflow: 'auto' }}>
              {traits.map((t, i) => (
                <button key={i} onClick={() => useTrait(t)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  background: '#0d0f18', border: '1px solid #1e2235', borderRadius: 6,
                  padding: '6px 10px', cursor: 'pointer', textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#a78bfa'; e.currentTarget.style.background = '#0f1020' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2235'; e.currentTarget.style.background = '#0d0f18' }}>
                  <span style={{ fontSize: '0.82rem', color: '#a78bfa' }}>{t}</span>
                  <Star size={13} color="#a78bfa" />
                </button>
              ))}
            </div>
      )}

      {/* Free action description */}
      {tab === 'action' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
            Descrivi liberamente l'azione del tuo personaggio.
          </p>
          <textarea
            value={actionText}
            onChange={e => setActionText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAction() } }}
            placeholder="Es: Mi avvicino al goblin e cerco di intimidirlo…"
            rows={3}
            style={{
              width: '100%', background: '#0d0f18', border: '1px solid #252840',
              borderRadius: 6, color: '#f1f5f9', fontSize: '0.82rem', padding: '0.5rem 0.75rem',
              resize: 'none', outline: 'none', boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
            onFocus={e => e.target.style.borderColor = '#7c3aed'}
            onBlur={e => e.target.style.borderColor = '#252840'}
          />
          <button
            onClick={sendAction}
            disabled={!actionText.trim()}
            className="btn btn-primary btn-sm"
            style={{ alignSelf: 'flex-end', opacity: actionText.trim() ? 1 : 0.4 }}
          >
            <Send size={13} /> Invia azione
          </button>
        </div>
      )}

      {/* Last roll */}
      {lastRoll && (
        <div style={{
          marginTop: 8, padding: '6px 10px', borderRadius: 6,
          background: '#1e1040', border: '1px solid #3730a3',
          color: '#e2e8f0', fontSize: '0.78rem', lineHeight: 1.4,
        }}>
          {lastRoll.text}
        </div>
      )}
    </div>
  )
}
