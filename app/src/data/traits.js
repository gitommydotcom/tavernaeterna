// Mini-libreria di tratti razziali, di classe e privilegi comuni di D&D 5e (italiano).
// Usata da lib/srd.js#lookupTrait per evitare di interrogare l'AI per cose ovvie.

export const TRAITS = {
  scurovisione: {
    name: 'Scurovisione',
    description: "La creatura può vedere nell'oscurità entro un raggio specifico (di solito 18 m / 60 piedi). Vede al buio fioco come se fosse luce intensa, e nell'oscurità totale come in luce fioca. Non riesce però a distinguere i colori al buio: vede tutto in tonalità di grigio.",
  },
  visione_nel_buio: {
    name: 'Scurovisione',
    description: "La creatura può vedere nell'oscurità entro un raggio specifico (di solito 18 m). Vede al buio fioco come se fosse luce intensa, e nell'oscurità totale come in luce fioca, ma in tonalità di grigio.",
  },
  resilienza_nanica: {
    name: 'Resilienza Nanica',
    description: 'Vantaggio sui tiri salvezza contro il veleno. Resistenza ai danni da veleno.',
  },
  addestramento_nanico_al_combattimento: {
    name: 'Addestramento Nanico al Combattimento',
    description: 'Competenza con asce da battaglia, asce da guerra, martelli leggeri e martelli da guerra.',
  },
  competenza_strumenti_da_fabbro: {
    name: 'Competenza Strumenti',
    description: 'Competenza con strumenti da artigiano scelti (es. fabbro, birraio, muratore).',
  },
  esperto_minatore: {
    name: 'Esperto Minatore (Conoscenza della Pietra)',
    description: 'Quando un nano effettua una prova di Intelligenza (Storia) relativa all\'origine di lavori in pietra, è considerato competente nell\'abilità Storia e aggiunge il doppio del bonus di competenza alla prova.',
  },
  conoscenza_della_pietra: {
    name: 'Conoscenza della Pietra',
    description: 'Quando un nano effettua una prova di Intelligenza (Storia) relativa all\'origine di lavori in pietra, è considerato competente nell\'abilità Storia e aggiunge il doppio del bonus di competenza alla prova.',
  },
  astuzia_gnomica: {
    name: 'Astuzia Gnomica',
    description: 'Vantaggio su tutti i tiri salvezza di Intelligenza, Saggezza e Carisma contro la magia.',
  },
  fortuna_halfling: {
    name: 'Fortuna Halfling',
    description: 'Quando ottieni 1 sul d20 per un tiro per colpire, una prova di abilità o un tiro salvezza, puoi ritirare il dado e devi usare il nuovo risultato.',
  },
  destrezza_halfling: {
    name: 'Destrezza Halfling',
    description: 'Puoi muoverti attraverso lo spazio occupato da una creatura di taglia superiore alla tua.',
  },
  coraggio: {
    name: 'Coraggio',
    description: 'Vantaggio sui tiri salvezza contro la condizione spaventato.',
  },
  ascendenza_dragonica: {
    name: 'Ascendenza Draconica',
    description: 'Hai un\'ascendenza draconica. Scegli un tipo di drago: il danno e il TS dell\'arma del soffio dipendono da quel tipo. Resistenza al tipo di danno corrispondente.',
  },
  arma_del_soffio: {
    name: 'Arma del Soffio',
    description: 'Puoi usare un\'azione per emettere energia distruttiva. Il tipo, la dimensione e la forma dell\'effetto dipendono dall\'ascendenza draconica. Le creature nell\'area effettuano un TS; in caso di fallimento subiscono 2d6 danni (aumenta a livelli superiori), in caso di successo metà.',
  },
  furia_elementale: {
    name: 'Furia (Barbaro)',
    description: 'In combattimento, come azione bonus, entri in furia. Vantaggio sulle prove e TS di Forza, +2 ai danni con armi da mischia in Forza, resistenza ai danni contundenti, perforanti e taglienti. Dura 1 minuto.',
  },
  furia: {
    name: 'Furia (Barbaro)',
    description: 'In combattimento, come azione bonus, entri in furia. Vantaggio sulle prove e TS di Forza, +2 ai danni con armi da mischia in Forza, resistenza ai danni contundenti, perforanti e taglienti. Dura 1 minuto.',
  },
  attacco_irruento: {
    name: 'Attacco Irruento',
    description: 'A partire dal 2° livello, puoi gettarti completamente nell\'attacco a discapito della tua difesa. Quando attacchi con un\'arma da mischia in Forza, hai vantaggio al tiro per colpire ma gli attacchi contro di te hanno vantaggio fino al tuo prossimo turno.',
  },
  ispirazione_bardica: {
    name: 'Ispirazione Bardica',
    description: 'Come azione bonus, una creatura entro 18 m in grado di sentirti riceve un dado di Ispirazione (d6 a basso livello, sale fino a d12). La creatura può aggiungerlo a una prova, attacco o TS entro 10 minuti.',
  },
  conoscenze_bardiche: {
    name: 'Sapienza Bardica',
    description: 'Aggiungi il doppio del bonus di competenza alle prove di Intelligenza (Storia, Arcano, Natura, Religione) in cui sei competente.',
  },
  incanalare_divinita: {
    name: 'Incanalare Divinità',
    description: 'A partire dal 2° livello (Chierico), puoi incanalare l\'energia divina del tuo dio per alimentare effetti magici. Numero di usi limitato per riposo breve/lungo.',
  },
  punire_divino: {
    name: 'Punire Divino (Smite)',
    description: 'Quando colpisci una creatura con un attacco di arma in mischia, puoi spendere uno slot incantesimo per infliggere danni radiosi extra (2d8 al 1° liv., +1d8 per slot superiore, max 5d8). +1d8 contro non morti e immondi.',
  },
  forma_selvatica: {
    name: 'Forma Selvatica',
    description: 'Puoi trasformarti in una bestia di GS limitato. Mantieni le tue caratteristiche mentali. Numero di usi limitato per riposo.',
  },
  stile_di_combattimento: {
    name: 'Stile di Combattimento',
    description: 'Adotti uno stile particolare di combattimento (es. Difesa, Duello, Combattimento con Armi a Due Mani, Tiratore, ecc.) che concede bonus specifici.',
  },
  recuperare_energie: {
    name: 'Recuperare Energie',
    description: 'Una volta per riposo breve, puoi recuperare PF pari a 1d10 + il tuo livello di guerriero come azione bonus.',
  },
  azione_impetuosa: {
    name: 'Azione Impetuosa',
    description: 'Una volta per riposo breve, puoi compiere un\'azione aggiuntiva nel tuo turno.',
  },
  attacco_extra: {
    name: 'Attacco Extra',
    description: 'Puoi attaccare due volte invece di una quando esegui l\'azione di Attacco nel tuo turno (più volte a livelli superiori).',
  },
  difesa_senza_armatura: {
    name: 'Difesa Senza Armatura',
    description: 'Quando non indossi armatura e non usi scudo, la tua CA è 10 + Mod. DES + Mod. (varia per classe: COS per Barbaro, SAG per Monaco).',
  },
  arti_marziali: {
    name: 'Arti Marziali',
    description: 'Puoi usare DES invece di FOR per attacchi/danno con armi da monaco; danno disarmato sale a 1d4 (poi 1d6/1d8/1d10); puoi compiere un attacco senz\'armi come azione bonus.',
  },
  furtivita_naturale: {
    name: 'Furtività Naturale',
    description: 'Puoi tentare di nasconderti anche quando sei coperto solamente da copertura leggera fornita da terreno naturale.',
  },
  vista_acuta: {
    name: 'Vista Acuta',
    description: 'Hai competenza nell\'abilità Percezione.',
  },
  vista_perfetta: {
    name: 'Vista Acuta',
    description: 'Hai competenza nell\'abilità Percezione.',
  },
  privilegio_di_classe: {
    name: 'Privilegio di Classe',
    description: 'Privilegio di classe specifico. Consulta il manuale del giocatore per i dettagli.',
  },
  meditazione_arcana: {
    name: 'Meditazione Arcana (Mago)',
    description: 'Durante un riposo breve, puoi copiare incantesimi nel tuo libro degli incantesimi (con costi e tempo) o prepararne di nuovi.',
  },
  recupero_arcano: {
    name: 'Recupero Arcano (Mago)',
    description: 'Una volta al giorno, dopo un riposo breve, recuperi slot incantesimo spesi con livello combinato pari alla metà del tuo livello di mago (arrotondato per eccesso). Nessuno slot può essere di livello superiore al 5°.',
  },
  libro_degli_incantesimi: {
    name: 'Libro degli Incantesimi',
    description: 'Contiene gli incantesimi che il mago conosce. All\'inizio sei competente in 6 incantesimi di 1° livello, e ne aggiungi 2 ad ogni livello successivo. Puoi anche copiare incantesimi trovati durante l\'avventura.',
  },
  libro_costrutto: {
    name: 'Libro Costrutto',
    description: 'Variante del Libro degli Incantesimi del Mago: contiene gli incantesimi conosciuti e funge da focus arcano.',
  },
  cantare_in_battaglia: {
    name: 'Canti di Battaglia (Bardo del Valore)',
    description: 'Competenza in armature medie, scudi e armi da guerra. Puoi usare l\'Ispirazione Bardica per attivare effetti speciali in combattimento.',
  },
  // Generic fallbacks
  taglia: {
    name: 'Taglia',
    description: 'La taglia della creatura (Minuta, Piccola, Media, Grande, Enorme, Mastodontica) determina spazio occupato e capacità di trasporto.',
  },
}

function norm(s) {
  return (s || '').toString().toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/[àá]/g, 'a').replace(/[èé]/g, 'e').replace(/[ìí]/g, 'i')
    .replace(/[òó]/g, 'o').replace(/[ùú]/g, 'u')
    .replace(/\(.*?\)/g, '') // ignora parentesi
    .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}

export function findTrait(name) {
  const k = norm(name)
  if (!k) return null
  if (TRAITS[k]) return TRAITS[k]
  // partial match
  const entry = Object.entries(TRAITS).find(([key]) => key.includes(k) || k.includes(key))
  return entry ? entry[1] : null
}
