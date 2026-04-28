import { useState } from 'react'
import {
  statMod, statModStr, STAT_LABELS, STAT_FULL,
  SAVES_LIST, SKILLS_LIST,
  calculateSaveBonus, calculateSkillBonus, bonusStr,
} from '../../data/characters'
import { ArrowLeft, Layers, FileText, Pencil, Printer, Trash2 } from 'lucide-react'

/* Vista classica della scheda — stile carta/pergamena. Tutti i campi modificabili in editMode. */
export default function ClassicCharacterSheet({ character: c, isDM, onUpdate, onBack, onDelete, onChangeView }) {
  const [editMode, setEditMode] = useState(false)

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
  function updateStat(key, val) { onUpdate({ stats: { ...c.stats, [key]: parseInt(val) || 10 } }) }

  function addItem(field, value) {
    if (!value || !value.trim()) return
    onUpdate({ [field]: [...(c[field] || []), value.trim()] })
  }
  function removeItem(field, idx) {
    onUpdate({ [field]: (c[field] || []).filter((_, i) => i !== idx) })
  }

  return (
    <div className="classic-sheet" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Toolbar (non stampata) */}
      <div className="classic-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button className="btn-icon" onClick={onBack}><ArrowLeft size={18} /></button>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', background: '#0d0f18', borderRadius: 6, padding: 2, border: '1px solid #252840' }}>
          <button onClick={() => onChangeView('moderna')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>
            <Layers size={11} /> Moderna
          </button>
          <button onClick={() => onChangeView('classica')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, background: '#1e1040', color: '#a78bfa', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>
            <FileText size={11} /> Classica
          </button>
        </div>
        <button onClick={() => setEditMode(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6,
          background: editMode ? '#1e1040' : '#1e2235',
          color: editMode ? '#a78bfa' : '#94a3b8',
          border: `1px solid ${editMode ? '#3730a3' : '#252840'}`,
          cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
        }}>
          <Pencil size={12} /> {editMode ? 'Fine modifica' : 'Modifica scheda'}
        </button>
        <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
          <Printer size={13} /> Stampa
        </button>
        {isDM && onDelete && <button className="btn btn-danger btn-sm" onClick={onDelete}><Trash2 size={13} /> Elimina</button>}
      </div>

      {/* Pergamena */}
      <div className="parchment">
        {/* Header */}
        <div className="cs-header">
          <div className="cs-name">
            {editMode
              ? <input className="parchment-input cs-name-input" defaultValue={c.name} onBlur={e => onUpdate({ name: e.target.value, initials: e.target.value.slice(0, 2).toUpperCase() })} />
              : <div className="cs-name-text">{c.name}</div>
            }
            <div className="cs-name-label">Nome del Personaggio</div>
          </div>
          <div className="cs-meta">
            <FieldBox label="Classe & Livello" editMode={editMode}
              display={`${c.class || '—'} ${c.level || ''}`}
              onSave={(s) => {
                const m = s.match(/^(.+?)\s+(\d+)$/)
                if (m) onUpdate({ class: m[1].trim(), level: parseInt(m[2]) })
                else onUpdate({ class: s.trim() })
              }} />
            <FieldBox label="Background" editMode={editMode}
              value={c.background || ''}
              onSave={(s) => onUpdate({ background: s })} />
            <FieldBox label="Razza" editMode={editMode}
              value={c.race || ''}
              onSave={(s) => onUpdate({ race: s })} />
            <FieldBox label="Allineamento" editMode={editMode}
              value={c.alignment || ''}
              onSave={(s) => onUpdate({ alignment: s })} />
            <FieldBox label="Punti Esperienza" editMode={editMode}
              value={c.xp || ''}
              onSave={(s) => onUpdate({ xp: s })} />
          </div>
        </div>

        <div className="cs-grid">
          {/* COLONNA SINISTRA: stats */}
          <div className="cs-col-left">
            <div className="cs-stats">
              {Object.entries(STAT_LABELS).map(([key, label]) => {
                const val = c.stats?.[key] ?? 10
                return (
                  <div key={key} className="cs-stat-box">
                    <div className="cs-stat-name">{STAT_FULL[key]}</div>
                    <div className="cs-stat-mod">{statModStr(val)}</div>
                    {editMode
                      ? <input className="parchment-input cs-stat-val" type="number" defaultValue={val} onBlur={e => updateStat(key, e.target.value)} />
                      : <div className="cs-stat-val">{val}</div>
                    }
                  </div>
                )
              })}
            </div>

            {/* Ispirazione e Bonus competenza */}
            <div className="cs-row-boxes">
              <div className="cs-mini-box">
                <div className="cs-mini-val">{c.inspiration ? '★' : '○'}</div>
                <div className="cs-mini-label">Ispirazione</div>
              </div>
              <div className="cs-mini-box">
                {editMode
                  ? <input className="parchment-input cs-mini-val" type="number" defaultValue={c.proficiency_bonus ?? 2} onBlur={e => onUpdate({ proficiency_bonus: parseInt(e.target.value) || 2 })} />
                  : <div className="cs-mini-val">+{c.proficiency_bonus ?? 2}</div>
                }
                <div className="cs-mini-label">Bonus Competenza</div>
              </div>
            </div>

            {/* Tiri Salvezza */}
            <div className="cs-block">
              <div className="cs-block-content">
                {SAVES_LIST.map(s => {
                  const isProf = (c.save_proficiencies || []).includes(s.key)
                  const bonus = calculateSaveBonus(c, s.key)
                  return (
                    <div key={s.key} className="cs-row">
                      <button
                        onClick={() => editMode && toggleSaveProf(s.key)}
                        className="cs-prof-circle"
                        style={{ background: isProf ? '#3a2a05' : 'transparent', cursor: editMode ? 'pointer' : 'default' }}
                      />
                      <span className="cs-row-bonus">{bonusStr(bonus)}</span>
                      <span className="cs-row-label">{s.label}</span>
                    </div>
                  )
                })}
              </div>
              <div className="cs-block-label">Tiri Salvezza</div>
            </div>

            {/* Abilità */}
            <div className="cs-block">
              <div className="cs-block-content">
                {SKILLS_LIST.map(s => {
                  const isProf = (c.skill_proficiencies || []).includes(s.key)
                  const isExpert = (c.skill_expertise || []).includes(s.key)
                  const bonus = calculateSkillBonus(c, s.key)
                  return (
                    <div key={s.key} className="cs-row">
                      <button
                        onClick={() => editMode && toggleSkillProf(s.key)}
                        className="cs-prof-circle"
                        style={{
                          background: isExpert ? '#7c2d12' : isProf ? '#3a2a05' : 'transparent',
                          cursor: editMode ? 'pointer' : 'default',
                        }}
                      />
                      <span className="cs-row-bonus">{bonusStr(bonus)}</span>
                      <span className="cs-row-label">{s.label}</span>
                      <span className="cs-row-stat">({STAT_LABELS[s.stat]})</span>
                    </div>
                  )
                })}
              </div>
              <div className="cs-block-label">Abilità</div>
            </div>

            {/* Percezione passiva */}
            <div className="cs-block-inline">
              {editMode
                ? <input className="parchment-input" type="number" defaultValue={c.passive_perception || 10} style={{ width: 50, textAlign: 'center' }} onBlur={e => onUpdate({ passive_perception: parseInt(e.target.value) || 10 })} />
                : <span className="cs-inline-val">{c.passive_perception ?? 10}</span>
              }
              <span className="cs-inline-label">Saggezza (Percezione) Passiva</span>
            </div>
          </div>

          {/* COLONNA CENTRO: combattimento + attacchi + equipaggiamento */}
          <div className="cs-col-center">
            <div className="cs-combat-row">
              <div className="cs-combat-box">
                {editMode
                  ? <input className="parchment-input cs-combat-val" type="number" defaultValue={c.ac || 10} onBlur={e => onUpdate({ ac: parseInt(e.target.value) || 10 })} />
                  : <div className="cs-combat-val">{c.ac}</div>
                }
                <div className="cs-combat-label">Classe<br />Armatura</div>
              </div>
              <div className="cs-combat-box">
                {editMode
                  ? <input className="parchment-input cs-combat-val" defaultValue={c.initiative || '+0'} onBlur={e => onUpdate({ initiative: e.target.value })} />
                  : <div className="cs-combat-val">{c.initiative}</div>
                }
                <div className="cs-combat-label">Iniziativa</div>
              </div>
              <div className="cs-combat-box">
                {editMode
                  ? <input className="parchment-input cs-combat-val" defaultValue={c.speed || '9 m'} onBlur={e => onUpdate({ speed: e.target.value })} />
                  : <div className="cs-combat-val">{c.speed}</div>
                }
                <div className="cs-combat-label">Velocità</div>
              </div>
            </div>

            {/* HP */}
            <div className="cs-hp-box">
              <div className="cs-hp-row">
                <div className="cs-hp-half">
                  <div className="cs-hp-label">PF Massimi</div>
                  {editMode
                    ? <input className="parchment-input cs-hp-val" type="number" defaultValue={c.hp_max} onBlur={e => onUpdate({ hp_max: parseInt(e.target.value) || 1 })} />
                    : <div className="cs-hp-val">{c.hp_max}</div>
                  }
                </div>
                <div className="cs-hp-half">
                  <div className="cs-hp-label">PF Attuali</div>
                  <input className="parchment-input cs-hp-val cs-hp-current" type="number"
                    value={c.hp_current ?? 0}
                    onChange={e => {
                      const v = parseInt(e.target.value)
                      if (!isNaN(v)) onUpdate({ hp_current: Math.max(0, Math.min(c.hp_max, v)) })
                    }}
                  />
                </div>
              </div>
              <div className="cs-hp-row">
                <div className="cs-hp-half">
                  <div className="cs-hp-label">PF Temporanei</div>
                  <input className="parchment-input cs-hp-val" type="number"
                    value={c.hp_temp ?? 0}
                    onChange={e => onUpdate({ hp_temp: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="cs-hp-half">
                  <div className="cs-hp-label">Dadi Vita</div>
                  {editMode
                    ? <input className="parchment-input cs-hp-val" defaultValue={c.hit_dice || `${c.level || 1}d8`} style={{ fontSize: '1rem' }} onBlur={e => onUpdate({ hit_dice: e.target.value })} />
                    : <div className="cs-hp-val" style={{ fontSize: '1rem' }}>{c.hit_dice || `${c.level || 1}d8`}</div>
                  }
                </div>
              </div>
            </div>

            {/* Attacchi */}
            <div className="cs-block">
              <div className="cs-block-content cs-attacks">
                <div className="cs-attack-header">
                  <span>Nome</span>
                  <span>Bonus</span>
                  <span>Danno / Tipo</span>
                </div>
                {(c.attacks || []).map((a, i) => editMode ? (
                  <div key={i} className="cs-attack-row">
                    <input className="parchment-input" defaultValue={a.name} onBlur={e => {
                      const next = [...c.attacks]; next[i] = { ...a, name: e.target.value }; onUpdate({ attacks: next })
                    }} />
                    <input className="parchment-input" defaultValue={a.bonus} onBlur={e => {
                      const next = [...c.attacks]; next[i] = { ...a, bonus: e.target.value }; onUpdate({ attacks: next })
                    }} />
                    <input className="parchment-input" defaultValue={`${a.damage} ${a.type || ''}`.trim()} onBlur={e => {
                      const v = e.target.value.split(' ')
                      const next = [...c.attacks]; next[i] = { ...a, damage: v[0], type: v.slice(1).join(' ') }; onUpdate({ attacks: next })
                    }} />
                    <button className="btn-icon" onClick={() => onUpdate({ attacks: c.attacks.filter((_, j) => j !== i) })}>×</button>
                  </div>
                ) : (
                  <div key={i} className="cs-attack-row">
                    <span>{a.name}</span>
                    <span>{a.bonus}</span>
                    <span>{a.damage} {a.type}</span>
                  </div>
                ))}
                {editMode && (
                  <AttackAddRow onAdd={(att) => onUpdate({ attacks: [...(c.attacks || []), att] })} />
                )}
              </div>
              <div className="cs-block-label">Attacchi & Incantesimi</div>
            </div>

            {/* Equipaggiamento */}
            <div className="cs-block cs-equip">
              <div className="cs-block-content">
                {(c.equipment || []).map((it, i) => editMode ? (
                  <div key={i} className="cs-equip-row">
                    <input className="parchment-input" defaultValue={it} onBlur={e => {
                      const next = [...c.equipment]; next[i] = e.target.value; onUpdate({ equipment: next })
                    }} />
                    <button className="btn-icon" onClick={() => removeItem('equipment', i)}>×</button>
                  </div>
                ) : (
                  <div key={i} className="cs-equip-row">◆ {it}</div>
                ))}
                {editMode && <SimpleAddRow placeholder="Aggiungi oggetto…" onAdd={v => addItem('equipment', v)} />}
              </div>
              <div className="cs-block-label">Equipaggiamento</div>
            </div>
          </div>

          {/* COLONNA DESTRA: tratti, descrizione */}
          <div className="cs-col-right">
            <div className="cs-block">
              <div className="cs-block-content">
                {(c.traits || []).map((t, i) => editMode ? (
                  <div key={i} className="cs-equip-row">
                    <input className="parchment-input" defaultValue={t} onBlur={e => {
                      const next = [...c.traits]; next[i] = e.target.value; onUpdate({ traits: next })
                    }} />
                    <button className="btn-icon" onClick={() => removeItem('traits', i)}>×</button>
                  </div>
                ) : (
                  <div key={i} className="cs-trait-row">• {t}</div>
                ))}
                {editMode && <SimpleAddRow placeholder="Aggiungi tratto…" onAdd={v => addItem('traits', v)} />}
              </div>
              <div className="cs-block-label">Tratti & Privilegi</div>
            </div>

            <div className="cs-block">
              <div className="cs-block-content">
                {editMode ? (
                  <textarea className="parchment-input" defaultValue={c.description || ''} rows={5} style={{ width: '100%', resize: 'vertical' }}
                    onBlur={e => onUpdate({ description: e.target.value })} />
                ) : (
                  <div className="cs-description">{c.description || '—'}</div>
                )}
              </div>
              <div className="cs-block-label">Descrizione del Personaggio</div>
            </div>

            <div className="cs-block">
              <div className="cs-block-content">
                {editMode ? (
                  <textarea className="parchment-input" defaultValue={c.notes || ''} rows={5} style={{ width: '100%', resize: 'vertical' }}
                    onBlur={e => onUpdate({ notes: e.target.value })} />
                ) : (
                  <div className="cs-description">{c.notes || '—'}</div>
                )}
              </div>
              <div className="cs-block-label">Note</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldBox({ label, value, display, editMode, onSave }) {
  return (
    <div className="cs-field-box">
      {editMode
        ? <input className="parchment-input" defaultValue={value ?? display ?? ''} onBlur={e => onSave(e.target.value)} />
        : <div className="cs-field-val">{display ?? value ?? '—'}</div>
      }
      <div className="cs-field-label">{label}</div>
    </div>
  )
}

function SimpleAddRow({ placeholder, onAdd }) {
  const [v, setV] = useState('')
  return (
    <form onSubmit={e => { e.preventDefault(); if (v.trim()) { onAdd(v); setV('') } }} style={{ display: 'flex', gap: 4, marginTop: 4 }}>
      <input className="parchment-input" value={v} onChange={e => setV(e.target.value)} placeholder={placeholder} style={{ flex: 1 }} />
      <button type="submit" className="btn btn-secondary btn-sm">+</button>
    </form>
  )
}

function AttackAddRow({ onAdd }) {
  const [a, setA] = useState({ name: '', bonus: '+0', damage: '1d6', type: '' })
  return (
    <form onSubmit={e => { e.preventDefault(); if (a.name.trim()) { onAdd(a); setA({ name: '', bonus: '+0', damage: '1d6', type: '' }) } }} className="cs-attack-row">
      <input className="parchment-input" placeholder="Arma" value={a.name} onChange={e => setA(p => ({ ...p, name: e.target.value }))} />
      <input className="parchment-input" placeholder="+0" value={a.bonus} onChange={e => setA(p => ({ ...p, bonus: e.target.value }))} />
      <input className="parchment-input" placeholder="1d6 Tagl." value={`${a.damage} ${a.type}`.trim()} onChange={e => {
        const v = e.target.value.split(' ')
        setA(p => ({ ...p, damage: v[0] || '', type: v.slice(1).join(' ') }))
      }} />
      <button type="submit" className="btn-icon">+</button>
    </form>
  )
}
