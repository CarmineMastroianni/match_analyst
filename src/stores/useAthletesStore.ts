import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Athlete, ID } from "../types/domain";
import { makeId } from "../utils/ids";

interface AthletesState {
  athletes: Record<ID, Athlete>;
  /** Inizializzato a true solo dopo seed iniziale, per evitare doppio seeding. */
  seeded: boolean;

  // ----- selectors helpers (state-derived) -----
  list: () => Athlete[];
  get: (id: ID) => Athlete | undefined;
  byTeam: (teamId: ID) => Athlete[];

  // ----- mutations -----
  setAll: (athletes: Athlete[]) => void;
  upsert: (input: Omit<Athlete, "id"> & { id?: ID }) => Athlete;
  remove: (id: ID) => void;
  markSeeded: () => void;
  reset: () => void;
}

export const useAthletesStore = create<AthletesState>()(
  persist(
    (set, get) => ({
      athletes: {},
      seeded: false,

      list: () =>
        Object.values(get().athletes).sort((a, b) =>
          `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, "it"),
        ),
      get: (id) => get().athletes[id],
      byTeam: (teamId) => get().list().filter((a) => a.teamIds.includes(teamId)),

      setAll: (athletes) => {
        const map: Record<ID, Athlete> = {};
        for (const a of athletes) map[a.id] = a;
        set({ athletes: map });
      },

      upsert: (input) => {
        const id = input.id ?? makeId("ath");
        const next: Athlete = { ...input, id };
        set((s) => ({ athletes: { ...s.athletes, [id]: next } }));
        return next;
      },

      remove: (id) =>
        set((s) => {
          const { [id]: _removed, ...rest } = s.athletes;
          void _removed;
          return { athletes: rest };
        }),

      markSeeded: () => set({ seeded: true }),

      reset: () => set({ athletes: {}, seeded: false }),
    }),
    {
      name: "scherma:athletes:v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
