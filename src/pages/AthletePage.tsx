import { useParams, Link, Navigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Tabs } from "../components/ui/Tabs";
import { Button } from "../components/ui/Button";
import { DonutChart } from "../components/charts/DonutChart";
import { EfficacyBar } from "../components/charts/EfficacyBar";
import { TrendLine } from "../components/charts/TrendLine";
import { useAthletesStore } from "../stores/useAthletesStore";
import { useTeamsStore } from "../stores/useTeamsStore";
import { useMatchesStore } from "../stores/useMatchesStore";
import { useAthleteStats, actionColor } from "../hooks/useStats";
import { fmtDate, pct } from "../utils/format";
import { Plus } from "lucide-react";

export function AthletePage() {
  const { id = "" } = useParams();
  const ath = useAthletesStore((s) => s.get(id));
  const team = useTeamsStore((s) => (ath?.teamIds[0] ? s.get(ath.teamIds[0]) : undefined));
  const matches = useMatchesStore((s) => s.byAthlete(id));
  const stats = useAthleteStats(id);

  if (!ath) return <Navigate to="/athletes" replace />;

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

  const trend = matches
    .slice(0, 10)
    .reverse()
    .map((m, i) => {
      const isA = m.athleteAId === id;
      const my = isA ? m.scoreA : m.scoreB;
      const opp = isA ? m.scoreB : m.scoreA;
      return { label: `M${i + 1}`, value: pct(my, my + opp) };
    });

  return (
    <>
      {/* HERO */}
      <div className="bg-gradient-to-br from-bg-dark to-bg-panel-2 text-white p-7 mb-6 relative overflow-hidden">
        <span className="absolute top-0 left-0 h-1 w-24 bg-brand-red" />
        <div className="flex items-center gap-5">
          <Avatar firstName={ath.firstName} lastName={ath.lastName} size={88} />
          <div className="flex-1">
            <Badge tone="red">{ath.category}</Badge>
            <h1 className="font-cond font-bold uppercase text-4xl mt-2 leading-none">
              {ath.firstName} {ath.lastName}
            </h1>
            <div className="text-text-dim text-sm mt-1.5">
              {team?.name ?? "—"} · {ath.hand === "L" ? "Mancino" : "Destro"} · {ath.sex}
            </div>
          </div>
          <div className="text-right">
            <div className="font-cond font-bold text-5xl leading-none">{stats.matchesPlayed}</div>
            <div className="text-[11px] uppercase tracking-widest2 text-text-dim mt-1 font-cond">
              Match · {stats.wins}V · {stats.losses}S
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <Link to="/match/new">
            <Button icon={<Plus size={14} />}>Nuova partita con questo atleta</Button>
          </Link>
        </div>
      </div>

      <Tabs
        items={[
          {
            id: "stats",
            label: "Statistiche",
            content: (
              <div className="grid md:grid-cols-2 gap-5">
                <Card title="Azioni principali" accent="red">
                  <DonutChart
                    data={donutData}
                    centerLabel="Totali"
                    centerValue={stats.totalActions}
                  />
                </Card>
                <Card title="Efficacia per azione" accent="blue">
                  <EfficacyBar rows={efficacy} />
                </Card>
                <Card title="Trend ultimi match" accent="red" className="md:col-span-2">
                  <TrendLine data={trend} />
                </Card>
              </div>
            ),
          },
          {
            id: "profile",
            label: "Profilo",
            content: (
              <Card>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-text-dark-dim text-xs uppercase font-cond tracking-widest2">Data di nascita</dt>
                    <dd className="mt-1">{ath.birthDate}</dd>
                  </div>
                  <div>
                    <dt className="text-text-dark-dim text-xs uppercase font-cond tracking-widest2">Categoria</dt>
                    <dd className="mt-1">{ath.category}</dd>
                  </div>
                  <div>
                    <dt className="text-text-dark-dim text-xs uppercase font-cond tracking-widest2">Squadra</dt>
                    <dd className="mt-1">{team?.name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-text-dark-dim text-xs uppercase font-cond tracking-widest2">Mano</dt>
                    <dd className="mt-1">{ath.hand === "L" ? "Mancino" : "Destro"}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-text-dark-dim text-xs uppercase font-cond tracking-widest2">Note</dt>
                    <dd className="mt-1 text-text-dark-dim italic">{ath.notes ?? "Nessuna nota."}</dd>
                  </div>
                </dl>
              </Card>
            ),
          },
          {
            id: "history",
            label: "Storico match",
            content: (
              <Card>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-widest2 font-cond text-text-dark-dim">
                      <th className="py-2 pr-2">Data</th>
                      <th className="py-2 pr-2">Avversario</th>
                      <th className="py-2 pr-2">Risultato</th>
                      <th className="py-2 pr-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((m) => {
                      const isA = m.athleteAId === id;
                      const my = isA ? m.scoreA : m.scoreB;
                      const opp = isA ? m.scoreB : m.scoreA;
                      const oppId = isA ? m.athleteBId : m.athleteAId;
                      return (
                        <tr key={m.id} className="border-t border-border-light">
                          <td className="py-2 pr-2">{fmtDate(m.date)}</td>
                          <td className="py-2 pr-2">
                            <Link to={`/athletes/${oppId}`} className="hover:text-brand-red">
                              {oppId.slice(-6)}
                            </Link>
                          </td>
                          <td className="py-2 pr-2 font-cond font-bold">
                            <span className={my > opp ? "text-ok" : "text-danger"}>{my}</span>
                            <span className="text-text-dark-dim mx-1">–</span>
                            {opp}
                          </td>
                          <td className="py-2 pr-2 text-right">
                            <Link to={`/match/${m.id}/recap`} className="text-brand-red text-xs font-semibold">
                              Recap →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            ),
          },
          {
            id: "notes",
            label: "Note",
            content: (
              <Card>
                <textarea
                  className="w-full min-h-[180px] p-3 border border-border-light text-sm bg-bg-light-2"
                  placeholder="Note dell'analyst (non persistite in MVP demo)…"
                  defaultValue={ath.notes ?? ""}
                />
              </Card>
            ),
          },
        ]}
      />
    </>
  );
}
