import { useState } from "react";
import clsx from "clsx";
import type { ActionType } from "../../types/domain";
import { actionColor } from "../../hooks/useStats";

interface Stats {
  yes: number;
  no: number;
}

interface Props {
  action: ActionType;
  athleteAStats: Stats;
  athleteBStats: Stats;
  onTap: (
    side: "A" | "B",
    choice: "yes" | "no",
    subLabel: string | undefined,
  ) => void;
}

function pct(yes: number, no: number, equal?: boolean): { yes: number; no: number } {
  const tot = yes + no;
  if (tot === 0) return equal ? { yes: 50, no: 50 } : { yes: 0, no: 0 };
  const y = Math.round((yes / tot) * 100);
  return { yes: y, no: 100 - y };
}

export function ActionRow({ action, athleteAStats, athleteBStats, onTap }: Props) {
  const [openA, setOpenA] = useState(false);
  const [openB, setOpenB] = useState(false);
  const [pendingA, setPendingA] = useState<"yes" | "no" | null>(null);
  const [pendingB, setPendingB] = useState<"yes" | "no" | null>(null);

  const color = actionColor(action);
  const pA = pct(athleteAStats.yes, athleteAStats.no, action.equalWeights);
  const pB = pct(athleteBStats.yes, athleteBStats.no, action.equalWeights);

  function handle(side: "A" | "B", choice: "yes" | "no") {
    const subs = choice === "yes" ? action.subYes : action.subNo;
    if (subs.length === 0) {
      onTap(side, choice, undefined);
      return;
    }
    if (side === "A") {
      setOpenA(true);
      setPendingA(choice);
    } else {
      setOpenB(true);
      setPendingB(choice);
    }
  }

  function confirmSub(side: "A" | "B", label: string) {
    if (side === "A" && pendingA) {
      onTap("A", pendingA, label);
      setOpenA(false);
      setPendingA(null);
    } else if (side === "B" && pendingB) {
      onTap("B", pendingB, label);
      setOpenB(false);
      setPendingB(null);
    }
  }

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-stretch border-t border-border/60 py-2">
      {/* Atleta A — speculare (No a sinistra, Sì a destra) */}
      <SideBlock
        side="A"
        action={action}
        stats={athleteAStats}
        pYes={pA.yes}
        pNo={pA.no}
        color={color}
        onTap={(c) => handle("A", c)}
        showSubs={openA}
        pending={pendingA}
        onSub={(l) => confirmSub("A", l)}
        onCancelSub={() => {
          setOpenA(false);
          setPendingA(null);
        }}
      />
      <div className="flex items-center justify-center px-2">
        <div
          className="font-cond font-bold text-[11px] uppercase tracking-widest2 text-center leading-tight"
          style={{ color }}
        >
          <div>{action.code}</div>
          <div className="text-[10px] text-text-dim normal-case tracking-normal">
            {action.label}
          </div>
        </div>
      </div>
      <SideBlock
        side="B"
        action={action}
        stats={athleteBStats}
        pYes={pB.yes}
        pNo={pB.no}
        color={color}
        onTap={(c) => handle("B", c)}
        showSubs={openB}
        pending={pendingB}
        onSub={(l) => confirmSub("B", l)}
        onCancelSub={() => {
          setOpenB(false);
          setPendingB(null);
        }}
      />
    </div>
  );
}

function SideBlock({
  side,
  action,
  stats,
  pYes,
  pNo,
  color,
  onTap,
  showSubs,
  pending,
  onSub,
  onCancelSub,
}: {
  side: "A" | "B";
  action: ActionType;
  stats: Stats;
  pYes: number;
  pNo: number;
  color: string;
  onTap: (choice: "yes" | "no") => void;
  showSubs: boolean;
  pending: "yes" | "no" | null;
  onSub: (label: string) => void;
  onCancelSub: () => void;
}) {
  // "A" è a sinistra: ordine bottoni [No | Sì]. "B" è a destra: [Sì | No].
  const subs = pending === "yes" ? action.subYes : pending === "no" ? action.subNo : [];
  return (
    <div className="relative">
      <div className={clsx("grid grid-cols-2 gap-1", side === "B" && "grid-flow-col-dense")}>
        {/* NO button */}
        <button
          onClick={() => onTap("no")}
          aria-label={`${action.label} — No (${side})`}
          className={clsx(
            "min-h-[64px] flex flex-col items-center justify-center px-3 py-2 bg-bg-panel hover:bg-bg-panel-2 border border-border transition-colors",
            side === "A" ? "order-1" : "order-2",
          )}
        >
          <div className="font-cond font-extrabold text-2xl text-danger leading-none">{pNo}%</div>
          <div className="text-[10px] text-text-dim font-semibold uppercase tracking-widest2 mt-1">
            No · {stats.no}
          </div>
        </button>
        {/* SI button */}
        <button
          onClick={() => onTap("yes")}
          aria-label={`${action.label} — Sì (${side})`}
          className={clsx(
            "min-h-[64px] flex flex-col items-center justify-center px-3 py-2 bg-bg-panel hover:bg-bg-panel-2 border border-border transition-colors",
            side === "A" ? "order-2" : "order-1",
          )}
        >
          <div className="font-cond font-extrabold text-2xl text-green leading-none">{pYes}%</div>
          <div className="text-[10px] text-text-dim font-semibold uppercase tracking-widest2 mt-1">
            Sì · {stats.yes}
          </div>
        </button>
      </div>
      {/* Sub-opzioni: cliccabili, persistite. Display-only se vuoto (mostriamo noPlaceholder). */}
      {showSubs && subs.length > 0 && (
        <div className="absolute inset-x-0 top-full mt-1 z-10 bg-bg-panel border border-brand-red p-2 flex flex-wrap gap-1">
          {subs.map((s) => (
            <button
              key={s}
              onClick={() => onSub(s)}
              className="px-2 py-1 text-xs border border-border hover:border-brand-red hover:text-brand-red-hot text-white"
              style={{ borderLeft: `3px solid ${color}` }}
            >
              {s}
            </button>
          ))}
          <button
            onClick={onCancelSub}
            className="px-2 py-1 text-xs text-text-dim hover:text-white"
          >
            annulla
          </button>
        </div>
      )}
      {action.noPlaceholder && action.subNo.length === 0 && action.subYes.length === 0 && (
        <div className="text-[10px] text-text-dim mt-1 text-center italic">
          {action.noPlaceholder}
        </div>
      )}
    </div>
  );
}
