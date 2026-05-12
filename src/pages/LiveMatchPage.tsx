import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ActionRow } from "../components/live/ActionRow";
import { OfflineBadge } from "../components/live/OfflineBadge";
import { useMatchesStore } from "../stores/useMatchesStore";
import { useAthletesStore } from "../stores/useAthletesStore";
import { useActionsConfigStore } from "../stores/useActionsConfigStore";
import { useLiveMatchStore } from "../stores/useLiveMatchStore";
import type { ActionEvent } from "../types/domain";
import { makeId } from "../utils/ids";
import { fmtMatchTime } from "../utils/format";
import { Pause, Play, RotateCcw, Square, X } from "lucide-react";

export function LiveMatchPage() {
  const { id = "" } = useParams();
  const nav = useNavigate();

  const match = useMatchesStore((s) => s.get(id));
  const aGet = useAthletesStore((s) => s.get);
  const events = useMatchesStore((s) => s.events[id] ?? []);
  const actions = useActionsConfigStore((s) => s.mainActive("foil"));
  const pushEvent = useMatchesStore((s) => s.pushEvent);
  const popLastEvent = useMatchesStore((s) => s.popLastEvent);
  const updateScore = useMatchesStore((s) => s.updateScore);
  const setStatus = useMatchesStore((s) => s.setStatus);

  const live = useLiveMatchStore();

  useEffect(() => {
    if (!match) return;
    if (live.activeMatchId !== match.id) live.startMatch(match.id);
    const t = setInterval(() => live.tick(), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match?.id]);

  const sideStats = useMemo(() => {
    const map = new Map<string, { a: { yes: number; no: number }; b: { yes: number; no: number } }>();
    if (!match) return map;
    for (const a of actions) map.set(a.id, { a: { yes: 0, no: 0 }, b: { yes: 0, no: 0 } });
    for (const e of events) {
      const cur = map.get(e.actionTypeId);
      if (!cur) continue;
      const side = e.athleteId === match.athleteAId ? "a" : "b";
      if (e.choice === "yes") cur[side].yes++;
      else cur[side].no++;
    }
    return map;
  }, [events, actions, match]);

  if (!match) {
    return (
      <div className="min-h-screen bg-bg-dark text-white flex items-center justify-center">
        Match non trovato.
      </div>
    );
  }
  const athA = aGet(match.athleteAId);
  const athB = aGet(match.athleteBId);
  if (!athA || !athB) return null;

  function recordAction(
    side: "A" | "B",
    actionTypeId: string,
    choice: "yes" | "no",
    subLabel: string | undefined,
  ) {
    if (!match) return;
    const actor = side === "A" ? match.athleteAId : match.athleteBId;
    const opp = side === "A" ? match.athleteBId : match.athleteAId;
    // "Sì" = punto all'atleta che ha eseguito; "No" = punto all'avversario.
    const pointTo: "A" | "B" =
      choice === "yes" ? side : side === "A" ? "B" : "A";
    const newA = pointTo === "A" ? match.scoreA + 1 : match.scoreA;
    const newB = pointTo === "B" ? match.scoreB + 1 : match.scoreB;
    const ev: ActionEvent = {
      id: makeId("ev"),
      matchId: match.id,
      athleteId: actor,
      actionTypeId,
      choice,
      timestamp: new Date().toISOString(),
      matchTime: fmtMatchTime(live.elapsedSeconds),
      opponentId: opp,
      scoreAfter: { A: newA, B: newB },
      subLabel,
    };
    pushEvent(match.id, ev);
    updateScore(match.id, newA, newB);
    live.pushRecent(ev.id);
    live.noteLastChoice(actor, choice);

    // Auto-fine match al raggiungimento del target
    const target = match.format === "a5" ? 5 : 15;
    if (newA >= target || newB >= target) {
      setStatus(match.id, "done");
      live.endMatch();
      setTimeout(() => nav(`/match/${match.id}/recap`), 400);
    }
  }

  function undo() {
    if (!match) return;
    const ev = popLastEvent(match.id);
    if (!ev) return;
    // Ricalcolo scoreAfter dall'evento precedente.
    const all = (useMatchesStore.getState().events[match.id] ?? []);
    const last = all[all.length - 1];
    const newA = last ? last.scoreAfter.A : 0;
    const newB = last ? last.scoreAfter.B : 0;
    updateScore(match.id, newA, newB);
    live.popRecent();
  }

  function endMatch() {
    if (!match) return;
    setStatus(match.id, "done");
    live.endMatch();
    nav(`/match/${match.id}/recap`);
  }

  return (
    <div className="min-h-screen bg-bg-dark text-white flex flex-col">
      {/* TOP BAR */}
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => nav("/")} className="text-text-dim hover:text-white" aria-label="Chiudi">
            <X size={18} />
          </button>
          <Badge tone="red">LIVE · {match.format.toUpperCase()}</Badge>
          <span className="text-xs text-text-dim">{match.competition ?? "—"}</span>
        </div>
        <div className="flex items-center gap-3">
          <OfflineBadge />
          <div className="font-cond font-bold text-xl tabular-nums">
            {fmtMatchTime(live.elapsedSeconds)}
          </div>
          <Button variant="dark" size="sm" onClick={() => live.togglePause()} icon={live.paused ? <Play size={14} /> : <Pause size={14} />}>
            {live.paused ? "Riprendi" : "Pausa"}
          </Button>
        </div>
      </div>

      {/* SCORE + PLAYERS */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 px-5 py-5 items-center border-b border-border">
        {/* A */}
        <div className="flex items-center gap-4">
          <Avatar firstName={athA.firstName} lastName={athA.lastName} size={64} />
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-widest2 text-text-dim font-cond">Atleta A</div>
            <div className="font-cond font-bold uppercase text-2xl truncate">
              {athA.firstName} {athA.lastName}
            </div>
          </div>
        </div>
        {/* CENTER SCORE */}
        <div className="text-center px-6">
          <div className="font-cond font-extrabold text-7xl leading-none tabular-nums">
            <span className={match.scoreA > match.scoreB ? "text-brand-red-hot" : ""}>{match.scoreA}</span>
            <span className="text-text-dim mx-3">:</span>
            <span className={match.scoreB > match.scoreA ? "text-brand-red-hot" : ""}>{match.scoreB}</span>
          </div>
          <div className="text-[11px] uppercase tracking-widest2 text-text-dim mt-2 font-cond">
            Target {match.format === "a5" ? 5 : 15}
          </div>
          <div className="flex gap-2 justify-center mt-3">
            <Button variant="dark" size="sm" onClick={undo} icon={<RotateCcw size={14} />}>
              Undo
            </Button>
            <Button variant="danger" size="sm" onClick={endMatch} icon={<Square size={14} />}>
              Fine
            </Button>
          </div>
        </div>
        {/* B */}
        <div className="flex items-center gap-4 justify-end text-right">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-widest2 text-text-dim font-cond">Atleta B</div>
            <div className="font-cond font-bold uppercase text-2xl truncate">
              {athB.firstName} {athB.lastName}
            </div>
          </div>
          <Avatar firstName={athB.firstName} lastName={athB.lastName} size={64} />
        </div>
      </div>

      {/* ACTION ROWS V2 */}
      <div className="flex-1 px-5 py-4">
        {actions.length === 0 ? (
          <div className="text-text-dim text-sm">Nessuna azione attiva. Configura le azioni nel pannello impostazioni.</div>
        ) : (
          actions.map((act) => {
            const s = sideStats.get(act.id) ?? { a: { yes: 0, no: 0 }, b: { yes: 0, no: 0 } };
            return (
              <ActionRow
                key={act.id}
                action={act}
                athleteAStats={s.a}
                athleteBStats={s.b}
                onTap={(side, choice, subLabel) => recordAction(side, act.id, choice, subLabel)}
              />
            );
          })
        )}
        <div className="text-[11px] text-text-dim mt-4 px-1">
          {`Sì = punto all'atleta · No = punto all'avversario. Le sub-opzioni vengono salvate insieme all'azione.`}
        </div>
      </div>
    </div>
  );
}
