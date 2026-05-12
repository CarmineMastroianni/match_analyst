import { useMemo } from "react";
import type { ActionEvent, ActionStats, ActionType, ID } from "../types/domain";
import { useMatchesStore } from "../stores/useMatchesStore";
import { useActionsConfigStore } from "../stores/useActionsConfigStore";

const COLOR_MAP: Record<string, string> = {
  red: "#C8102E",
  "red-hot": "#E11D3C",
  blue: "#1E3A8A",
  "blue-hi": "#3B5FD9",
  warn: "#F59E0B",
  ok: "#10B981",
  green: "#22C55E",
  danger: "#EF4444",
};

export function actionColor(a: Pick<ActionType, "color">): string {
  return COLOR_MAP[a.color] ?? "#1E3A8A";
}

function statsFromEvents(events: ActionEvent[], actions: ActionType[]): ActionStats[] {
  return actions.map((act) => {
    const ofAct = events.filter((e) => e.actionTypeId === act.id);
    const yes = ofAct.filter((e) => e.choice === "yes").length;
    const no = ofAct.length - yes;
    return {
      actionTypeId: act.id,
      total: ofAct.length,
      yes,
      no,
      successRate: ofAct.length === 0 ? 0 : yes / ofAct.length,
    };
  });
}

export function useAthleteStats(athleteId: ID) {
  const eventsAll = useMatchesStore((s) => s.events);
  const matches = useMatchesStore((s) => s.matches);
  const actions = useActionsConfigStore((s) => s.actions);

  return useMemo(() => {
    const events: ActionEvent[] = [];
    for (const list of Object.values(eventsAll)) {
      for (const e of list) if (e.athleteId === athleteId) events.push(e);
    }
    const matchIds = new Set(events.map((e) => e.matchId));
    let wins = 0;
    let losses = 0;
    matchIds.forEach((mid) => {
      const m = matches[mid];
      if (!m || m.status !== "done") return;
      const isA = m.athleteAId === athleteId;
      const myScore = isA ? m.scoreA : m.scoreB;
      const oppScore = isA ? m.scoreB : m.scoreA;
      if (myScore > oppScore) wins++;
      else if (myScore < oppScore) losses++;
    });
    const actionList = Object.values(actions).sort((a, b) => a.sortOrder - b.sortOrder);
    const byAction = statsFromEvents(events, actionList);
    return {
      events,
      matchesPlayed: matchIds.size,
      wins,
      losses,
      totalActions: events.length,
      byAction,
      actions: actionList,
    };
  }, [eventsAll, matches, actions, athleteId]);
}

export function useTeamStats(athleteIds: ID[]) {
  const eventsAll = useMatchesStore((s) => s.events);
  const actions = useActionsConfigStore((s) => s.actions);
  return useMemo(() => {
    const set = new Set(athleteIds);
    const events: ActionEvent[] = [];
    for (const list of Object.values(eventsAll)) {
      for (const e of list) if (set.has(e.athleteId)) events.push(e);
    }
    const actionList = Object.values(actions).sort((a, b) => a.sortOrder - b.sortOrder);
    const byAction = statsFromEvents(events, actionList);
    return { totalActions: events.length, byAction, actions: actionList };
  }, [eventsAll, actions, athleteIds]);
}

export function useMatchStats(matchId: ID, athleteId: ID) {
  const events = useMatchesStore((s) => s.events[matchId] ?? []);
  const actions = useActionsConfigStore((s) => s.actions);
  return useMemo(() => {
    const list = events.filter((e) => e.athleteId === athleteId);
    const actionList = Object.values(actions).sort((a, b) => a.sortOrder - b.sortOrder);
    return { events: list, byAction: statsFromEvents(list, actionList), actions: actionList };
  }, [events, actions, athleteId]);
}
