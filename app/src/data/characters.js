export const DEFAULT_CHARACTERS = [
  {
    id: 'ubaldo',
    name: 'Ubaldo "Clemente" Tripparossa',
    race: 'Nano',
    class: 'Guerriero',
    level: 3,
    alignment: 'Caotico Buono',
    color: '#7c3aed',
    initials: 'UT',
    stats: { for: 14, des: 14, cos: 16, int: 8, sag: 10, car: 12 },
    saves: ['Forza +4', 'Costituzione +4'],
    proficiency_bonus: 2,
    hp_current: 36,
    hp_max: 36,
    ac: 16,
    initiative: '+1',
    speed: '7,5 m',
    passive_perception: 10,
    skills: [
      { name: 'Atletica', bonus: '+2' },
      { name: 'Percezione', bonus: '0' },
      { name: 'Persuasione', bonus: '+1' },
    ],
    attacks: [
      { name: 'Ascia Bipenne', bonus: '+4', damage: '1d10+2', type: 'Taglio' },
      { name: 'Bastone Ferrato', bonus: '+4', damage: '1d6+2', type: 'Contundente' },
      { name: 'Martellone', bonus: '+4', damage: '1d12+2', type: 'Contundente' },
      { name: 'Pugnale', bonus: '+4', damage: '1d4+2', type: 'Perforante' },
      { name: 'Accette da Lancio ×3', bonus: '+4', damage: '1d4+2', type: 'Taglio' },
      { name: 'Balestra', bonus: '+4', damage: '1d6+1', type: 'Perforante' },
    ],
    spells: null,
    equipment: [
      'Rubino con drago d\'argento',
      'Attrezzi da fabbro',
      'Attrezzi da campeggio',
      '4 torce',
      '20 m di corda',
      '4 razioni di cibo',
      '2 tomi di teletrasporto',
      '1 libro maledetto',
    ],
    traits: [
      'Scurovisione',
      'Resilienza Nanica (vantaggio su TS veleno)',
      'Addestramento nanico (asce e martelli)',
      'Competenza strumenti da fabbro',
      'Esperto minatore',
      'Menù Potenziato',
      'Fame di Battaglia',
      'Maestro d\'Armi Pesanti',
    ],
    description: 'Soprannominato "Clemente" perché a volte lascia scappare i nemici ridendo sonoramente. La sua famiglia è rivale dei Scorziapietra. È il secondogenito di Corrado Tripparossa, detto "due porchi".',
    notes: '',
  },
  {
    id: 'jebbeddo',
    name: 'Jebbeddo l\'Illusionista',
    race: 'Gnomo',
    class: 'Bardo',
    level: 4,
    alignment: '',
    color: '#0891b2',
    initials: 'JI',
    stats: { for: 8, des: 14, cos: 12, int: 13, sag: 10, car: 16 },
    saves: ['Destrezza +4', 'Carisma +4'],
    proficiency_bonus: 2,
    hp_current: 35,
    hp_max: 33,
    ac: 13,
    initiative: '+2',
    speed: '7,5 m',
    passive_perception: 10,
    skills: [
      { name: 'Arcano', bonus: '+1' },
      { name: 'Furtività', bonus: '+2' },
      { name: 'Intrattenere', bonus: '+2' },
      { name: 'Natura', bonus: '+1' },
      { name: 'Persuasione', bonus: '+2' },
      { name: 'Rapidità di Mano', bonus: '+2' },
      { name: 'Storia', bonus: '+1' },
    ],
    attacks: [
      { name: 'Spada Corta', bonus: '+4', damage: '1d6+2', type: 'Perforante' },
      { name: 'Arco Corto', bonus: '+1', damage: '1d6', type: 'Perforante' },
    ],
    spells: {
      ability: 'CAR',
      attack_bonus: '+4',
      save_dc: 13,
      slots_used: { 1: 0, 2: 0 },
      slots_max: { 1: 4, 2: 3 },
      cantrips: ['Beffa Crudele (1d4, 18 m, svantaggio)', 'Illusione Minore', 'Interdizione alle cattiverie'],
      spells: [
        { level: 1, name: 'Onda Tonante', desc: '1 Az, 4,5 m, 2d8' },
        { level: 1, name: 'Cura Ferite', desc: '1 Az, 1d8+2' },
        { level: 1, name: 'Eroismo', desc: '1 Az, Concentr. 1 min' },
        { level: 1, name: 'Individuazione del Magico', desc: 'Rituale' },
        { level: 2, name: 'Silenzio', desc: '1 Az, 36 m, 10 min' },
        { level: 2, name: 'Blocca Persone', desc: '1 Az, 18 m' },
        { level: 2, name: 'Immagine Speculare', desc: '1 Az, 10 min' },
      ],
    },
    equipment: [
      'Torcia',
      '40 frecce',
      '79 monete d\'oro',
      'Libro Bardico',
      '2 razioni',
      'Pietra trappole +2',
      '2 pozioni di guarigione',
      '1 pozione di invisibilità (1 ora)',
      '15 frecce extra',
    ],
    traits: [
      'Scurovisione',
      'Astuzia Gnomica (vantaggio su TS INT, SAG, CAR)',
      'Ispirazione Bardica 1d6 (1 ora)',
      'Competenze strumenti: Tamburo, Ukulele',
    ],
    description: 'Altezza: 100 cm. Gnomo illusionista con un talento per le illusioni e la bardatura.',
    notes: '',
  },
  {
    id: 'tsegof',
    name: 'Tserof',
    race: 'Umano',
    class: 'Mago',
    level: 3,
    alignment: 'Neutrale',
    color: '#dc2626',
    initials: 'TS',
    stats: { for: 9, des: 16, cos: 15, int: 16, sag: 14, car: 11 },
    saves: ['Intelligenza +5', 'Saggezza +3'],
    proficiency_bonus: 2,
    hp_current: 30,
    hp_max: 32,
    ac: 10,
    initiative: '+2',
    speed: '9 m',
    passive_perception: 13,
    skills: [
      { name: 'Arcano', bonus: '+5' },
      { name: 'Indagare', bonus: '+3' },
      { name: 'Medicina', bonus: '+3' },
      { name: 'Natura', bonus: '+3' },
      { name: 'Religione', bonus: '+3' },
      { name: 'Storia', bonus: '+5' },
    ],
    attacks: [
      { name: 'Spada Corta', bonus: '+1', damage: '1d6+1', type: 'Perforante' },
      { name: 'Pugnale', bonus: '+5', damage: '1d4+1d4', type: 'Perforante' },
      { name: 'Pugnale Magico', bonus: '+5', damage: 'd13', type: 'Magico' },
    ],
    spells: {
      ability: 'INT',
      attack_bonus: '+5',
      save_dc: 13,
      slots_used: { 1: 0, 2: 0 },
      slots_max: { 1: 4, 2: 2 },
      cantrips: [
        'Dardo Infuocato (36 m, 1d10)',
        'Raggio di Gelo (18 m, 1d8, –3 m vel.)',
        'Spruzzo Velenoso (3 m, 1d12, TS COS)',
        'Mano Magica',
        'Tocco Gelido (36 m, 1d8)',
      ],
      spells: [
        { level: 1, name: 'Armatura Magica', desc: '13 + DES' },
        { level: 1, name: 'Onda Tonante', desc: '4,5 m cubo, 2d8' },
        { level: 1, name: 'Sonno', desc: '5d8 PF, 18 m' },
        { level: 1, name: 'Servitore Inosservato', desc: 'Rituale' },
        { level: 1, name: 'Cura Ferite', desc: '1d8' },
        { level: 2, name: 'Frantumare', desc: '18 m, 3d8' },
        { level: 2, name: 'Invisibilità', desc: '1 ora, Concentr.' },
        { level: 2, name: 'Sfera Infuocata', desc: '18 m, 2d6' },
      ],
    },
    equipment: [
      '1 pergamena Palla di Fuoco',
      '2 pozioni di guarigione (2d8)',
      '250 monete d\'oro',
    ],
    traits: ['Libro Costrutto'],
    description: 'Mago umano neutrale con forti abilità arcane e conoscenze accademiche.',
    notes: '',
  },
]

