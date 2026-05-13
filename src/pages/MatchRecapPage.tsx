import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { DonutChart } from "../components/charts/DonutChart";
import { useMatchesStore } from "../stores/useMatchesStore";
import { useAthletesStore } from "../stores/useAthletesStore";
import { useActionsConfigStore } from "../stores/useActionsConfigStore";
import { actionColor } from "../hooks/useStats";
import { fmtDate } from "../utils/format";
import { Trash2, ChevronLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function MatchRecapPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const m = useMatchesStore((s) => s.get(id));
  const events = useMatchesStore((s) => s.events[id] ?? []);
  const aGet = useAthletesStore((s) => s.get);
  const actions = useActionsConfigStore(useShallow((s) => s.list()));

  const [notes, setNotes] = useState(m?.notes ?? "");
  const [notesSaved, setNotesSaved] = useState(false);

  if (!m) return <Navigate to="/" replace />;
  const athA = aGet(m.athleteAId);
  const athB = aGet(m.athleteBId);

  const dataFor = (athId: string) =>
    actions
      .map((act) => {
        const evs = events.filter((e) => e.athleteId === athId && e.actionTypeId === act.id);
        return { name: act.label, value: evs.length, color: actionColor(act) };
      })
      .filter((d) => d.value > 0);

  const comparisonData = actions
    .map((act) => ({
      name: act.code,
      A: events.filter((e) => e.athleteId === m.athleteAId && e.actionTypeId === act.id).length,
      B: events.filter((e) => e.athleteId === m.athleteBId && e.actionTypeId === act.id).length,
    }))
    .filter((d) => d.A > 0 || d.B > 0);

  function handleDelete() {
    if (window.confirm("Sei sicuro di voler eliminare questo match?")) {
      useMatchesStore.getState().remove(id);
      navigate("/");
    }
  }

  function handleSaveNotes() {
    useMatchesStore.getState().setNotes(id, notes);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
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
        <Badge tone={m.status === "done" ? "green" : "neutral"}>{m.status.toUpperCase()}</Badge>
        <div className="font-cond font-bold uppercase text-3xl mt-3">
          {athA?.lastName} {athA?.firstName} <span className="text-text-dim mx-2">vs</span> {athB?.lastName} {athB?.firstName}
        </div>
        <div className="font-cond font-extrabold text-7xl mt-3 tabular-nums">
          <span className={m.scoreA > m.scoreB ? "text-brand-red-hot" : ""}>{m.scoreA}</span>
          <span className="text-text-dim mx-3">:</span>
          <span className={m.scoreB > m.scoreA ? "text-brand-red-hot" : ""}>{m.scoreB}</span>
        </div>
        <div className="text-sm text-text-dim mt-3">
          {fmtDate(m.date)} · {m.venue ?? "—"} · {m.format.toUpperCase()}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-6">
        <Card title="Durata" accent="red">
          <div className="font-cond font-bold text-4xl">{events[events.length - 1]?.matchTime ?? "00:00"}</div>
        </Card>
        <Card title="Azioni totali" accent="blue">
          <div className="font-cond font-bold text-4xl">{events.length}</div>
        </Card>
        <Card title="Data" accent="blue">
          <div className="font-cond font-bold text-2xl">{fmtDate(m.date)}</div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-6">
        <Card title={`Azioni · ${athA?.lastName ?? "A"}`} accent="red">
          <DonutChart data={dataFor(m.athleteAId)} centerLabel="Azioni" centerValue={dataFor(m.athleteAId).reduce((s, d) => s + d.value, 0)} />
        </Card>
        <Card title={`Azioni · ${athB?.lastName ?? "B"}`} accent="blue">
          <DonutChart data={dataFor(m.athleteBId)} centerLabel="Azioni" centerValue={dataFor(m.athleteBId).reduce((s, d) => s + d.value, 0)} />
        </Card>
      </div>

      {comparisonData.length > 0 && (
        <Card title="Confronto azioni" accent="blue" className="mb-6">
          <div className="text-[11px] font-cond uppercase tracking-widest2 text-text-dark-dim mb-3 flex gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 bg-brand-red" />
              {athA?.lastName ?? "A"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 bg-brand-blue-hi" />
              {athB?.lastName ?? "B"}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={comparisonData} barGap={2} barCategoryGap="20%">
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#888", fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#888", fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1a2e",
                  border: "1px solid #2a2a3e",
                  fontSize: 12,
                  color: "#fff",
                }}
              />
              <Bar dataKey="A" name={athA?.lastName ?? "A"} fill="#C8102E" radius={0} />
              <Bar dataKey="B" name={athB?.lastName ?? "B"} fill="#3B5FD9" radius={0} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card title="Timeline azioni" accent="red">
        <ol className="text-sm divide-y divide-border-light">
          {events.map((e, i) => {
            const act = actions.find((a) => a.id === e.actionTypeId);
            const ath = aGet(e.athleteId);
            return (
              <li key={e.id} className="py-2 flex items-center gap-3">
                <span className="font-mono text-[11px] text-text-dark-dim w-10">{String(i + 1).padStart(3, "0")}</span>
                <span className="font-mono text-[11px] w-12">{e.matchTime}</span>
                <span className="font-cond font-semibold uppercase tracking-wider2 text-xs w-48 truncate">
                  {act?.label ?? "—"}
                </span>
                <span className="text-xs flex-1 truncate">{ath?.lastName}</span>
                <span
                  className={
                    "font-cond font-bold text-xs uppercase tracking-widest2 " +
                    (e.choice === "yes" ? "text-ok" : "text-danger")
                  }
                >
                  {e.choice === "yes" ? "Sì" : "No"}
                  {e.subLabel ? ` · ${e.subLabel}` : ""}
                </span>
                <span className="font-cond font-bold text-xs">{e.scoreAfter.A}–{e.scoreAfter.B}</span>
              </li>
            );
          })}
          {events.length === 0 && (
            <li className="py-4 text-text-dark-dim italic text-sm">Nessuna azione registrata.</li>
          )}
        </ol>
      </Card>

      <Card title="Note match" accent="blue" className="mt-6">
        <textarea
          className="w-full min-h-[140px] p-3 border border-border-light text-sm bg-bg-light-2 resize-y"
          placeholder="Aggiungi note su questo match…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex justify-end mt-3">
          <Button
            onClick={handleSaveNotes}
            variant={notesSaved ? "ghost" : "primary"}
          >
            {notesSaved ? "Salvato ✓" : "Salva note"}
          </Button>
        </div>
      </Card>

      <div className="flex justify-between gap-2 mt-6">
        <Button variant="danger" icon={<Trash2 size={14} />} onClick={handleDelete}>
          Elimina match
        </Button>
        <div className="flex gap-2">
          <Link to="/"><Button variant="ghost">Torna alla dashboard</Button></Link>
          <Button disabled title="Disponibile nel Tier 4">Esporta PDF</Button>
        </div>
      </div>
    </>
  );
}
