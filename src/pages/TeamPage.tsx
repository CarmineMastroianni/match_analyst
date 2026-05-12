import { Link, Navigate, useParams } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Tabs } from "../components/ui/Tabs";
import { DonutChart } from "../components/charts/DonutChart";
import { EfficacyBar } from "../components/charts/EfficacyBar";
import { useTeamsStore } from "../stores/useTeamsStore";
import { useAthletesStore } from "../stores/useAthletesStore";
import { useMatchesStore } from "../stores/useMatchesStore";
import { useTeamStats, actionColor } from "../hooks/useStats";
import { fmtDate } from "../utils/format";
import { useAuthStore } from "../stores/useAuthStore";

export function TeamPage() {
  const { id = "" } = useParams();
  const team = useTeamsStore((s) => s.get(id));
  const athletes = useAthletesStore((s) => s.athletes);
  const matches = useMatchesStore((s) => s.byTeam(id));
  const stats = useTeamStats(team?.roster ?? []);
  const role = useAuthStore((s) => s.user?.role);

  if (!team) return <Navigate to="/teams" replace />;
  const readOnly = role === "team_viewer";

  const donutData = stats.byAction
    .filter((s) => s.total > 0)
    .map((s) => {
      const act = stats.actions.find((a) => a.id === s.actionTypeId);
      return {
        name: act?.label ?? "—",
        value: s.total,
        color: actionColor(act ?? { color: "blue" }),
      };
    });

  const efficacy = stats.byAction.map((s) => {
    const act = stats.actions.find((a) => a.id === s.actionTypeId);
    return {
      label: act?.label ?? "—",
      yes: s.yes,
      total: s.total,
      color: actionColor(act ?? { color: "blue" }),
    };
  });

  return (
    <>
      <div className="bg-gradient-to-br from-brand-blue to-bg-panel-2 text-white p-7 mb-6 relative overflow-hidden">
        <span className="absolute top-0 left-0 h-1 w-24 bg-brand-red" />
        <Badge tone={team.category === "M" ? "red" : "blue"}>{team.category}</Badge>
        <h1 className="font-cond font-bold uppercase text-4xl mt-2 leading-none">{team.name}</h1>
        <div className="text-text-dim text-sm mt-1.5">
          {team.club} · {team.roster.length} atleti · {matches.length} match
        </div>
      </div>

      <Tabs
        items={[
          {
            id: "lineup",
            label: "Formazione",
            content: (
              <Card title="Formazione schierata (6)" accent="red">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => {
                    const aid = team.lineup[i];
                    const ath = aid ? athletes[aid] : undefined;
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-2 border border-border-light p-3 relative"
                      >
                        <span className="absolute top-1 left-1 text-[10px] font-cond font-bold tracking-widest2 text-brand-red">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {ath ? (
                          <Link to={`/athletes/${ath.id}`} className="contents">
                            <Avatar firstName={ath.firstName} lastName={ath.lastName} size={56} />
                            <div className="text-xs font-cond font-bold uppercase text-center leading-tight">
                              {ath.lastName}
                              <div className="text-[10px] text-text-dark-dim normal-case">{ath.firstName}</div>
                            </div>
                          </Link>
                        ) : (
                          <div className="text-text-dark-dim text-xs">vuoto</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ),
          },
          {
            id: "roster",
            label: "Rosa",
            content: (
              <Card>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {team.roster.map((aid) => {
                    const ath = athletes[aid];
                    if (!ath) return null;
                    const isStarter = team.lineup.includes(aid);
                    return (
                      <Link
                        key={aid}
                        to={`/athletes/${aid}`}
                        className="border border-border-light p-3 flex items-center gap-3 hover:border-brand-red transition-colors"
                      >
                        <Avatar firstName={ath.firstName} lastName={ath.lastName} size={36} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold truncate">
                            {ath.lastName} {ath.firstName}
                          </div>
                          <div className="text-[11px] text-text-dark-dim">{ath.category}</div>
                        </div>
                        {isStarter && <Badge tone="red">TIT</Badge>}
                      </Link>
                    );
                  })}
                </div>
              </Card>
            ),
          },
          {
            id: "stats",
            label: "Statistiche",
            content: (
              <div className="grid md:grid-cols-2 gap-5">
                <Card title="Azioni della squadra" accent="red">
                  <DonutChart data={donutData} centerLabel="Totali" centerValue={stats.totalActions} />
                </Card>
                <Card title="Efficacia" accent="blue">
                  <EfficacyBar rows={efficacy} />
                </Card>
              </div>
            ),
          },
          {
            id: "history",
            label: "Storico",
            content: (
              <Card>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-widest2 font-cond text-text-dark-dim">
                      <th className="py-2 pr-2">Data</th>
                      <th className="py-2 pr-2">Match</th>
                      <th className="py-2 pr-2">Risultato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((m) => (
                      <tr key={m.id} className="border-t border-border-light">
                        <td className="py-2 pr-2">{fmtDate(m.date)}</td>
                        <td className="py-2 pr-2 font-mono text-xs">{m.id.slice(-8)}</td>
                        <td className="py-2 pr-2 font-cond font-bold">{m.scoreA}–{m.scoreB}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            ),
          },
        ]}
      />
      {readOnly && (
        <div className="mt-6 text-xs text-text-dark-dim italic">
          Sola lettura · ruolo team viewer.
        </div>
      )}
    </>
  );
}
