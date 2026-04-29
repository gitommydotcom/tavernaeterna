// Database di oggetti magici e mondani D&D 5e in italiano.
// Usato dai generatori DM (tesori, loot, negozi). Tutti gli oggetti
// generati DEVONO provenire da qui — così ogni chip cliccabile mostra
// una descrizione vera del manuale, senza chiamate AI.
//
// Campi: name, rarity (Comune/Non Comune/Raro/Molto Raro/Leggendario),
//        type (Arma/Armatura/Pozione/Pergamena/Bacchetta/Bastone/Anello/
//              Stivali/Mantello/Anfora/Strumento/Tesoro/Gemma/Mondano/Cibo),
//        attunement (boolean), value_mo, description.

export const ITEMS = [
  // ───────── MONDANI / TESORI ──────────────────────────────
  { name: 'Sacchetto di monete', rarity: 'Mondano', type: 'Tesoro', value_mo: 0, description: 'Una borsa in cuoio con un mucchio di monete miste (rame, argento, oro). Pratica e indistinguibile.' },
  { name: 'Gemma da 10 mo', rarity: 'Mondano', type: 'Gemma', value_mo: 10, description: 'Pietra semipreziosa: ametista, occhio di tigre, malachite o turchese. Facilmente rivendibile.' },
  { name: 'Gemma da 50 mo', rarity: 'Mondano', type: 'Gemma', value_mo: 50, description: 'Pietra preziosa: corniola, perla nera, corallo, granato. Apprezzata da gioiellieri.' },
  { name: 'Gemma da 100 mo', rarity: 'Mondano', type: 'Gemma', value_mo: 100, description: 'Pietra preziosa di ottima qualità: ametista finissima, peridoto, topazio.' },
  { name: 'Gemma da 500 mo', rarity: 'Mondano', type: 'Gemma', value_mo: 500, description: 'Pietra preziosa di alta qualità: opale nero, ambra, zaffiro stellato. Oggetto di desiderio per nobili.' },
  { name: 'Gemma da 1000 mo', rarity: 'Mondano', type: 'Gemma', value_mo: 1000, description: 'Pietra preziosa rarissima: smeraldo, zaffiro, rubino. Solo i grandi tesorieri ne maneggiano.' },
  { name: 'Statuetta d\'argento', rarity: 'Mondano', type: 'Tesoro', value_mo: 25, description: 'Piccola statuetta di un dio o di un animale, lavorata con cura. Peso ~0.5 kg.' },
  { name: 'Calice d\'argento intarsiato', rarity: 'Mondano', type: 'Tesoro', value_mo: 75, description: 'Calice cerimoniale con incisioni elfiche o naniche. Spesso parte di un tesoro più grande.' },
  { name: 'Anello d\'oro con sigillo', rarity: 'Mondano', type: 'Tesoro', value_mo: 100, description: 'Anello d\'oro inciso con uno stemma nobiliare sconosciuto. Può aprire molte porte.' },
  { name: 'Diadema d\'oro con perle', rarity: 'Mondano', type: 'Tesoro', value_mo: 250, description: 'Diadema regale con piccole perle. Ostentarlo in pubblico è rischioso.' },
  { name: 'Tappeto orientale arrotolato', rarity: 'Mondano', type: 'Tesoro', value_mo: 50, description: 'Tappeto pregiato di seta. Pesa 4 kg ma vale bene il trasporto.' },

  // ───────── CIBO E SUPPLIES ──────────────────────────────
  { name: 'Razioni di viaggio', rarity: 'Mondano', type: 'Cibo', value_mo: 0.5, description: 'Cibo secco e conservato: gallette, carne secca, frutta disidratata. Ogni razione sostiene una creatura per un giorno.' },
  { name: 'Sacca di pane fresco', rarity: 'Mondano', type: 'Cibo', value_mo: 0.1, description: 'Pane appena sfornato. Si conserva 2-3 giorni.' },
  { name: 'Borraccia con vino', rarity: 'Mondano', type: 'Cibo', value_mo: 0.5, description: 'Vino della casa: forte e poco raffinato, ma scalda nelle notti fredde.' },

  // ───────── POZIONI ──────────────────────────────────────
  { name: 'Pozione di Guarigione', rarity: 'Comune', type: 'Pozione', value_mo: 50, description: 'Liquido rosso. Bevuta o somministrata come azione, recupera 2d4+2 PF.' },
  { name: 'Pozione di Guarigione Superiore', rarity: 'Non Comune', type: 'Pozione', value_mo: 200, description: 'Liquido rosso intenso. Recupera 4d4+4 PF.' },
  { name: 'Pozione di Guarigione Maggiore', rarity: 'Raro', type: 'Pozione', value_mo: 500, description: 'Liquido cremisi luminoso. Recupera 8d4+8 PF.' },
  { name: 'Pozione di Volo', rarity: 'Molto Raro', type: 'Pozione', value_mo: 500, description: 'Liquido limpido che roteaspontaneamente. Concede velocità di volo 18 m per 1 ora.' },
  { name: 'Pozione di Invisibilità', rarity: 'Molto Raro', type: 'Pozione', value_mo: 500, description: 'Liquido trasparente in flacone di cristallo. Chi la beve diventa invisibile per 1 ora o finché non attacca.' },
  { name: 'Pozione di Forza del Gigante delle Colline', rarity: 'Non Comune', type: 'Pozione', value_mo: 200, description: 'Per 1 ora la FOR diventa 21 (se è già superiore non ha effetto).' },
  { name: 'Pozione di Resistenza', rarity: 'Non Comune', type: 'Pozione', value_mo: 300, description: 'Resistenza a un tipo di danno (acido/freddo/folgore/fuoco/forza/necrotico/perforante/contundente/tagliente/psichico/radioso/tuono/veleno) per 1 ora.' },
  { name: 'Pozione di Velocità', rarity: 'Molto Raro', type: 'Pozione', value_mo: 500, description: 'Effetto dell\'incantesimo Velocità per 1 minuto, senza concentrazione. Stordito 1 round dopo.' },
  { name: 'Pozione di Eroismo', rarity: 'Raro', type: 'Pozione', value_mo: 200, description: '10 PF temporanei e effetto Benedizione per 1 ora.' },
  { name: 'Pozione di Lettura del Pensiero', rarity: 'Raro', type: 'Pozione', value_mo: 200, description: 'Permette di lanciare Individuazione del Pensiero per 1 ora.' },
  { name: 'Pozione di Forma Gassosa', rarity: 'Raro', type: 'Pozione', value_mo: 200, description: 'Diventi una nube di gas per 1 ora. Velocità di volo 3 m, immune a contundente/perforante/tagliente.' },
  { name: 'Pozione di Resistenza al Veleno', rarity: 'Non Comune', type: 'Pozione', value_mo: 200, description: 'Resistenza ai danni da veleno e vantaggio sui TS contro veleno per 1 ora.' },
  { name: 'Pozione di Respirazione Acquatica', rarity: 'Non Comune', type: 'Pozione', value_mo: 200, description: 'Per 1 ora puoi respirare sott\'acqua normalmente.' },
  { name: 'Pozione di Fuochi Esplosivi', rarity: 'Raro', type: 'Pozione', value_mo: 200, description: 'Lancio: cubo 1,5 m, CD 13 DES o 5d6 fuoco.' },

  // ───────── PERGAMENE INCANTESIMI ────────────────────────
  { name: 'Pergamena di Trucchetto', rarity: 'Comune', type: 'Pergamena', value_mo: 25, description: 'Pergamena con un trucchetto casuale. Lanciabile da chiunque sappia leggerla, anche se non incantatore (CD 10 INT).' },
  { name: 'Pergamena Liv. 1', rarity: 'Comune', type: 'Pergamena', value_mo: 75, description: 'Pergamena con un incantesimo di 1° livello. Si distrugge dopo l\'uso.' },
  { name: 'Pergamena Liv. 2', rarity: 'Non Comune', type: 'Pergamena', value_mo: 150, description: 'Pergamena con un incantesimo di 2° livello.' },
  { name: 'Pergamena Liv. 3', rarity: 'Non Comune', type: 'Pergamena', value_mo: 300, description: 'Pergamena con un incantesimo di 3° livello.' },
  { name: 'Pergamena di Palla di Fuoco', rarity: 'Non Comune', type: 'Pergamena', value_mo: 300, description: 'Lancia Palla di Fuoco (3° livello, CD 15, 8d6 fuoco in sfera 6 m).' },
  { name: 'Pergamena di Identificare', rarity: 'Comune', type: 'Pergamena', value_mo: 75, description: 'Lancia Identificare. Permette di rivelare proprietà di un oggetto magico.' },
  { name: 'Pergamena di Resurrezione', rarity: 'Molto Raro', type: 'Pergamena', value_mo: 5000, description: 'Lancia Resurrezione (7° livello). Riporta in vita una creatura morta da meno di 100 anni.' },
  { name: 'Pergamena di Protezione (Non Morti)', rarity: 'Raro', type: 'Pergamena', value_mo: 200, description: 'I non-morti entro 1,5 m hanno svantaggio agli attacchi contro chi mostra la pergamena per 5 minuti. La pergamena si distrugge.' },

  // ───────── ARMI MAGICHE ────────────────────────────────
  { name: 'Arma +1', rarity: 'Non Comune', type: 'Arma', value_mo: 500, description: 'Bonus +1 al tiro per colpire e ai danni. Conta come magica per superare resistenze.' },
  { name: 'Arma +2', rarity: 'Raro', type: 'Arma', value_mo: 2000, description: 'Bonus +2 al tiro per colpire e ai danni. Magica.' },
  { name: 'Arma +3', rarity: 'Molto Raro', type: 'Arma', value_mo: 8000, description: 'Bonus +3 al tiro per colpire e ai danni. Magica.' },
  { name: 'Spada Lunga Fiammeggiante', rarity: 'Raro', type: 'Arma', attunement: true, value_mo: 5000, description: 'Spada Lunga +1. Come azione bonus puoi accendere o spegnere fiamme che infliggono +2d6 fuoco.' },
  { name: 'Spada Solare', rarity: 'Raro', type: 'Arma', attunement: true, value_mo: 5000, description: 'Spada di luce pura. Danno radioso anziché tagliente, +2d8 vs non-morti, illumina come torcia.' },
  { name: 'Frecce +1 (10)', rarity: 'Non Comune', type: 'Arma', value_mo: 500, description: '10 frecce magiche +1. Si distruggono dopo l\'uso.' },
  { name: 'Frecce Slay', rarity: 'Molto Raro', type: 'Arma', value_mo: 2500, description: 'Freccia +3 contro un tipo specifico di creatura (tira casualmente). CD 17 COS o muore se ridotta a 0 PF.' },
  { name: 'Spada Vorpal', rarity: 'Leggendario', type: 'Arma', attunement: true, value_mo: 24000, description: 'Spada Lunga +3. Su un 20 naturale, decapita una creatura con testa singola (Mostruose esonerate).' },
  { name: 'Daga Velenosa', rarity: 'Non Comune', type: 'Arma', value_mo: 350, description: 'Daga +1 con riserva di veleno (3 dosi/giorno): +1d6 veleno per attacco.' },
  { name: 'Mazza del Terrore', rarity: 'Raro', type: 'Arma', attunement: true, value_mo: 4000, description: 'Mazza +1. Una creatura colpita: CD 14 SAG o spaventata 1 minuto.' },
  { name: 'Martello del Tuono', rarity: 'Molto Raro', type: 'Arma', attunement: true, value_mo: 9000, description: 'Martello da Guerra +2. Quando colpisci: 4d6 tuono extra.' },
  { name: 'Scimitarra Velocità', rarity: 'Molto Raro', type: 'Arma', attunement: true, value_mo: 9000, description: 'Scimitarra +2. Inoltre concede un attacco bonus per turno con la stessa arma.' },

  // ───────── ARMATURE MAGICHE ─────────────────────────────
  { name: 'Armatura +1', rarity: 'Raro', type: 'Armatura', value_mo: 1500, description: 'Qualsiasi tipo di armatura, bonus +1 alla CA. Magica.' },
  { name: 'Armatura +2', rarity: 'Molto Raro', type: 'Armatura', value_mo: 5000, description: 'Bonus +2 alla CA.' },
  { name: 'Armatura +3', rarity: 'Leggendario', type: 'Armatura', value_mo: 18000, description: 'Bonus +3 alla CA.' },
  { name: 'Armatura di Mithril', rarity: 'Non Comune', type: 'Armatura', value_mo: 1000, description: 'Armatura più leggera del normale: nessuna penalità Furtività, FOR minima ridotta.' },
  { name: 'Armatura di Adamantio', rarity: 'Non Comune', type: 'Armatura', value_mo: 1500, description: 'Trasforma ogni colpo critico ricevuto in un colpo normale.' },
  { name: 'Armatura di Resistenza', rarity: 'Raro', type: 'Armatura', attunement: true, value_mo: 4000, description: 'Resistenza a un tipo di danno (scelto dal DM al ritrovamento).' },
  { name: 'Scudo +1', rarity: 'Non Comune', type: 'Armatura', value_mo: 500, description: 'Scudo magico, +1 CA aggiuntivo (totale +3).' },
  { name: 'Scudo +2', rarity: 'Raro', type: 'Armatura', value_mo: 2000, description: '+4 CA totale.' },
  { name: 'Scudo del Fulmine', rarity: 'Raro', type: 'Armatura', attunement: true, value_mo: 4000, description: 'Scudo +1. Reazione: chi ti colpisce in mischia subisce 2d8 folgore.' },

  // ───────── ANELLI ───────────────────────────────────────
  { name: 'Anello di Protezione', rarity: 'Raro', type: 'Anello', attunement: true, value_mo: 3500, description: '+1 alla CA e a tutti i tiri salvezza.' },
  { name: 'Anello di Resistenza al Fuoco', rarity: 'Raro', type: 'Anello', attunement: true, value_mo: 3000, description: 'Resistenza ai danni da fuoco.' },
  { name: 'Anello di Resistenza al Freddo', rarity: 'Raro', type: 'Anello', attunement: true, value_mo: 3000, description: 'Resistenza ai danni da freddo.' },
  { name: 'Anello di Caduta Felina', rarity: 'Non Comune', type: 'Anello', attunement: true, value_mo: 1000, description: 'Cadi 18 m / round e atterri illeso. Funziona se sei prono o cadi.' },
  { name: 'Anello di Salto', rarity: 'Non Comune', type: 'Anello', attunement: true, value_mo: 2500, description: 'Lancia Salto su te stesso a volontà come azione bonus.' },
  { name: 'Anello di Camminare sull\'Acqua', rarity: 'Non Comune', type: 'Anello', attunement: true, value_mo: 2500, description: 'Lancia Camminare sull\'Acqua su te stesso a volontà.' },
  { name: 'Anello di Invisibilità', rarity: 'Leggendario', type: 'Anello', attunement: true, value_mo: 18000, description: 'Diventi invisibile come azione. Restare invisibile finché lo usi o attacchi/lanci.' },
  { name: 'Anello dei Tre Desideri', rarity: 'Leggendario', type: 'Anello', attunement: true, value_mo: 24000, description: 'Tre cariche. Una carica per lanciare Desiderio (8° livello). Non si ricarica.' },
  { name: 'Anello dell\'Evasione', rarity: 'Raro', type: 'Anello', attunement: true, value_mo: 3500, description: '3 cariche/giorno. Reazione su TS DES per dimezzare: nessun danno se passi.' },
  { name: 'Anello del Telefilo', rarity: 'Molto Raro', type: 'Anello', attunement: true, value_mo: 8000, description: '5 cariche/giorno. 2 cariche: lancia Teletrasporto.' },

  // ───────── STIVALI ──────────────────────────────────────
  { name: 'Stivali Elfici', rarity: 'Non Comune', type: 'Stivali', attunement: true, value_mo: 2500, description: 'I tuoi passi sono silenziosi: vantaggio alle prove di Furtività con le calzature.' },
  { name: 'Stivali del Vento', rarity: 'Raro', type: 'Stivali', attunement: true, value_mo: 3500, description: 'Velocità +3 m. Lancia Velocità su te stesso 1/giorno.' },
  { name: 'Stivali di Velocità', rarity: 'Raro', type: 'Stivali', attunement: true, value_mo: 4000, description: 'Come azione bonus, raddoppi la velocità per 10 minuti. Una volta al giorno.' },
  { name: 'Stivali della Levitazione', rarity: 'Raro', type: 'Stivali', attunement: true, value_mo: 3500, description: 'Lancia Levitazione su te stesso a volontà.' },
  { name: 'Stivali Volanti', rarity: 'Molto Raro', type: 'Stivali', attunement: true, value_mo: 9000, description: 'Velocità di volo pari alla velocità a piedi. 4 ore di volo prima di dover essere ricaricati (1 ora di riposo per ora di volo).' },
  { name: 'Stivali a Falcata', rarity: 'Non Comune', type: 'Stivali', attunement: true, value_mo: 2500, description: 'Salti orizzontali e verticali triplicati. Velocità di nuoto e arrampicata = velocità.' },

  // ───────── MANTELLI ──────────────────────────────────────
  { name: 'Mantello Elfico', rarity: 'Non Comune', type: 'Mantello', attunement: true, value_mo: 2500, description: 'Vantaggio sulle prove di Furtività. Svantaggio per chi tenta di vederti.' },
  { name: 'Mantello di Protezione', rarity: 'Non Comune', type: 'Mantello', attunement: true, value_mo: 1500, description: '+1 alla CA e a tutti i tiri salvezza.' },
  { name: 'Mantello del Pipistrello', rarity: 'Raro', type: 'Mantello', attunement: true, value_mo: 4000, description: 'Vantaggio Furtività. Volo 12 m in oscurità. Trasformati in pipistrello come azione 1/giorno.' },
  { name: 'Mantello del Manto della Pioggia', rarity: 'Comune', type: 'Mantello', value_mo: 50, description: 'Resta sempre asciutto sotto la pioggia.' },
  { name: 'Mantello di Resistenza Folgore', rarity: 'Raro', type: 'Mantello', attunement: true, value_mo: 3500, description: 'Resistenza ai danni da folgore.' },

  // ───────── BACCHETTE & BASTONI ──────────────────────────
  { name: 'Bacchetta di Detect Magic', rarity: 'Non Comune', type: 'Bacchetta', value_mo: 1500, description: '7 cariche. 1 carica: lancia Individuazione del Magico. Si ricarica 1d6+1/notte.' },
  { name: 'Bacchetta di Magic Missile', rarity: 'Non Comune', type: 'Bacchetta', value_mo: 1500, description: '7 cariche. 1 carica: lancia Dardo Incantato (1°), o usa più cariche per slot superiori (max 7° livello).' },
  { name: 'Bacchetta delle Saette', rarity: 'Raro', type: 'Bacchetta', attunement: true, value_mo: 4000, description: '7 cariche. 1 carica: lancia Fulmine (3° liv), CD 15. Si ricarica 1d6+1/notte.' },
  { name: 'Bacchetta della Polimorfia', rarity: 'Molto Raro', type: 'Bacchetta', attunement: true, value_mo: 9000, description: '7 cariche. 1 carica: lancia Polimorfia, CD 15.' },
  { name: 'Bacchetta del Mago di Guerra +1', rarity: 'Non Comune', type: 'Bacchetta', attunement: true, value_mo: 1500, description: '+1 ai tiri per colpire incantesimi.' },
  { name: 'Bastone della Strega (10 cariche)', rarity: 'Raro', type: 'Bastone', attunement: true, value_mo: 5000, description: 'Funge da focus arcano. 10 cariche per lanciare incantesimi vari (Charm, Sleep, Detect Magic).' },
  { name: 'Bastone Curativo', rarity: 'Raro', type: 'Bastone', attunement: true, value_mo: 4500, description: '10 cariche. Spendi cariche per lanciare incantesimi di guarigione (Cura Ferite, Massa Cura, Resurrezione minore).' },
  { name: 'Bastone del Mago Supremo', rarity: 'Leggendario', type: 'Bastone', attunement: true, value_mo: 24000, description: '50 cariche. Lanciare quasi qualsiasi incantesimo, +2 incantesimi e CA, assorbire incantesimi nemici.' },

  // ───────── ELMO/COPRICAPI ───────────────────────────────
  { name: 'Elmo della Telepatia', rarity: 'Non Comune', type: 'Elmo', attunement: true, value_mo: 3500, description: '1/giorno: lancia Individuazione del Pensiero. A volontà: comunica telepaticamente entro 36 m.' },
  { name: 'Elmo della Comprensione delle Lingue', rarity: 'Comune', type: 'Elmo', value_mo: 75, description: 'Lancia Comprensione delle Lingue su te stesso a volontà.' },
  { name: 'Cappello del Camuffamento', rarity: 'Non Comune', type: 'Elmo', attunement: true, value_mo: 1500, description: 'Lancia Cambiare Aspetto su te stesso a volontà.' },
  { name: 'Diadema dell\'Astuzia', rarity: 'Molto Raro', type: 'Elmo', attunement: true, value_mo: 9000, description: 'INT diventa 19 (se è già superiore non ha effetto).' },

  // ───────── ALTRI WONDROUS ITEMS ─────────────────────────
  { name: 'Borsa di Contenimento', rarity: 'Non Comune', type: 'Wondrous', value_mo: 4000, description: 'Spazio interdimensionale: contiene fino a 250 kg in un volume di 1,8 m³, pesa solo 7 kg.' },
  { name: 'Borsa Custode', rarity: 'Raro', type: 'Wondrous', value_mo: 6000, description: 'Variante migliorata: 500 kg in 3,5 m³, pesa 4,5 kg.' },
  { name: 'Cintura della Forza del Gigante delle Colline', rarity: 'Raro', type: 'Cintura', attunement: true, value_mo: 5000, description: 'FOR diventa 21 (se è già superiore non ha effetto).' },
  { name: 'Cintura della Forza del Gigante del Fuoco', rarity: 'Molto Raro', type: 'Cintura', attunement: true, value_mo: 9000, description: 'FOR diventa 25.' },
  { name: 'Cintura della Forza del Gigante della Tempesta', rarity: 'Leggendario', type: 'Cintura', attunement: true, value_mo: 24000, description: 'FOR diventa 29.' },
  { name: 'Guanti di Bersaglio', rarity: 'Non Comune', type: 'Guanti', attunement: true, value_mo: 3000, description: '+2 ai danni con armi a distanza (escluse pesanti).' },
  { name: 'Guanti dell\'Orchetto', rarity: 'Non Comune', type: 'Guanti', attunement: true, value_mo: 1500, description: 'FOR diventa 19 mentre li indossi (se è già superiore non ha effetto).' },
  { name: 'Specchio della Vista Lontana', rarity: 'Raro', type: 'Wondrous', attunement: true, value_mo: 4500, description: 'Come Scrutamento (Scrying), CD 17 SAG. Bersaglio appare nello specchio.' },
  { name: 'Sfera di Cristallo', rarity: 'Molto Raro', type: 'Wondrous', attunement: true, value_mo: 9000, description: 'Lancia Scrutamento (5° liv). Variante superiore: percepire telepaticamente, sentire bersaglio.' },
  { name: 'Pietra Ioun: Saggezza', rarity: 'Molto Raro', type: 'Wondrous', attunement: true, value_mo: 6000, description: 'Pietra che orbita intorno alla testa. SAG +2 (max 20).' },
  { name: 'Pietra Ioun: Vigilanza', rarity: 'Raro', type: 'Wondrous', attunement: true, value_mo: 4500, description: 'Bonus +5 all\'iniziativa. Non puoi essere sorpreso se cosciente.' },
  { name: 'Tomo del Sapere Chiaro', rarity: 'Molto Raro', type: 'Wondrous', value_mo: 10000, description: 'Letto in 48 ore: SAG aumenta di 2 e il massimo aumenta di 2. Si distrugge dopo l\'uso.' },
  { name: 'Manuale dell\'Esercizio Atletico', rarity: 'Molto Raro', type: 'Wondrous', value_mo: 10000, description: 'Letto in 48 ore: FOR aumenta di 2 e il massimo aumenta di 2. Si distrugge.' },
  { name: 'Calderone Cornucopia', rarity: 'Raro', type: 'Wondrous', value_mo: 4000, description: '1/giorno produce uno stufato che sazia 12 persone.' },
  { name: 'Anfora Cornucopia', rarity: 'Comune', type: 'Wondrous', value_mo: 200, description: 'Produce 4 litri di acqua o 2 litri di vino al giorno.' },
  { name: 'Decanter di Acqua Infinita', rarity: 'Non Comune', type: 'Wondrous', value_mo: 1500, description: 'Comando: produce fino a 110 litri/round di acqua dolce o salata. Diluvio se "geyser".' },
  { name: 'Lente di Lettura Magica', rarity: 'Comune', type: 'Wondrous', value_mo: 50, description: 'Permette di leggere caratteri magici sospetti come se conoscessi la lingua.' },
  { name: 'Candela Eterna', rarity: 'Comune', type: 'Wondrous', value_mo: 100, description: 'Brucia 24 ore senza consumarsi. Si spegne con un soffio normale.' },
  { name: 'Sigillo del Marinaio', rarity: 'Raro', type: 'Wondrous', attunement: true, value_mo: 4000, description: 'Convoca un piccolo veliero magico 1/giorno per 24 ore.' },
  { name: 'Manuale dei Trucchi del Bardo', rarity: 'Raro', type: 'Wondrous', value_mo: 3500, description: 'Letto in 48 ore: CAR aumenta di 2 e max +2. Si distrugge.' },
  { name: 'Liuto Bardico magico', rarity: 'Non Comune', type: 'Strumento', attunement: true, value_mo: 1500, description: 'Lancia 1 incantesimo bardico/giorno con il liuto come componente. Vantaggio prove Intrattenere.' },
  { name: 'Tamburo della Marcia', rarity: 'Raro', type: 'Strumento', value_mo: 3000, description: 'Concede +3 m alla velocità di tutti gli alleati entro 9 m che marciano insieme.' },

  // ───────── OGGETTI MALEDETTI / CURIOSI ──────────────────
  { name: 'Bambola della Compagnia', rarity: 'Raro', type: 'Wondrous', attunement: true, value_mo: 3000, description: 'Bambola di pezza che, attaccata a te, ti tiene compagnia: parla in piccolo, cura paura, ricorda 1 evento.' },
  { name: 'Pietra del Controllo Elementale', rarity: 'Raro', type: 'Wondrous', attunement: true, value_mo: 4500, description: 'Concede dominio su 1 elementale invocato. Specifico per elemento (terra/aria/fuoco/acqua).' },
  { name: 'Statuetta del Servigio: Cane d\'Argento', rarity: 'Raro', type: 'Wondrous', value_mo: 3000, description: 'Diventa un mastino d\'argento per 6 ore. Combatte e percepisce.' },
  { name: 'Statuetta del Servigio: Civetta d\'Ebano', rarity: 'Non Comune', type: 'Wondrous', value_mo: 2500, description: 'Diventa una civetta gigante per 8 ore. Funge anche da messaggera.' },
  { name: 'Pergamena del Recupero (Mago)', rarity: 'Comune', type: 'Pergamena', value_mo: 50, description: 'Permette al Mago di copiare un nuovo incantesimo nel proprio libro senza costo aggiuntivo.' },
  { name: 'Sale Benedetto (sacchetto)', rarity: 'Comune', type: 'Wondrous', value_mo: 25, description: 'Cospargere una linea per impedire ai non-morti di attraversare per 8 ore.' },
  { name: 'Reliquia di un Santo', rarity: 'Raro', type: 'Tesoro', attunement: true, value_mo: 1500, description: 'Vantaggio TS contro magia di un tipo (a discrezione DM). Indossa come amuleto.' },
  { name: 'Specchio d\'Argento Tascabile', rarity: 'Comune', type: 'Wondrous', value_mo: 25, description: 'Mostra ciò che è invisibile entro 1,5 m di chi guarda dentro.' },
  { name: 'Polvere di Luce', rarity: 'Comune', type: 'Wondrous', value_mo: 100, description: '3 dosi. Una dose lanciata: illumina cubo 6 m come Luce per 1 ora.' },

  // ───────── ARTEFATTI LEGGENDARI ─────────────────────────
  { name: 'Mano di Vecna', rarity: 'Leggendario', type: 'Artefatto', attunement: true, value_mo: 0, description: 'Mano mummificata. Si attacca a un moncherino. Concede grandi poteri ma corrompe l\'anima.' },
  { name: 'Occhio di Vecna', rarity: 'Leggendario', type: 'Artefatto', attunement: true, value_mo: 0, description: 'Occhio raggrinzito. Sostituisce un tuo occhio. Vista nel buio infinita, Truevision, ma sanguina maledizioni.' },
  { name: 'Corona del Re Lich', rarity: 'Leggendario', type: 'Artefatto', attunement: true, value_mo: 0, description: 'Diadema oscuro. Comanda 100 PG di non-morti. Maledetta: chi la indossa diventerà lich a sua morte.' },
  { name: 'Calice di Bahamut', rarity: 'Leggendario', type: 'Artefatto', value_mo: 0, description: 'Coppa d\'argento del Re Drago. Bere dentro cura completamente, rimuove ogni malattia/maledizione 1/anno.' },
  { name: 'Pietra Filosofale (frammento)', rarity: 'Leggendario', type: 'Artefatto', value_mo: 50000, description: 'Frammento dorato. Trasmuta 1 oggetto/giorno in oro puro (max 5 kg). Quando intero: immortalità.' },

  // ───────── OGGETTI MONDANI UTILI ────────────────────────
  { name: 'Corda di Seta (15 m)', rarity: 'Mondano', type: 'Mondano', value_mo: 10, description: 'Forte e leggera. Sostiene fino a 100 kg.' },
  { name: 'Kit del Ladro', rarity: 'Mondano', type: 'Mondano', value_mo: 25, description: 'Grimaldelli, lime, specchietti. Necessario per scassinare serrature.' },
  { name: 'Kit dell\'Erborista', rarity: 'Mondano', type: 'Mondano', value_mo: 5, description: 'Vasetti, pestelli, strumenti. Necessario per identificare erbe e creare pozioni base.' },
  { name: 'Kit del Travestimento', rarity: 'Mondano', type: 'Mondano', value_mo: 25, description: 'Trucco, parrucche, vestiti. Necessario per cambiare aspetto credibilmente.' },
  { name: 'Kit del Veleno', rarity: 'Mondano', type: 'Mondano', value_mo: 50, description: 'Veleni base e strumenti. Necessario per applicare veleno su armi.' },
  { name: 'Bisaccia da Esploratore', rarity: 'Mondano', type: 'Mondano', value_mo: 10, description: 'Zaino con bedroll, mess kit, acciarino, 10 torce, 10 giorni di razioni, borraccia, 15 m corda.' },
  { name: 'Lanterna Cieca', rarity: 'Mondano', type: 'Mondano', value_mo: 5, description: 'Direziona la luce in un cono. Brucia 6 ore con 0,5 L di olio.' },
  { name: 'Tomi e Libri (assortiti)', rarity: 'Mondano', type: 'Mondano', value_mo: 25, description: 'Una pila di vecchi libri. Conferiscono +5 a una prova di Storia/Religione/Arcano se consultati con tempo.' },
  { name: 'Mappa del Tesoro (vecchia)', rarity: 'Mondano', type: 'Mondano', value_mo: 50, description: 'Pergamena ingiallita con segni e una X. Forse autentica, forse una truffa.' },
]

function norm(s) {
  return (s || '').toString().toLowerCase()
    .replace(/[''`]/g, '').replace(/[àá]/g, 'a').replace(/[èé]/g, 'e')
    .replace(/[ìí]/g, 'i').replace(/[òó]/g, 'o').replace(/[ùú]/g, 'u')
}

const ITEMS_BY_NORM = new Map(ITEMS.map(i => [norm(i.name), i]))

export function findItem(name) {
  const k = norm(name)
  if (ITEMS_BY_NORM.has(k)) return ITEMS_BY_NORM.get(k)
  // partial match
  for (const [key, item] of ITEMS_BY_NORM) {
    if (key.includes(k) || k.includes(key)) return item
  }
  return null
}

export const ITEMS_BY_RARITY = {
  Mondano: ITEMS.filter(i => i.rarity === 'Mondano'),
  Comune: ITEMS.filter(i => i.rarity === 'Comune'),
  'Non Comune': ITEMS.filter(i => i.rarity === 'Non Comune'),
  Raro: ITEMS.filter(i => i.rarity === 'Raro'),
  'Molto Raro': ITEMS.filter(i => i.rarity === 'Molto Raro'),
  Leggendario: ITEMS.filter(i => i.rarity === 'Leggendario'),
}
