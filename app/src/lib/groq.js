const GROQ_API_KEY = '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'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function generateStory(diaryEntries = [], characters = [], keywords = '') {
  const charText = characters.map(c => `${c.name} (${c.race} ${c.class} lv.${c.level})`).join(', ')
  const notesText = diaryEntries.length > 0
    ? diaryEntries.map(e => `[${e.type.toUpperCase()}] ${e.title}: ${e.content || '—'}`).join('\n')
    : 'Il gruppo ha appena iniziato la sua avventura.'

  const keywordsLine = keywords.trim() ? `\nParole chiave del DM: ${keywords}` : ''

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'Sei un maestro narratore di Dungeons & Dragons. Scrivi sempre in italiano, in stile epico e coinvolgente, come un romanzo fantasy.',
        },
        {
          role: 'user',
          content: `Scrivi il racconto epico della nostra campagna D&D in 3-4 paragrafi, in terza persona.

Gruppo: ${charText}

Note di sessione:
${notesText}${keywordsLine}

Il racconto deve essere drammatico, evocativo e ricco di dettagli atmosferici.`,
        },
      ],
      max_tokens: 900,
      temperature: 0.85,
    }),
  })

  if (!res.ok) throw new Error(`Groq error: ${res.status}`)
  const data = await res.json()
  return data.choices[0].message.content
}

export async function improveStory(text) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'Sei un maestro narratore di Dungeons & Dragons. Scrivi sempre in italiano in stile epico fantasy, evocativo e drammatico.' },
        { role: 'user', content: `Riscrivi questo racconto in chiave fantasy epica in massimo 4 righe. Mantieni tutti i fatti, i nomi e gli eventi, ma rendilo più cinematografico, evocativo e in stile D&D. Sii conciso.\n\nTesto:\n${text}` },
      ],
      max_tokens: 300,
      temperature: 0.85,
    }),
  })
  if (!res.ok) throw new Error(`Groq error: ${res.status}`)
  const data = await res.json()
  return data.choices[0].message.content
}

export async function generateNPCDescription(name, context = '') {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'Sei un narratore D&D. Scrivi in italiano.' },
        { role: 'user', content: `Descrivi il PNG "${name}" in 2-3 frasi evocative per D&D 5e. Contesto: ${context || 'mondo fantasy medievale'}. Includi aspetto fisico, atteggiamento e un dettaglio memorabile.` },
      ],
      max_tokens: 200,
      temperature: 0.9,
    }),
  })
  const data = await res.json()
  return data.choices[0].message.content
}
