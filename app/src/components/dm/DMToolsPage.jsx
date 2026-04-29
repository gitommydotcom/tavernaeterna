import { useState, useMemo, useEffect } from 'react'
import { Wand2, BookOpen, Scroll, Table2, RefreshCw, Search, X, Info, Users } from 'lucide-react'
import { MONSTERS } from '../../data/monsters_it'
import { ITEMS, ITEMS_BY_RARITY, findItem } from '../../data/items_it'
import { getAllSpells, lookupSpell, lookupTrait } from '../../lib/srd'
import { supabase } from '../../lib/supabase'

// ─── Utility ─────────────────────────────────────────────────────────────────
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function pickN(arr, n) {
  const copy = [...arr]; const out = []
  while (out.length < n && copy.length) {
    const idx = Math.floor(Math.random() * copy.length)
    out.push(copy.splice(idx, 1)[0])
  }
  return out
}
function rollDice(n, sides, mod = 0) {
  let total = 0
  for (let i = 0; i < n; i++) total += Math.floor(Math.random() * sides) + 1
  return total + mod
}
function mod(v) { const m = Math.floor((v - 10) / 2); return (m >= 0 ? '+' : '') + m }

// ─── Pool dati ───────────────────────────────────────────────────────────────
const NOMI_M = ['Aldric','Beron','Caius','Dorian','Edric','Faelen','Gorath','Hadvar','Ivar','Jorin','Kael','Loric','Marek','Niran','Orin','Peran','Quinn','Roven','Solan','Theron','Ulric','Varen','Wulfric','Xander','Yoren','Zavan','Brennan','Cormac','Drust','Eamon','Fionn','Gareth','Heric','Idris','Jovan','Kevan','Adelmo','Baltasar','Corrado','Dante','Ezio','Folco','Gualtiero','Lorenzo','Niccolò','Orlando','Pietro','Renato','Salvatore','Tommaso','Vincenzo']
const NOMI_F = ['Aela','Brynn','Caris','Deva','Elia','Faera','Gwendolyn','Hana','Isara','Jira','Kira','Lyra','Mira','Nira','Oriel','Petra','Ressa','Syla','Tara','Ursula','Vela','Wren','Xara','Ysa','Zora','Ailis','Brea','Catriona','Deirdre','Eithne','Fiadh','Grainne','Adelaide','Bianca','Costanza','Diamante','Eleonora','Fiammetta','Genoveffa','Isolda','Lavinia','Margherita','Norina','Olimpia','Roxana']
const COGNOMI = ['Fabbro','Falco','Grano','Luna','Monte','Nebbia','Notte','Pietra','Quercia','Roccia','Rosa','Sabbia','Scudo','Selva','Serra','Sogno','Spada','Stella','Tempra','Torre','Tuono','Vento','Vetta','Viola','Vipera','Alba','Ferro','Fiamma','Ombra','Osso','Radice','Ramo','Sole','Crepuscolo','Argento','Bronzo','Cervo','Lince','Aquila','Vespa','Spina','Foglia','Mare','Fiume','Ghiaccio','Marmo','Ruggine']
const NOMI_ELFICI_M = ['Aerindel','Caladwen','Erevan','Faeron','Galathil','Ilrune','Laucian','Mirdan','Naevys','Quarion','Riardon','Soveliss','Thamior','Varis','Yaerelon','Aelar','Beiro','Carric','Enialis','Heian','Mindartis','Paelias','Theren','Vanuath','Quaranth']
const NOMI_ELFICI_F = ['Adrie','Bethrynna','Caelynn','Drusilia','Enna','Felosial','Iefyr','Keyleth','Leshanna','Mialee','Naivara','Quelenna','Sariel','Thiala','Vadania','Anastrianna','Birel','Faral','Lia','Meriele','Quillathe','Shanairra','Valanthe','Theirastra']
const COGNOMI_ELFICI = ['Faentamira','Liadon','Myaltar','Naïlo','Tiltathana','Sileasalwa','Floshem','Galanodel','Holimion','Ilphelkiir','Liadon','Meliamne','Nailo','Siannodel','Suithrasas','Xiloscient']
const NOMI_NANI_M = ['Adrik','Baern','Darrak','Delg','Eberk','Fargrim','Gardain','Harbek','Kildrak','Morgran','Orsik','Oskar','Rangrim','Rurik','Taklinn','Thoradin','Tordek','Travok','Vondal','Beli','Burim','Dolgrin','Khazum','Werren']
const NOMI_NANI_F = ['Amber','Artin','Audhild','Bardryn','Dagnal','Diesa','Eldeth','Falkrunn','Gunnloda','Gurdis','Helja','Hilund','Ilde','Liftrasa','Mardred','Riswynn','Sannl','Torbera','Vistra','Bardryn','Diesa','Tordek']
const COGNOMI_NANI = ['Spaccacrani','Battiscudo','Bramatesori','Stretto','Frantumaossi','Pugnoferro','Cuordoro','Pesopiede','Bracciaforte','Forgiaramo','Stoppabarba','Cumulonero','Strappapietra']
const NOMI_HALFLING = ['Alton','Beau','Cade','Eldon','Errich','Finnan','Garret','Lindal','Lyle','Merric','Milo','Nedda','Osborn','Perrin','Reed','Roscoe','Wellby','Andry','Bree','Callie','Dee','Emma','Lavinia','Lidda','Merla','Paela','Portia','Seraphina','Trym','Vani','Verna']
const NOMI_DRAGONIDI = ['Arjhan','Balasar','Bharash','Donaar','Ghesh','Heskan','Kriv','Medrash','Nadarr','Patrin','Rhogar','Shamash','Akra','Biri','Daar','Farideh','Harann','Havilar','Jheri','Kava','Korinn','Mishann','Nala','Perra','Raiann','Sora','Surina','Thava']
const NOMI_TIEFLING = ['Akmenos','Amnon','Barakas','Damakos','Ekemon','Iados','Kairon','Leucis','Melech','Mordai','Morthos','Pelaios','Skamos','Therai','Akta','Anakir','Bryseis','Criella','Damaia','Ea','Kallista','Lerissa','Makaria','Nemeia','Orianna','Phelaia','Rieta']
const NOMI_GNOMI = ['Boddynock','Brocc','Burgell','Dimble','Eldon','Erky','Fonkin','Frug','Gerbo','Gimble','Glim','Jebeddo','Roondar','Wrenn','Bimpnottin','Caramip','Carlin','Donella','Duvamil','Ella','Ellyjobell','Mardnab','Nyx','Orla','Roywyn','Siffress','Tana','Waywocket','Zanna']
const NOMI_MEZZORCO = ['Dench','Feng','Gell','Henk','Holg','Imsh','Krusk','Mhurren','Ront','Shump','Thokk','Baggi','Emen','Engong','Kansif','Myev','Neega','Ovak','Sutha','Volen']
const TITOLI_NOBILE = ['Conte','Contessa','Visconte','Viscontessa','Marchese','Marchesa','Barone','Baronessa','Cavaliere','Dama','Lord','Lady','Duca','Duchessa','Sere','Sire','Madonna','Messere']

const RAZZE = [
  { key: 'umano', label: 'Umano' },
  { key: 'elfo', label: 'Elfo' },
  { key: 'nano', label: 'Nano' },
  { key: 'halfling', label: 'Halfling' },
  { key: 'gnomo', label: 'Gnomo' },
  { key: 'dragonide', label: 'Dragonide' },
  { key: 'tiefling', label: 'Tiefling' },
  { key: 'mezzorco', label: 'Mezz\'Orco' },
  { key: 'nobile', label: 'Nobile (con titolo)' },
]

function genNome(razza = 'umano') {
  if (razza === 'elfo') {
    const first = Math.random() > 0.5 ? pick(NOMI_ELFICI_M) : pick(NOMI_ELFICI_F)
    return `${first} ${pick(COGNOMI_ELFICI)}`
  }
  if (razza === 'nano') {
    const first = Math.random() > 0.5 ? pick(NOMI_NANI_M) : pick(NOMI_NANI_F)
    return `${first} ${pick(COGNOMI_NANI)}`
  }
  if (razza === 'halfling') return `${pick(NOMI_HALFLING)} ${pick(COGNOMI)}`
  if (razza === 'dragonide') return pick(NOMI_DRAGONIDI)
  if (razza === 'tiefling') return pick(NOMI_TIEFLING)
  if (razza === 'gnomo') return pick(NOMI_GNOMI)
  if (razza === 'mezzorco') return `${pick(NOMI_MEZZORCO)} ${pick(COGNOMI)}`
  if (razza === 'nobile') return `${pick(TITOLI_NOBILE)} ${Math.random() > 0.5 ? pick(NOMI_M) : pick(NOMI_F)} di ${pick(COGNOMI)}`
  const m = Math.random() > 0.5
  return `${m ? pick(NOMI_M) : pick(NOMI_F)} ${pick(COGNOMI)}`
}

