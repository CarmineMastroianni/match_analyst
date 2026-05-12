# Scherma · Match Analyst — Front-end MVP (mock)

Front-end React/TypeScript dell'app **Scherma — Match Analyst**, portato sul prototipo HTML del cliente.
Tutto il back-end è **mockato su localStorage** tramite Zustand `persist`: nessuna chiamata HTTP, nessuna autenticazione reale, nessun parsing Excel, nessun PDF. Obiettivo: avere un demo navigabile per club e federazioni.

## Stack

- Vite + React 18 + TypeScript (strict)
- Tailwind CSS (`darkMode: 'class'`) con tokens del prototipo
- React Router v6 (BrowserRouter)
- Zustand + `persist` (localStorage)
- React Hook Form + Zod
- Recharts (donut, efficacy bar, trend)
- Framer Motion (micro-interazioni live)
- lucide-react (icone)

Niente shadcn/ui: per mantenere l'identità sportiva del prototipo i componenti UI sono scritti a mano.

## Avvio

```bash
npm install
npm run dev
```

L'app gira su <http://localhost:5173>.

### Reset stato locale

Aggiungere `?reset=1` all'URL (es. `http://localhost:5173/?reset=1`) per svuotare `localStorage` e ricaricare. Verrà riapplicato il seed mock.

## Cosa è mockato

| Area | Stato |
|------|-------|
| Auth | finta: due demo (`analyst` / `team_viewer`) salvate in `useAuthStore` |
| Persistenza | `localStorage` via Zustand `persist`, uno store per dominio |
| Atleti / squadre / match | seed deterministico generato a primo avvio |
| Live match | logica V2 fioretto (5 azioni Sì/No) implementata client-side |
| Import Excel | UI presente, download CSV template ok, parser **non** implementato |
| Report PDF | bottone presente, disabled |

## Stato sviluppo

Vedi `Piano-Implementazione-Preventivi.md` nella root del repo. Questo modulo copre l'evoluzione **Tier 1 → base Tier 2** (mock end-to-end).

## Prossimi passi (oltre questo modulo)

- **Tier 2**: sostituire gli store mock con client Supabase, RLS, auth reale, PWA installabile, sync offline base.
- **Tier 3**: ruolo team viewer separato, IndexedDB outbox, import Excel reale, export CSV, audit trail.
- **Tier 4**: multi-arma, incontri a squadre (9 assalti), report PDF brandizzati, landing page.
