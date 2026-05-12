import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ID, Team } from "../types/domain";
import { makeId } from "../utils/ids";

interface TeamsState {
  teams: Record<ID, Team>;
  list: () => Team[];
  get: (id: ID) => Team | undefined;
  setAll: (teams: Team[]) => void;
  upsert: (input: Omit<Team, "id"> & { id?: ID }) => Team;
  remove: (id: ID) => void;
  reset: () => void;
}

export const useTeamsStore = create<TeamsState>()(
  persist(
    (set, get) => ({
      teams: {},
      list: () => Object.values(get().teams).sort((a, b) => a.name.localeCompare(b.name, "it")),
      get: (id) => get().teams[id],
      setAll: (teams) => {
        const map: Record<ID, Team> = {};
        for (const t of teams) map[t.id] = t;
        set({ teams: map });
      },
      upsert: (input) => {
        const id = input.id ?? makeId("team");
        const next: Team = { ...input, id };
        set((s) => ({ teams: { ...s.teams, [id]: next } }));
        return next;
      },
      remove: (id) =>
        set((s) => {
          const { [id]: _, ...rest } = s.teams;
          void _;
          return { teams: rest };
        }),
      reset: () => set({ teams: {} }),
    }),
    { name: "scherma:teams:v1", storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);
