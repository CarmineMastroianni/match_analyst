import { Link } from "react-router-dom";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Plus } from "lucide-react";
import { useTeamsStore } from "../stores/useTeamsStore";
import { useMatchesStore } from "../stores/useMatchesStore";
import type { TeamCategory } from "../types/domain";

const teamSchema = z.object({
  name: z.string().min(1, "Obbligatorio"),
  club: z.string().min(1, "Obbligatorio"),
  category: z.enum(["M", "F"]),
});
type FormData = z.infer<typeof teamSchema>;

export function TeamsListPage() {
  const teams = useTeamsStore(useShallow((s) => s.list()));
  const byTeam = useMatchesStore((s) => s.byTeam);

  const [modalOpen, setModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const { register, handleSubmit, formState, reset } = useForm<FormData>({
    defaultValues: { name: "", club: "", category: "M" },
  });

  function onSubmit(data: FormData) {
    useTeamsStore.getState().upsert({
      name: data.name,
      club: data.club,
      category: data.category as TeamCategory,
      roster: [],
      lineup: [],
      crestSeed: data.name,
    });
    reset();
    setModalOpen(false);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }

  return (
    <>
      {toastVisible && (
        <div className="fixed top-4 right-4 z-50 bg-ok text-white text-sm font-semibold px-4 py-2.5 shadow-lg">
          Squadra aggiunta con successo
        </div>
      )}

      <div className="flex items-end justify-between mb-7">
        <div>
          <h1 className="font-cond font-bold uppercase text-[40px] leading-none">Squadre</h1>
          <div className="text-sm text-text-dark-dim mt-1">{teams.length} squadre</div>
        </div>
        <Button icon={<Plus size={14} />} onClick={() => setModalOpen(true)}>
          Nuova squadra
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {teams.map((t) => {
          const n = byTeam(t.id).length;
          return (
            <Link key={t.id} to={`/teams/${t.id}`} className="group hover:-translate-y-0.5 transition-transform block">
              <Card accent={t.category === "M" ? "red" : "blue"} className="hover:shadow-card transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <Badge tone={t.category === "M" ? "red" : "blue"}>{t.category}</Badge>
                  <div className="text-[11px] text-text-dark-dim font-mono">{t.club}</div>
                </div>
                <div className="font-cond font-bold uppercase text-xl leading-tight group-hover:text-brand-red transition-colors">{t.name}</div>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuova squadra" width={480}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
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
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Annulla</Button>
            <Button type="submit" icon={<Plus size={14} />}>Aggiungi squadra</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
