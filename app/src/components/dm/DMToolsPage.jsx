import { useState, useMemo } from 'react'
import { Wand2, BookOpen, Scroll, Table2, RefreshCw, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { MONSTERS } from '../../data/monsters_it'
import { getAllSpells } from '../../lib/srd'

// ─── Generators ─────────────────────────────────────────────────────────────

const NOMI_MASCHILI = ['Aldric','Beron','Caius','Dorian','Edric','Faelen','Gorath','Hadvar','Ivar','Jorin','Kael','Loric','Marek','Niran','Orin','Peran','Quinn','Roven','Solan','Theron','Ulric','Varen','Wulfric','Xander','Yoren','Zavan','Brennan','Cormac','Drust','Eamon','Fionn','Gareth','Heric','Idris','Jovan','Kevan']
const NOMI_FEMMINILI = ['Aela','Brynn','Caris','Deva','Elia','Faera','Gwendolyn','Hana','Isara','Jira','Kira','Lyra','Mira','Nira','Oriel','Petra','Ressa','Syla','Tara','Ursula','Vela','Wren','Xara','Ysa','Zora','Ailis','Brea','Catriona','Deirdre','Eithne','Fiadh','Grainne']
const COGNOMI = ['Fabbro','Falco','Grano','Luna','Monte','Nebbia','Notte','Pietra','Quercia','Roccia','Rosa','Sabbia','Scudo','Selva','Serra','Sogno','Spada','Stella','Tempra','Torre','Tuono','Vento','Vetta','Viola','Vipera','Alba','Ferro','Fiamma','Ombra','Osso','Radice','Ramo']
const NOMI_ELFICI_M = ['Aerindel','Caladwen','Erevan','Faeron','Galathil','Ilrune','Laucian','Mirdan','Naevys','Quarion','Riardon','Soveliss','Thamior','Varis','Yaerelon']
const NOMI_ELFICI_F = ['Adrie','Bethrynna','Caelynn','Drusilia','Enna','Felosial','Iefyr','Keyleth','Leshanna','Mialee','Naivara','Quelenna','Sariel','Thiala','Vadania']
const NOMI_NANI_M = ['Adrik','Baern','Darrak','Delg','Eberk','Fargrim','Gardain','Harbek','Kildrak','Morgran','Orsik','Oskar','Rangrim','Rurik','Taklinn']
const NOMI_NANI_F = ['Amber','Artin','Audhild','Bardryn','Dagnal','Diesa','Eldeth','Falkrunn','Gunnloda','Gurdis','Helja','Hilund','Ilde','Liftrasa','Mardred']
const AGGETTIVI_TAVERNA = ['Il Drago','Il Leone','La Fenice','Il Grifone','Il Lupo','La Sirena','L\'Aquila','Il Cigno','La Volpe','Il Corvo','Il Cervo','Il Cinghiale','L\'Orso','La Vipera','Il Capro','Il Serpente']
const NOMI_TAVERNA = ['Dorato','Ubriaco','Stanco','Saggio','Muto','Danzante','Addormentato','Ridente','Antico','Segreto','Fortunato','Maledetto','Incoronato','Ferito','Dimenticato','Assetato']
const METEO = ['Cielo sereno e soleggiato','Nuvole sparse, brezza fresca','Nebbia mattutina che si dirada','Pioggia leggera e costante','Temporale con tuoni in lontananza','Vento forte da nord','Neve leggera','Tormenta di neve','Caldo afoso e umido','Cielo coperto, atmosfera opprimente','Vento caldo del sud','Pioggia battente con lampi','Ghiaccio notturno, mattino gelido','Grandine improvvisa','Arcobaleno doppio dopo la pioggia','Nebbia fitta che non si dirada']
const AGGETTIVI_PNG = ['Diffidente','Allegro','Cupo','Nervoso','Curioso','Arrogante','Umile','Sospettoso','Generoso','Avaro','Coraggioso','Codardo','Eloquente','Balbuziente','Misterioso','Aperto','Melanconico','Fanatico','Pragmatico','Idealista']
const MOTIVAZIONI_PNG = ['cerca vendetta per un torto subito','vuole proteggere la propria famiglia','è in fuga da qualcosa o qualcuno','desidera ricchezze ad ogni costo','persegue un ideale con fede cieca','nasconde un segreto pericoloso','è ossessionato dal passato','cerca redenzione per un errore','vuole solo sopravvivere un altro giorno','ha perso tutto e non ha più nulla da perdere','vuole dimostrare il proprio valore','mira a scalare la gerarchia sociale','serve un\'entità superiore','vuole trovare una persona scomparsa']
const SEGRETI_PNG = ['Ha ucciso qualcuno in passato','Lavora per il nemico','È in realtà nobile decaduto','Indossa un travestimento permanente','Deve denaro agli uomini sbagliati','Ha un figlio segreto','È maledetto da una divinità','Possiede un artefatto rubato','Conosce la posizione di un tesoro','È immortale ma lo nasconde','È una spia di un regno nemico','Ha fatto un patto con un diavolo','Sa dove si nasconde un ricercato','Sta cercando di disertare']
const OCCUPAZIONI_PNG = ['Mercante','Soldato','Chierico','Fabbro','Agricoltore','Pescatore','Guardia','Cuoco','Ladro','Mago itinerante','Araldo','Guaritore','Nobile decaduto','Marinaio','Cacciatore','Minatore','Cantastorie','Spia']
const AGGETTIVI_LOCANDA = ['La Lanterna','Il Calice','La Coppa','Il Barile','La Fiamma','Il Portale','Il Crocevia','Il Rifugio','La Meridiana','Il Mantello','Il Focolare','La Pergola']
const NOMI_LOCANDA = ['dell\'Alba','del Tramonto','del Viandante','del Guerriero','del Saggio','della Fortuna','dell\'Avventura','del Destino','del Pellegrino','del Dragone','del Mercante','del Cacciatore']

const TIPO_STANZA = ['Sala del trono abbandonata','Armeria saccheggiata','Cella di prigione','Laboratorio del mago','Cripta con bare aperte','Sala dei banchetti in rovina','Biblioteca polverosa','Camera delle torture','Tempio profanato','Cucina dei mostri','Stanza dei trofei','Caverna naturale','Deposito di rune magiche','Santuario nascosto']
const CARATTERISTICHE_STANZA = ['Un pozzo al centro senza fondo visibile','Rune incandescenti sui muri','Un odore di zolfo nell\'aria','Tracce di sangue secco sul pavimento','Un altare rotto','Ossa sparse ovunque','Un libro aperto su un leggio','Specchi che riflettono immagini distorte','Una porta segreta dietro un arazzo','Ragnatele enormi che coprono il soffitto','Un buco nel pavimento da cui sale vapore','Una mappa incisa nella pietra']
const TRAPPOLE_STANZA = ['Nessuna trappola','Frecce dalle pareti (CD 14 DES)','Pavimento cedevole (CD 12 DES)','Gas soporifero (CD 13 COS)','Statua con occhi laser (CD 15 DES)','Fossa con pali (CD 14 DES)']

function genStanza() {
  return {
    tipo: pick(TIPO_STANZA),
    caratteristica: pick(CARATTERISTICHE_STANZA),
    trappola: pick(TRAPPOLE_STANZA),
    uscite: Math.floor(Math.random() * 3) + 1,
  }
}

const GANCI_CHI = ['Un vecchio mercante','Una bambina orfana','Il sindaco del villaggio','Un cavaliere ferito','Una messaggera reale','Un druido della foresta','Un ex-avventuriero','Un fantasma insoddisfatto','Un monaco in esilio','Un prigioniero fuggito']
const GANCI_COSA = ['ha perso qualcosa di prezioso','offre una ricompensa ingente','ha bisogno di protezione','porta notizie di un pericolo imminente','cerca qualcuno scomparso','vuole vendetta','custodisce un segreto che scotta','ha bisogno di una scorta','ha trovato qualcosa di strano','chiede di indagare su una morte']
const GANCI_DOVE = ['nelle fogne della città','in una torre abbandonata','nel bosco proibito','sulle rovine di un vecchio castello','al mercato nero','in un villaggio isolato','in un tempio dimenticato','nel porto malfamato','su una strada trafficata','in una miniera abbandonata']

function genGancio() {
  return { chi: pick(GANCI_CHI), cosa: pick(GANCI_COSA), dove: pick(GANCI_DOVE) }
}

const DESCRIZIONI_CITTÀ_QUARTIERE = ['Quartiere dei mercanti: bancarelle, grida di venditori, odore di spezie','Basso Fondo: vicoli bui, occhi nell\'ombra, odore di fogna','Quartiere nobile: palazzi alti, guardie in livrea, silenzi sospetti','Porto: marinai ubriachi, gabbiani, odore di pesce e catrame','Distretto dei Templi: incenso nell\'aria, canti sacri, mendicanti sui gradini','Quartiere degli Artigiani: martelli, forge, schemi e colori vivaci','Ghetto: porte chiuse, sussurri, tensione palpabile','Piazza del Mercato: caos colorato, borseggiatori, artisti di strada']
const VOCI_TAVERNA = ['Si dice che qualcuno abbia visto luci strane nella foresta a est.','Un mercante è scomparso portando con sé una grossa somma.','Il signore del castello non si vede da settimane.','Qualcuno ha rubato il sigillo reale dal palazzo.','Un pozzo nel villaggio vicino dà acqua nera.','Si vocifera di un tesoro nascosto sotto la vecchia torre.','Un predicatore straniero sta radunando seguaci in piazza.','Le guardie di frontiera non mandano più rapporti.','Qualcuno ha visto un drago volare di notte verso le montagne.','Una vecchia strega ha lanciato una maledizione sul raccolto.']

function genCittà() { return pick(DESCRIZIONI_CITTÀ_QUARTIERE) }
function genVoce() { return pick(VOCI_TAVERNA) }

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function genNome(razza = 'umano') {
  if (razza === 'elfo') {
    return Math.random() > 0.5 ? pick(NOMI_ELFICI_M) : pick(NOMI_ELFICI_F)
  }
  if (razza === 'nano') {
    return Math.random() > 0.5 ? pick(NOMI_NANI_M) : pick(NOMI_NANI_F)
  }
  const maschile = Math.random() > 0.5
  return `${maschile ? pick(NOMI_MASCHILI) : pick(NOMI_FEMMINILI)} ${pick(COGNOMI)}`
}

function genTaverna() { return `${pick(AGGETTIVI_TAVERNA)} ${pick(NOMI_TAVERNA)}` }
function genLocanda() { return `${pick(AGGETTIVI_LOCANDA)} ${pick(NOMI_LOCANDA)}` }
function genMeteo() { return pick(METEO) }

function genPNG() {
  const razze = ['umano','umano','umano','elfo','nano','umano']
  const razza = pick(razze)
  return {
    nome: genNome(razza),
    razza,
    occupazione: pick(OCCUPAZIONI_PNG),
    carattere: pick(AGGETTIVI_PNG),
    motivazione: pick(MOTIVAZIONI_PNG),
    segreto: pick(SEGRETI_PNG),
  }
}

const TESORI_COMUNI = ['10 mo in una borsa logora','Una pietra preziosa (50 mo)','Pozione di guarigione','Pergamena con incantesimo di 1° livello','Mappa parziale di un dungeon','Chiave arrugginita senza serratura nota','Amuleto con simbolo sconosciuto','Libro cifrato','Gemma da 100 mo','Gioiello d\'argento (25 mo)','Moneta straniera da un regno lontano','Flacone di veleno (3 dosi)','Specchio d\'argento tascabile','Pergamena di protezione']
const TESORI_RARI = ['Spada +1 con rune elfiche','Mantello dell\'elfo','Stivali di velocità','Anello di protezione +1','Bastone da mago livello 1','Armatura di cuoio +1','Scudo +1','Occhiali del tempo','Guanti dell\'orchetto','Elmo della telepatia','Borse di contenimento','Pietra del controllo elementale','Veste di mago archimago','Corno di Valhalla d\'argento']
function genTesoro(livello) {
  const pool = livello < 5 ? TESORI_COMUNI : [...TESORI_COMUNI, ...TESORI_RARI]
  const n = livello < 3 ? 2 : livello < 6 ? 3 : 4
  const risultati = []
  const used = new Set()
  while (risultati.length < n) {
    const item = pick(pool)
    if (!used.has(item)) { risultati.push(item); used.add(item) }
  }
  const mo = Math.floor(Math.random() * (livello * 20)) + livello * 5
  const mo_argento = Math.floor(Math.random() * (livello * 10))
  return { oggetti: risultati, monete: `${mo} mo, ${mo_argento} ma` }
}

const INCONTRI = {
  1: ['1d4 Goblin in agguato','2 Kobold che frugano nei rifiuti','1 Lupo affamato','1d6 Topi giganti in una cantina','1 Bandito solitario','1 Scheletro errante','1d4 Pipistrelli giganti','2 Serpenti velenosi','1 Ladro notturno','1 Cultista armato'],
  3: ['1d6 Orchi in marcia','1 Ghoul alla ricerca di cibo','2d4 Goblin con un Worg','1 Ogre annoiato','1 Troll sotto un ponte','1d4 Zombi','1 Mago cultista con 2 scagnozzi','1 Ettercap con ragnatele','1d4 Gnoll','1 Vampiro minore'],
  5: ['1 Mago rinnegato con 2 scagnozzi','1 Mannaro al chiaro di luna','1d4 Sahuagin emersi dal mare','1 Elementale dell\'aria','2 Troll','1 Medusa','1 Naga Ossea','1 Divoratore di Menti','1 Djinn corrotto','2 Elementali del fuoco'],
  10: ['1 Drago giovane curioso','1 Vampiro con 3 servitori','1 Gigante della tempesta','2 Elementali del fuoco','1 Lich in viaggio','1d4 Guardiani di pietra','1 Aboleth','1 Golem di ferro','2 Giganti del fuoco','1 Balor imprigionato liberato'],
}
function genIncontro(livello) {
  const tier = livello < 3 ? 1 : livello < 6 ? 3 : livello < 11 ? 5 : 10
  return pick(INCONTRI[tier])
}

function GeneratoriTab() {
  const [livello, setLivello] = useState(1)
  const [results, setResults] = useState({})

  function gen(key, fn) { setResults(r => ({ ...r, [key]: fn() })) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Livello party */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Livello party:</span>
        <input type="number" min={1} max={20} value={livello} onChange={e => setLivello(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
          className="input" style={{ width: 60 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {/* PNG completo */}
        <GenCard title="PNG Completo" icon="🎭" onGen={() => gen('png', genPNG)}
          result={results.png ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div><strong>Nome:</strong> {results.png.nome} ({results.png.razza})</div>
              <div><strong>Occupazione:</strong> {results.png.occupazione}</div>
              <div><strong>Carattere:</strong> {results.png.carattere}</div>
              <div><strong>Motivazione:</strong> {results.png.motivazione}</div>
              <div><strong>Segreto:</strong> {results.png.segreto}</div>
            </div>
          ) : null}
        />
        {/* Nome umano */}
        <GenCard title="Nome Umano" icon="👤" onGen={() => gen('nome', () => genNome('umano'))} result={results.nome} />
        {/* Nome elfico */}
        <GenCard title="Nome Elfico" icon="🌿" onGen={() => gen('nomeElfo', () => genNome('elfo'))} result={results.nomeElfo} />
        {/* Nome nanico */}
        <GenCard title="Nome Nanico" icon="⛏️" onGen={() => gen('nomeNano', () => genNome('nano'))} result={results.nomeNano} />
        {/* Taverna */}
        <GenCard title="Nome Taverna" icon="🍺" onGen={() => gen('taverna', genTaverna)} result={results.taverna} />
        {/* Locanda */}
        <GenCard title="Nome Locanda" icon="🏠" onGen={() => gen('locanda', genLocanda)} result={results.locanda} />
        {/* Meteo */}
        <GenCard title="Meteo" icon="☁️" onGen={() => gen('meteo', genMeteo)} result={results.meteo} />
        {/* Voce di taverna */}
        <GenCard title="Voce di Taverna" icon="🗣️" onGen={() => gen('voce', genVoce)} result={results.voce} />
        {/* Gancio avventura */}
        <GenCard title="Gancio Avventura" icon="🪝" onGen={() => gen('gancio', genGancio)}
          result={results.gancio ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div><strong>Chi:</strong> {results.gancio.chi}</div>
              <div><strong>Cosa:</strong> {results.gancio.cosa}</div>
              <div><strong>Dove:</strong> {results.gancio.dove}</div>
            </div>
          ) : null}
        />
        {/* Stanza dungeon */}
        <GenCard title="Stanza Dungeon" icon="🏚️" onGen={() => gen('stanza', genStanza)}
          result={results.stanza ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div><strong>Tipo:</strong> {results.stanza.tipo}</div>
              <div><strong>Dettaglio:</strong> {results.stanza.caratteristica}</div>
              <div><strong>Trappola:</strong> {results.stanza.trappola}</div>
              <div><strong>Uscite:</strong> {results.stanza.uscite}</div>
            </div>
          ) : null}
        />
        {/* Quartiere città */}
        <GenCard title="Quartiere Città" icon="🏙️" onGen={() => gen('citta', genCittà)} result={results.citta} />
        {/* Tesoro */}
        <GenCard title={`Tesoro (Liv. ${livello})`} icon="💎" onGen={() => gen('tesoro', () => genTesoro(livello))}
          result={results.tesoro ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div><strong>Monete:</strong> {results.tesoro.monete}</div>
              {results.tesoro.oggetti.map((o, i) => <div key={i}>• {o}</div>)}
            </div>
          ) : null}
        />
        {/* Incontro */}
        <GenCard title={`Incontro Casuale (Liv. ${livello})`} icon="⚔️" onGen={() => gen('incontro', () => genIncontro(livello))} result={results.incontro} />
      </div>
    </div>
  )
}

function GenCard({ title, icon, onGen, result }) {
  return (
    <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.1rem' }}>{icon}</span>
          <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.875rem' }}>{title}</span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onGen} title="Genera">
          <RefreshCw size={13} />
        </button>
      </div>
      {result ? (
        typeof result === 'string' ? (
          <div style={{ color: '#a78bfa', fontSize: '0.875rem', fontWeight: 500 }}>{result}</div>
        ) : (
          <div style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.6 }}>{result}</div>
        )
      ) : (
        <div style={{ color: '#475569', fontSize: '0.8rem', fontStyle: 'italic' }}>Premi il pulsante per generare…</div>
      )}
    </div>
  )
}

