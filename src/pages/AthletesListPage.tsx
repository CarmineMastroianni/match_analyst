import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Plus, ChevronLeft } from "lucide-react";
import { useAthletesStore } from "../stores/useAthletesStore";
import { useTeamsStore } from "../stores/useTeamsStore";
import { useMatchesStore } from "../stores/useMatchesStore";
import type { AthleteCategory, Hand, Sex } from "../types/domain";

const schema = z.object({
  firstName: z.string().min(1, "Obbligatorio"),
  lastName: z.string().min(1, "Obbligatorio"),
  birthDate: z.string().optional(),
  sex: z.enum(["M", "F", "X"]),
  hand: z.enum(["R", "L"]),
  category: z.enum(["Senior", "U20", "U17", "U14"]),
  teamId: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function AthletesListPage() {
  const navigate = useNavigate();
  const athletes = useAthletesStore(useShallow((s) => s.list()));
  const teams = useTeamsStore(useShallow((s) => s.list()));
  const tGet = useTeamsStore((s) => s.get);
  const byAthlete = useMatchesStore((s) => s.byAthlete);

  const [q, setQ] = useState("");
  const [teamId, setTeamId] = useState<string>("");
  const [sex, setSex] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const { register, handleSubmit, formState, reset } = useForm<FormData>({
    defaultValues: { sex: "M", hand: "R", category: "Senior" },
  });

  const filtered = useMemo(() => {
    return athletes.filter((a) => {
      if (q && !`${a.firstName} ${a.lastName}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (teamId && !a.teamIds.includes(teamId)) return false;
      if (sex && a.sex !== sex) return false;
      return true;
    });
  }, [athletes, q, teamId, sex]);

  function onSubmit(data: FormData) {
    useAthletesStore.getState().upsert({
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: data.birthDate ?? "",
      sex: data.sex as Sex,
      hand: data.hand as Hand,
      category: data.category as AthleteCategory,
      teamIds: data.teamId ? [data.teamId] : [],
      photoSeed: `${data.firstName} ${data.lastName}`,
    });
    reset();
    setModalOpen(false);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
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

      {toastVisible && (
        <div className="fixed top-4 right-4 z-50 bg-ok text-white text-sm font-semibold px-4 py-2.5 shadow-lg">
          Atleta aggiunto con successo
        </div>
      )}

      <div className="flex items-end justify-between mb-7">
        <div>
          <h1 className="font-cond font-bold uppercase text-[40px] leading-none">Atleti</h1>
          <div className="text-sm text-text-dark-dim mt-1">{filtered.length} atleti</div>
        </div>
        <Button icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>Nuovo atleta</Button>
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
                <tr
                  key={a.id}
                  className="border-t border-border-light cursor-pointer hover:bg-bg-panel/50 transition-colors"
                  onClick={() => navigate("/athletes/" + a.id)}
                >
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuovo atleta" width={540}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
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
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Annulla</Button>
            <Button type="submit" icon={<Plus size={14} />}>Aggiungi atleta</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
