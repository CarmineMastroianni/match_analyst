# Scherma – Design Spec MVP

**Versione:** 0.1 (draft per brainstorming)
**Data:** 22 aprile 2026
**Target MVP:** 22 giugno 2026
**Autore / prodotto:** Donato + match analyst (cliente)
**Stato:** in definizione, da validare insieme prima del disegno

---

## 1. Contesto e obiettivi

L'applicazione nasce per supportare un arbitro di scherma nel costruirsi il ruolo di **match analyst**: va nelle squadre durante assalti e partite, osserva gli atleti, li valuta sulle azioni tecniche principali e produce statistiche che descrivono sia il singolo atleta sia la squadra. Oggi è il suo strumento di lavoro; domani diventa piattaforma che le squadre pagano per avere il quadro completo degli avversari.

L'MVP deve rispondere a una domanda sola: **"posso usarlo a bordo pedana il 22 giugno 2026 per analizzare un match reale e restituire subito un ritratto statistico dell'atleta e della squadra?"** Se la risposta è sì, abbiamo un prodotto che guadagna autorevolezza ad ogni match e che giustifica la vendita a squadre.

Obiettivi MVP:

1. Registrare in live le azioni degli atleti durante gli assalti, con ergonomia da campo (tablet, una mano, tap veloci).
2. Aggregare le azioni a livello di atleta e di squadra, in tempo reale.
3. Dare all'analyst (e, in sola lettura, alle squadre) una vista chiara di profilazione e statistiche.
4. Consentire l'import iniziale dei dati atleta/squadra da Excel.

**Non obiettivi** in MVP: modulo di fatturazione/abbonamenti, report PDF brandizzati, analisi video, confronto tra squadre, streaming dei match, federazione identità (SSO), app native.

---

## 2. Utenti e ruoli

Due ruoli dal giorno uno.

