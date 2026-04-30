import { useState } from 'react'
import { Dice6, Plus, Minus, X, RotateCcw } from 'lucide-react'

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100]

function rollDie(sides) { return Math.floor(Math.random() * sides) + 1 }

function rollExpression(pool, modifier) {
  const rolls = []
  let total = 0
  for (const { sides, count } of pool) {
    if (count <= 0) continue
    for (let i = 0; i < count; i++) {
      const r = rollDie(sides)
      rolls.push({ sides, value: r })
      total += r
    }
  }
  total += modifier
  return { rolls, total, modifier }
}

function expressionLabel(pool, modifier) {
  const parts = pool.filter(p => p.count > 0).map(p => `${p.count}d${p.sides}`)
  if (modifier !== 0) parts.push(`${modifier > 0 ? '+' : ''}${modifier}`)
  return parts.join(' + ').replace(/\+ -/g, '- ') || '—'
}

export default function DiceWidget() {
  const [pool, setPool] = useState(DICE_TYPES.map(sides => ({ sides, count: 0 })))
  const [modifier, setModifier] = useState(0)
  const [history, setHistory] = useState([])
  const [collapsed, setCollapsed] = useState(false)

  function setCount(sides, delta) {
    setPool(prev => prev.map(p => p.sides === sides ? { ...p, count: Math.max(0, p.count + delta) } : p))
  }

  function quickRoll(sides) {
    const result = rollExpression([{ sides, count: 1 }], modifier)
    addToHistory(result, `1d${sides}`)
  }

  function rollPool() {
    const totalCount = pool.reduce((s, p) => s + p.count, 0)
    if (totalCount === 0) return
    const result = rollExpression(pool, modifier)
    addToHistory(result, expressionLabel(pool, modifier))
  }

  function addToHistory(result, label) {
    setHistory(prev => [{ ...result, label, ts: Date.now() }, ...prev].slice(0, 10))
  }

  function clearPool() {
    setPool(DICE_TYPES.map(sides => ({ sides, count: 0 })))
    setModifier(0)
  }

  const totalCount = pool.reduce((s, p) => s + p.count, 0)
  const last = history[0]

  return (
    <div className="card" style={{ padding: '0.875rem 1rem', border: '1px solid #3730a3' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: collapsed ? 0 : 10 }}>
        <Dice6 size={16} color="#a78bfa" />
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Dadi
        </span>
        {last && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', marginRight: 8 }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{last.label}</span>
            <span style={{
              fontSize: '1.1rem', fontWeight: 800,
              color: last.rolls.length === 1 && last.rolls[0].value === last.rolls[0].sides ? '#f59e0b'
                : last.rolls.length === 1 && last.rolls[0].value === 1 ? '#ef4444'
                : '#f1f5f9',
            }}>
              {last.total}
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.7rem', padding: 4 }}
        >
          {collapsed ? 'Espandi ▾' : 'Comprimi ▴'}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Quick roll row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 10 }}>
            {DICE_TYPES.map(sides => (
              <button key={sides} onClick={() => quickRoll(sides)} className="dice-btn" style={{ padding: '0.4rem 0' }}>
                <span style={{ fontSize: '0.78rem' }}>d{sides}</span>
              </button>
            ))}
          </div>

          {/* Multi-dice pool */}
          <div style={{ background: '#0d0f18', border: '1px solid #1e2235', borderRadius: 8, padding: '0.6rem 0.7rem', marginBottom: 8 }}>
            <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>
              Costruisci tiro multiplo
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(74px, 1fr))', gap: 6, marginBottom: 8 }}>
              {pool.map(({ sides, count }) => (
                <div key={sides} style={{
                  background: count > 0 ? '#1e1040' : '#161929',
                  border: `1px solid ${count > 0 ? '#3730a3' : '#252840'}`,
                  borderRadius: 6,
                  padding: '4px 6px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}>
                  <div style={{ fontSize: '0.62rem', color: count > 0 ? '#a78bfa' : '#64748b', fontWeight: 700 }}>d{sides}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button onClick={() => setCount(sides, -1)} disabled={count === 0}
                      style={{ background: 'transparent', border: 'none', color: count === 0 ? '#252840' : '#94a3b8', cursor: count === 0 ? 'default' : 'pointer', padding: 0, display: 'flex' }}>
                      <Minus size={11} />
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f1f5f9', minWidth: 14, textAlign: 'center' }}>{count}</span>
                    <button onClick={() => setCount(sides, +1)}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Mod</label>
              <input type="number" className="input" value={modifier}
                onChange={e => setModifier(parseInt(e.target.value) || 0)}
                style={{ width: 64, textAlign: 'center', padding: '0.3rem 0.4rem' }} />
              <span style={{ fontSize: '0.72rem', color: '#64748b', flex: 1, fontFamily: 'monospace' }}>
                {expressionLabel(pool, modifier)}
              </span>
              <button onClick={clearPool} className="btn btn-secondary btn-sm" disabled={totalCount === 0 && modifier === 0}>
                <RotateCcw size={11} /> Reset
              </button>
              <button onClick={rollPool} className="btn btn-primary btn-sm" disabled={totalCount === 0}>
                <Dice6 size={13} /> Tira
              </button>
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 110, overflow: 'auto' }}>
              {history.map(h => (
                <div key={h.ts} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#0d0f18', border: '1px solid #1e2235', borderRadius: 6, padding: '4px 8px',
                }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>{h.label}</span>
                  <span style={{ fontSize: '0.7rem', color: '#475569' }}>
                    {h.rolls.map(r => r.value).join(' · ')}
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f1f5f9', minWidth: 36, textAlign: 'right' }}>
                    {h.total}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
