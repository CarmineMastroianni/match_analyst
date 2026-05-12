import type {
  ActionEvent,
  ActionType,
  Athlete,
  ID,
  Match,
  Team,
} from "../types/domain";
import { makeId, hash32 } from "../utils/ids";

const FIRST_M = [
  "Alessandro", "Lorenzo", "Matteo", "Tommaso", "Riccardo",
  "Giulio", "Federico", "Davide", "Luca", "Marco",
  "Andrea", "Stefano", "Filippo", "Simone", "Niccolò",
  "Giovanni", "Edoardo", "Pietro", "Daniele", "Gabriele",
  "Leonardo", "Cristian", "Mattia", "Samuele", "Diego",
  "Enrico", "Fabio", "Vincenzo", "Antonio", "Paolo",
];

const FIRST_F = [
  "Giulia", "Sofia", "Aurora", "Martina", "Chiara",
  "Alice", "Anna", "Sara", "Emma", "Beatrice",
  "Francesca", "Ginevra", "Vittoria", "Carlotta", "Greta",
  "Camilla", "Eleonora", "Bianca", "Margherita", "Viola",
  "Arianna", "Elisa", "Noemi", "Lucia", "Isabella",
  "Cecilia", "Veronica", "Adele", "Linda", "Matilde",
];

const LAST = [
  "Rossi", "Bianchi", "Romano", "Conti", "Esposito",
  "Greco", "Russo", "Ferrari", "Bruno", "Marino",
  "Costa", "Galli", "Riva", "Sala", "Villa",
  "Moretti", "Barbieri", "Fontana", "Caruso", "Mancini",
  "Rinaldi", "Serra", "Colombo", "Lombardi", "Vitale",
  "Pellegrini", "Gentile", "De Luca", "Martini", "Palumbo",
];

const CLUBS = [
  { name: "CS Fiamme Oro", city: "Roma" },
  { name: "Pro Patria Scherma", city: "Milano" },
  { name: "Club Scherma Torino", city: "Torino" },
  { name: "Circolo Schermistico Bolognese", city: "Bologna" },
  { name: "AS Scherma Napoli", city: "Napoli" },
  { name: "Sala Scherma Firenze", city: "Firenze" },
];

const VENUES = [
  "PalaPellicone, Ostia",
  "PalaVesuvio, Napoli",
  "PalaScherma, Torino",
  "Palasport Bologna",
  "Centro Federale FIS, Modena",
];

const COMPS = [
  "Coppa Italia U20",
  "Campionato Italiano Assoluti",
  "Open Internazionale Roma",
  "Trofeo Carroccio",
  "Gran Premio Giovanissimi",
];

// ====== ACTION CATALOG V2 FIORETTO ======
export function buildDefaultActions(): ActionType[] {
  return [
    {
      id: "act_attacco-lungo",
      label: "Attacco lungo",
      code: "ATL",
      weapon: "foil",
      color: "red",
      active: true,
      isMain: true,
      subYes: [],
      subNo: ["Corto", "Parata", "Controattacco"],
      sortOrder: 0,
    },
    {
      id: "act_attacco-buca",
      label: "Attacco buca preparazione",
      code: "ATB",
      weapon: "foil",
      color: "red-hot",
      active: true,
      isMain: true,
      subYes: ["Uguale", "Lo ↗"],
      subNo: ["Corto", "Parata", "Controattacco"],
      sortOrder: 1,
    },
    {
      id: "act_difesa-misura-centro",
      label: "Difesa di misura al centro",
      code: "DMC",
      weapon: "foil",
      color: "blue",
      active: true,
      isMain: true,
      subYes: [],
      subNo: [],
      noPlaceholder: "Da definire",
      sortOrder: 2,
    },
    {
      id: "act_difesa",
      label: "Difesa",
      code: "DIF",
      weapon: "foil",
      color: "blue-hi",
      active: true,
      isMain: true,
      subYes: [],
      subNo: ["Difesa di misura", "Parata", "Controattacco"],
      sortOrder: 3,
    },
    {
      id: "act_attacco-diretto-centro",
      label: "Attacco diretto al centro",
      code: "ADC",
      weapon: "foil",
      color: "warn",
      active: true,
      isMain: true,
      subYes: ["Parata", "Controattacco", "Difesa di misura"],
      subNo: ["Parata", "Controattacco", "Difesa di misura"],
      equalWeights: true,
      sortOrder: 4,
    },
  ];
}

type Category = "Senior" | "U20" | "U17" | "U14";

function pick<T>(arr: readonly T[], i: number): T {
  const v = arr[i % arr.length];
  if (v === undefined) throw new Error("pick: empty");
  return v;
}

function pseudoRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// ====== TEAMS + ATHLETES ======
export interface SeedBundle {
  teams: Team[];
  athletes: Athlete[];
  matches: Match[];
  events: Record<ID, ActionEvent[]>;
  actions: ActionType[];
}