export function statMod(value) {
  return Math.floor((value - 10) / 2)
}

export function statModStr(value) {
  const mod = statMod(value)
  return mod >= 0 ? `+${mod}` : `${mod}`
}

export function bonusStr(value) {
  const v = parseInt(value) || 0
  return v >= 0 ? `+${v}` : `${v}`
}

export const STAT_LABELS = {
  for: 'FOR',
  des: 'DES',
  cos: 'COS',
  int: 'INT',
  sag: 'SAG',
  car: 'CAR',
}

export const STAT_FULL = {
  for: 'Forza',
  des: 'Destrezza',
  cos: 'Costituzione',
  int: 'Intelligenza',
  sag: 'Saggezza',
  car: 'Carisma',
}

// Tutti i 6 tiri salvezza
export const SAVES_LIST = [
  { key: 'for', label: 'Forza' },
  { key: 'des', label: 'Destrezza' },
  { key: 'cos', label: 'Costituzione' },
  { key: 'int', label: 'Intelligenza' },
  { key: 'sag', label: 'Saggezza' },
  { key: 'car', label: 'Carisma' },
]

// Tutte le 18 abilità di D&D 5e (in italiano)
export const SKILLS_LIST = [
  { key: 'acrobazia', label: 'Acrobazia', stat: 'des' },
  { key: 'addestrare_animali', label: 'Addestrare Animali', stat: 'sag' },
  { key: 'arcano', label: 'Arcano', stat: 'int' },
  { key: 'atletica', label: 'Atletica', stat: 'for' },
  { key: 'furtivita', label: 'Furtività', stat: 'des' },
  { key: 'indagare', label: 'Indagare', stat: 'int' },
  { key: 'inganno', label: 'Inganno', stat: 'car' },
  { key: 'intimidire', label: 'Intimidire', stat: 'car' },
  { key: 'intrattenere', label: 'Intrattenere', stat: 'car' },
  { key: 'intuizione', label: 'Intuizione', stat: 'sag' },
  { key: 'medicina', label: 'Medicina', stat: 'sag' },
  { key: 'natura', label: 'Natura', stat: 'int' },
  { key: 'percezione', label: 'Percezione', stat: 'sag' },
  { key: 'persuasione', label: 'Persuasione', stat: 'car' },
  { key: 'rapidita_di_mano', label: 'Rapidità di Mano', stat: 'des' },
  { key: 'religione', label: 'Religione', stat: 'int' },
  { key: 'sopravvivenza', label: 'Sopravvivenza', stat: 'sag' },
  { key: 'storia', label: 'Storia', stat: 'int' },
]

