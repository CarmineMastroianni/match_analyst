import { useAthletesStore } from "../stores/useAthletesStore";
import { useTeamsStore } from "../stores/useTeamsStore";
import { useMatchesStore } from "../stores/useMatchesStore";
import { useActionsConfigStore } from "../stores/useActionsConfigStore";
import { buildSeed } from "./seed";

/** Inizializza gli store dal seed se vuoti. Chiamato una sola volta all'avvio. */
export function bootstrapMocks(): void {
  const aStore = useAthletesStore.getState();
  if (aStore.seeded && Object.keys(aStore.athletes).length > 0) return;

  const seed = buildSeed();
  useAthletesStore.getState().setAll(seed.athletes);
  useAthletesStore.getState().markSeeded();
  useTeamsStore.getState().setAll(seed.teams);
  useMatchesStore.getState().setAll(seed.matches, seed.events);
  useActionsConfigStore.getState().setAll(seed.actions);
}
