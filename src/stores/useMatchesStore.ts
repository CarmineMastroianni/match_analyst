import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ActionEvent, ID, Match } from "../types/domain";
import { makeId } from "../utils/ids";

interface MatchesState {
  matches: Record<ID, Match>;
  /** Storia eventi per match. Indicizzata per matchId. */
  events: Record<ID, ActionEvent[]>;

  list: () => Match[];
  get: (id: ID) => Match | undefined;
  byAthlete: (athleteId: ID) => Match[];
  byTeam: (teamId: ID) => Match[];
  eventsOf: (matchId: ID) => ActionEvent[];
  eventsOfAthlete: (athleteId: ID) => ActionEvent[];

  setAll: (matches: Match[], events: Record<ID, ActionEvent[]>) => void;
  upsertMatch: (input: Omit<Match, "id"> & { id?: ID }) => Match;
  updateScore: (id: ID, scoreA: number, scoreB: number) => void;
  setStatus: (id: ID, status: Match["status"]) => void;
  pushEvent: (matchId: ID, ev: ActionEvent) => void;
  popLastEvent: (matchId: ID) => ActionEvent | undefined;
  setNotes: (id: ID, notes: string) => void;
  remove: (id: ID) => void;
  reset: () => void;
}

export const useMatchesStore = create<MatchesState>()(
  persist(
    (set, get) => ({
      matches: {},
      events: {},

      list: () =>
        Object.values(get().matches).sort((a, b) => (a.date < b.date ? 1 : -1)),
      get: (id) => get().matches[id],
      byAthlete: (athleteId) =>
        get().list().filter((m) => m.athleteAId === athleteId || m.athleteBId === athleteId),
      byTeam: (teamId) =>
        get().list().filter((m) => m.teamAId === teamId || m.teamBId === teamId),
      eventsOf: (matchId) => get().events[matchId] ?? [],
      eventsOfAthlete: (athleteId) => {
        const all = get().events;
        const out: ActionEvent[] = [];
        for (const list of Object.values(all)) {
          for (const e of list) if (e.athleteId === athleteId) out.push(e);
        }
        return out;
      },

      setAll: (matches, events) => {
        const map: Record<ID, Match> = {};
        for (const m of matches) map[m.id] = m;
        set({ matches: map, events });
      },

      upsertMatch: (input) => {
        const id = input.id ?? makeId("mt");
        const next: Match = { ...input, id };
        set((s) => ({
          matches: { ...s.matches, [id]: next },
          events: s.events[id] ? s.events : { ...s.events, [id]: [] },
        }));
        return next;
      },

      updateScore: (id, scoreA, scoreB) =>
        set((s) => {
          const cur = s.matches[id];
          if (!cur) return s;
          return { matches: { ...s.matches, [id]: { ...cur, scoreA, scoreB } } };
        }),

      setStatus: (id, status) =>
        set((s) => {
          const cur = s.matches[id];
          if (!cur) return s;
          return { matches: { ...s.matches, [id]: { ...cur, status } } };
        }),

      pushEvent: (matchId, ev) =>
        set((s) => ({
          events: { ...s.events, [matchId]: [...(s.events[matchId] ?? []), ev] },
        })),

      popLastEvent: (matchId) => {
        const list = get().events[matchId] ?? [];
        if (list.length === 0) return undefined;
        const last = list[list.length - 1];
        set((s) => ({
          events: { ...s.events, [matchId]: list.slice(0, -1) },
        }));
        return last;
      },

      setNotes: (id, notes) =>
        set((s) => {
          const cur = s.matches[id];
          if (!cur) return s;
          return { matches: { ...s.matches, [id]: { ...cur, notes } } };
        }),

      remove: (id) =>
        set((s) => {
          const { [id]: _m, ...rest } = s.matches;
          const { [id]: _e, ...evRest } = s.events;
          void _m;
          void _e;
          return { matches: rest, events: evRest };
        }),

      reset: () => set({ matches: {}, events: {} }),
    }),
    { name: "scherma:matches:v1", storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);
