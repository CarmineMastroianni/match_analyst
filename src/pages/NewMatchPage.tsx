import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Input";
import { useAthletesStore } from "../stores/useAthletesStore";
import { useMatchesStore } from "../stores/useMatchesStore";
import { useAuthStore } from "../stores/useAuthStore";
import type { MatchFormat } from "../types/domain";

export function NewMatchPage() {
  const nav = useNavigate();
  const athletes = useAthletesStore((s) => s.list());
  const upsert = useMatchesStore((s) => s.upsertMatch);
  const analystId = useAuthStore((s) => s.user?.id ?? "user_analyst");

  const [step, setStep] = useState(1);
  const [athleteAId, setA] = useState(athletes[0]?.id ?? "");
  const [athleteBId, setB] = useState(athletes[1]?.id ?? "");
  const [format, setFormat] = useState<MatchFormat>("a15");

  function confirm() {
    const a = athletes.find((x) => x.id === athleteAId);
    const b = athletes.find((x) => x.id === athleteBId);
    if (!a || !b || a.id === b.id) return;
    const m = upsert({
      date: new Date().toISOString(),
      weapon: "foil",
      format,
      athleteAId: a.id,
      athleteBId: b.id,
      teamAId: a.teamIds[0],
      teamBId: b.teamIds[0],
      scoreA: 0,
      scoreB: 0,
      status: "live",
      analystId,
    });
    nav(`/match/live/${m.id}`);
  }

  return (
    <>
      <h1 className="font-cond font-bold uppercase text-[40px] leading-none mb-6">Nuovo match</h1>
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={
              "flex-1 h-1 " + (step >= s ? "bg-brand-red" : "bg-border-light")
            }
          />
        ))}
      </div>

      {step === 1 && (
        <Card accent="red">
          <h2 className="font-cond uppercase font-bold text-lg mb-4">Step 1 · Atleti</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Select label="Atleta A" value={athleteAId} onChange={(e) => setA(e.target.value)}>
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.lastName} {a.firstName}
                </option>
              ))}
            </Select>
            <Select label="Atleta B" value={athleteBId} onChange={(e) => setB(e.target.value)}>
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.lastName} {a.firstName}
                </option>
              ))}
            </Select>
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!athleteAId || !athleteBId || athleteAId === athleteBId}>
              Continua →
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card accent="red">
          <h2 className="font-cond uppercase font-bold text-lg mb-4">Step 2 · Arma e formato</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Select label="Arma" value="foil" disabled>
              <option value="foil">Fioretto</option>
            </Select>
            <Select label="Formato" value={format} onChange={(e) => setFormat(e.target.value as MatchFormat)}>
              <option value="a15">Assalto a 15</option>
              <option value="a5">Assalto a 5</option>
            </Select>
          </div>
          <div className="mt-5 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>← Indietro</Button>
            <Button onClick={() => setStep(3)}>Continua →</Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card accent="red">
          <h2 className="font-cond uppercase font-bold text-lg mb-4">Step 3 · Conferma</h2>
          <ul className="text-sm space-y-2 mb-5">
            <li>
              <b>Atleta A:</b> {athletes.find((a) => a.id === athleteAId)?.lastName}{" "}
              {athletes.find((a) => a.id === athleteAId)?.firstName}
            </li>
            <li>
              <b>Atleta B:</b> {athletes.find((a) => a.id === athleteBId)?.lastName}{" "}
              {athletes.find((a) => a.id === athleteBId)?.firstName}
            </li>
            <li><b>Arma:</b> Fioretto</li>
            <li><b>Formato:</b> {format}</li>
          </ul>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>← Indietro</Button>
            <Button onClick={confirm}>Avvia live match →</Button>
          </div>
        </Card>
      )}
    </>
  );
}
