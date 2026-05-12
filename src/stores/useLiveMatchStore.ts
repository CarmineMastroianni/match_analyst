import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ActionChoice, ID } from "../types/domain";

interface LiveMatchState {
  /** Match attualmente in live (un solo live alla volta). */
  activeMatchId: ID | null;
  /** Secondi trascorsi dall'inizio (cronometro semplice). */
  elapsedSeconds: number;
  /** Pausa cronometro. */
  paused: boolean;
  /** Badge offline simulato. */
  offline: boolean;
  /** Stack di eventi recenti per undo (ultimi 10). */
  recentEventIds: ID[];

  startMatch: (matchId: ID) => void;
  endMatch: () => void;
  tick: () => void;
  togglePause: () => void;
  toggleOffline: () => void;
  pushRecent: (eventId: ID) => void;
  popRecent: () => ID | undefined;
  reset: () => void;

  // helper per persistere il dato derivato "ultima azione tap" per micro feedback
  lastChoice: { athleteId: ID; choice: ActionChoice; at: number } | null;
  noteLastChoice: (athleteId: ID, choice: ActionChoice) => void;
}

export const useLiveMatchStore = create<LiveMatchState>()(
  persist(
    (set, get) => ({
      activeMatchId: null,
      elapsedSeconds: 0,
      paused: false,
      offline: false,
      recentEventIds: [],
      lastChoice: null,

      startMatch: (matchId) =>
        set({ activeMatchId: matchId, elapsedSeconds: 0, paused: false, recentEventIds: [] }),
      endMatch: () => set({ activeMatchId: null, paused: true }),
      tick: () => {
        if (get().paused || !get().activeMatchId) return;
        set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 }));
      },
      togglePause: () => set((s) => ({ paused: !s.paused })),
      toggleOffline: () => set((s) => ({ offline: !s.offline })),
      pushRecent: (eventId) =>
        set((s) => ({ recentEventIds: [...s.recentEventIds, eventId].slice(-10) })),
      popRecent: () => {
        const arr = get().recentEventIds;
        if (arr.length === 0) return undefined;
        const last = arr[arr.length - 1];
        set({ recentEventIds: arr.slice(0, -1) });
        return last;
      },
      noteLastChoice: (athleteId, choice) =>
        set({ lastChoice: { athleteId, choice, at: Date.now() } }),
      reset: () =>
        set({
          activeMatchId: null,
          elapsedSeconds: 0,
          paused: false,
          offline: false,
          recentEventIds: [],
          lastChoice: null,
        }),
    }),
    { name: "scherma:live:v1", storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);
