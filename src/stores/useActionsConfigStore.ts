import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ActionType, ID, Weapon } from "../types/domain";

interface ActionsConfigState {
  actions: Record<ID, ActionType>;
  list: () => ActionType[];
  byWeapon: (w: Weapon) => ActionType[];
  mainActive: (w: Weapon) => ActionType[];
  setAll: (actions: ActionType[]) => void;
  upsert: (a: ActionType) => void;
  toggleActive: (id: ID) => void;
  toggleMain: (id: ID) => void;
  reorder: (weapon: Weapon, orderedIds: ID[]) => void;
  reset: () => void;
}

export const useActionsConfigStore = create<ActionsConfigState>()(
  persist(
    (set, get) => ({
      actions: {},
      list: () =>
        Object.values(get().actions).sort((a, b) => a.sortOrder - b.sortOrder),
      byWeapon: (w) => get().list().filter((a) => a.weapon === w),
      mainActive: (w) =>
        get().byWeapon(w).filter((a) => a.active && a.isMain),
      setAll: (actions) => {
        const map: Record<ID, ActionType> = {};
        for (const a of actions) map[a.id] = a;
        set({ actions: map });
      },
      upsert: (a) => set((s) => ({ actions: { ...s.actions, [a.id]: a } })),
      toggleActive: (id) =>
        set((s) => {
          const cur = s.actions[id];
          if (!cur) return s;
          return { actions: { ...s.actions, [id]: { ...cur, active: !cur.active } } };
        }),
      toggleMain: (id) =>
        set((s) => {
          const cur = s.actions[id];
          if (!cur) return s;
          return { actions: { ...s.actions, [id]: { ...cur, isMain: !cur.isMain } } };
        }),
      reorder: (weapon, orderedIds) =>
        set((s) => {
          const next = { ...s.actions };
          orderedIds.forEach((id, idx) => {
            const cur = next[id];
            if (cur && cur.weapon === weapon) next[id] = { ...cur, sortOrder: idx };
          });
          return { actions: next };
        }),
      reset: () => set({ actions: {} }),
    }),
    {
      name: "scherma:actions-config:v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
