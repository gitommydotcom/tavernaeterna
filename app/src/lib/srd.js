import srdData from '../data/srd.json'
import { findTrait } from '../data/traits'

function norm(str) {
  return (str || '').toLowerCase()
    .replace(/[''`]/g, '').replace(/[àá]/g, 'a').replace(/[èé]/g, 'e')
    .replace(/[ìí]/g, 'i').replace(/[òó]/g, 'o').replace(/[ùú]/g, 'u')
    .replace(/\(.*?\)/g, '')
    .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}

// Alias corrections: character data names → SRD keys
const SPELL_ALIASES = {
  dardo_infuocato: 'dardo_incantato',
  raggio_di_gelo: 'raggio_gelido',
  spruzzo_velenoso: 'spruzzo_velenoso',
  sfera_infuocata: 'sfera_di_fuoco',
  beffa_crudele: 'beffa_crudele',
  individuazione_del_magico: 'individuazione_del_bene_e_del_male',
  cura_ferite: 'cura_ferite',
  tocco_gelido: 'tocco_gelido',
  immagine_speculare: 'immagine_speculare',
}

export function getAllSpells() {
  return Object.values(srdData.spells)
}

export function lookupSpell(name) {
  const key = norm(name)
  if (srdData.spells[key]) return srdData.spells[key]
  if (SPELL_ALIASES[key] && srdData.spells[SPELL_ALIASES[key]]) return srdData.spells[SPELL_ALIASES[key]]
  const partial = Object.entries(srdData.spells).find(([k]) => k.includes(key) || key.includes(k))
  if (partial) return partial[1]
  return null
}

// Le "abilities" nel srd.json sono in realtà le SKILL (atletica, arcano, ecc.)
export function lookupAbility(name) {
  const key = norm(name)
  if (srdData.abilities[key]) return srdData.abilities[key]
  const partial = Object.entries(srdData.abilities).find(([k]) => k.includes(key) || key.includes(k))
  if (partial) return partial[1]
  return null
}

// Tratti razziali, di classe, privilegi: cerca nella mini-libreria interna.
export function lookupTrait(name) {
  return findTrait(name)
}

// Fallback AI-powered: chiede a Groq la descrizione di un elemento di scheda.
// `kind` è una stringa già "umana" da usare nel prompt:
//   'spell' | 'trait' | 'feature' | 'equipment' | 'ability'
const KIND_LABEL = {
  spell: 'incantesimo',
  trait: 'tratto razziale o privilegio di classe',
  feature: 'privilegio di classe',
  equipment: 'oggetto magico o equipaggiamento',
  ability: 'abilità',
}

export async function lookupWithGroqFallback(name, kind = 'spell') {
  // Prima prova locale
  if (kind === 'spell') {
    const hit = lookupSpell(name)
    if (hit) return { source: 'srd', data: hit }
  } else if (kind === 'trait' || kind === 'feature') {
    const hit = lookupTrait(name)
    if (hit) return { source: 'srd', data: hit }
  } else if (kind === 'ability') {
    const hit = lookupAbility(name)
    if (hit) return { source: 'srd', data: hit }
  }

  const label = KIND_LABEL[kind] || 'elemento di scheda'

  const sysPrompt = `Sei un esperto del manuale di D&D 5a edizione (italiano). Conosci tutti i tratti razziali (Scurovisione, Resilienza Nanica, Astuzia Gnomica, Fortuna Halfling, Ascendenza Draconica, ecc.), i privilegi di classe (Furia, Attacco Extra, Azione Impetuosa, Forma Selvatica, ecc.) e le regole comuni. Rispondi SEMPRE assumendo che esista in 5e: se il nome è una variante o una traduzione, fornisci comunque la descrizione del tratto/privilegio canonico più simile. NON dire mai "non esiste in 5e" — al limite, descrivi l'effetto generico più vicino.`

  const userPrompt = `Descrivi "${name}" (${label}) in D&D 5a edizione, in italiano. ${
    kind === 'spell'
      ? 'Includi: livello/scuola, tempo di lancio, gittata, durata, componenti, descrizione dell\'effetto.'
      : 'Includi: cosa fa meccanicamente, quando si attiva, eventuali limiti d\'uso e il livello/razza/classe in cui si ottiene.'
  } Massimo 200 parole. Sii conciso e utile a un giocatore al tavolo.`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer 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',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 350,
        temperature: 0.2,
      }),
    })
    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content || 'Descrizione non disponibile.'
    return { source: 'ai', data: { name, description: text } }
  } catch (e) {
    return { source: 'error', data: { name, description: 'Impossibile recuperare la descrizione.' } }
  }
}