**Analyst** (l'arbitro, utente primario). Single-tenant nell'MVP: nell'istanza c'è un solo analyst "proprietario" che crea tutto. Può creare atleti, squadre, assalti; inserire azioni live; vedere e modificare tutto. Tiene in mano lo strumento durante i match.

**Team viewer** (squadra). Login dedicato. Vede solo gli atleti e gli assalti della propria squadra, in sola lettura. Non può modificare nulla né vedere dati di squadre altrui. Accede da desktop (allenatori, direttori tecnici) o tablet.

In futuro: analyst multipli (multi-tenant), atleta-self, amministratore di federazione. Non in MVP.

**Assunzione da validare:** la squadra accede con un unico login condiviso (team account) o con utenti individuali (allenatore 1, allenatore 2)? Per MVP suggerisco *team account unico*, più semplice e realistico. Da confermare.

---

## 3. Scope MVP

### Dentro

- Gestione anagrafica atleti (CRUD, import Excel).
- Gestione anagrafica squadre (CRUD, import Excel; associazione atleti → squadra/e).
- Pannello di configurazione azioni tracciate (il catalogo delle azioni è configurabile, non hard-coded).
- Creazione di un assalto / partita: due atleti, arma, contesto.
- Schermata **live** di registrazione azioni durante l'assalto (tablet-first).
- Pagina **Atleta** con profilo + statistiche aggregate (tutti i match, o filtrate).
- Pagina **Squadra** con statistiche aggregate (tutta la rosa o formazione schierata di 6 tiratori).
- Pagina **Assalto** con riepilogo delle azioni e grafico a torta delle azioni principali.
- Autenticazione a due ruoli (analyst / team viewer) con permessi per risorsa.

### Fuori

- Report PDF scaricabili (prevedi l'hook, ma il pulsante è disattivato con label "presto disponibile").
- Video tagging.
- Confronto testa-a-testa storico (A vs B cumulato).
- Notifiche / email.
- Billing.
- App mobile nativa (la PWA installabile è sufficiente).

### Vincoli non funzionali

- **PWA installabile** (manifest + service worker). Minimo indispensabile: installabilità + caching assets.
- **Offline resiliente per la schermata live**: se la connessione cade durante l'assalto, le azioni devono essere registrate localmente e sincronizzate quando la connessione torna. Questo è il requisito non-funzionale più importante. Il resto dell'app può vivere online.
- **Responsive desktop + tablet** come prima classe. Mobile smartphone è accettabile ma non ottimizzato.
- **Performance:** la schermata live deve rispondere a un tap in < 100 ms. Nessuna latenza percettibile.

---

## 4. Modello dati

Entità core e relazioni. Livello concettuale, non SQL.

**Athlete** (Atleta)
- id, nome, cognome, data di nascita, sesso (M/F/altro), mano (dx/sx), categoria (es. "Senior", "U20")
- foto (opzionale, MVP: placeholder)
- squadra/e di appartenenza (un atleta può stare in più squadre — es. club + nazionale? da confermare; in MVP: una sola per semplicità)
- note testuali dell'analyst (profilazione qualitativa)
- statistiche aggregate: derivate da `ActionEvent`, non materializzate

**Team** (Squadra)
- id, nome, categoria (M/F), club/affiliazione, logo (opzionale)
- rosa: array di athleteId (fino a N, tipicamente 8–12)
- formazione "schierata" per un match: 6 tiratori (può cambiare tra match)
- statistiche aggregate: derivate

**Match** / **Bout** (Assalto)
- id, data, luogo (opzionale), competizione (opzionale)
- tipo: "assalto individuale" | "incontro a squadre" (MVP: individuale; squadre in v1.1 se serve)
- atleta A, atleta B (+ squadra di riferimento di ciascuno)
- arma (MVP: solo fioretto, ma il campo esiste)
- formato: "a 5", "a 15", "a tempo"
- risultato finale: punteggio A, punteggio B, vincitore
- stato: "pianificato" | "in corso" | "concluso" | "annullato"
- analystId che ha registrato il match

**ActionType** (configurabile)
- id, nome visibile (es. "Parata"), codice breve (es. "PAR"), categoria (offensiva / difensiva / tattica / esito), color-token, attiva sì/no
- arma di applicabilità (MVP: [fioretto]; in v2 [fioretto, spada, sciabola])
- è "azione di stoccata" (chiude il punto) sì/no
- fa parte del set "5 azioni principali" del grafico a torta (max 6)

Set di default per fioretto MVP: **Tocca**, **Non tocca** (azione tentata senza stoccata), **Messa in azione** (attacco preparatorio), **Parata**, **Risposta**, **Contrattacco**. L'analyst può aggiungerne, disattivarle, rinominarle.

**ActionEvent** (il tap sull'assalto)
- id, matchId, athleteId (chi esegue), actionTypeId
- timestamp di evento, "tempo assalto" (es. minuto:secondo)
- esito: "a segno" | "a vuoto" | "subito" | "annullato" (enum breve)
- punto conseguente: "A" | "B" | "nessuno"
- punteggio cumulativo dopo l'azione (A–B)
- opponentAthleteId (automatico, è l'altro dei due)
- nota testuale breve (opzionale, compilabile post-match)

**User / Role**
- user: id, email, passwordHash, role ∈ {analyst, team_viewer}
- per team_viewer: teamId associato (sola lettura su quel team)

### Regole derivate (chiave del valore)

- **Stat atleta per azione:** per ogni ActionType, conta eventi / percentuale riuscita / rapporto a segno vs a vuoto.
- **Stat squadra:** somma aggregata degli atleti della *formazione schierata* (6 tiratori) per quell'insieme di match, oppure di tutta la *rosa* (selezionabile).
- **Aggiornamento live:** le statistiche si ricalcolano al volo man mano che si toccano i tap durante l'assalto. Nessun batch.
- **Filtri:** per arma, per periodo, per avversario, per tipo di gara.

---

## 5. Configurazione delle azioni (pannello)

Schermata (desktop) per l'analyst, dove può:

- Vedere il catalogo delle action type attive per fioretto.
- Attivare/disattivare una action type.
- Rinominare label visibile e codice breve.
- Scegliere il colore (dal token set dell'app).
- Marcare un'azione come "principale" (entra nel grafico a torta).
- Aggiungere un'azione custom.

Validazioni: massimo 6 azioni principali. Almeno 1 azione attiva. Codice breve univoco per arma.

Il catalogo è per-analyst (ogni analyst il suo). In futuro: preset federali.

---

## 6. User flow principale — "Live match"

Questo è il flow più critico. Lo descrivo passo per passo.

1. L'analyst arriva al palazzetto, apre la PWA sul tablet.
2. Home → "Nuova partita".
3. Seleziona atleta A (lookup con autocomplete), atleta B (stesso), arma (default: fioretto), formato (default: a 15), competizione (opzionale).
4. Conferma → parte la **schermata live**.
5. Schermata live: due "zone atleta" contrapposte a sinistra e destra. Al centro: punteggio attuale, timer assalto, pulsanti globali (pausa, annulla ultima azione, fine assalto).
6. Per ogni azione: l'analyst tap la zona dell'atleta → appare la paletta con le azioni attive → tap sul tipo → (se richiesto) tap sull'esito → l'evento è registrato. Feedback visivo immediato. **Target: 2 tap per azione semplice, 3 tap massimo per azione con esito.**
7. "Annulla ultima azione" sempre visibile (undo istantaneo, fino a 5 eventi indietro).
8. Al raggiungimento del punteggio formato (5 o 15) o al "fine assalto": schermata **riepilogo** con torta e lista azioni.
9. L'analyst può aggiungere note per atleta e chiudere.
10. Ritorno alla dashboard; l'assalto ora è visibile nello storico e i dati di squadra sono aggiornati.

**Edge cases da gestire:**

- Chiusura app / lock schermo durante l'assalto → ripristino allo stato esatto all'apertura.
- Connessione persa → tutto continua su storage locale, badge "offline" visibile.
- Tap per errore → undo a un tocco, sempre.
- Atleta sconosciuto (non in anagrafica) → "crea al volo" con solo nome/cognome, completi dopo.

---

## 7. Sitemap / Information architecture

```
Login
├── Analyst
│   ├── Dashboard (oggi, prossimi match, ultimi match, KPI rapidi)
│   ├── Atleti
│   │   ├── Lista (filtri: squadra, sesso, categoria)
│   │   ├── Atleta [id]
│   │   │   ├── Profilo
│   │   │   ├── Statistiche (filtri: periodo, arma, avversario)
│   │   │   └── Storico match
│   │   └── Nuovo / Import Excel
│   ├── Squadre
│   │   ├── Lista
│   │   ├── Squadra [id]
│   │   │   ├── Rosa
│   │   │   ├── Formazione schierata (6 tiratori)
│   │   │   └── Statistiche aggregate
│   │   └── Nuova / Import Excel
│   ├── Partite
│   │   ├── Lista (filtri: data, stato, atleta, squadra)
│   │   ├── Nuova partita (wizard breve)
│   │   ├── Live match [id]   ← schermata cuore
│   │   └── Riepilogo match [id]
│   └── Configurazione
│       ├── Azioni (catalogo per arma)
│       ├── Profilo analyst
│       └── Account / sicurezza
└── Team viewer
    ├── Home team (la mia squadra)
    ├── Atleti della mia squadra (lettura)
    ├── Assalti della mia squadra (lettura)
    └── Statistiche squadra (lettura)
```

---

## 8. Spec per schermata (senza pixel, solo struttura)

### 8.1 Dashboard analyst

Blocchi: saluto + data, "match di oggi" (card grandi, clicca → live), "ultimi 5 match" (chip con risultato), KPI rapidi (match totali, atleti in db, squadre), CTA grande "Nuova partita".

### 8.2 Lista atleti

Tabella densa (desktop) / card (tablet). Colonne: foto/iniziali, nome, squadra, sesso, categoria, # match, ultima valutazione. Ricerca, filtri, ordinamento. Bottone "Nuovo" e "Importa Excel".

### 8.3 Pagina atleta

Header con foto/placeholder, nome, squadra, categoria, bottone "Nuova partita con questo atleta". Tab: **Profilo** (anagrafica + note qualitative), **Statistiche** (grafico torta azioni principali + tabella dettaglio per azione: a segno / a vuoto / %; filtri periodo + avversario), **Storico match** (lista cronologica).

### 8.4 Pagina squadra

Header squadra. Tab: **Rosa** (lista atleti, add/remove), **Formazione** (6 slot schierabili, drag&drop da rosa), **Statistiche** (aggregazione di rosa o formazione, stesse metriche della pagina atleta).

### 8.5 Nuova partita (wizard)

3 step: atleti, arma + formato, conferma. Ogni step una sola azione. In mobile è full-screen; in desktop è una modal. A fine wizard → live.

### 8.6 Live match (la schermata più importante)

**Layout orizzontale** (landscape tablet). Due pannelli atleta speculari, separati dalla barra centrale di punteggio + timer. In ciascun pannello atleta:

- Nome + colore di squadra
- Punteggio grande (numero)
- Paletta azioni attive (griglia 2×3 o 3×2) — ogni cella è un tap grande (min 88 px, preferibile 104 px) con icona + label breve
- Bottone piccolo "nota" e "storico azioni" atleta

Barra centrale: timer (start/pausa), punteggio globale, **Undo ultima azione** (grande), menu "…" (pausa match, annulla match, fine match).

Stati: default (nessun tap), mid-action (dopo primo tap, appare modal esito), feedback successo (micro-animazione conferma), offline (badge giallo in alto).

**Nessuno scrolling** durante il match. Tutto sopra la piega.

### 8.7 Riepilogo match

Risultato finale (card grande), grafico a torta delle azioni principali per entrambi gli atleti (affiancate), tabella dettaglio azioni, input note, pulsanti "Salva", "Esporta (presto)".

### 8.8 Configurazione azioni

Lista di ActionType per l'arma selezionata. Toggle attiva, edit label/colore/codice, toggle "principale", drag per ordinare. Contatore "X/6 azioni principali attive".

### 8.9 Home team viewer

Card della propria squadra, ultimi 3 assalti, link "vedi tutte le statistiche". Layout molto leggero, informativo.

---

## 9. Direzione visiva

Lo stile è **sportivo e dinamico**, non dashboard clinico. Non voglio una palette che sembri Linear o Stripe. Voglio che ad aprirlo si senta "questo è uno strumento di scherma".

### Principi

- **Contrasti forti, non sussurri.** I punteggi e le azioni sono protagonisti: tipografia grande, peso alto.
- **Una coppia di colori identitari,** non cinque. Un accento caldo (azione, attenzione) e un accento freddo (calma, dati). Grigio molto scuro di fondo in live mode per ridurre affaticamento visivo.
- **Forme spigolose**, mai rotondità zuccherine. Richiamo al triangolo / lama / linee diagonali nei divisori e nelle transizioni.
- **Tipografia condensata per i dati, display per i titoli.** Una condensed (es. famiglia tipo Barlow Condensed, Oswald) per numeri/label azioni; una display neutra ma con carattere per il resto (Inter, DM Sans).
- **Motion con intenzione.** Micro-animazioni di conferma tap (200 ms), transizioni di cambio punteggio (spring). Niente animazioni gratuite.

### Palette proposta (direzionale, da affinare)

- Fondo scuro: near-black `#0D0F14` (per live mode) / bianco caldo `#F7F5F0` (per desktop analisi)
- Accento primario: rosso-sangue scherma `#C8102E` (azione, CTA, indicatori)
- Accento secondario: blu acciaio `#1E3A8A` (dati, team, elementi informativi)
- Neutro scuro: `#1F2330`
- Neutro medio: `#5A6070`
- Neutro chiaro: `#E3E5EC`
- Accento warning: `#F59E0B`
- Accento success: `#10B981`

Accessibility: tutti i contrasti devono rispettare WCAG AA (4.5:1 per testo, 3:1 per UI e numeri grandi). Da verificare in audit dedicato prima del freeze.

### Tipografia proposta

- Display/UI: **Inter** 400/600/700
- Numeri e label azioni: **Barlow Condensed** 600/700/800
- Monospace (opzionale, per codici azione): **JetBrains Mono**

### Componenti base di design system

Button (primary / ghost / danger, 3 size), Input, Select, Modal, Card, Tab, Table, EmptyState, Toast, Badge, Avatar, ActionTile (tap grande per live), ScoreDisplay, PieChart wrapper. Tutti con stati hover / active / disabled / focus-visible (keyboard).

---

## 10. Architettura tecnica suggerita (alto livello)

Non è scolpito nella pietra, ma come direzione per far tornare i conti su tempi e PWA:

- **Frontend:** React + TypeScript, Vite. Tailwind per styling (accelera enormemente la system-ness). shadcn/ui come base componenti, ripensati col visual sportivo.
- **PWA:** Vite PWA plugin (workbox). Service worker che cachea shell + ultimi N match per offline.
- **Stato live:** React Query per server state + Zustand (o Redux Toolkit) per lo stato dell'assalto in corso, persistito su IndexedDB.
- **Backend:** Supabase (Postgres + Auth + Row Level Security) per MVP. Motivo: l'RLS modella esattamente i permessi a due ruoli, azzera backend boilerplate, gratis/economico nel free tier. Alternativa: Firebase. Alternativa heavy: Node+Postgres dedicato.
- **Sync offline:** outbox pattern su IndexedDB → flush quando online. Libreria candidata: Dexie + un piccolo sync layer custom, o RxDB se volgiamo sincronia seria.
- **Hosting:** Vercel / Netlify / Cloudflare Pages.
- **Analytics:** PostHog (free tier) per capire come viene usato.

Questa scelta va validata prima di scrivere codice. Non serve per l'MVP design, ma orienta cosa è fattibile.

---

## 11. Metriche di successo dell'MVP

- **Tempo medio per registrare un'azione live:** < 3 secondi (2 tap).
- **Errore di registrazione per match:** < 2 undo per assalto.
- **Disponibilità offline:** un assalto completo da 15 punti registrato senza rete e sincronizzato senza perdita.
- **Numero di match registrati nel primo mese post-lancio:** ≥ 10.
- **NPS qualitativo dell'analyst dopo 5 match reali:** "lo userei di nuovo domani" = sì.

---

## 12. Roadmap oltre l'MVP

- Report PDF brandizzati (v1.1)
- Video tagging collegato all'assalto (v1.2)
- Confronto head-to-head storico tra due atleti/squadre (v1.2)
- Multi-arma attiva (spada, sciabola) (v1.3)
- Incontri a squadre (formato 9 assalti) (v1.3)
- Multi-tenant (più analyst indipendenti) + billing (v2.0)
- App mobile nativa se/quando serve davvero

---

## 13. Domande aperte / decisioni da prendere

Queste sono le cose che ancora non abbiamo deciso e che dobbiamo chiudere prima del disegno vero.

1. Un atleta può stare in più squadre contemporaneamente? (MVP: una sola, da confermare)
2. Team viewer: account condiviso per squadra o utenti individuali? (MVP suggerito: account condiviso)
3. L'import Excel: quale formato atteso? Serve un template da scaricare?
4. Il "match" dell'MVP è solo l'assalto individuale o anche l'incontro a squadre (9 assalti)?
5. Esiste una competizione/lega di riferimento da modellare (campionato, torneo) o nell'MVP basta "data + luogo libero"?
6. Lingua: solo italiano o già multilingua (EN) in vista di squadre internazionali?
7. Regole privacy / GDPR: dobbiamo gestire consenso atleti per inserimento dati? (Probabile sì, specie se i dati escono verso le squadre.)

Una volta chiuse queste, passiamo a wireframe desktop + tablet e poi al prototipo HTML navigabile.

---

*Fine documento. Prossima revisione prevista dopo la sessione di allineamento con Donato.*
