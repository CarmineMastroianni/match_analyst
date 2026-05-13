import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { Plus, ChevronRight, Play } from "lucide-react";
import { useAthletesStore } from "../stores/useAthletesStore";
import { useTeamsStore } from "../stores/useTeamsStore";
import { useMatchesStore } from "../stores/useMatchesStore";
import { fmtDate } from "../utils/format";

export function DashboardPage() {
  const athletes = useAthletesStore(useShallow((s) => s.list()));
  const aGet = useAthletesStore((s) => s.get);
  const teams = useTeamsStore(useShallow((s) => s.list()));
  const matches = useMatchesStore(useShallow((s) => s.list()));
  const eventsAll = useMatchesStore((s) => s.events);
  const totalEvents = Object.values(eventsAll).reduce((s, l) => s + l.length, 0);

  const live = matches.find((m) => m.status === "live");
  const today = new Date();
  const todayStr = today.toDateString();
  const todayMatches = matches.filter(
    (m) => new Date(m.date).toDateString() === todayStr,
  );
  const recent = matches.filter((m) => m.status === "done").slice(0, 5);
  const planned = matches.filter((m) => m.status === "planned").slice(0, 3);

  const cutoff90 = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d.toISOString();
  }, []);

  const top3 = useMemo(() => {
    const doneIn90 = matches.filter(
      (m) => m.status === "done" && m.date >= cutoff90,
    );
    const statsMap: Record<string, { wins: number; losses: number }> = {};
    for (const m of doneIn90) {
      for (const [athId, won] of [
        [m.athleteAId, m.scoreA > m.scoreB],
        [m.athleteBId, m.scoreB > m.scoreA],
      ] as [string, boolean][]) {
        if (!statsMap[athId]) statsMap[athId] = { wins: 0, losses: 0 };
        if (won) statsMap[athId]!.wins++;
        else statsMap[athId]!.losses++;
      }
    }
    return Object.entries(statsMap)
      .filter(([, s]) => s.wins + s.losses >= 3)
      .map(([athleteId, s]) => ({
        athleteId,
        wins: s.wins,
        losses: s.losses,
        total: s.wins + s.losses,
        winRate: s.wins / (s.wins + s.losses),
      }))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 3);
  }, [matches, cutoff90]);

  return (
    <>
      <div className="flex items-end justify-between mb-7">
        <div>
          <div className="text-xs text-text-dark-dim font-cond uppercase tracking-widest2">
            {fmtDate(new Date().toISOString())}
          </div>
          <h1 className="font-cond font-bold uppercase text-[40px] leading-none mt-1">
            Dashboard
          </h1>
        </div>
        <Link to="/match/new">
          <Button size="lg" icon={<Plus size={16} />}>Nuova partita</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        <Card title="Match totali">
          <div className="font-cond font-bold text-5xl leading-none">{matches.length}</div>
        </Card>
        <Link to="/athletes" className="block hover:-translate-y-0.5 transition-transform">
          <Card title="Atleti" accent="red">
            <div className="font-cond font-bold text-5xl leading-none">{athletes.length}</div>
          </Card>
        </Link>
        <Link to="/teams" className="block hover:-translate-y-0.5 transition-transform">
          <Card title="Squadre" accent="blue">
            <div className="font-cond font-bold text-5xl leading-none">{teams.length}</div>
          </Card>
        </Link>
        <Card title="Azioni registrate" accent="blue">
          <div className="font-cond font-bold text-5xl leading-none">{totalEvents}</div>
        </Card>
      </div>

      <Card title="Prossimi match" accent="red" className="mb-6">
        {planned.length === 0 ? (
          <div className="text-sm text-text-dark-dim py-3 italic">Nessun match programmato.</div>
        ) : (
          <ul className="flex flex-col divide-y divide-border-light">
            {planned.map((m) => {
              const a = aGet(m.athleteAId);
              const b = aGet(m.athleteBId);
              return (
                <li key={m.id} className="py-3 flex items-center gap-3">
                  <span className="font-mono text-xs text-text-dark-dim w-24 shrink-0">
                    {fmtDate(m.date)}
                  </span>
                  <span className="font-cond font-semibold uppercase text-sm flex-1 truncate">
                    {a?.lastName} {a?.firstName?.[0]}. vs {b?.lastName} {b?.firstName?.[0]}.
                  </span>
                  <Badge tone="neutral">{m.format.toUpperCase()}</Badge>
                  <Link to={`/match/live/${m.id}`}>
                    <Button size="sm" icon={<Play size={12} />}>Avvia</Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {live && (
        <Link
          to={`/match/live/${live.id}`}
          className="block mb-6 bg-gradient-to-br from-bg-dark to-bg-panel-2 text-white p-6 relative overflow-hidden hover:-translate-y-0.5 transition-transform"
        >
          <Badge tone="red">In corso · LIVE</Badge>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex-1">
              <div className="font-cond font-bold text-2xl uppercase">
                {aGet(live.athleteAId)?.lastName} {aGet(live.athleteAId)?.firstName?.[0]}.
              </div>
            </div>
            <div className="font-cond font-bold text-brand-red-hot text-xl">VS</div>
            <div className="flex-1 text-right">
              <div className="font-cond font-bold text-2xl uppercase">
                {aGet(live.athleteBId)?.lastName} {aGet(live.athleteBId)?.firstName?.[0]}.
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 text-xs">
            <span className="text-text-dim">
              {live.format.toUpperCase()} · {live.venue ?? "—"}
            </span>
            <span className="text-white font-semibold inline-flex items-center gap-1">
              Apri schermata live <ChevronRight size={14} />
            </span>
          </div>
        </Link>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <Card title="Match di oggi" accent="red">
          {todayMatches.length === 0 ? (
            <div className="text-sm text-text-dark-dim py-4">Nessun match in programma oggi.</div>
          ) : (
            <ul className="flex flex-col divide-y divide-border-light">
              {todayMatches.map((m) => {
                const a = aGet(m.athleteAId);
                const b = aGet(m.athleteBId);
                return (
                  <li key={m.id} className="py-3 flex items-center gap-3">
                    <Badge tone={m.status === "live" ? "red" : "neutral"}>{m.status}</Badge>
                    <span className="font-cond font-semibold uppercase text-sm flex-1">
                      {a?.lastName} vs {b?.lastName}
                    </span>
                    <Link to={`/match/${m.id}/recap`} className="text-xs text-brand-red font-semibold">
                      Apri
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Ultimi assalti" accent="blue">
          <ul className="flex flex-col divide-y divide-border-light">
            {recent.map((m) => {
              const a = aGet(m.athleteAId);
              const b = aGet(m.athleteBId);
              const winA = m.scoreA > m.scoreB;
              return (
                <li key={m.id} className="py-2.5 flex items-center gap-3">
                  {a && <Avatar firstName={a.firstName} lastName={a.lastName} size={28} />}
                  <span className="text-sm font-cond font-semibold flex-1 truncate">
                    <span className={winA ? "text-text-dark" : "text-text-dark-dim"}>{a?.lastName}</span>{" "}
                    <span className="text-text-dark-dim">
                      {m.scoreA}–{m.scoreB}
                    </span>{" "}
                    <span className={!winA ? "text-text-dark" : "text-text-dark-dim"}>{b?.lastName}</span>
                  </span>
                  <span className="text-[11px] text-text-dark-dim font-cond uppercase tracking-widest2">
                    {fmtDate(m.date)}
                  </span>
                  <Link to={`/match/${m.id}/recap`} className="text-xs text-brand-red font-semibold">
                    Recap
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card title="Top Performers · Ultimi 90 gg" accent="red" className="mt-5">
        {top3.length === 0 ? (
          <div className="text-sm text-text-dark-dim py-3 italic">
            Nessun atleta con almeno 3 match negli ultimi 90 giorni.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3.map((item, i) => {
              const ath = aGet(item.athleteId);
              if (!ath) return null;
              const rankColors = ["text-yellow-400", "text-slate-300", "text-orange-400"];
              const winPct = Math.round(item.winRate * 100);
              return (
                <Link
                  key={item.athleteId}
                  to={`/athletes/${item.athleteId}`}
                  className="flex flex-col gap-3 p-4 bg-bg-light border border-border-light hover:border-brand-red/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-cond font-extrabold text-2xl leading-none ${rankColors[i] ?? ""}`}>
                      #{i + 1}
                    </span>
                    <Avatar firstName={ath.firstName} lastName={ath.lastName} size={40} />
                    <div className="min-w-0">
                      <div className="font-cond font-bold uppercase text-sm leading-tight truncate">
                        {ath.lastName} {ath.firstName}
                      </div>
                      <div className="text-[11px] text-text-dark-dim mt-0.5 font-cond">
                        {item.wins}V · {item.losses}S
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-cond mb-1">
                      <span className="text-text-dark-dim uppercase tracking-widest2">Win rate</span>
                      <span className="font-bold text-white">{winPct}%</span>
                    </div>
                    <div className="h-1.5 bg-bg-dark w-full">
                      <div
                        className="h-full bg-brand-red"
                        style={{ width: `${winPct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}