function normName(s) {
  return (s || '').toString().toLowerCase()
    .replace(/[àá]/g, 'a').replace(/[èé]/g, 'e').replace(/[ìí]/g, 'i')
    .replace(/[òó]/g, 'o').replace(/[ùú]/g, 'u')
    .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}

const SAVE_NAME_TO_KEY = {
  forza: 'for', destrezza: 'des', costituzione: 'cos',
  intelligenza: 'int', saggezza: 'sag', carisma: 'car',
}

// Migrazione retrocompatibile: deduce skill_proficiencies / save_proficiencies
// dagli array vecchi se non ancora presenti.
export function ensureProficiencies(c) {
  if (!c) return c
  const out = { ...c }
  let changed = false

  if (!Array.isArray(out.skill_proficiencies)) {
    const profs = []
    if (Array.isArray(out.skills)) {
      out.skills.forEach(s => {
        const n = normName(s.name || s)
        const match = SKILLS_LIST.find(sk => sk.key === n || normName(sk.label) === n)
        if (match) profs.push(match.key)
      })
    }
    out.skill_proficiencies = [...new Set(profs)]
    changed = true
  }

  if (!Array.isArray(out.skill_expertise)) {
    out.skill_expertise = []
    changed = true
  }

  if (!Array.isArray(out.save_proficiencies)) {
    const profs = []
    if (Array.isArray(out.saves)) {
      out.saves.forEach(s => {
        const raw = (typeof s === 'string' ? s : s.name || '')
        const word = raw.split(/\s+/)[0]
        const n = normName(word)
        const k = SAVE_NAME_TO_KEY[n]
        if (k) profs.push(k)
      })
    }
    out.save_proficiencies = [...new Set(profs)]
    changed = true
  }

  return changed ? out : c
}

export function calculateSaveBonus(c, saveKey) {
  const statValue = c.stats?.[saveKey] ?? 10
  const mod = statMod(statValue)
  const profBonus = c.proficiency_bonus ?? 2
  const isProf = (c.save_proficiencies || []).includes(saveKey)
  return mod + (isProf ? profBonus : 0)
}

export function calculateSkillBonus(c, skillKey) {
  const sk = SKILLS_LIST.find(s => s.key === skillKey)
  if (!sk) return 0
  const statValue = c.stats?.[sk.stat] ?? 10
  const mod = statMod(statValue)
  const profBonus = c.proficiency_bonus ?? 2
  const isProf = (c.skill_proficiencies || []).includes(skillKey)
  const isExpert = (c.skill_expertise || []).includes(skillKey)
  return mod + (isProf ? profBonus : 0) + (isExpert ? profBonus : 0)
}

export const CONDITIONS = [
  'Accecato', 'Affascinato', 'Afferrato', 'Assordato',
  'Avvelenato', 'Concentrazione', 'Incapacitato',
  'Invisibile', 'Paralizzato', 'Pietrificato',
  'Prono', 'Rallentato', 'Spaventato', 'Stordito',
]

export const PRESET_MONSTERS = [
  { name: 'Goblin', hp_max: 7, ac: 15, initiative_bonus: 2, color: '#16a34a' },
  { name: 'Coboldo', hp_max: 5, ac: 12, initiative_bonus: 2, color: '#16a34a' },
  { name: 'Scheletro', hp_max: 13, ac: 13, initiative_bonus: 2, color: '#94a3b8' },
  { name: 'Zombie', hp_max: 22, ac: 8, initiative_bonus: -2, color: '#4b5563' },
  { name: 'Orco', hp_max: 15, ac: 13, initiative_bonus: 1, color: '#65a30d' },
  { name: 'Lupo', hp_max: 11, ac: 13, initiative_bonus: 2, color: '#78716c' },
  { name: 'Bandito', hp_max: 11, ac: 12, initiative_bonus: 1, color: '#b45309' },
  { name: 'Troll', hp_max: 84, ac: 15, initiative_bonus: 1, color: '#166534' },
  { name: 'Ogre', hp_max: 59, ac: 11, initiative_bonus: -1, color: '#713f12' },
  { name: 'Drago Giovane Rosso', hp_max: 178, ac: 18, initiative_bonus: 0, color: '#dc2626' },
]
