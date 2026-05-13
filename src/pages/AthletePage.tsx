import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
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
import { TrendLine } from "../components/charts/TrendLine";
import { useAthletesStore } from "../stores/useAthletesStore";
import { useTeamsStore } from "../stores/useTeamsStore";
import { useMatchesStore } from "../stores/useMatchesStore";
import { useAthleteStats, actionColor } from "../hooks/useStats";
import { fmtDate, pct } from "../utils/format";
import { Plus, Pencil, Trash2, ChevronLeft } from "lucide-react";
import type { AthleteCategory, Hand, Sex } from "../types/domain";

const athleteSchema = z.object({
  firstName: z.string().min(1, "Obbligatorio"),
  lastName: z.string().min(1, "Obbligatorio"),
  birthDate: z.string().optional(),
  sex: z.enum(["M", "F", "X"]),
  hand: z.enum(["R", "L"]),
  category: z.enum(["Senior", "U20", "U17", "U14"]),
  teamId: z.string().optional(),
});
type FormData = z.infer<typeof athleteSchema>;

function NotesTab({ athId }: { athId: string }) {
  const ath = useAthletesStore((s) => s.get(athId));
  const [value, setValue] = useState(ath?.notes ?? "");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (!ath) return;
    useAthletesStore.getState().upsert({ ...ath, notes: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <textarea
        className="w-full min-h-[180px] p-3 border border-border-light text-sm bg-bg-light-2 resize-y"
        placeholder="Note dell'analyst…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="flex justify-end mt-3">
        <Button onClick={handleSave} variant={saved ? "ghost" : "primary"}>
          {saved ? "Salvato ✓" : "Salva note"}
        </Button>
      </div>
    </Card>
  );
}

export function AthletePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const athRaw = useAthletesStore((s) => s.get(id));
  const aGet = useAthletesStore((s) => s.get);
  const teams = useTeamsStore(useShallow((s) => s.list()));
  const team = useTeamsStore((s) => (athRaw?.teamIds[0] ? s.get(athRaw.teamIds[0]) : undefined));
  const matches = useMatchesStore(useShallow((s) => s.byAthlete(id)));
  const stats = useAthleteStats(id);

  const [editOpen, setEditOpen] = useState(false);

  const { register, handleSubmit, formState, reset: resetForm } = useForm<FormData>({
    defaultValues: {
      firstName: athRaw?.firstName ?? "",
      lastName: athRaw?.lastName ?? "",
      birthDate: athRaw?.birthDate ?? "",
      sex: (athRaw?.sex ?? "M") as "M" | "F" | "X",
      hand: (athRaw?.hand ?? "R") as "R" | "L",
      category: (athRaw?.category ?? "Senior") as "Senior" | "U20" | "U17" | "U14",
      teamId: athRaw?.teamIds[0] ?? "",
    },
  });

  if (!athRaw) return <Navigate to="/athletes" replace />;
  const ath = athRaw;

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

  function onEditSubmit(data: FormData) {
    useAthletesStore.getState().upsert({
      id: ath.id,
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: data.birthDate ?? "",
      sex: data.sex as Sex,
      hand: data.hand as Hand,
      category: data.category as AthleteCategory,
      teamIds: data.teamId ? [data.teamId] : [],
      photoSeed: ath.photoSeed,
      notes: ath.notes,
    });
    setEditOpen(false);
  }

  function handleDelete() {
    if (window.confirm(`Eliminare ${ath.firstName} ${ath.lastName}?`)) {
      useAthletesStore.getState().remove(ath.id);
      navigate("/athletes");
    }
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
          <Link to={"/match/new?athleteA=" + id}>
            <Button icon={<Plus size={14} />}>Nuovo match</Button>
          </Link>
          <Button
            variant="dark"
            icon={<Pencil size={14} />}
            onClick={() => {
              resetForm({
                firstName: ath.firstName,
                lastName: ath.lastName,
                birthDate: ath.birthDate ?? "",
                sex: ath.sex,
                hand: ath.hand,
                category: ath.category,
                teamId: ath.teamIds[0] ?? "",
              });
              setEditOpen(true);
            }}
          >
            Modifica
          </Button>
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
                      const oppAth = aGet(oppId);
                      return (
                        <tr key={m.id} className="border-t border-border-light">
                          <td className="py-2 pr-2">{fmtDate(m.date)}</td>
                          <td className="py-2 pr-2">
                            <Link to={`/athletes/${oppId}`} className="hover:text-brand-red">
                              {oppAth?.lastName ?? "—"}
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
            content: <NotesTab athId={id} />,
          },
        ]}
      />

      <div className="mt-8 pt-6 border-t-2 border-brand-red/40">
        <Button variant="danger" icon={<Trash2 size={14} />} onClick={handleDelete}>
          Elimina atleta
        </Button>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Modifica atleta" width={540}>
        <form onSubmit={handleSubmit(onEditSubmit)} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nome"
              {...register("firstName")}
              error={formState.errors.firstName?.message}
            />
            <Input
              label="Cognome"
              {...register("lastName")}
              error={formState.errors.lastName?.message}
            />
          </div>
          <Input label="Data di nascita" type="date" {...register("birthDate")} />
          <div className="grid grid-cols-3 gap-3">
            <Select label="Sesso" {...register("sex")}>
              <option value="M">M</option>
              <option value="F">F</option>
              <option value="X">X</option>
            </Select>
            <Select label="Mano" {...register("hand")}>
              <option value="R">Destra</option>
              <option value="L">Sinistra</option>
            </Select>
            <Select label="Categoria" {...register("category")}>
              <option value="Senior">Senior</option>
              <option value="U20">U20</option>
              <option value="U17">U17</option>
              <option value="U14">U14</option>
            </Select>
          </div>
          <Select label="Squadra (opzionale)" {...register("teamId")}>
            <option value="">Nessuna</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Annulla</Button>
            <Button type="submit" icon={<Pencil size={14} />}>Salva modifiche</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