// ─── Monsters ───────────────────────────────────────────────────────────────

const CR_ORDER = ['0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30']
function crSort(a, b) { return CR_ORDER.indexOf(String(a.cr)) - CR_ORDER.indexOf(String(b.cr)) }

function mod(v) { const m = Math.floor((v - 10) / 2); return (m >= 0 ? '+' : '') + m }

function MonsterStatBlock({ m, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: '#1a1d2e', border: '1px solid #252840', borderRadius: 12, padding: '1.5rem', maxWidth: 520, width: '100%', maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.2rem' }}>{m.name}</h2>
            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>{m.size} {m.type} • CA {m.ac} • {m.hp} PF • Velocità {m.speed}</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 6, marginBottom: '1rem', background: '#111420', borderRadius: 8, padding: '0.75rem' }}>
          {['FOR','DES','COS','INT','SAG','CAR'].map((label, i) => {
            const val = [m.str, m.dex, m.con, m.int, m.wis, m.cha][i]
            return (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#a78bfa' }}>{val}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{mod(val)}</div>
              </div>
            )
          })}
        </div>

        {m.saves?.length > 0 && (
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#cbd5e1' }}><strong style={{ color: '#94a3b8' }}>Tiri salvezza:</strong> {m.saves.join(', ')}</p>
        )}

        {m.traits?.length > 0 && (
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Tratti</div>
            {m.traits.map((t, i) => (
              <p key={i} style={{ margin: '0 0 6px', fontSize: '0.82rem', color: '#cbd5e1' }}><strong>{t.name}.</strong> {t.desc}</p>
            ))}
          </div>
        )}

        {m.actions?.length > 0 && (
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Azioni</div>
            {m.actions.map((a, i) => (
              <p key={i} style={{ margin: '0 0 6px', fontSize: '0.82rem', color: '#cbd5e1' }}><strong>{a.name}.</strong> {a.desc}</p>
            ))}
          </div>
        )}

        {m.reactions?.length > 0 && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Reazioni</div>
            {m.reactions.map((r, i) => (
              <p key={i} style={{ margin: '0 0 6px', fontSize: '0.82rem', color: '#cbd5e1' }}><strong>{r.name}.</strong> {r.desc}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MostriTab() {
  const [search, setSearch] = useState('')
  const [crFilter, setCrFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const monsters = useMemo(() => {
    let list = [...MONSTERS].sort(crSort)
    if (search) list = list.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.type.toLowerCase().includes(search.toLowerCase()))
    if (crFilter !== 'all') list = list.filter(m => String(m.cr) === crFilter)
    return list
  }, [search, crFilter])

  const crs = useMemo(() => [...new Set(MONSTERS.map(m => String(m.cr)))].sort((a, b) => CR_ORDER.indexOf(a) - CR_ORDER.indexOf(b)), [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca mostro…" style={{ paddingLeft: 32, width: '100%' }} />
        </div>
        <select className="select" value={crFilter} onChange={e => setCrFilter(e.target.value)} style={{ width: 100 }}>
          <option value="all">Tutti i CR</option>
          {crs.map(cr => <option key={cr} value={cr}>CR {cr}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
        {monsters.map((m, i) => (
          <button key={i} onClick={() => setSelected(m)} style={{
            background: '#1a1d2e', border: '1px solid #252840', borderRadius: 8,
            padding: '0.75rem', textAlign: 'left', cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#252840'}
          >
            <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.875rem' }}>{m.name}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>{m.type} • CA {m.ac}</div>
            <div style={{ fontSize: '0.7rem', color: '#d97706', marginTop: 2, fontWeight: 600 }}>CR {m.cr}</div>
          </button>
        ))}
        {monsters.length === 0 && <p style={{ color: '#475569', fontStyle: 'italic', gridColumn: '1/-1' }}>Nessun mostro trovato.</p>}
      </div>

      {selected && <MonsterStatBlock m={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

// ─── Spells ─────────────────────────────────────────────────────────────────

// scuola field format: "Abiurazione di 2° livello" or "Trucchetto di Abiurazione"
function parseSpellLevel(scuola) {
  if (!scuola) return null
  if (/^trucchetto/i.test(scuola)) return 0
  const m = scuola.match(/di\s+(\d+)°/)
  return m ? parseInt(m[1]) : null
}

function parseSpellSchool(scuola) {
  if (!scuola) return ''
  if (/^trucchetto/i.test(scuola)) {
    const after = scuola.replace(/^trucchetto\s+di\s+/i, '')
    return after.charAt(0).toUpperCase() + after.slice(1).toLowerCase()
  }
  const school = scuola.split(' di ')[0]
  return school.charAt(0).toUpperCase() + school.slice(1)
}

function MagieTab() {
  const allSpells = useMemo(() => getAllSpells(), [])
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [schoolFilter, setSchoolFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)

  const schools = useMemo(() => {
    const set = new Set(allSpells.map(s => parseSpellSchool(s.scuola)).filter(Boolean))
    return [...set].sort()
  }, [allSpells])

  const filtered = useMemo(() => {
    let list = allSpells
    if (search) list = list.filter(s => (s.name || '').toLowerCase().includes(search.toLowerCase()))
    if (levelFilter !== 'all') list = list.filter(s => parseSpellLevel(s.scuola) === parseInt(levelFilter))
    if (schoolFilter !== 'all') list = list.filter(s => parseSpellSchool(s.scuola) === schoolFilter)
    return list
  }, [allSpells, search, levelFilter, schoolFilter])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca incantesimo…" style={{ paddingLeft: 32, width: '100%' }} />
        </div>
        <select className="select" value={levelFilter} onChange={e => setLevelFilter(e.target.value)} style={{ width: 120 }}>
          <option value="all">Tutti i livelli</option>
          <option value="0">Trucchetto</option>
          {[1,2,3,4,5,6,7,8,9].map(l => <option key={l} value={String(l)}>Livello {l}</option>)}
        </select>
        <select className="select" value={schoolFilter} onChange={e => setSchoolFilter(e.target.value)} style={{ width: 140 }}>
          <option value="all">Tutte le scuole</option>
          {schools.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ fontSize: '0.75rem', color: '#475569' }}>{filtered.length} incantesimi</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filtered.map((spell, i) => {
          const key = spell.name || spell.nome || i
          const isOpen = expanded === key
          const level = parseSpellLevel(spell.scuola)
          const school = parseSpellSchool(spell.scuola)
          return (
            <div key={key} style={{ background: '#1a1d2e', border: `1px solid ${isOpen ? '#3730a3' : '#252840'}`, borderRadius: 8, overflow: 'hidden' }}>
              <button
                onClick={() => setExpanded(isOpen ? null : key)}
                style={{ width: '100%', background: 'none', border: 'none', padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: level === 0 ? '#1e3a5f' : '#1e1040', color: level === 0 ? '#38bdf8' : '#a78bfa', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {level === 0 ? 'Trk' : level !== null ? `Liv ${level}` : '?'}
                  </span>
                  <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{spell.name || spell.nome}</span>
                  {school && <span style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0 }}>{school}</span>}
                </div>
                {isOpen ? <ChevronUp size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />}
              </button>
              {isOpen && (
                <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid #252840' }}>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                    {spell.tempo && <Stat label="Lancio" value={spell.tempo} />}
                    {spell.gittata && <Stat label="Gittata" value={spell.gittata} />}
                    {spell.durata && <Stat label="Durata" value={spell.durata} />}
                    {spell.componenti && <Stat label="Componenti" value={spell.componenti} />}
                  </div>
                  {(spell.description || spell.descrizione) && (
                    <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {spell.description || spell.descrizione}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && <p style={{ color: '#475569', fontStyle: 'italic' }}>Nessun incantesimo trovato.</p>}
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{value}</span>
    </div>
  )
}

// ─── Tables ──────────────────────────────────────────────────────────────────

const TABLES = [
  {
    title: 'Magia Selvaggia', icon: '✨',
    rows: [
      '1. Il personaggio lancia Fuochi d\'artificio per 1 minuto.',
      '2. Il personaggio si teletrasporta in uno spazio casuale entro 18 m.',
      '3. Il personaggio è circondato da petali di fiori per 1 minuto.',
      '4. Il personaggio trasforma un oggetto che tocca in cristallo.',
      '5. Il personaggio guadagna 3d6 PF temporanei.',
      '6. Tutti i personaggi entro 9 m si scambiano i PF attuali.',
      '7. Il personaggio è invisibile fino alla sua prossima mossa.',
      '8. Il personaggio lancia Palla di fuoco centrata su sé stesso.',
      '9. Il personaggio inizia a levitare per 1 minuto.',
      '10. 1d4 pecore appaiono a 9 m dal personaggio.',
    ]
  },
  {
    title: 'Tratti PNG Casuali', icon: '🎭',
    rows: [
      '1. Parla sempre in terza persona.',
      '2. Colleziona oggetti banali trovati per strada.',
      '3. Ha un tic nervoso quando mente.',
      '4. Cita sempre un saggio immaginario.',
      '5. Non riesce a guardarsi negli occhi.',
      '6. Canta sottovoce quando è nervoso.',
      '7. Porta sempre con sé cibo da condividere.',
      '8. Chiama tutti con soprannomi inventati sul momento.',
      '9. Teme i gatti sopra ogni altra cosa.',
      '10. Racconta barzellette inappropriato nei momenti sbagliati.',
    ]
  },
  {
    title: 'Conseguenze di Fallimento Critico', icon: '💀',
    rows: [
      '1. L\'arma cade a terra a 1,5 m.',
      '2. L\'attacco colpisce un alleato adiacente.',
      '3. Il personaggio inciampa e cade prono.',
      '4. La corda si rompe o l\'arma si inceppa.',
      '5. L\'armatura subisce un ammaccatura (-1 CA fino a riparazione).',
      '6. Il personaggio è stordito fino all\'inizio del prossimo turno.',
      '7. Il personaggio espone il fianco (vantaggio al prossimo attacco nemico).',
      '8. L\'attacco attira l\'attenzione di un nemico nuovo.',
      '9. Il personaggio perde l\'equilibrio (svantaggio per 1 round).',
      '10. Il personaggio grida involontariamente, attirando rinforzi.',
    ]
  },
  {
    title: 'Follia a Breve Termine', icon: '🌀',
    rows: [
      '1. Il personaggio è stordito per 1d10 minuti.',
      '2. Il personaggio è convinto di essere uno PNG sconosciuto per 1 ora.',
      '3. Il personaggio è compulsivamente onesto per 1d10 minuti.',
      '4. Il personaggio ha il terrore di ogni oggetto magico per 1 ora.',
      '5. Il personaggio parla solo in rima per 1d10 minuti.',
      '6. Il personaggio si crede invincibile per 1 ora.',
      '7. Il personaggio è ostile a chiunque per 1d10 minuti.',
      '8. Il personaggio ride incontrollabilmente per 1 minuto ogni 1d10 minuti.',
      '9. Il personaggio dimentica chi sono i suoi alleati per 1d10 minuti.',
      '10. Il personaggio è tremante di terrore per 1d10 minuti.',
    ]
  },
]

function TabelleTab() {
  const [rolled, setRolled] = useState({})
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
      {TABLES.map(table => (
        <div key={table.title} className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{table.icon}</span> {table.title}
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => {
              const idx = Math.floor(Math.random() * table.rows.length)
              setRolled(r => ({ ...r, [table.title]: idx }))
            }}>
              <RefreshCw size={13} /> Tira
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {table.rows.map((row, i) => (
              <div key={i} style={{
                fontSize: '0.78rem', padding: '4px 8px', borderRadius: 4,
                background: rolled[table.title] === i ? '#1e1040' : 'transparent',
                color: rolled[table.title] === i ? '#a78bfa' : '#94a3b8',
                border: `1px solid ${rolled[table.title] === i ? '#3730a3' : 'transparent'}`,
                fontWeight: rolled[table.title] === i ? 600 : 400,
              }}>
                {row}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'generatori', label: 'Generatori', icon: Wand2 },
  { id: 'mostri', label: 'Mostri', icon: BookOpen },
  { id: 'magie', label: 'Magie', icon: Scroll },
  { id: 'tabelle', label: 'Tabelle', icon: Table2 },
]

export default function DMToolsPage() {
  const [tab, setTab] = useState('generatori')

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 3rem)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9' }}>Strumenti DM</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1rem', flexShrink: 0, flexWrap: 'wrap' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.45rem 1rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              background: tab === id ? '#1e1040' : 'transparent',
              color: tab === id ? '#a78bfa' : '#64748b',
              border: `1px solid ${tab === id ? '#3730a3' : '#252840'}`,
              transition: 'all 0.15s',
            }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: '2rem' }}>
        {tab === 'generatori' && <GeneratoriTab />}
        {tab === 'mostri' && <MostriTab />}
        {tab === 'magie' && <MagieTab />}
        {tab === 'tabelle' && <TabelleTab />}
      </div>
    </div>
  )
}
