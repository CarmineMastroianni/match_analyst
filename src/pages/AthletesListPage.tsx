import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Plus, Upload } from "lucide-react";
import { useAthletesStore } from "../stores/useAthletesStore";
import { useTeamsStore } from "../stores/useTeamsStore";
import { useMatchesStore } from "../stores/useMatchesStore";

export function AthletesListPage() {
  const athletes = useAthletesStore((s) => s.list());
  const teams = useTeamsStore((s) => s.list());
  const tGet = useTeamsStore((s) => s.get);
  const byAthlete = useMatchesStore((s) => s.byAthlete);

  const [q, setQ] = useState("");
  const [teamId, setTeamId] = useState<string>("");
  const [sex, setSex] = useState<string>("");

  const filtered = useMemo(() => {
    return athletes.filter((a) => {
      if (q && !`${a.firstName} ${a.lastName}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (teamId && !a.teamIds.includes(teamId)) return false;
      if (sex && a.sex !== sex) return false;
      return true;
    });
  }, [athletes, q, teamId, sex]);

  return (
    <>
      <div className="flex items-end justify-between mb-7">
        <div>
          <h1 className="font-cond font-bold uppercase text-[40px] leading-none">Atleti</h1>
          <div className="text-sm text-text-dark-dim mt-1">{filtered.length} atleti</div>
        </div>
        <div className="flex gap-2">
          <Link to="/import">
            <Button variant="ghost" icon={<Upload size={14} />}>Importa Excel</Button>
          </Link>
          <Button icon={<Plus size={14} />}>Nuovo atleta</Button>
        </div>
      </div>

      <Card accent="none" className="mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input label="Cerca" placeholder="Nome o cognome…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select label="Squadra" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
            <option value="">Tutte</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
          <Select label="Sesso" value={sex} onChange={(e) => setSex(e.target.value)}>
            <option value="">Tutti</option>
            <option value="M">M</option>
            <option value="F">F</option>
          </Select>
        </div>
      </Card>

      <Card accent="red">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase font-cond tracking-widest2 text-text-dark-dim">
              <th className="py-2 pr-2">Atleta</th>
              <th className="py-2 pr-2">Squadra</th>
              <th className="py-2 pr-2">Cat.</th>
              <th className="py-2 pr-2">Mano</th>
              <th className="py-2 pr-2"># Match</th>
              <th className="py-2 pr-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const team = a.teamIds[0] ? tGet(a.teamIds[0]) : undefined;
              const nMatches = byAthlete(a.id).length;
              return (
                <tr key={a.id} className="border-t border-border-light">
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar firstName={a.firstName} lastName={a.lastName} size={32} />
                      <div>
                        <div className="font-semibold">{a.lastName} {a.firstName}</div>
                        <div className="text-[11px] text-text-dark-dim font-mono">{a.id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-2">{team?.name ?? "—"}</td>
                  <td className="py-2.5 pr-2">
                    <Badge tone="neutral">{a.category}</Badge>
                  </td>
                  <td className="py-2.5 pr-2 font-cond font-semibold">{a.hand === "L" ? "Sx" : "Dx"}</td>
                  <td className="py-2.5 pr-2 font-cond font-semibold">{nMatches}</td>
                  <td className="py-2.5 pr-2 text-right">
                    <Link to={`/athletes/${a.id}`} className="text-brand-red font-semibold text-xs">
                      Apri →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}