const AGG_TAVERNA = ['Il Drago','Il Leone','La Fenice','Il Grifone','Il Lupo','La Sirena','L\'Aquila','Il Cigno','La Volpe','Il Corvo','Il Cervo','Il Cinghiale','L\'Orso','La Vipera','Il Capro','Il Serpente','La Lanterna','Il Calice','La Coppa','Il Barile','La Fiamma','Il Crocevia','Il Rifugio','La Meridiana','Il Mantello','Il Focolare','La Pergola','Il Boccale','La Ruota','Il Martello','Il Vello','La Stella','Il Cappuccio']
const NOMI_TAVERNA = ['Dorato','Ubriaco','Stanco','Saggio','Muto','Danzante','Addormentato','Ridente','Antico','Segreto','Fortunato','Maledetto','Incoronato','Ferito','Dimenticato','Assetato','dell\'Alba','del Tramonto','del Viandante','del Guerriero','del Pellegrino','del Mercante','del Cacciatore','d\'Argento','di Pietra','del Drago','d\'Oro']

const METEO = ['Cielo sereno e soleggiato','Nuvole sparse, brezza fresca','Nebbia mattutina che si dirada','Pioggia leggera e costante','Temporale con tuoni in lontananza','Vento forte da nord','Neve leggera che si posa','Tormenta di neve violenta','Caldo afoso e umido','Cielo coperto, atmosfera opprimente','Vento caldo del sud (sirocco)','Pioggia battente con lampi','Ghiaccio notturno, mattino gelido','Grandine improvvisa','Arcobaleno doppio dopo la pioggia','Nebbia fitta che non si dirada','Aurora boreale rara','Vento gelido che taglia il viso','Pioggia colorata (presagio)','Aria immobile, silenzio innaturale','Nubi a forma di drago','Sole pallido velato di ceneri','Foschia rossastra al tramonto']

const AGG_PNG = ['Diffidente','Allegro','Cupo','Nervoso','Curioso','Arrogante','Umile','Sospettoso','Generoso','Avaro','Coraggioso','Codardo','Eloquente','Balbuziente','Misterioso','Aperto','Melanconico','Fanatico','Pragmatico','Idealista','Cinico','Ingenuo','Ambizioso','Pacato','Esuberante','Riservato','Romantico','Spietato']
const MOTIVAZIONI_PNG = ['cerca vendetta per un torto subito','vuole proteggere la propria famiglia','è in fuga da qualcosa o qualcuno','desidera ricchezze ad ogni costo','persegue un ideale con fede cieca','nasconde un segreto pericoloso','è ossessionato dal passato','cerca redenzione per un errore','vuole solo sopravvivere un altro giorno','ha perso tutto e non ha più nulla da perdere','vuole dimostrare il proprio valore','mira a scalare la gerarchia sociale','serve un\'entità superiore','vuole trovare una persona scomparsa','è alla ricerca di un artefatto perduto','vuole abbandonare la sua vecchia identità','cerca di placare un\'antica colpa','vuole liberare qualcuno dalla prigionia']
const SEGRETI_PNG = ['Ha ucciso qualcuno in passato','Lavora per il nemico','È in realtà nobile decaduto','Indossa un travestimento permanente','Deve denaro agli uomini sbagliati','Ha un figlio segreto','È maledetto da una divinità','Possiede un artefatto rubato','Conosce la posizione di un tesoro','È immortale ma lo nasconde','È una spia di un regno nemico','Ha fatto un patto con un diavolo','Sa dove si nasconde un ricercato','Sta cercando di disertare','È un licantropo','È in realtà un druido sotto copertura','Sente voci che gli parlano','Ha venduto l\'anima per un favore','Ricorda una vita passata','Ha visto qualcosa che non doveva vedere']
const OCCUPAZIONI = ['Mercante','Soldato','Chierico','Fabbro','Agricoltore','Pescatore','Guardia','Cuoco','Ladro','Mago itinerante','Araldo','Guaritore','Nobile decaduto','Marinaio','Cacciatore','Minatore','Cantastorie','Spia','Boia','Esattore tasse','Locandiere','Bardo girovago','Mendicante','Stalliere','Erborista','Sarta','Becchino','Calzolaio','Panettiere','Stampatore']
const TIC_NERVOSI = ['si tira sempre la barba','sussurra prima di parlare ad alta voce','batte le dita ritmicamente','evita lo sguardo diretto','schiocca le nocche','sorride quando è teso','ha un occhio che gli trema','tossicchia spesso','si tocca un amuleto','muove la testa scattando come un uccello','si aggiusta continuamente i vestiti','annuisce quando ascolta','sospira tra una frase e l\'altra']

const TIPO_STANZA = ['Sala del trono abbandonata','Armeria saccheggiata','Cella di prigione','Laboratorio del mago','Cripta con bare aperte','Sala dei banchetti in rovina','Biblioteca polverosa','Camera delle torture','Tempio profanato','Cucina dei mostri','Stanza dei trofei','Caverna naturale','Deposito di rune magiche','Santuario nascosto','Mausoleo allagato','Sala degli specchi','Pozzo dei sacrifici','Refettorio infestato','Aula degli studi arcani','Stalla per cavalcature mostruose','Vivaio di funghi giganti','Sala delle fontane bianche','Gabinetto di curiosità','Magazzino di trofei di guerra']
const CARATTERISTICHE_STANZA = ['Un pozzo al centro senza fondo visibile','Rune incandescenti sui muri','Un odore di zolfo nell\'aria','Tracce di sangue secco sul pavimento','Un altare rotto','Ossa sparse ovunque','Un libro aperto su un leggio','Specchi che riflettono immagini distorte','Una porta segreta dietro un arazzo','Ragnatele enormi che coprono il soffitto','Un buco nel pavimento da cui sale vapore','Una mappa incisa nella pietra','Stalattiti taglienti dal soffitto','Lampade che si accendono al passaggio','Uno scheletro incatenato al muro','Un quadro che sembra seguire chi entra','Un mucchio di monete polverose','Una statua coperta da un panno','Bracieri che bruciano senza combustibile','Una pozza d\'acqua perfettamente quieta','Un\'eco innaturale','Vento freddo da una crepa nascosta','Bisbigli appena udibili in lingua arcana']
const TRAPPOLE_STANZA = ['Nessuna trappola','Frecce dalle pareti (CD 14 DES, 2d6 perforanti)','Pavimento cedevole (CD 12 DES, caduta 6 m)','Gas soporifero (CD 13 COS o sonno 1 ora)','Statua con occhi laser (CD 15 DES, 4d6 radiosi)','Fossa con pali (CD 14 DES, caduta 3 m + 2d6 perforanti)','Lastra di pressione: porta si chiude (CD 18 FOR per riaprire)','Glifo di guardia esplosivo (CD 14 DES, 5d8 fuoco)','Ago avvelenato sulla maniglia (CD 11 COS o avvelenato)','Pavimento ghiacciato (CD 10 DES o prono)','Magia di teletrasporto a sorpresa','Roccia che precipita dal soffitto (CD 15 DES, 4d10)']

const QUARTIERI_CITTA = [
  'Quartiere dei mercanti: bancarelle, grida di venditori, odore di spezie',
  'Basso Fondo: vicoli bui, occhi nell\'ombra, odore di fogna',
  'Quartiere nobile: palazzi alti, guardie in livrea, silenzi sospetti',
  'Porto: marinai ubriachi, gabbiani, odore di pesce e catrame',
  'Distretto dei Templi: incenso nell\'aria, canti sacri, mendicanti sui gradini',
  'Quartiere degli Artigiani: martelli, forge, schemi e colori vivaci',
  'Ghetto straniero: porte chiuse, sussurri, tensione palpabile',
  'Piazza del Mercato: caos colorato, borseggiatori, artisti di strada',
  'Quartiere universitario: studenti rumorosi, librerie polverose, magia leggera nell\'aria',
  'Le Corti: tribunali, scribi, condanne pubbliche al gogna',
  'Cimitero antico: tombe inclinate, edera, statue d\'angelo',
  'Quartiere alchimisti: fumi colorati dalle fessure delle finestre',
  'Catacombe sotto la città: passaggi dimenticati, lumini votivi',
  'Quartiere malfamato: case di gioco, lupanari, locande senza nome',
]

