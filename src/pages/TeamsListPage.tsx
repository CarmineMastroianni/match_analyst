import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useTeamsStore } from "../stores/useTeamsStore";
import { useMatchesStore } from "../stores/useMatchesStore";

export function TeamsListPage() {
  const teams = useTeamsStore((s) => s.list());
  const byTeam = useMatchesStore((s) => s.byTeam);

  return (
    <>
      <div className="flex items-end justify-between mb-7">
        <div>
          <h1 className="font-cond font-bold uppercase text-[40px] leading-none">Squadre</h1>
          <div className="text-sm text-text-dark-dim mt-1">{teams.length} squadre</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {teams.map((t) => {
          const n = byTeam(t.id).length;
          return (
            <Link key={t.id} to={`/teams/${t.id}`}>
              <Card accent={t.category === "M" ? "red" : "blue"} className="hover:shadow-card transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <Badge tone={t.category === "M" ? "red" : "blue"}>{t.category}</Badge>
                  <div className="text-[11px] text-text-dark-dim font-mono">{t.club}</div>
                </div>
                <div className="font-cond font-bold uppercase text-xl leading-tight">{t.name}</div>
                <div className="mt-4 flex gap-6 text-sm">
                  <div>
                    <div className="font-cond font-bold text-2xl leading-none">{t.roster.length}</div>
                    <div className="text-[11px] text-text-dark-dim uppercase tracking-widest2 font-cond">Atleti</div>
                  </div>
                  <div>
                    <div className="font-cond font-bold text-2xl leading-none">{n}</div>
                    <div className="text-[11px] text-text-dark-dim uppercase tracking-widest2 font-cond">Match</div>
                  </div>
                  <div>
                    <div className="font-cond font-bold text-2xl leading-none">{t.lineup.length}/6</div>
                    <div className="text-[11px] text-text-dark-dim uppercase tracking-widest2 font-cond">Formazione</div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
