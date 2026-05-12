// Modello dati MVP — fonte: Design-Spec-MVP.md §4 + spec azioni V2 fioretto.
// Niente `any`. Tutto ISO string per date. ID = stringa opaca (ulid-like).

export type ID = string;

// -------- Atleta --------
export type Sex = "M" | "F" | "X";
export type Hand = "R" | "L";
export type AthleteCategory = "Senior" | "U20" | "U17" | "U14";

export interface Athlete {
  id: ID;
  firstName: string;
  lastName: string;
  birthDate: string; // ISO YYYY-MM-DD
  sex: Sex;
  hand: Hand;
  category: AthleteCategory;
  teamIds: ID[];
  /** seed deterministico per gradiente iniziali (hash del nome). */
  photoSeed: string;
  notes?: string;
}

// -------- Squadra --------
export type TeamCategory = "M" | "F";

export interface Team {
  id: ID;
  name: string;
  club: string;
  category: TeamCategory;
  /** Rosa completa. */
  roster: ID[];
  /** Formazione schierata: max 6, ordinata. */
  lineup: ID[];
  crestSeed: string;
}

// -------- Match --------
export type Weapon = "foil" | "epee" | "sabre"; // MVP usa solo "foil"
export type MatchFormat = "a5" | "a15" | "team9";
export type MatchStatus = "planned" | "live" | "done" | "cancelled";

export interface Match {
  id: ID;
  date: string; // ISO datetime
  venue?: string;
  competition?: string;
  weapon: Weapon;
  format: MatchFormat;
  athleteAId: ID;
  athleteBId: ID;
  teamAId?: ID;
  teamBId?: ID;
  scoreA: number;
  scoreB: number;
  status: MatchStatus;
  analystId: ID;
  /** Note libere post-match. */
  notes?: string;
}

// -------- Action Type (catalogo configurabile per arma) --------
/** Token palette ammesso per le tile azione. */
export type ActionColor =
  | "red"
  | "red-hot"
  | "blue"
  | "blue-hi"
  | "warn"
  | "ok"
  | "green"
  | "danger";

export interface ActionType {
  id: ID;
  label: string;
  code: string; // codice breve univoco per arma
  weapon: Weapon;
  color: ActionColor;
  active: boolean;
  /** Entra nelle "azioni principali" della pagina Live + torta. Max 6 per arma. */
  isMain: boolean;
  /** Etichette sub-opzioni mostrate quando l'azione finisce in "Sì". */
  subYes: string[];
  /** Etichette sub-opzioni mostrate quando l'azione finisce in "No". */
  subNo: string[];
  /** Se true, percentuali Sì/No partono bilanciate (es. attacco diretto al centro). */
  equalWeights?: boolean;
  /** Stringa mostrata al posto delle sub-opzioni quando subNo è vuoto. */
  noPlaceholder?: string;
  /** Ordine visivo nella schermata Live e in config. */
  sortOrder: number;
}

// -------- Action Event (tap sul live) --------
export type ActionChoice = "yes" | "no";

export interface ActionEvent {
  id: ID;
  matchId: ID;
  athleteId: ID;
  actionTypeId: ID;
  choice: ActionChoice;
  /** ISO datetime momento del tap. */
  timestamp: string;
  /** Tempo dell'assalto al momento del tap (mm:ss). */
  matchTime: string;
  opponentId: ID;
  /** Stato del tabellone DOPO l'applicazione del punto. */
  scoreAfter: { A: number; B: number };
  /** Sub-opzione eventualmente selezionata (display-only in MVP ma persistita). */
  subLabel?: string;
}

// -------- Utente / sessione --------
export type Role = "analyst" | "team_viewer";

export interface User {
  id: ID;
  email: string;
  role: Role;
  /** Solo per team_viewer: la squadra che può vedere in lettura. */
  teamId?: ID;
  name: string;
}

// -------- Aggregati derivati (non persistiti) --------
export interface ActionStats {
  actionTypeId: ID;
  total: number;
  yes: number;
  no: number;
  /** yes / total (0..1), 0 se total === 0. */
  successRate: number;
}

export interface AthleteAggregateStats {
  athleteId: ID;
  matchesPlayed: number;
  totalActions: number;
  wins: number;
  losses: number;
  byAction: ActionStats[];
}