const VOCI_TAVERNA = [
  'Si dice che qualcuno abbia visto luci strane nella foresta a est.',
  'Un mercante è scomparso portando con sé una grossa somma.',
  'Il signore del castello non si vede da settimane.',
  'Qualcuno ha rubato il sigillo reale dal palazzo.',
  'Un pozzo nel villaggio vicino dà acqua nera.',
  'Si vocifera di un tesoro nascosto sotto la vecchia torre.',
  'Un predicatore straniero sta radunando seguaci in piazza.',
  'Le guardie di frontiera non mandano più rapporti.',
  'Qualcuno ha visto un drago volare di notte verso le montagne.',
  'Una vecchia strega ha lanciato una maledizione sul raccolto.',
  'Una statua del tempio ha pianto sangue all\'alba.',
  'Il fiume ha cambiato corso da solo durante la notte.',
  'Un bambino del villaggio è nato con gli occhi di drago.',
  'Si racconta di una città di ghiaccio che appare nella foresta solo a luna piena.',
  'I lupi delle colline non ululano più da una settimana.',
  'Un cadavere è stato trovato in piazza con monete d\'oro al posto degli occhi.',
  'Il vecchio mago della torre nera cerca apprendisti — nessuno torna.',
  'Una nave fantasma è apparsa al porto, ferma e silente.',
  'I morti del cimitero del vecchio campo di battaglia camminano di nuovo.',
]

const GANCI_CHI = ['Un vecchio mercante','Una bambina orfana','Il sindaco del villaggio','Un cavaliere ferito','Una messaggera reale','Un druido della foresta','Un ex-avventuriero','Un fantasma insoddisfatto','Un monaco in esilio','Un prigioniero fuggito','Un nobile in incognito','Un alchimista paranoico','Un cantastorie cieco','Una sacerdotessa in fuga','Uno gnomo molto agitato','Un goblin che parla la Lingua Comune']
const GANCI_COSA = ['ha perso qualcosa di prezioso','offre una ricompensa ingente','ha bisogno di protezione','porta notizie di un pericolo imminente','cerca qualcuno scomparso','vuole vendetta','custodisce un segreto che scotta','ha bisogno di una scorta','ha trovato qualcosa di strano','chiede di indagare su una morte','vuole rubare qualcosa di sorvegliato','ha ricevuto una visione','sta per essere arrestato ingiustamente','vuole fuggire dalla città','cerca un erede perduto','ha aperto una porta che non doveva']
const GANCI_DOVE = ['nelle fogne della città','in una torre abbandonata','nel bosco proibito','sulle rovine di un vecchio castello','al mercato nero','in un villaggio isolato','in un tempio dimenticato','nel porto malfamato','su una strada trafficata','in una miniera abbandonata','in un dungeon nanico','nel labirinto di siepi del nobile','nel cimitero degli stranieri','sotto il pavimento dell\'osteria','in una caverna sul mare','dentro un tumulo elfico']

const COMPLICAZIONI_QUEST = [
  'Il mandante mente sulla vera natura della missione.',
  'Una fazione rivale sta perseguendo lo stesso obiettivo.',
  'Il bersaglio non è cattivo come sembra.',
  'C\'è un traditore nel gruppo del committente.',
  'Il tempo è limitato: 3 giorni o tutto è perduto.',
  'Sono richiesti vincoli morali (no uccisioni, no testimoni).',
  'L\'oggetto cercato è maledetto.',
  'Il pagamento promesso non sarà reale.',
  'Le autorità locali ostacolano l\'avventura.',
  'La missione attira un demone potente.',
]

const RICOMPENSE = [
  '500 mo + lettera di raccomandazione di un nobile',
  '1000 mo + un oggetto magico Comune (tira)',
  '250 mo + una proprietà (casa al villaggio)',
  '2000 mo + accesso a biblioteca segreta',
  '100 mo + favore di un\'organizzazione potente',
  '5000 mo + un titolo nobiliare minore',
  '1500 mo + un\'arma magica famosa',
  '750 mo + 1d4 pozioni assortite',
  '300 mo + libertà a vita per crimini passati',
  '3000 mo + nave personale da viaggio',
]

// ─── Generatori di base ──────────────────────────────────────────────────────
function genTaverna() { return `${pick(AGG_TAVERNA)} ${pick(NOMI_TAVERNA)}` }
function genMeteo() { return pick(METEO) }

function genPNG(razza) {
  const r = razza || pick(['umano','umano','umano','elfo','nano','halfling','umano','dragonide','tiefling','mezzorco','gnomo'])
  return {
    nome: genNome(r),
    razza: r,
    occupazione: pick(OCCUPAZIONI),
    carattere: pick(AGG_PNG),
    tic: pick(TIC_NERVOSI),
    motivazione: pick(MOTIVAZIONI_PNG),
    segreto: pick(SEGRETI_PNG),
  }
}

function genGancio() {
  return { chi: pick(GANCI_CHI), cosa: pick(GANCI_COSA), dove: pick(GANCI_DOVE) }
}

function genStanza() {
  return {
    tipo: pick(TIPO_STANZA),
    caratteristica: pick(CARATTERISTICHE_STANZA),
    trappola: pick(TRAPPOLE_STANZA),
    uscite: Math.floor(Math.random() * 3) + 1,
  }
}

function genCitta() { return pick(QUARTIERI_CITTA) }
function genVoce() { return pick(VOCI_TAVERNA) }

// ─── Tesoro: ora pesca da items_it.js (ogni chip è cliccabile e mostra dati reali)
function genTesoro(livello) {
  let buckets, n, moltMo
  // ogni "bucket" è un sottoinsieme di rarità da cui pescare un oggetto
  if (livello <= 2) { buckets = ['Mondano', 'Mondano', 'Comune']; n = 2; moltMo = 1 }
  else if (livello <= 4) { buckets = ['Mondano', 'Comune', 'Comune']; n = 3; moltMo = 3 }
  else if (livello <= 7) { buckets = ['Comune', 'Non Comune', 'Non Comune']; n = 3; moltMo = 8 }
  else if (livello <= 10) { buckets = ['Non Comune', 'Non Comune', 'Raro']; n = 4; moltMo = 20 }
  else if (livello <= 14) { buckets = ['Non Comune', 'Raro', 'Raro']; n = 4; moltMo = 50 }
  else if (livello <= 17) { buckets = ['Raro', 'Raro', 'Molto Raro']; n = 5; moltMo = 100 }
  else { buckets = ['Raro', 'Molto Raro', 'Leggendario']; n = 5; moltMo = 200 }

  const items = []
  const used = new Set()
  while (items.length < n) {
    const rarity = pick(buckets)
    const pool = ITEMS_BY_RARITY[rarity] || []
    if (!pool.length) continue
    const it = pick(pool)
    if (!used.has(it.name)) { items.push(it); used.add(it.name) }
  }
  const mo = rollDice(2, 6) * moltMo
  const mp = rollDice(1, 6) * moltMo * 5
  const gemme = livello >= 5 ? `${rollDice(1, 4)} gemme da ${50 * Math.ceil(livello / 4)} mo` : null
  return { items, mo, mp, gemme, livello }
}

// ─── Negozio (DM): inventario casuale con prezzi ────────────────────────────
function genNegozio(livello) {
  const tipo = pick([
    { nome: 'Bottega del Fabbro', cat: ['Arma', 'Armatura'] },
    { nome: 'Erboristeria', cat: ['Pozione', 'Mondano'] },
    { nome: 'Curiosità Magiche', cat: ['Wondrous', 'Pergamena', 'Bacchetta'] },
    { nome: 'Mercante Ambulante', cat: ['Pozione', 'Mondano', 'Pergamena', 'Anello'] },
    { nome: 'Tempio (mercato sacro)', cat: ['Pergamena', 'Pozione', 'Wondrous'] },
  ])
  const buckets = livello <= 4 ? ['Mondano', 'Comune'] : livello <= 9 ? ['Comune', 'Non Comune'] : ['Non Comune', 'Raro']
  const candidates = ITEMS.filter(i => buckets.includes(i.rarity) && tipo.cat.some(c => i.type.includes(c)))
  const stock = pickN(candidates, Math.min(7, candidates.length))
  const oste = genPNG()
  return { ...tipo, stock, oste }
}

// ─── Quest completa ────────────────────────────────────────────────────────
function genQuest(livello) {
  return {
    gancio: genGancio(),
    complicazione: pick(COMPLICAZIONI_QUEST),
    incontro: genIncontro(livello),
    tesoro: genTesoro(livello),
    ricompensa: pick(RICOMPENSE),
  }
}

