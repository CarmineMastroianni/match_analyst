import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Tabs } from "../components/ui/Tabs";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { DonutChart } from "../components/charts/DonutChart";
import { EfficacyBar } from "../components/charts/EfficacyBar";
import { useTeamsStore } from "../stores/useTeamsStore";
import { useAthletesStore } from "../stores/useAthletesStore";
import { useMatchesStore } from "../stores/useMatchesStore";
import { useTeamStats, actionColor } from "../hooks/useStats";
import { fmtDate } from "../utils/format";
import { useAuthStore } from "../stores/useAuthStore";
import { Pencil, Trash2, Plus, ChevronLeft, X, ChevronUp, ChevronDown, UserPlus } from "lucide-react";
import type { TeamCategory } from "../types/domain";

const teamSchema = z.object({
  name: z.string().min(1, "Obbligatorio"),
  club: z.string().min(1, "Obbligatorio"),
  category: z.enum(["M", "F"]),
});
type TeamFormData = z.infer<typeof teamSchema>;

export function TeamPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const team = useTeamsStore((s) => s.get(id));
  const athletes = useAthletesStore((s) => s.athletes);
  const allAthletes = useAthletesStore(useShallow((s) => s.list()));
  const matches = useMatchesStore(useShallow((s) => s.byTeam(id)));
  const stats = useTeamStats(team?.roster ?? []);
  const role = useAuthStore((s) => s.user?.role);

  const [editOpen, setEditOpen] = useState(false);
  const [addRosterOpen, setAddRosterOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lineupSlot, setLineupSlot] = useState<number | null>(null);

  const { register, handleSubmit, formState, reset: resetForm } = useForm<TeamFormData>({
    defaultValues: {
      name: team?.name ?? "",
      club: team?.club ?? "",
      category: (team?.category ?? "M") as "M" | "F",
    },
  });

  if (!team) return <Navigate to="/teams" replace />;
  const t = team;
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

  function onEditSubmit(data: TeamFormData) {
    useTeamsStore.getState().upsert({
      ...t,
      name: data.name,
      club: data.club,
      category: data.category as TeamCategory,
    });
    setEditOpen(false);
  }

  function handleDelete() {
    if (window.confirm(`Eliminare la squadra "${t.name}"?`)) {
      useTeamsStore.getState().remove(t.id);
      navigate("/teams");
    }
  }

  function removeFromRoster(athId: string) {
    useTeamsStore.getState().upsert({
      ...t,
      roster: t.roster.filter((rid) => rid !== athId),
      lineup: t.lineup.filter((lid) => lid !== athId),
    });
  }

  const availableAthletes = allAthletes.filter((a) => !t.roster.includes(a.id));

  function toggleSelect(athId: string) {
    setSelectedIds((prev) =>
      prev.includes(athId) ? prev.filter((x) => x !== athId) : [...prev, athId]
    );
  }

  function confirmAddRoster() {
    useTeamsStore.getState().upsert({
      ...t,
      roster: [...t.roster, ...selectedIds],
    });
    setSelectedIds([]);
    setAddRosterOpen(false);
  }

  function buildLineupArray(): string[] {
    return [0, 1, 2, 3, 4, 5].map((i) => t.lineup[i] ?? "");
  }

  function saveLineup(arr: string[]) {
    useTeamsStore.getState().upsert({ ...t, lineup: arr.filter(Boolean) });
  }

  function setLineupAthlete(slot: number, athId: string) {
    const next = buildLineupArray();
    const existing = next.indexOf(athId);
    if (existing !== -1) next[existing] = "";
    next[slot] = athId;
    saveLineup(next);
    setLineupSlot(null);
  }

  function clearLineupSlot(slot: number) {
    const next = buildLineupArray();
    next[slot] = "";
    saveLineup(next);
  }

  function moveLineupUp(slot: number) {
    if (slot === 0) return;
    const next = buildLineupArray();
    const tmp = next[slot - 1] ?? "";
    next[slot - 1] = next[slot] ?? "";
    next[slot] = tmp;
    saveLineup(next);
  }

  function moveLineupDown(slot: number) {
    if (slot >= t.lineup.length - 1) return;
    const next = buildLineupArray();
    const tmp = next[slot] ?? "";
    next[slot] = next[slot + 1] ?? "";
    next[slot + 1] = tmp;
    saveLineup(next);
  }

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-text-dim hover:text-white text-sm mb-4"
      >
        <ChevronLeft size={16} />
        Indietro
      </button>

      <div className="bg-gradient-to-br from-brand-blue to-bg-panel-2 text-white p-7 mb-6 relative overflow-hidden">
        <span className="absolute top-0 left-0 h-1 w-24 bg-brand-red" />
        <Badge tone={team.category === "M" ? "red" : "blue"}>{team.category}</Badge>
        <h1 className="font-cond font-bold uppercase text-4xl mt-2 leading-none">{team.name}</h1>
        <div className="text-text-dim text-sm mt-1.5">
          {team.club} · {team.roster.length} atleti · {matches.length} match
        </div>
        {!readOnly && (
          <div className="flex gap-2 mt-5">
            <Button
              variant="dark"
              icon={<Pencil size={14} />}
              onClick={() => {
                resetForm({ name: team.name, club: team.club, category: team.category });
                setEditOpen(true);
              }}
            >
              Modifica squadra
            </Button>
            <Button variant="danger" icon={<Trash2 size={14} />} onClick={handleDelete}>
              Elimina squadra
            </Button>
          </div>
        )}
      </div>

      <Tabs
        items={[
          {
            id: "lineup",
            label: "Formazione",
            content: (
              <Card accent="red">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-cond font-bold uppercase text-base">Formazione schierata</div>
                    <div className="text-xs text-text-dark-dim mt-0.5">{t.lineup.length}/6 posizioni occupate</div>
                  </div>
                  {!readOnly && t.lineup.length < 6 && t.roster.length > t.lineup.length && (
                    <Button
                      variant="ghost"
                      icon={<UserPlus size={14} />}
                      onClick={() => setLineupSlot(t.lineup.length)}
                    >
                      Aggiungi posizione
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => {
                    const aid = t.lineup[i];
                    const ath = aid ? athletes[aid] : undefined;
                    const filled = !!ath;
                    return (
                      <div
                        key={i}
                        className={[
                          "flex flex-col items-center gap-2 border p-3 relative transition-colors",
                          filled
                            ? "border-border-light bg-bg-panel"
                            : readOnly
                            ? "border-border/30 opacity-40"
                            : "border-dashed border-border/50 hover:border-brand-red/50 cursor-pointer",
                        ].join(" ")}
                        onClick={!filled && !readOnly ? () => setLineupSlot(i) : undefined}
                      >
                        <span className="absolute top-1 left-1.5 text-[10px] font-cond font-bold tracking-widest2 text-brand-red">
                          {String(i + 1).padStart(2, "0")}
                        </span>

                        {filled && !readOnly && (
                          <div className="absolute top-1 right-1 flex gap-0.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); moveLineupUp(i); }}
                              disabled={i === 0}
                              className="p-0.5 text-text-dim hover:text-white disabled:opacity-20"
                              title="Sposta su"
                            >
                              <ChevronUp size={11} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); moveLineupDown(i); }}
                              disabled={i >= t.lineup.length - 1}
                              className="p-0.5 text-text-dim hover:text-white disabled:opacity-20"
                              title="Sposta giù"
                            >
                              <ChevronDown size={11} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); clearLineupSlot(i); }}
                              className="p-0.5 text-text-dim hover:text-danger"
                              title="Rimuovi dalla formazione"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        )}

                        {ath ? (
                          <>
                            <Avatar firstName={ath.firstName} lastName={ath.lastName} size={52} />
                            <div className="text-xs font-cond font-bold uppercase text-center leading-tight">
                              {ath.lastName}
                              <div className="text-[10px] text-text-dark-dim normal-case font-normal">{ath.firstName}</div>
                            </div>
                            {!readOnly && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setLineupSlot(i); }}
                                className="text-[10px] text-text-dim hover:text-brand-red font-cond uppercase tracking-widest2 mt-0.5"
                              >
                                cambia
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1 pt-3 pb-1">
                            <Plus size={18} className="text-text-dim" />
                            <div className="text-[10px] text-text-dim font-cond uppercase tracking-widest2">vuoto</div>
                          </div>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {team.roster.map((aid) => {
                    const ath = athletes[aid];
                    if (!ath) return null;
                    const isStarter = team.lineup.includes(aid);
                    return (
                      <div
                        key={aid}
                        className="border border-border-light p-3 flex items-center gap-3"
                      >
                        <Link
                          to={`/athletes/${aid}`}
                          className="flex items-center gap-3 flex-1 min-w-0 hover:text-brand-red transition-colors"
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
                        {!readOnly && (
                          <button
                            onClick={() => removeFromRoster(aid)}
                            className="text-text-dim hover:text-danger ml-1 shrink-0"
                            title="Rimuovi dalla rosa"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {!readOnly && (
                  <Button
                    variant="ghost"
                    icon={<Plus size={14} />}
                    onClick={() => {
                      setSelectedIds([]);
                      setAddRosterOpen(true);
                    }}
                  >
                    Aggiungi atleta
                  </Button>
                )}
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

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Modifica squadra" width={480}>
        <form onSubmit={handleSubmit(onEditSubmit)} className="flex flex-col gap-3">
          <Input
            label="Nome squadra"
            {...register("name")}
            error={formState.errors.name?.message}
          />
          <Input
            label="Club / Società"
            {...register("club")}
            error={formState.errors.club?.message}
          />
          <Select label="Categoria" {...register("category")}>
            <option value="M">M</option>
            <option value="F">F</option>
          </Select>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Annulla</Button>
            <Button type="submit" icon={<Pencil size={14} />}>Salva modifiche</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={lineupSlot !== null}
        onClose={() => setLineupSlot(null)}
        title={lineupSlot !== null ? `Posizione ${lineupSlot + 1} — scegli atleta` : ""}
        width={480}
      >
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto mb-4">
          {t.roster
            .filter((rid) => !t.lineup.includes(rid) || t.lineup[lineupSlot ?? -1] === rid)
            .map((rid) => {
              const ath = athletes[rid];
              if (!ath) return null;
              const isCurrent = lineupSlot !== null && t.lineup[lineupSlot] === rid;
              return (
                <button
                  key={rid}
                  onClick={() => lineupSlot !== null && setLineupAthlete(lineupSlot, rid)}
                  className={[
                    "flex items-center gap-3 p-3 border text-left w-full transition-colors",
                    isCurrent
                      ? "border-brand-red bg-brand-red/10"
                      : "border-border-light hover:border-brand-red hover:bg-bg-panel",
                  ].join(" ")}
                >
                  <Avatar firstName={ath.firstName} lastName={ath.lastName} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{ath.lastName} {ath.firstName}</div>
                    <div className="text-[11px] text-text-dark-dim">{ath.category} · {ath.hand === "L" ? "Mancino" : "Destro"}</div>
                  </div>
                  {isCurrent && <Badge tone="red">attuale</Badge>}
                </button>
              );
            })}
          {t.roster.filter((rid) => !t.lineup.includes(rid) || t.lineup[lineupSlot ?? -1] === rid).length === 0 && (
            <div className="text-text-dark-dim text-sm italic py-4 text-center">
              Tutti gli atleti della rosa sono già in formazione.
            </div>
          )}
        </div>
        {lineupSlot !== null && t.lineup[lineupSlot] && (
          <div className="pt-3 border-t border-border-light">
            <Button
              variant="danger"
              icon={<X size={14} />}
              onClick={() => { clearLineupSlot(lineupSlot); setLineupSlot(null); }}
            >
              Rimuovi dalla formazione
            </Button>
          </div>
        )}
      </Modal>

      <Modal open={addRosterOpen} onClose={() => setAddRosterOpen(false)} title="Aggiungi atleti alla rosa" width={520}>
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto mb-4">
          {availableAthletes.length === 0 ? (
            <div className="text-text-dark-dim text-sm italic py-4 text-center">
              Nessun atleta disponibile da aggiungere.
            </div>
          ) : (
            availableAthletes.map((ath) => (
              <label
                key={ath.id}
                className="flex items-center gap-3 p-3 border border-border-light cursor-pointer hover:border-brand-red transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(ath.id)}
                  onChange={() => toggleSelect(ath.id)}
                  className="accent-brand-red"
                />
                <Avatar firstName={ath.firstName} lastName={ath.lastName} size={32} />
                <div>
                  <div className="text-sm font-semibold">{ath.lastName} {ath.firstName}</div>
                  <div className="text-[11px] text-text-dark-dim">{ath.category}</div>
                </div>
              </label>
            ))
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setAddRosterOpen(false)}>Annulla</Button>
          <Button
            icon={<Plus size={14} />}
            onClick={confirmAddRoster}
            disabled={selectedIds.length === 0}
          >
            Aggiungi ({selectedIds.length})
          </Button>
        </div>
      </Modal>
    </>
  );
}
