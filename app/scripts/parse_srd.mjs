import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '../../manuale dnd')

function readFile(name) { return readFileSync(join(root, name), 'utf8') }

function normalizeKey(name) {
  return name.toLowerCase()
    .replace(/[''`]/g, '').replace(/[àá]/g, 'a').replace(/[èé]/g, 'e')
    .replace(/[ìí]/g, 'i').replace(/[òó]/g, 'o').replace(/[ùú]/g, 'u')
    .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}

/* ── Parse spells ───────────────────────────────────────────── */
function parseSpells(text) {
  const spells = {}
  const lines = text.split('\n').map(l => l.trim())

  // School/level pattern
  const schoolRx = /^(Ammaliamento|Divinazione|Evocazione|Illusione|Necromanzia|Abiurazione|Trasmutazione|Invocazione|Trucchetto)\s+(di\s+\d+°\s+livello|di\s+livello|di\s+Ammaliamento|\(trucchetto\)|\di)?/i

  const isProperty = l =>
    l.startsWith('Tempo di lancio:') || l.startsWith('Gittata:') ||
    l.startsWith('Componenti:') || l.startsWith('Durata:')

  const isJunk = l =>
    l.startsWith('Rivendita') || l.startsWith('Systems Reference') ||
    /^\d+$/.test(l) || l === ''

  for (let i = 0; i < lines.length - 3; i++) {
    const name = lines[i]
    const next1 = lines[i + 1]
    const next2 = lines[i + 2]

    // A spell name: non-empty, reasonable length, no colon, not junk
    if (!name || name.length > 60 || name.length < 3 || name.includes(':') ||
        name.startsWith('•') || isJunk(name)) continue

    // Immediately after name (blank or school line) → school line
    const schoolLine = schoolRx.test(next1) ? next1 : (next1 === '' && schoolRx.test(next2) ? next2 : null)
    if (!schoolLine) continue

    // Collect block
    let j = i + 1
    while (j < lines.length && lines[j] === '') j++  // skip blank
    if (!schoolRx.test(lines[j])) continue

    const props = { scuola: lines[j] }
    j++
    // Collect properties
    while (j < lines.length && (isProperty(lines[j]) || lines[j] === '')) {
      const l = lines[j]
      if (l.startsWith('Tempo di lancio:')) props.tempo = l.replace('Tempo di lancio:', '').trim()
      else if (l.startsWith('Gittata:')) props.gittata = l.replace('Gittata:', '').trim()
      else if (l.startsWith('Componenti:')) props.componenti = l.replace('Componenti:', '').trim()
      else if (l.startsWith('Durata:')) props.durata = l.replace('Durata:', '').trim()
      j++
    }

    // Collect description (until blank + spell-looking-name)
    const descLines = []
    while (j < lines.length) {
      const l = lines[j]
      if (isJunk(l) && l === '') {
        // Check if next non-empty line is another spell
        let k = j + 1
        while (k < lines.length && lines[k] === '') k++
        if (k < lines.length && schoolRx.test(lines[k])) break
        if (k < lines.length && k + 1 < lines.length && schoolRx.test(lines[k + 1])) break
      }
      if (l.startsWith('Rivendita') || l.startsWith('Systems Reference')) break
      if (l !== '') descLines.push(l)
      j++
      if (descLines.join(' ').length > 1500) break
    }

    if (props.tempo && descLines.length > 0) {
      const key = normalizeKey(name)
      // Keep the more complete version if duplicate
      if (!spells[key] || (spells[key].description?.length || 0) < descLines.join(' ').length) {
        spells[key] = {
          name,
          ...props,
          description: descLines.join(' ').replace(/\s+/g, ' ').trim()
        }
      }
    }
    i = j - 1
  }
  return spells
}

/* ── Parse abilities ────────────────────────────────────────── */
function parseAbilities(text) {
  const abilities = {}
  const skillDefs = [
    { name: 'Atletica', stat: 'Forza' },
    { name: 'Acrobazia', stat: 'Destrezza' },
    { name: 'Furtività', stat: 'Destrezza' },
    { name: 'Rapidità di Mano', stat: 'Destrezza' },
    { name: 'Arcano', stat: 'Intelligenza' },
    { name: 'Indagare', stat: 'Intelligenza' },
    { name: 'Natura', stat: 'Intelligenza' },
    { name: 'Religione', stat: 'Intelligenza' },
    { name: 'Storia', stat: 'Intelligenza' },
    { name: 'Medicina', stat: 'Saggezza' },
    { name: 'Percezione', stat: 'Saggezza' },
    { name: 'Sopravvivenza', stat: 'Saggezza' },
    { name: 'Intuizione', stat: 'Saggezza' },
    { name: 'Intrattenere', stat: 'Carisma' },
    { name: 'Inganno', stat: 'Carisma' },
    { name: 'Intimidire', stat: 'Carisma' },
    { name: 'Persuasione', stat: 'Carisma' },
  ]

  for (const { name, stat } of skillDefs) {
    const rx = new RegExp(`\\b${name}\\. `, 'm')
    const m = text.match(rx)
    if (!m) continue
    const idx = text.indexOf(m[0])
    let chunk = text.slice(idx, idx + 800)
    // trim at next skill
    const endRx = /\n[A-ZÀ-Ù][a-zA-Zà-ù\s]+\. /
    const end = chunk.search(endRx)
    if (end > 50) chunk = chunk.slice(0, end)
    abilities[normalizeKey(name)] = {
      name,
      characteristic: stat,
      description: chunk.replace(/\s+/g, ' ').trim().slice(0, 700)
    }
  }
  return abilities
}

// Run
console.log('Parsing SRD files…')
const spellsText = readFile('05_incantesimi.txt')
const abilitiesText = readFile('04_caratteristiche_abilita_esplorazione_combattimento.txt')

const spells = parseSpells(spellsText)
const abilities = parseAbilities(abilitiesText)

const output = { spells, abilities }
const outPath = join(__dir, '../src/data/srd.json')
writeFileSync(outPath, JSON.stringify(output, null, 2))
console.log(`✅ Incantesimi: ${Object.keys(spells).length}`)
console.log(`✅ Abilità: ${Object.keys(abilities).length}`)

// Quick check of key spells
const checks = ['beffa_crudele','blocca_persone','onda_tonante','invisibilita','cura_ferite','sonno','frantumare','palla_di_fuoco','sfera_infuocata','armatura_magica','silenzio','eroismo']
checks.forEach(k => {
  const s = spells[k]
  console.log(k + ': ' + (s ? `"${s.name}" - ${s.description?.slice(0,60)}…` : 'NOT FOUND'))
})