// ─── Boss ─────────────────────────────────────────────────────────────────
function genBoss(livello) {
  const minCR = Math.max(1, livello - 1)
  const maxCR = livello + 3
  const candidates = MONSTERS.filter(m => {
    const cr = crToNum(m.cr)
    return cr >= minCR && cr <= maxCR
  })
  if (!candidates.length) return null
  const boss = pick(candidates)
  return {
    boss,
    minions: rollDice(1, 4),
    minionType: pick(MONSTERS.filter(m => crToNum(m.cr) >= 0.25 && crToNum(m.cr) <= Math.max(1, livello - 2))),
    lair: pick(TIPO_STANZA),
    legendary: pick([
      'Una vasca di lava attorno a un altare',
      'Pilastri rotanti che bloccano la fuga',
      'Sangue rituale che cura il boss ogni round',
      'Statue che si animano in soccorso',
      'Il pavimento si inclina pericolosamente',
      'Una nebbia opprimente offusca la vista (3 m)',
      'Catene magiche che paralizzano se toccate',
    ]),
  }
}

// ─── Pozione misteriosa ──────────────────────────────────────────────────
function genPozioneMisteriosa() {
  const aspetto = pick(['Liquido rosso scuro', 'Sciroppo dorato', 'Pasta verdognola', 'Liquido perfettamente trasparente', 'Vapore che fluttua', 'Sciroppo di pesca', 'Sciroppo di lampone vivo', 'Liquido bianco lattiginoso', 'Polvere rossa nel flacone', 'Liquido bicolore (oro+blu)'])
  const odore = pick(['Profumo dolce di rose', 'Odore di pece bruciata', 'Odore di muschio', 'Odore di pesce salato', 'Niente odore', 'Aroma di vino antico', 'Profumo di incenso', 'Odore di metallo', 'Profumo di gelsomino', 'Odore acidulo'])
  const sapore = pick(['Dolce come miele', 'Amarissimo', 'Sapido come sangue', 'Acquoso e insipido', 'Speziato come zenzero', 'Acido come limone'])
  // Effetto: pesca da pozioni reali ITEMS
  const pozioni = ITEMS.filter(i => i.type === 'Pozione')
  const effetto = pick(pozioni)
  return { aspetto, odore, sapore, effetto }
}

// ─── Maledizione/Benedizione ─────────────────────────────────────────────
const MALEDIZIONI = [
  'Capelli e barba crescono di 1 cm/ora',
  'Tutti gli specchi mostrano un\'immagine spaventosa',
  'Una voce sussurra il nome durante il sonno',
  'Le piante muoiono al tuo passaggio',
  'Non puoi più mentire — anche piccole bugie',
  'Una corda invisibile ti lega a un luogo specifico',
  'Le tue mani sanguinano in presenza di icone sacre',
  'Gli animali ti evitano e fuggono',
  'Soffri visioni del passato di chiunque tocchi',
  'Tutto ciò che bevi ha sapore di sangue',
  'Ogni 24 ore inizi a invecchiare di 1 anno',
  'I tuoi sogni mostrano il tuo prossimo giorno',
]

const BENEDIZIONI = [
  'Una stella visibile solo a te ti guida',
  'Vantaggio sul prossimo TS importante',
  'Recuperi 1 dado vita al prossimo riposo breve',
  'I tuoi pasti durano il doppio',
  'Le creature ostili hanno svantaggio al primo attacco contro di te',
  'Conosci il prossimo evento importante (frase enigmatica)',
  '1 incantesimo lanciato è automaticamente potenziato',
  'Resistenza a un tipo di danno per 24 ore',
  'PF temporanei pari al tuo livello al risveglio',
  'Recupera 1 slot incantesimo speso (qualsiasi livello)',
]

const SOGNI_PROFETICI = [
  'Una mano di pietra emerge da un mare nero.',
  'Tre lune piene appaiono nello stesso cielo.',
  'Un drago bianco vola sopra una foresta in fiamme.',
  'Una bambina canta una ninna nanna in una lingua sconosciuta.',
  'Un albero di metallo cresce dal centro di un castello.',
  'Le stelle si spengono una a una.',
  'Una porta dorata in mezzo al deserto.',
  'Un labirinto di specchi infiniti.',
  'Un trono vuoto ricoperto di ragnatele.',
  'Una corona che cammina da sola tra rovine.',
]

// ─── Incontri casuali ────────────────────────────────────────────────────────
function crToNum(cr) {
  if (cr === '1/8') return 0.125
  if (cr === '1/4') return 0.25
  if (cr === '1/2') return 0.5
  return parseInt(cr) || 0
}

const ENCOUNTER_TIERS = [
  { range: [0, 0.5], partyLevels: [1] },
  { range: [0.25, 1], partyLevels: [2] },
  { range: [0.5, 2], partyLevels: [3] },
  { range: [1, 3], partyLevels: [4] },
  { range: [2, 4], partyLevels: [5, 6] },
  { range: [3, 6], partyLevels: [7, 8] },
  { range: [5, 9], partyLevels: [9, 10] },
  { range: [7, 12], partyLevels: [11, 12] },
  { range: [10, 15], partyLevels: [13, 14] },
  { range: [12, 17], partyLevels: [15, 16] },
  { range: [15, 20], partyLevels: [17, 18] },
  { range: [18, 30], partyLevels: [19, 20] },
]

function getMonstersForLevel(livello) {
  const tier = ENCOUNTER_TIERS.find(t => t.partyLevels.includes(livello)) || ENCOUNTER_TIERS[0]
  const [lo, hi] = tier.range
  return MONSTERS.filter(m => {
    const cr = crToNum(m.cr)
    return cr >= lo && cr <= hi
  })
}

function genIncontro(livello) {
  const pool = getMonstersForLevel(livello)
  if (!pool.length) return { gruppo: [] }
  const isHorde = Math.random() < 0.5
  if (isHorde) {
    const m = pick(pool)
    const count = Math.max(1, Math.min(8, Math.floor(rollDice(1, 4) + livello / 4)))
    return { gruppo: [{ monster: m, count }] }
  }
  const variants = pickN(pool, Math.min(2, pool.length))
  return {
    gruppo: variants.map(m => ({ monster: m, count: rollDice(1, 3) }))
  }
}

// ─── Modal universale: mostra dettagli di mostro/incantesimo/oggetto ────────
function ItemDetailModal({ entry, onClose }) {
  if (!entry) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 540, maxHeight: '85vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.15rem' }}>{entry.name}</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        {entry.kind === 'monster' && <MonsterDetail m={entry.monster} />}
        {entry.kind === 'spell' && <SpellDetail s={entry.spell} />}
        {entry.kind === 'item' && <ItemDetail it={entry.item} />}
      </div>
    </div>
  )
}

function MonsterDetail({ m }) {
  return (
    <>
      <p style={{ margin: '0 0 0.75rem', color: '#94a3b8', fontSize: '0.8rem' }}>{m.size} {m.type} • CA {m.ac} • {m.hp} PF • Velocità {m.speed} • CR {m.cr}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 6, marginBottom: '1rem', background: '#111420', borderRadius: 8, padding: '0.5rem' }}>
        {['FOR','DES','COS','INT','SAG','CAR'].map((label, i) => {
          const val = [m.str, m.dex, m.con, m.int, m.wis, m.cha][i]
          return (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700 }}>{label}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#a78bfa' }}>{val}</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{mod(val)}</div>
            </div>
          )
        })}
      </div>
      {m.saves?.length > 0 && (
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.78rem', color: '#cbd5e1' }}><strong style={{ color: '#94a3b8' }}>Salvezze:</strong> {m.saves.join(', ')}</p>
      )}
      {m.skills?.length > 0 && (
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', color: '#cbd5e1' }}><strong style={{ color: '#94a3b8' }}>Abilità:</strong> {m.skills.join(', ')}</p>
      )}
      {m.traits?.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', marginBottom: 4 }}>Tratti</div>
          {m.traits.map((t, i) => typeof t === 'string'
            ? <p key={i} style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#cbd5e1' }}>• {t}</p>
            : <p key={i} style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#cbd5e1' }}><strong>{t.name}.</strong> {t.desc}</p>
          )}
        </div>
      )}
      {m.actions?.length > 0 && (
        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: 4 }}>Azioni</div>
          {m.actions.map((a, i) => (
            <p key={i} style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#cbd5e1' }}><strong>{a.name}.</strong> {a.desc}</p>
          ))}
        </div>
      )}
      {m.reactions?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: 4 }}>Reazioni</div>
          {m.reactions.map((r, i) => (
            <p key={i} style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#cbd5e1' }}><strong>{r.name}.</strong> {r.desc}</p>
          ))}
        </div>
      )}
    </>
  )
}