export function buildSeed(): SeedBundle {
  const rng = pseudoRandom(20260512);
  const teams: Team[] = [];
  const athletes: Athlete[] = [];

  // 12 squadre: 6M + 6F
  CLUBS.forEach((c, idx) => {
    (["M", "F"] as const).forEach((cat) => {
      const id = `team_${idx}_${cat}`;
      teams.push({
        id,
        name: `${c.name} ${cat}`,
        club: c.city,
        category: cat,
        roster: [],
        lineup: [],
        crestSeed: c.name + cat,
      });
    });
  });

  // 30M + 30F atleti, distribuiti
  const buildSet = (count: number, sex: "M" | "F") => {
    const firstPool = sex === "M" ? FIRST_M : FIRST_F;
    const teamsOfSex = teams.filter((t) => t.category === sex);
    for (let i = 0; i < count; i++) {
      const fn = pick(firstPool, i);
      const ln = pick(LAST, Math.floor(i * 1.7));
      const team = teamsOfSex[i % teamsOfSex.length];
      if (!team) continue;
      const age = 16 + Math.floor(rng() * 18);
      const birthYear = 2026 - age;
      const cat: Category =
        age >= 21 ? "Senior" : age >= 18 ? "U20" : age >= 15 ? "U17" : "U14";
      const ath: Athlete = {
        id: `ath_${sex}_${i}`,
        firstName: fn,
        lastName: ln,
        birthDate: `${birthYear}-0${1 + (i % 9)}-1${i % 9}`,
        sex,
        hand: rng() > 0.85 ? "L" : "R",
        category: cat,
        teamIds: [team.id],
        photoSeed: `${fn} ${ln}`,
      };
      athletes.push(ath);
      team.roster.push(ath.id);
      if (team.lineup.length < 6) team.lineup.push(ath.id);
    }
  };
  buildSet(30, "M");
  buildSet(30, "F");

  const actions = buildDefaultActions();
  const matches: Match[] = [];
  const events: Record<ID, ActionEvent[]> = {};
  const analystId = "user_analyst";

  // Costruzione match storici + 1 live
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  function makeMatchPair(athA: Athlete, athB: Athlete, dayOffset: number, status: Match["status"]) {
    const mId = makeId("mt");
    const date = new Date(now - dayOffset * dayMs).toISOString();
    const targetScore = rng() > 0.5 ? 15 : 5;
    const evs: ActionEvent[] = [];
    let sA = 0;
    let sB = 0;
    const totalPoints = status === "live" ? Math.floor(targetScore * 0.5) : targetScore + Math.floor(rng() * (targetScore - 1));
    let safety = 0;
    while ((sA < targetScore && sB < targetScore) && (sA + sB) < totalPoints && safety < 60) {
      safety++;
      const aTurn = rng() > 0.5;
      const actor = aTurn ? athA : athB;
      const opp = aTurn ? athB : athA;
      const act = pick(actions, Math.floor(rng() * actions.length));
      const choice: "yes" | "no" = rng() > 0.45 ? "yes" : "no";
      if (choice === "yes") {
        if (aTurn) sA++;
        else sB++;
      } else {
        if (aTurn) sB++;
        else sA++;
      }
      const minutes = Math.floor((sA + sB) * 0.7);
      const seconds = Math.floor(rng() * 60);
      evs.push({
        id: makeId("ev"),
        matchId: mId,
        athleteId: actor.id,
        actionTypeId: act.id,
        choice,
        timestamp: date,
        matchTime: `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        opponentId: opp.id,
        scoreAfter: { A: sA, B: sB },
      });
    }
    const m: Match = {
      id: mId,
      date,
      venue: pick(VENUES, Math.floor(rng() * VENUES.length)),
      competition: pick(COMPS, Math.floor(rng() * COMPS.length)),
      weapon: "foil",
      format: targetScore === 15 ? "a15" : "a5",
      athleteAId: athA.id,
      athleteBId: athB.id,
      teamAId: athA.teamIds[0],
      teamBId: athB.teamIds[0],
      scoreA: sA,
      scoreB: sB,
      status,
      analystId,
    };
    matches.push(m);
    events[mId] = evs;
  }

  // ~30 match conclusi negli ultimi 90 gg
  for (let i = 0; i < 30; i++) {
    const sex: "M" | "F" = rng() > 0.5 ? "M" : "F";
    const pool = athletes.filter((a) => a.sex === sex);
    const a = pick(pool, Math.floor(rng() * pool.length));
    let b = pick(pool, Math.floor(rng() * pool.length));
    let safety = 0;
    while (b.id === a.id && safety < 10) {
      b = pick(pool, Math.floor(rng() * pool.length));
      safety++;
    }
    makeMatchPair(a, b, Math.floor(rng() * 90) + 1, "done");
  }

  // 1 match LIVE (oggi)
  const liveA = athletes.find((a) => a.sex === "M");
  const liveB = athletes.find((a) => a.sex === "M" && a !== liveA);
  if (liveA && liveB) makeMatchPair(liveA, liveB, 0, "live");

  // 2 match planned (prossimi giorni)
  for (let i = 0; i < 2; i++) {
    const sex: "M" | "F" = i === 0 ? "F" : "M";
    const pool = athletes.filter((a) => a.sex === sex);
    const a = pool[i * 3];
    const b = pool[i * 3 + 1];
    if (a && b) {
      const mId = makeId("mt");
      const date = new Date(now + (i + 1) * dayMs).toISOString();
      matches.push({
        id: mId,
        date,
        venue: pick(VENUES, i),
        competition: pick(COMPS, i),
        weapon: "foil",
        format: "a15",
        athleteAId: a.id,
        athleteBId: b.id,
        teamAId: a.teamIds[0],
        teamBId: b.teamIds[0],
        scoreA: 0,
        scoreB: 0,
        status: "planned",
        analystId,
      });
      events[mId] = [];
    }
  }

  return { teams, athletes, matches, events, actions };
}

export function seedDeterministicGradient(name: string): number {
  return hash32(name);
}
