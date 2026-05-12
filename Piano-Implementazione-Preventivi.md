# Scherma – Piano di implementazione e preventivi

**Versione:** 0.1
**Data:** 22 aprile 2026
**Target MVP cliente:** 22 giugno 2026

---

## Come leggere questo documento

Il cliente (l'arbitro/match analyst) ha un bisogno concreto ma non ha ancora validato con dati reali che lo strumento funzioni in pedana. Partire con la full MVP ha senso solo se la validazione a monte è già fatta o se il budget assorbe eventuali pivot. In caso contrario, conviene salire per tier.

Ogni tier è **un prodotto finito a sé**, non un frammento incompleto. Alla fine di ciascun tier lo strumento è utilizzabile in una forma specifica; si passa al tier successivo solo se la validazione del precedente lo giustifica.

**Assunzione di costo base:** tariffa blended di **350 €/giorno** (freelance mid-senior full-stack + design, mercato italiano). Tutti i numeri sono in euro, IVA esclusa. Per team più strutturati (studio/agenzia) moltiplicare per 1,6–2,0×.

**Stima giornate ≠ calendario.** Una giornata-uomo equivale a 1 giorno effettivo di lavoro. Dedicare il 100 % del tempo è irrealistico, quindi il calendario è sempre più lungo delle giornate-uomo (tipicamente 1,4×).

---

## Sommario preventivi

| Tier | Che cosa consegna | Giornate | Calendario | Investimento |
|------|-------------------|----------|------------|--------------|
| **1 – Demo clickabile** | Prototipo navigabile per presentare il prodotto a club e federazioni | 6–8 | 2 settimane | **2.000 – 2.800 €** |
| **2 – MVP Solo** | App funzionante solo per l'analyst: live match, atleti, squadre, persistenza dati | 28–34 | 7–9 settimane | **9.800 – 11.900 €** |
| **3 – MVP Standard** | Aggiunge ruolo squadra in lettura, offline resiliente, configurazione azioni, import Excel | 48–58 | 12–15 settimane | **16.800 – 20.300 €** |
| **4 – MVP Pro** | Aggiunge multi-arma, incontri a squadre (9 assalti), branding custom, 2 mesi di supporto | 72–86 | 18–22 settimane | **25.200 – 30.100 €** |

---

## Tier 1 — Demo clickabile (entry)

### Scopo

Avere un prototipo navigabile ma "finto" (niente backend, niente database) da usare come **strumento di validazione e vendita** prima di investire seriamente. Lo porti a club e federazioni per capire se il prodotto risuona, raccogliere feedback e misurare l'interesse.

### Include

- Rifinitura del prototipo HTML esistente (navigabilità fra 5 schermate: dashboard, atleti, squadra, live, recap).
- Dati statici hard-coded ma realistici, preparati con il cliente.
- Stile visivo direzionale finalizzato (palette, tipografia, componenti base).
- Deploy su URL pubblico (Vercel/Netlify, dominio temporaneo incluso).
- 1 sessione di walkthrough con il cliente (1 ora).

### Non include

Backend, autenticazione, persistenza, import Excel, qualsiasi logica reale. Il bottone "Salva" non salva davvero.

### Breakdown

| Attività | Giornate |
|---|---|
| Polishing prototipo esistente (5 schermate) | 3 |
| Finalizzazione stile e componenti | 2 |
| Dati statici realistici | 0,5 |
| Deploy + configurazione dominio | 0,5 |
| Sessione walkthrough + micro-iterazione | 1 |
| **Totale** | **7** |

### Calendario

2 settimane. Consegna stimata: **inizio maggio 2026**.

### Investimento

**2.000 – 2.800 € IVA esclusa.** Range dipende da profondità rifiniture e numero di revisioni.

### Quando ha senso

Il cliente non ha ancora mai provato lo strumento con dati reali e vuole validare sia il concept sia il proprio appeal verso le squadre prima di investire sul software vero. È il tier giusto se il budget totale è < 10 k € ma si vuole comunque un artefatto presentabile.

---

## Tier 2 — MVP Solo (l'arbitro, un utente, dati reali)

### Scopo

L'arbitro può usarlo in pedana il 22 giugno 2026 con **i suoi dati reali**. Funziona solo per lui (single user), niente ruolo squadra ancora. È il tier minimo per "strumento di lavoro reale", come indicato negli appunti.

### Include (tutto Tier 1 +)

- **Autenticazione single user** (email + password, no registrazione aperta).
- **Backend completo** (Supabase: Postgres + Auth). Database schema per Atleta, Squadra, Match, Azione, ActionType.
- **5 schermate funzionanti:**
  - Dashboard con dati reali
  - Lista atleti + pagina atleta con statistiche aggregate
  - Lista squadre + pagina squadra con rosa e statistiche
  - **Live match funzionante** con salvataggio persistente
  - Recap match
- **Azioni fioretto pre-caricate** (6 azioni: tocca, non tocca, messa in azione, parata, risposta, contrattacco). Non ancora configurabili via UI.
- **PWA installabile** (icona home screen, splash screen, manifest).
- **Caching assets** (service worker base) — l'app apre anche offline ma i dati richiedono connessione.
- **Deploy su dominio cliente** (es. `scherma.nomearbitro.it`) — dominio a carico del cliente.
- **Onboarding dati iniziali:** caricamento manuale fino a 60 atleti + 24 squadre fatto da noi una tantum.

### Non include

Ruolo team viewer, import Excel (dati caricati a mano in onboarding), offline resiliente avanzato, pannello configurazione azioni, report scaricabili.

### Breakdown

| Fase | Attività | Giornate |
|---|---|---|
| **Setup** | Repository, CI base, Supabase project, ambiente dev/prod | 1,5 |
| **Design system** | Tokens, componenti base (button, card, input, modal, tab), applicazione tema sport/dinamico | 3 |
| **Schema dati** | Modellazione entità, migrations, policy RLS minima | 2 |
| **Auth** | Login/logout single user, protezione route, recupero password | 1,5 |
| **Atleti** | CRUD completo, lista, pagina atleta con stats aggregate, filtri | 4 |
| **Squadre** | CRUD completo, rosa, formazione schierata (6), stats aggregate | 4 |
| **Nuova partita** | Wizard selezione atleti + arma + formato | 1,5 |
| **Live match** | Schermata live refinita, tap → esito → persistenza, undo, timer | 5 |
| **Recap** | Schermata con dati veri, grafico torta, timeline azioni | 2 |
| **Dashboard** | KPI reali, match di oggi, ultimi match | 1,5 |
| **PWA** | Manifest, service worker base, icone, splash | 1 |
| **Onboarding dati** | Caricamento manuale atleti + squadre iniziali | 1 |
| **QA + bugfix** | Test cross-device (desktop + tablet), correzioni | 3 |
| **Deploy + handover** | Production setup, documentazione base, sessione training (2 ore) | 1 |
| **Totale giornate-uomo** | | **32 ± 3** |

### Calendario

7–9 settimane (calendario) se si parte **subito**. Consegna stimata: **metà giugno 2026** → rispetta il target MVP del 22/06.

### Investimento

**9.800 – 11.900 € IVA esclusa.**

Suddivisione pagamenti proposta:
- 30 % alla firma (≈ 3 k €) — copre setup, design system, schema dati
- 40 % a metà (≈ 4 k €) — consegna atleti, squadre e live match in ambiente di test
- 30 % alla consegna finale (≈ 3 k €) — consegna production + training

### Quando ha senso

Il cliente vuole portarlo in pedana per sé con dati reali ma è in una fase di solo "strumento personale". Le squadre vedranno i dati *più avanti* solo quando avremo validato che lo strumento gli fa davvero risparmiare tempo e genera insight.

**Rischio principale:** senza ruolo team viewer, non c'è ancora modello di business. Se il cliente vuole *vendere* accesso in lettura alle squadre, deve salire a Tier 3.

---

## Tier 3 — MVP Standard (due ruoli, business-ready)

### Scopo

Questo è l'**MVP commerciale**. Due ruoli (analyst + team viewer), ognuno con la propria vista, permessi ben separati, offline resiliente sulla schermata live (il requisito non-funzionale più importante). È lo strumento pronto per iniziare a vendere accesso alle squadre.

### Include (tutto Tier 2 +)

- **Ruolo team viewer:** login separato, vede solo la propria squadra in lettura, permessi gestiti via RLS Postgres.
- **Pannello configurazione azioni:** attivare/disattivare/rinominare/colorare le azioni, scegliere le 6 principali (quelle in torta).
- **Import Excel atleti e squadre:** template scaricabile, validazione, gestione errori, anteprima prima di commit.
- **Offline resiliente (cuore del valore):**
  - La schermata live funziona completamente offline.
  - Storage locale (IndexedDB) con coda outbox.
  - Sync automatico al rientro in linea con gestione conflitti base.
  - Badge di stato rete sempre visibile.
- **Export CSV base** delle statistiche atleta/squadra.
- **Filtri avanzati:** per periodo, per avversario, per arma (già preparato per v2).
- **Storico match paginato:** 100+ match senza perdita di performance.
- **Pagina ricerca globale:** atleta / squadra / match.
- **Audit trail minimo:** chi ha creato/modificato cosa.
- **Documentazione utente** in italiano (PDF, ~15 pagine) + video demo 5 min.

### Non include

Multi-arma attiva, incontri a squadre (9 assalti), report PDF brandizzati, billing, multi-tenant (più analyst indipendenti).

### Breakdown aggiuntivo (sopra Tier 2)

| Fase | Attività | Giornate |
|---|---|---|
| **RLS + ruoli** | Policy Postgres per team viewer, test permessi | 2 |
| **UI team viewer** | Home team, lista atleti (read-only), statistiche squadra | 3 |
| **Config azioni** | Pannello CRUD action types, preview colore, drag-sort | 3 |
| **Import Excel** | Template, parser, validazione, anteprima, commit transazionale | 3 |
| **Offline resiliente** | IndexedDB, outbox, sync, gestione conflitti, test di rete degradata | 6 |
| **Export CSV** | Report base atleta e squadra | 1 |
| **Filtri avanzati** | UI filtri + query ottimizzate | 2 |
| **Pagina ricerca** | Componente + indicizzazione client | 1 |
| **Audit trail** | Campi + visualizzazione | 0,5 |
| **Documentazione + video** | Guida utente + screencast | 2 |
| **QA extra** | Test ruoli, test offline, regression | 2,5 |
| **Totale aggiuntivo** | | **26** |

### Totale Tier 3

**32 + 26 = 58 giornate-uomo** (± 5).

### Calendario

12–15 settimane complessive. Se partiamo subito, consegna **inizio agosto 2026**. Per rispettare il 22/06 servirebbe iniziare **al più tardi entro fine aprile 2026**.

### Investimento

**16.800 – 20.300 € IVA esclusa.**

Suddivisione pagamenti proposta:
- 25 % alla firma
- 25 % a consegna Tier 2 (MVP Solo funzionante)
- 25 % a consegna ruolo team viewer + offline
- 25 % a consegna finale con documentazione

### Quando ha senso

Il cliente ha già validato che "lo strumento gli fa fare meglio il suo lavoro" (con un Tier 2 o con altro) **e** ha almeno una squadra pilota disposta a pagare per vedere le statistiche. È il tier che apre al business.

---

## Tier 4 — MVP Pro (tutto, marcato e presentabile come prodotto)

### Scopo

Il prodotto non è più un "tool personale": è una **piattaforma brandata** che il cliente può presentare a federazione, club di alto livello, sponsor. Copre tutte le armi, tutti i formati competitivi, ha un'identità visiva finalizzata e supporto operativo post-lancio incluso.

### Include (tutto Tier 3 +)

- **Multi-arma attivo:** fioretto, spada, sciabola. Set di azioni distinto per arma, regole di priorità modellate dove rilevante.
- **Incontri a squadre (formato 9 assalti):** flow specifico per team-match, punteggio cumulativo, rotazione tiratori, statistiche di team match.
- **Competizioni:** modello "Torneo" con lista match collegati, tabellone, classifica.
- **Branding personalizzato:** logo del cliente, palette tuning, favicon, email templates, dominio con certificato SSL custom.
- **Identità visiva professionale:** sessione di 2 giorni con designer per finalizzare brand mark, tipografia, componenti finali.
- **Landing page pubblica:** con value prop, demo embed, CTA "richiedi accesso squadra" (lead-gen).
- **Report PDF brandizzati** scaricabili per atleta, squadra e match (come cartella stampa).
- **Analytics d'uso (PostHog):** per capire come viene usato e dove investire.
- **Onboarding flows:** tutorial interattivo al primo login, empty state curati.
- **Supporto post-lancio incluso: 2 mesi** di assistenza (bug fix, piccole modifiche, 1 check-in settimanale).

### Non include

Multi-tenant (più analyst indipendenti con billing SaaS), video tagging, confronto head-to-head storico automatico, notifiche email, app mobile nativa.

### Breakdown aggiuntivo (sopra Tier 3)

| Fase | Attività | Giornate |
|---|---|---|
| **Multi-arma** | Schema + config per fioretto/spada/sciabola, regole priorità, set azioni default | 4 |
| **Incontri a squadre** | Modello match-a-9, UI dedicata live, aggregazione, recap team match | 5 |
| **Competizioni / Torneo** | Entità torneo, tabellone, classifica | 3 |
| **Branding** | Session designer + applicazione identità completa | 4 |
| **Landing page** | Copy + design + sviluppo + SEO base | 3 |
| **Report PDF** | Templates brandizzati per atleta/squadra/match, generazione server-side | 3 |
| **Analytics** | Setup PostHog + dashboard custom | 1 |
| **Onboarding interattivo** | Tutorial + empty states | 2 |
| **Supporto 2 mesi** | Retainer bug-fix + piccole richieste | 8 (20 %) |
| **Totale aggiuntivo** | | **33** |

### Totale Tier 4

**58 + 33 = 91 giornate-uomo** stimate — stringo a **72–86** con possibili ottimizzazioni sui pacchetti disegno e tornei.

### Calendario

18–22 settimane. Se partiamo subito: consegna **fine settembre 2026**. Il 22/06 è irrealistico per questo tier.

### Investimento

**25.200 – 30.100 € IVA esclusa.** (Include già i 2 mesi di supporto.)

### Quando ha senso

Il cliente è già oltre la fase "provo a vedere se funziona" e vuole posizionarsi come **servizio di analytics per la scherma italiana**, con ambizione di andare anche su federazione o club di serie A. È il tier giusto quando si cerca partnership con uno sponsor o con la FIS stessa.

---

## Oltre l'MVP: cosa costerebbe il resto

Queste sono le voci che ho tenuto fuori anche dal Tier 4 perché spostano la conversazione da "MVP" a "prodotto-azienda". Cifre direzionali.

| Feature | Giornate | Investimento |
|---|---|---|
| Multi-tenant + billing SaaS (più analyst indipendenti, Stripe) | 20–25 | 7.000 – 9.000 € |
| Video tagging sincronizzato con le azioni | 15–20 | 5.500 – 7.500 € |
| App mobile native (iOS + Android, React Native) | 25–30 | 9.000 – 11.000 € |
| Confronto head-to-head storico con ML previsione vittoria | 12–18 | 4.500 – 6.500 € |
| Integrazione federazione (import ranking, anagrafica ufficiale) | 8–12 | 3.000 – 4.500 € |
| Notifiche email + reminder match | 3–5 | 1.200 – 1.800 € |

---

## Manutenzione post-lancio

Separata dal costo MVP. Tre opzioni:

- **Pay-as-you-go:** 60 €/ora per singoli interventi. Adatto a lanci con poche richieste.
- **Retainer leggero:** 600 €/mese, fino a 10 ore, bug-fix prioritario SLA 48 h. Adatto se l'uso è costante ma non evolutivo.
- **Retainer evolutivo:** 1.500 €/mese, fino a 20 ore + 1 micro-feature al mese. Adatto alla fase "il prodotto cresce".

Hosting e infrastruttura a carico del cliente:
- Vercel/Netlify tier gratuito per i primi 12–18 mesi
- Supabase free tier fino a 500 MB DB e 50 k MAU; piano Pro = 25 $/mese circa
- Dominio: 10–15 €/anno

Totale infra: **≈ 30 €/mese** quando si cresce oltre il free tier.

---

## Fattori che spostano il preventivo

**In alto** (aumentano il costo):
- Design system da zero completamente custom (+ 3 giorni)
- Conformità GDPR spinta con DPA, data processing agreement, cookie banner avanzato (+ 2 giorni)
- Traduzioni multilingua (+ 1,5 giorni per lingua)
- Integrazione con cronometro/macchina della scherma (+ 5–8 giorni, dipende dall'API del fornitore)
- Test automatizzati E2E (Playwright) su più browser (+ 4 giorni)
- Accessibilità WCAG AA certificata con audit indipendente (+ 3 giorni)

**In basso** (riducono il costo):
- Palette e tipografia preconfezionate (-1,5 giorni sul design system)
- Nessun import Excel, dati inseriti a mano (-3 giorni)
- Solo layout desktop, niente tablet-first (-4 giorni, ma è un errore strategico)
- Usare shadcn/ui sub-tema sport invece di componenti custom (-2 giorni sul design system)
- Riuso del prototipo HTML come base del front-end (-3 giorni sul setup)

---

## La mia raccomandazione

Se fossi nella tua stanza al tavolo di lavoro, la sequenza che proporrei è:

1. **Partire da Tier 1 (Demo clickabile).** 2 settimane, sotto i 3 k €. È il "vaccino" che protegge dal rischio di investire 20 k € in un prodotto che poi le squadre non comprano. Il cliente ha in mano qualcosa di presentabile, va in 5 squadre target, raccoglie feedback reale.

2. **Usare il feedback per decidere tra Tier 2 e Tier 3.** Se almeno 1–2 squadre dicono "se costa X io firmerei", puntare dritto a Tier 3. Se invece il feedback è "bello, ma prima voglio vederti registrare un match reale", Tier 2 è un ottimo ponte. Tier 2 → Tier 3 è fattibile senza buttare niente del lavoro fatto.

3. **Tier 4 arriva come evoluzione**, non come partenza. Richiede una conversazione di posizionamento (la squadra/club pilota esiste? la FIS è al tavolo? c'è uno sponsor?) che oggi probabilmente non è matura.

Traduzione in budget: **consigliato partire con un impegno di 2–3 k €** (Tier 1) per i primi 14 giorni, poi decidere se committere altri 10 k (Tier 2) o 17–20 k (Tier 3) sulla base di dati reali. È la via che minimizza il rischio senza rallentare la roadmap.

---

## Prossimi passi

1. Validare con il cliente quale tier corrisponde al suo appetito di rischio e al suo budget effettivo.
2. Decidere arma MVP definitiva (oggi: **fioretto**, da confermare).
3. Chiudere le domande aperte del documento `Design-Spec-MVP.md` (sezione 13).
4. Firmare proposta + anticipo → kick-off.
5. Daily/weekly di avanzamento (Slack o simili) + demo ogni due settimane.

*Tutti i costi sono IVA esclusa. Offerta valida 30 giorni. Tariffa giornaliera indicizzata al mercato Italia 2026.*
