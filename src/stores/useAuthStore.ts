import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Role, User } from "../types/domain";

interface AuthState {
  user: User | null;
  loginAs: (role: Role, opts?: { teamId?: string; name?: string; email?: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loginAs: (role, opts) => {
        const user: User = {
          id: role === "analyst" ? "user_analyst" : "user_viewer",
          email: opts?.email ?? (role === "analyst" ? "analyst@demo.it" : "viewer@demo.it"),
          role,
          teamId: opts?.teamId,
          name: opts?.name ?? (role === "analyst" ? "Match Analyst" : "Team Viewer"),
        };
        set({ user });
      },
      logout: () => set({ user: null }),
    }),
    { name: "scherma:auth:v1", storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);