function SpellDetail({ s }) {
  return (
    <>
      {s.scuola && <p style={{ margin: '0 0 0.75rem', color: '#a78bfa', fontSize: '0.8rem', fontStyle: 'italic' }}>{s.scuola}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '0.75rem' }}>
        {[['Lancio', s.tempo], ['Gittata', s.gittata], ['Durata', s.durata], ['Componenti', s.componenti]].filter(x => x[1]).map(([l, v]) => (
          <div key={l} style={{ background: '#0d0f18', border: '1px solid #1e2235', borderRadius: 6, padding: '4px 8px' }}>
            <div style={{ fontSize: '0.58rem', color: '#64748b', textTransform: 'uppercase' }}>{l}</div>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{v}</div>
          </div>
        ))}
      </div>
      <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
        {s.description || s.desc || 'Descrizione non disponibile.'}
      </p>
    </>
  )
}

const RARITY_COLORS = {
  Mondano: '#94a3b8', Comune: '#22c55e', 'Non Comune': '#22c55e',
  Raro: '#3b82f6', 'Molto Raro': '#a78bfa', Leggendario: '#f59e0b', Artefatto: '#dc2626',
}

function ItemDetail({ it }) {
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '0.75rem' }}>
        <span style={{ background: '#0d0f18', color: RARITY_COLORS[it.rarity] || '#94a3b8', border: `1px solid ${RARITY_COLORS[it.rarity] || '#94a3b8'}55`, borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 600 }}>{it.rarity}</span>
        <span style={{ background: '#0d0f18', color: '#cbd5e1', border: '1px solid #1e2235', borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem' }}>{it.type}</span>
        {it.attunement && <span style={{ background: '#1e1040', color: '#a78bfa', border: '1px solid #3730a3', borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem' }}>Sintonia richiesta</span>}
        {it.value_mo > 0 && <span style={{ background: '#0d0f18', color: '#f59e0b', border: '1px solid #78350f', borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 600 }}>{it.value_mo} mo</span>}
      </div>
      <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{it.description}</p>
    </>
  )
}

// ─── Chip cliccabile: cerca nel database e apre il modal ────────────────────
function ClickableName({ name, onSelect }) {
  if (!name) return null
  const trimmed = name.trim()
  const monster = MONSTERS.find(m => m.name.toLowerCase() === trimmed.toLowerCase())
  if (monster) return <button className="dm-chip dm-chip-monster" onClick={() => onSelect({ name: monster.name, kind: 'monster', monster })}>{trimmed}</button>
  const spell = lookupSpell(trimmed)
  if (spell && spell.name) return <button className="dm-chip dm-chip-spell" onClick={() => onSelect({ name: spell.name, kind: 'spell', spell })}>{trimmed}</button>
  const item = findItem(trimmed)
  if (item) return <button className="dm-chip dm-chip-item" onClick={() => onSelect({ name: item.name, kind: 'item', item })}>{trimmed}</button>
  // Nessun match nel database — testo semplice (no chip = no link a "non trovato")
  return <span>{trimmed}</span>
}

// ─── Generatori Tab — ora con SELECT integrati nelle card ───────────────────
function GeneratoriTab({ onSelect }) {
  const [livello, setLivello] = useState(1)
  const [razza, setRazza] = useState('umano')
  const [results, setResults] = useState({})
  function gen(key, fn) { setResults(r => ({ ...r, [key]: fn() })) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Controlli globali */}
      <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Livello party</span>
          <input type="number" min={1} max={20} value={livello}
            onChange={e => setLivello(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
            className="input" style={{ width: 60 }} />
          <span style={{ color: '#475569', fontSize: '0.7rem' }}>(per Tesoro, Incontro, Negozio, Quest, Boss)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Razza PNG</span>
          <select className="select" value={razza} onChange={e => setRazza(e.target.value)} style={{ width: 160 }}>
            {RAZZE.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {/* PNG con razza scelta */}
        <GenCard title={`PNG (${RAZZE.find(r => r.key === razza)?.label || 'Umano'})`} icon="🎭" onGen={() => gen('png', () => genPNG(razza))}
          result={results.png ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div><strong>Nome:</strong> {results.png.nome} <span style={{ color: '#64748b' }}>({results.png.razza})</span></div>
              <div><strong>Occupazione:</strong> {results.png.occupazione}</div>
              <div><strong>Carattere:</strong> {results.png.carattere}</div>
              <div><strong>Tic:</strong> {results.png.tic}</div>
              <div><strong>Motivazione:</strong> {results.png.motivazione}</div>
              <div><strong>Segreto:</strong> <span style={{ color: '#fbbf24' }}>{results.png.segreto}</span></div>
            </div>
          ) : null}
        />

        <GenCard title="Solo Nome" icon="👤"
          subAction={(<select className="select" value={razza} onChange={e => setRazza(e.target.value)} style={{ height: 26, fontSize: '0.7rem', padding: '0 4px', minWidth: 110 }}>
            {RAZZE.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>)}
          onGen={() => gen('nome', () => genNome(razza))} result={results.nome} />

        <GenCard title="Nome Taverna" icon="🍺" onGen={() => gen('taverna', genTaverna)} result={results.taverna} />
        <GenCard title="Meteo" icon="☁️" onGen={() => gen('meteo', genMeteo)} result={results.meteo} />
        <GenCard title="Voce di Taverna" icon="🗣️" onGen={() => gen('voce', genVoce)} result={results.voce} />
        <GenCard title="Quartiere Città" icon="🏙️" onGen={() => gen('citta', genCitta)} result={results.citta} />

        <GenCard title="Gancio Avventura" icon="🪝" onGen={() => gen('gancio', genGancio)}
          result={results.gancio ? (
            <div>
              <div><strong>Chi:</strong> {results.gancio.chi}</div>
              <div><strong>Cosa:</strong> {results.gancio.cosa}</div>
              <div><strong>Dove:</strong> {results.gancio.dove}</div>
            </div>
          ) : null}
        />

        <GenCard title="Stanza Dungeon" icon="🏚️" onGen={() => gen('stanza', genStanza)}
          result={results.stanza ? (
            <div>
              <div><strong>Tipo:</strong> {results.stanza.tipo}</div>
              <div><strong>Dettaglio:</strong> {results.stanza.caratteristica}</div>
              <div><strong>Trappola:</strong> {results.stanza.trappola}</div>
              <div><strong>Uscite:</strong> {results.stanza.uscite}</div>
            </div>
          ) : null}
        />

        {/* Tesoro con select livello integrato */}
        <GenCard title={`Tesoro Liv. ${livello}`} icon="💎"
          subAction={(<select className="select" value={livello} onChange={e => setLivello(parseInt(e.target.value))} style={{ height: 26, fontSize: '0.7rem', padding: '0 4px', width: 70 }}>
            {Array.from({ length: 20 }).map((_, i) => <option key={i+1} value={i+1}>Liv. {i+1}</option>)}
          </select>)}
          onGen={() => gen('tesoro', () => genTesoro(livello))}
          result={results.tesoro ? (
            <div>
              <div style={{ fontSize: '0.8rem', marginBottom: 6 }}>
                <strong>Monete:</strong>{' '}
                <span style={{ color: '#f59e0b' }}>{results.tesoro.mo} mo</span>,{' '}
                <span style={{ color: '#cbd5e1' }}>{results.tesoro.mp} mp</span>
                {results.tesoro.gemme && <>, <span style={{ color: '#a78bfa' }}>{results.tesoro.gemme}</span></>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {results.tesoro.items.map((it, i) => (
                  <div key={i} style={{ fontSize: '0.78rem' }}>
                    ◆ <ClickableName name={it.name} onSelect={onSelect} />{' '}
                    <span style={{ fontSize: '0.65rem', color: RARITY_COLORS[it.rarity] || '#64748b' }}>[{it.rarity}]</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        />

        {/* Incontro con select livello */}
        <GenCard title={`Incontro Liv. ${livello}`} icon="⚔️"
          subAction={(<select className="select" value={livello} onChange={e => setLivello(parseInt(e.target.value))} style={{ height: 26, fontSize: '0.7rem', padding: '0 4px', width: 70 }}>
            {Array.from({ length: 20 }).map((_, i) => <option key={i+1} value={i+1}>Liv. {i+1}</option>)}
          </select>)}
          onGen={() => gen('incontro', () => genIncontro(livello))}
          result={results.incontro?.gruppo?.length ? (
            <div>
              {results.incontro.gruppo.map((g, i) => (
                <div key={i} style={{ fontSize: '0.85rem' }}>
                  {g.count}× <ClickableName name={g.monster.name} onSelect={onSelect} />{' '}
                  <span style={{ color: '#64748b', fontSize: '0.7rem' }}>(CR {g.monster.cr})</span>
                </div>
              ))}
            </div>
          ) : null}
        />

        {/* Negozio */}
        <GenCard title={`Negozio Liv. ${livello}`} icon="🏪" onGen={() => gen('negozio', () => genNegozio(livello))}
          result={results.negozio ? (
            <div>
              <div style={{ marginBottom: 4 }}><strong>{results.negozio.nome}</strong></div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 6 }}>
                Oste: {results.negozio.oste.nome} ({results.negozio.oste.carattere})
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Inventario</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {results.negozio.stock.map((it, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                    <span><ClickableName name={it.name} onSelect={onSelect} /></span>
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>{it.value_mo > 0 ? `${it.value_mo} mo` : '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        />

        {/* Quest completa */}
        <GenCard title={`Quest Completa Liv. ${livello}`} icon="📜" onGen={() => gen('quest', () => genQuest(livello))}
          result={results.quest ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.78rem' }}>
              <div><strong>Gancio:</strong> {results.quest.gancio.chi} {results.quest.gancio.cosa} {results.quest.gancio.dove}.</div>
              <div><strong>Twist:</strong> {results.quest.complicazione}</div>
              <div><strong>Incontro:</strong> {results.quest.incontro.gruppo.map((g, i) => (
                <span key={i}>{i > 0 && ', '}{g.count}× <ClickableName name={g.monster.name} onSelect={onSelect} /></span>
              ))}</div>
              <div><strong>Loot:</strong> {results.quest.tesoro.mo} mo, {results.quest.tesoro.items.map((it, i) => (
                <span key={i}>{i > 0 && ', '}<ClickableName name={it.name} onSelect={onSelect} /></span>
              ))}</div>
              <div><strong>Ricompensa:</strong> {results.quest.ricompensa}</div>
            </div>
          ) : null}
        />

        {/* Boss */}
        <GenCard title={`Boss Liv. ${livello}`} icon="👹" onGen={() => gen('boss', () => genBoss(livello))}
          result={results.boss ? (
            <div style={{ fontSize: '0.78rem' }}>
              <div><strong>Boss:</strong> <ClickableName name={results.boss.boss.name} onSelect={onSelect} /> <span style={{ color: '#64748b' }}>(CR {results.boss.boss.cr})</span></div>
              <div><strong>Ambientazione:</strong> {results.boss.lair}</div>
              <div><strong>Sgherri:</strong> {results.boss.minions}× <ClickableName name={results.boss.minionType?.name} onSelect={onSelect} /></div>
              <div style={{ marginTop: 4 }}><strong>Effetto Tana:</strong> {results.boss.legendary}</div>
            </div>
          ) : null}
        />

        {/* Pozione misteriosa */}
        <GenCard title="Pozione Misteriosa" icon="🧪" onGen={() => gen('pozione', genPozioneMisteriosa)}
          result={results.pozione ? (
            <div style={{ fontSize: '0.78rem' }}>
              <div><strong>Aspetto:</strong> {results.pozione.aspetto}</div>
              <div><strong>Odore:</strong> {results.pozione.odore}</div>
              <div><strong>Sapore:</strong> {results.pozione.sapore}</div>
              <div style={{ marginTop: 6 }}><strong>Effetto reale:</strong> <ClickableName name={results.pozione.effetto.name} onSelect={onSelect} /></div>
            </div>
          ) : null}
        />

        <GenCard title="Maledizione" icon="☠️" onGen={() => gen('maled', () => pick(MALEDIZIONI))} result={results.maled} />
        <GenCard title="Benedizione" icon="✨" onGen={() => gen('bened', () => pick(BENEDIZIONI))} result={results.bened} />
        <GenCard title="Sogno Profetico" icon="🌙" onGen={() => gen('sogno', () => pick(SOGNI_PROFETICI))} result={results.sogno} />
      </div>
    </div>
  )
}

function GenCard({ title, icon, onGen, result, subAction }) {
  return (
    <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: '1.1rem' }}>{icon}</span>
          <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {subAction}
          <button className="btn btn-secondary btn-sm" onClick={onGen} title="Genera">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>
      {result ? (
        typeof result === 'string'
          ? <div style={{ color: '#a78bfa', fontSize: '0.875rem', fontWeight: 500 }}>{result}</div>
          : <div style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.6 }}>{result}</div>
      ) : (
        <div style={{ color: '#475569', fontSize: '0.8rem', fontStyle: 'italic' }}>Premi il pulsante per generare…</div>
      )}
    </div>
  )
}

// ─── Mostri Tab ──────────────────────────────────────────────────────────────
const CR_ORDER = ['0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30']
function crSort(a, b) { return CR_ORDER.indexOf(String(a.cr)) - CR_ORDER.indexOf(String(b.cr)) }

function MostriTab({ onSelect }) {
  const [search, setSearch] = useState('')
  const [crFilter, setCrFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const monsters = useMemo(() => {
    let list = [...MONSTERS].sort(crSort)
    if (search) {
      const s = search.toLowerCase()
      list = list.filter(m => m.name.toLowerCase().includes(s) || (m.type || '').toLowerCase().includes(s))
    }
    if (crFilter !== 'all') list = list.filter(m => String(m.cr) === crFilter)
    if (typeFilter !== 'all') list = list.filter(m => (m.type || '').toLowerCase().includes(typeFilter.toLowerCase()))
    return list
  }, [search, crFilter, typeFilter])

  const crs = useMemo(() => [...new Set(MONSTERS.map(m => String(m.cr)))].sort((a, b) => CR_ORDER.indexOf(a) - CR_ORDER.indexOf(b)), [])
  const types = useMemo(() => [...new Set(MONSTERS.map(m => (m.type || '').split(' ')[0]).filter(Boolean))].sort(), [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca mostro…" style={{ paddingLeft: 32, width: '100%' }} />
        </div>
        <select className="select" value={crFilter} onChange={e => setCrFilter(e.target.value)} style={{ width: 110 }}>
          <option value="all">Tutti i CR</option>
          {crs.map(cr => <option key={cr} value={cr}>CR {cr}</option>)}
        </select>
        <select className="select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: 130 }}>
          <option value="all">Tutti i tipi</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div style={{ fontSize: '0.75rem', color: '#475569' }}>{monsters.length} mostri</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
        {monsters.map((m, i) => (
          <button key={`${m.name}-${m.cr}-${i}`} onClick={() => onSelect({ name: m.name, kind: 'monster', monster: m })} style={{
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
    </div>
  )
}

// ─── Magie Tab ───────────────────────────────────────────────────────────────
function parseSpellLevel(scuola) {
  if (!scuola || typeof scuola !== 'string') return null
  if (/^trucchetto/i.test(scuola)) return 0
  const m = scuola.match(/(\d+)°/)
  return m ? parseInt(m[1]) : null
}
function parseSpellSchool(scuola) {
  if (!scuola || typeof scuola !== 'string') return ''
  const trk = scuola.match(/^trucchetto\s+di\s+(\w+)/i)
  if (trk) return trk[1].charAt(0).toUpperCase() + trk[1].slice(1).toLowerCase()
  const school = scuola.split(/\s+di\s+/i)[0]
  return school.charAt(0).toUpperCase() + school.slice(1).toLowerCase()
}

function MagieTab({ onSelect }) {
  const allSpells = useMemo(() => getAllSpells(), [])
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [schoolFilter, setSchoolFilter] = useState('all')

  const enriched = useMemo(() =>
    allSpells.map(s => ({ ...s, _level: parseSpellLevel(s.scuola), _school: parseSpellSchool(s.scuola) }))
      .sort((a, b) => {
        if (a._level !== b._level) return (a._level ?? 99) - (b._level ?? 99)
        return (a.name || '').localeCompare(b.name || '')
      })
  , [allSpells])

  const schools = useMemo(() => {
    const set = new Set(enriched.map(s => s._school).filter(Boolean))
    return [...set].sort()
  }, [enriched])

  const filtered = useMemo(() => {
    let list = enriched
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s => (s.name || '').toLowerCase().includes(q))
    }
    if (levelFilter !== 'all') {
      const lv = parseInt(levelFilter)
      list = list.filter(s => s._level === lv)
    }
    if (schoolFilter !== 'all') list = list.filter(s => s._school === schoolFilter)
    return list
  }, [enriched, search, levelFilter, schoolFilter])

  const counts = useMemo(() => {
    const c = {}
    enriched.forEach(s => { c[s._level ?? 'x'] = (c[s._level ?? 'x'] || 0) + 1 })
    return c
  }, [enriched])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca incantesimo…" style={{ paddingLeft: 32, width: '100%' }} />
        </div>
        <select className="select" value={levelFilter} onChange={e => setLevelFilter(e.target.value)} style={{ width: 150 }}>
          <option value="all">Tutti i livelli</option>
          <option value="0">Trucchetti ({counts[0] || 0})</option>
          {[1,2,3,4,5,6,7,8,9].map(l => <option key={l} value={String(l)}>Livello {l} ({counts[l] || 0})</option>)}
        </select>
        <select className="select" value={schoolFilter} onChange={e => setSchoolFilter(e.target.value)} style={{ width: 150 }}>
          <option value="all">Tutte le scuole</option>
          {schools.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ fontSize: '0.75rem', color: '#475569' }}>
        {filtered.length} incantesimi {filtered.length !== enriched.length && <span>(su {enriched.length} totali)</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filtered.map((spell, i) => (
          <button key={spell.name + i}
            onClick={() => onSelect({ name: spell.name, kind: 'spell', spell })}
            style={{
              background: '#1a1d2e', border: '1px solid #252840', borderRadius: 8,
              padding: '0.6rem 1rem', cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: 10, textAlign: 'left',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#252840'}
          >
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 999,
              background: spell._level === 0 ? '#1e3a5f' : '#1e1040',
              color: spell._level === 0 ? '#38bdf8' : '#a78bfa',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {spell._level === 0 ? 'Trk' : spell._level !== null ? `L${spell._level}` : '?'}
            </span>
            <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.875rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{spell.name}</span>
            {spell._school && <span style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0 }}>{spell._school}</span>}
            <Info size={12} color="#475569" />
          </button>
        ))}
        {filtered.length === 0 && <p style={{ color: '#475569', fontStyle: 'italic' }}>Nessun incantesimo trovato.</p>}
      </div>
    </div>
  )
}

// ─── Oggetti Tab (catalogo del nuovo database) ──────────────────────────────
function OggettiTab({ onSelect }) {
  const [search, setSearch] = useState('')
  const [rarityFilter, setRarityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const types = useMemo(() => [...new Set(ITEMS.map(i => i.type))].sort(), [])
  const rarities = ['Mondano', 'Comune', 'Non Comune', 'Raro', 'Molto Raro', 'Leggendario', 'Artefatto']

  const filtered = useMemo(() => {
    let list = ITEMS
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(i => i.name.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q))
    }
    if (rarityFilter !== 'all') list = list.filter(i => i.rarity === rarityFilter)
    if (typeFilter !== 'all') list = list.filter(i => i.type === typeFilter)
    return list
  }, [search, rarityFilter, typeFilter])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca oggetto…" style={{ paddingLeft: 32, width: '100%' }} />
        </div>
        <select className="select" value={rarityFilter} onChange={e => setRarityFilter(e.target.value)} style={{ width: 140 }}>
          <option value="all">Tutte le rarità</option>
          {rarities.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ width: 130 }}>
          <option value="all">Tutti i tipi</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div style={{ fontSize: '0.75rem', color: '#475569' }}>{filtered.length} oggetti</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
        {filtered.map((it, i) => (
          <button key={it.name + i} onClick={() => onSelect({ name: it.name, kind: 'item', item: it })} style={{
            background: '#1a1d2e', border: `1px solid #252840`, borderLeft: `3px solid ${RARITY_COLORS[it.rarity] || '#94a3b8'}`,
            borderRadius: 8, padding: '0.75rem', textAlign: 'left', cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.borderTopColor = '#7c3aed'}
            onMouseLeave={e => e.currentTarget.style.borderTopColor = '#252840'}
          >
            <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.85rem' }}>{it.name}</div>
            <div style={{ fontSize: '0.7rem', color: RARITY_COLORS[it.rarity] || '#64748b', marginTop: 2, fontWeight: 600 }}>{it.rarity} · {it.type}</div>
            {it.value_mo > 0 && <div style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: 2 }}>{it.value_mo} mo</div>}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Tabelle Tab ─────────────────────────────────────────────────────────────
const TABLES = [
  { title: 'Magia Selvaggia (d20)', icon: '✨', rows: ['Il personaggio lancia Fuochi d\'artificio per 1 minuto.','Si teletrasporta in uno spazio casuale entro 18 m.','È circondato da petali di fiori per 1 minuto.','Trasforma un oggetto che tocca in cristallo.','Guadagna 3d6 PF temporanei.','Tutti i personaggi entro 9 m si scambiano i PF attuali.','È invisibile fino alla sua prossima mossa.','Lancia Palla di Fuoco centrata su sé stesso.','Inizia a levitare per 1 minuto.','1d4 pecore appaiono a 9 m.','Diventa un albero per 1 minuto.','Tutti gli alleati entro 9 m guariscono di 1d10 PF.','L\'aspetto fisico cambia (capelli, occhi).','Una creatura ostile entro 36 m subisce confusione 1 round.','Tutti gli oggetti non viventi entro 1,5 m: Animare Oggetti.','Inversione di gravità per 10 secondi.','Dimentica un incantesimo casuale fino al prossimo riposo.','Il prossimo incantesimo è automaticamente potenziato.','Si moltiplica in 2 immagini speculari per 1 minuto.','Tira di nuovo due volte e applica entrambi.'] },
  { title: 'Tratti PNG Casuali (d20)', icon: '🎭', rows: ['Parla sempre in terza persona.','Colleziona oggetti banali trovati per strada.','Ha un tic nervoso quando mente.','Cita sempre un saggio immaginario.','Non riesce a guardarsi negli occhi.','Canta sottovoce quando è nervoso.','Porta sempre con sé cibo da condividere.','Chiama tutti con soprannomi inventati.','Teme i gatti sopra ogni altra cosa.','Racconta barzellette inappropriate.','Ha una passione segreta per la poesia.','Tiene un diario in una lingua morta.','Si rivolge agli oggetti come a persone.','Crede che il numero 7 porti sfortuna.','Ha sempre con sé un dado truccato.','Non beve acqua, solo vino o latte.','Mente compulsivamente su dettagli minori.','Si presenta sempre con un nome diverso.','Ha un\'opinione fortissima sulla cucina.','Ride alle cose tristi e piange a quelle felici.'] },
  { title: 'Conseguenze Critico (d12)', icon: '💀', rows: ['L\'arma cade a terra a 1,5 m.','L\'attacco colpisce un alleato adiacente.','Il personaggio inciampa e cade prono.','La corda si rompe o l\'arma si inceppa.','L\'armatura subisce un\'ammaccatura (-1 CA).','Stordito fino al suo prossimo turno.','Espone il fianco (vantaggio attacco nemico).','L\'attacco attira un nemico nuovo.','Perde l\'equilibrio (svantaggio 1 round).','Grida involontariamente, attira rinforzi.','L\'incantesimo si attiva sull\'incantatore stesso.','Attiva una trappola ambientale.'] },
  { title: 'Follia Breve (d10)', icon: '🌀', rows: ['Stordito per 1d10 minuti.','Convinto di essere uno PNG sconosciuto per 1 ora.','Compulsivamente onesto per 1d10 minuti.','Terrore di ogni oggetto magico per 1 ora.','Parla solo in rima per 1d10 minuti.','Crede di essere invincibile per 1 ora.','Ostile a chiunque per 1d10 minuti.','Ride incontrollabilmente per 1 minuto/1d10.','Dimentica chi sono i suoi alleati per 1d10 minuti.','Tremante di terrore per 1d10 minuti.'] },
  { title: 'Cosa C\'è in Tasca? (d20)', icon: '🎒', rows: ['1d6 monete di rame e una pelosina.','Una pergamena strappata con metà di una mappa.','Un dado a sei facce truccato.','Una chiave d\'argento senza serratura nota.','Un fazzoletto sporco di sangue.','Una piuma di fenice (vera? falsa?).','Un dente di drago bambino.','Una lettera d\'amore mai consegnata.','Un anello di ottone con incisione "AETERNUM".','Una manciata di sassolini colorati.','Un piccolo specchio a mano.','Un foglietto con un\'unica parola: "Ricorda".','Un\'ampolla di sale benedetto.','Una statuina di drago intagliata.','Un guanto sinistro spaiato.','Una collana con un dente di lupo.','Un piccolo libro di preghiere.','Mezzo biscotto vecchio di settimane.','Un sigillo di cera rotto.','Una bambola di pezza con un occhio bottone.'] },
  { title: 'Eventi di Viaggio (d12)', icon: '🛤️', rows: ['Un cacciatore offre cibo in cambio di compagnia.','Un carro mercantile è bloccato e chiede aiuto.','Si trova un cadavere recente sulla strada.','Un branco di lupi (1d4) attraversa la pista.','Una pioggia improvvisa allaga il sentiero.','Un albero antico è caduto bloccando il passaggio.','Un gruppo di pellegrini si unisce al cammino.','Banditi (2d4) tentano un\'imboscata.','Si vedono colonne di fumo in lontananza.','Un druido eremita offre ospitalità per la notte.','Un fenomeno magico naturale (aurora, nebbia colorata).','Una creatura piccola ferita chiede aiuto.'] },
  { title: 'Profumi della Città (d12)', icon: '👃', rows: ['Cumino e cardamomo da una bancarella.','Pesce salato e catrame dal porto.','Pane appena sfornato.','Sterco di cavallo e fieno fresco.','Fumo di legna e brace.','Sudore e cuoio da un mercante.','Profumo dolciastro di gelsomino.','Carne arrostita e vino versato.','Olio di lampada bruciato.','Aroma intenso di erbe medicinali.','Fumo dolce dell\'oppio.','Sangue fresco da un macellaio.'] },
  { title: 'Trovate sul Cadavere (d10)', icon: '⚰️', rows: ['Un anello con incisione "Per sempre tua, R."','17 mp e 3 mo in una borsa di cuoio.','Una pergamena: lista di nomi cancellati uno per uno.','Una bottiglietta di veleno (4 dosi).','Una lettera sigillata indirizzata "Al Re".','Un coltello con il nome di un compagno inciso.','Una mappa di un quartiere malfamato con una X rossa.','Un medaglione con dentro un ritratto sbiadito.','Un tatuaggio fresco a forma di occhio sul polso.','Una chiave dorata pesante.'] },
  { title: 'Eventi Taverna (d10)', icon: '🍺', rows: ['Una rissa scoppia per via di una mano truccata a carte.','Un menestrello inizia a cantare di gesta dei PG (vere o inventate).','Uno straniero offre da bere a tutti senza spiegazioni.','Un nobile in incognito chiede di unirsi al tavolo.','Una guardia entra cercando un fuggitivo.','Una donna piange in un angolo: chiede aiuto a chi le si avvicina.','Una scommessa: 50 mo a chi beve 5 boccali di seguito.','Un druido entra con un orso al guinzaglio.','Un\'ombra strana si muove in un angolo: nessuno sembra notarla.','Un vecchio veterano racconta di un mostro nei dintorni.'] },
  { title: 'Sogno Profetico (d10)', icon: '🌙', rows: SOGNI_PROFETICI },
]

function TabelleTab() {
  const [rolled, setRolled] = useState({})
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 280, overflow: 'auto' }}>
            {table.rows.map((row, i) => (
              <div key={i} style={{
                fontSize: '0.78rem', padding: '4px 8px', borderRadius: 4,
                background: rolled[table.title] === i ? '#1e1040' : 'transparent',
                color: rolled[table.title] === i ? '#a78bfa' : '#94a3b8',
                border: `1px solid ${rolled[table.title] === i ? '#3730a3' : 'transparent'}`,
                fontWeight: rolled[table.title] === i ? 600 : 400,
              }}>
                <span style={{ color: '#475569', marginRight: 6 }}>{i + 1}.</span> {row}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Giocatori Tab — DM assegna PG ai giocatori ─────────────────────────────
function GiocatoriTab() {
  const [profiles, setProfiles] = useState([])
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: true }),
      supabase.from('characters').select('id, data'),
    ]).then(([{ data: pData }, { data: cData }]) => {
      setProfiles(pData || [])
      setCharacters((cData || []).map(r => ({ id: r.id, name: r.data?.name || r.id, player_name: r.data?.player_name })))
      setLoading(false)
    })
  }, [])

  async function setCharForProfile(profile, charId) {
    setSavingId(profile.id)
    const { error } = await supabase
      .from('profiles')
      .update({ character_id: charId || null })
      .eq('id', profile.id)
    if (!error) {
      // sincronizza anche player_name del personaggio (auto da username)
      if (charId) {
        const c = characters.find(c => c.id === charId)
        const playerName = profile.username || profile.email
        if (c && playerName && c.player_name !== playerName) {
          const { data: full } = await supabase.from('characters').select('data').eq('id', charId).single()
          if (full) {
            const updated = { ...full.data, player_name: playerName }
            await supabase.from('characters')
              .update({ data: updated, updated_at: new Date().toISOString() })
              .eq('id', charId)
          }
        }
      }
      setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, character_id: charId || null } : p))
      setMsg('Salvato.')
    } else {
      setMsg('Errore: ' + error.message)
    }
    setSavingId(null)
    setTimeout(() => setMsg(null), 2000)
  }

  async function setRole(profile, role) {
    setSavingId(profile.id)
    const { error } = await supabase.from('profiles').update({ role }).eq('id', profile.id)
    if (!error) setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, role } : p))
    else setMsg('Errore: ' + error.message)
    setSavingId(null)
  }

  if (loading) return <p style={{ color: '#64748b' }}>Caricamento profili…</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ background: '#0d0f18', border: '1px solid #1e2235', borderRadius: 8, padding: '0.75rem 1rem' }}>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
          Assegna un personaggio a ciascun giocatore. Il giocatore vedrà solo i propri PF in combattimento; il nome dello username viene
          riportato come "nome del giocatore" sulla scheda.
        </p>
      </div>

      {msg && <div style={{ background: '#1e1040', color: '#a78bfa', borderRadius: 6, padding: '0.5rem 1rem', fontSize: '0.85rem' }}>{msg}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {profiles.map(p => {
          const assignedChar = characters.find(c => c.id === p.character_id)
          return (
            <div key={p.id} className="card" style={{ padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px', minWidth: 180 }}>
                <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.9rem' }}>{p.username || p.email || p.id.slice(0, 8)}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{p.id.slice(0, 8)}…</div>
              </div>

              <select className="select" value={p.role || 'player'} onChange={e => setRole(p, e.target.value)} style={{ width: 110 }}>
                <option value="player">Giocatore</option>
                <option value="dm">Dungeon Master</option>
              </select>

              <select className="select" value={p.character_id || ''} onChange={e => setCharForProfile(p, e.target.value)} style={{ flex: '1 1 200px', minWidth: 180 }}>
                <option value="">— Nessun personaggio —</option>
                {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              {savingId === p.id && <span style={{ color: '#a78bfa', fontSize: '0.75rem' }}>Salvo…</span>}
              {assignedChar && <span style={{ fontSize: '0.7rem', color: '#22c55e' }}>→ {assignedChar.name}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'generatori', label: 'Generatori', icon: Wand2 },
  { id: 'mostri', label: 'Mostri', icon: BookOpen },
  { id: 'magie', label: 'Magie', icon: Scroll },
  { id: 'oggetti', label: 'Oggetti', icon: Info },
  { id: 'tabelle', label: 'Tabelle', icon: Table2 },
  { id: 'giocatori', label: 'Giocatori', icon: Users },
]

export default function DMToolsPage() {
  const [tab, setTab] = useState('generatori')
  const [selected, setSelected] = useState(null)

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 3rem)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9' }}>Strumenti DM</h1>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: '1rem', flexShrink: 0, flexWrap: 'wrap' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0.45rem 1rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
            background: tab === id ? '#1e1040' : 'transparent',
            color: tab === id ? '#a78bfa' : '#64748b',
            border: `1px solid ${tab === id ? '#3730a3' : '#252840'}`,
            transition: 'all 0.15s',
          }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: '2rem' }}>
        {tab === 'generatori' && <GeneratoriTab onSelect={setSelected} />}
        {tab === 'mostri' && <MostriTab onSelect={setSelected} />}
        {tab === 'magie' && <MagieTab onSelect={setSelected} />}
        {tab === 'oggetti' && <OggettiTab onSelect={setSelected} />}
        {tab === 'tabelle' && <TabelleTab />}
        {tab === 'giocatori' && <GiocatoriTab />}
      </div>

      {selected && <ItemDetailModal entry={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
