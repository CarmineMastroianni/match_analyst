import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useActionsConfigStore } from "../stores/useActionsConfigStore";
import { actionColor } from "../hooks/useStats";
import { buildDefaultActions } from "../mocks/seed";
import { RotateCcw, ChevronLeft, ChevronDown, ChevronUp, Trash2, Plus } from "lucide-react";
import { makeId } from "../utils/ids";
import type { ActionColor, ActionType } from "../types/domain";

const ACTION_COLORS: { value: ActionColor; hex: string }[] = [
  { value: "red", hex: "#C8102E" },
  { value: "red-hot", hex: "#E11D3C" },
  { value: "blue", hex: "#1E3A8A" },
  { value: "blue-hi", hex: "#3B5FD9" },
  { value: "warn", hex: "#F59E0B" },
  { value: "ok", hex: "#10B981" },
  { value: "green", hex: "#22c55e" },
  { value: "danger", hex: "#EF4444" },
];

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");
  function add() {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput("");
  }
  return (
    <div className="flex flex-wrap gap-1 items-center">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-bg-dark border border-border text-xs">
          {t}
          <button onClick={() => onChange(tags.filter((x) => x !== t))} className="text-text-dim hover:text-danger">×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        placeholder="+ aggiungi…"
        className="bg-transparent text-xs outline-none border-b border-border text-white placeholder:text-text-dim w-24"
      />
      {input && <button onClick={add} className="text-brand-red text-xs font-bold">+</button>}
    </div>
  );
}

export function ActionsConfigPage() {
  const navigate = useNavigate();
  const actions = useActionsConfigStore(useShallow((s) => s.byWeapon("foil")));
  const toggleActive = useActionsConfigStore((s) => s.toggleActive);
  const toggleMain = useActionsConfigStore((s) => s.toggleMain);
  const upsert = useActionsConfigStore((s) => s.upsert);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeCount = actions.filter((a) => a.active).length;
  const mainCount = actions.filter((a) => a.active && a.isMain).length;

  function handleReset() {
    useActionsConfigStore.getState().reset();
    const defaults = buildDefaultActions();
    for (const a of defaults) {
      useActionsConfigStore.getState().upsert(a);
    }
  }

  function moveUp(a: ActionType) {
    const idx = actions.findIndex((x) => x.id === a.id);
    if (idx <= 0) return;
    const prev = actions[idx - 1];
    if (!prev) return;
    upsert({ ...a, sortOrder: prev.sortOrder });
    upsert({ ...prev, sortOrder: a.sortOrder });
  }

  function moveDown(a: ActionType) {
    const idx = actions.findIndex((x) => x.id === a.id);
    if (idx < 0 || idx >= actions.length - 1) return;
    const next = actions[idx + 1];
    if (!next) return;
    upsert({ ...a, sortOrder: next.sortOrder });
    upsert({ ...next, sortOrder: a.sortOrder });
  }

  function deleteAction(id: string) {
    useActionsConfigStore.getState().remove(id);
    if (expandedId === id) setExpandedId(null);
  }

  function addAction() {
    const maxOrder = Math.max(0, ...actions.map((a) => a.sortOrder));
    useActionsConfigStore.getState().upsert({
      id: makeId("act"),
      label: "Nuova azione",
      code: "NEW",
      weapon: "foil",
      color: "blue",
      active: true,
      isMain: false,
      subYes: [],
      subNo: [],
      sortOrder: maxOrder + 1,
    });
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

      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-cond font-bold uppercase text-[40px] leading-none mb-1">
            Configurazione azioni
          </h1>
          <div className="text-sm text-text-dark-dim">
            Fioretto · <span className="text-white font-semibold">{activeCount} azioni attive</span>
            {" · "}
            <span className="text-white font-semibold">{mainCount} azioni principali</span>
          </div>
        </div>
        <Button
          variant="ghost"
          icon={<RotateCcw size={14} />}
          onClick={handleReset}
        >
          Reset al default
        </Button>
      </div>

      <Card accent="red">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-widest2 font-cond text-text-dark-dim">
              <th className="py-2 pr-2 w-8">#</th>
              <th className="py-2 pr-2 w-8">Colore</th>
              <th className="py-2 pr-2">Label</th>
              <th className="py-2 pr-2 w-24">Codice</th>
              <th className="py-2 pr-2 w-20">
                <span title="L'azione appare nelle tile principali della schermata Live (max 6 per arma)">
                  Principale
                </span>
              </th>
              <th className="py-2 pr-2 w-16">
                <span title="L'azione è disponibile per il tracciamento live">
                  Attiva
                </span>
              </th>
              <th className="py-2 pr-2 w-20">Ordine</th>
              <th className="py-2 pr-2 w-8"></th>
              <th className="py-2 pr-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {actions.map((a, i) => (
              <Fragment key={a.id}>
                <tr className="border-t border-border-light">
                  <td className="py-2 pr-2 font-mono text-xs">{i + 1}</td>
                  <td className="py-2 pr-2">
                    <span
                      className="inline-block w-4 h-4"
                      style={{ background: actionColor(a) }}
                    />
                  </td>
                  <td className="py-2 pr-2 min-w-[200px]">
                    <Input
                      value={a.label}
                      onChange={(e) => upsert({ ...a, label: e.target.value })}
                    />
                  </td>
                  <td className="py-2 pr-2 w-24">
                    <Input
                      value={a.code}
                      onChange={(e) => upsert({ ...a, code: e.target.value.toUpperCase() })}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <button
                      onClick={() => toggleMain(a.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-cond font-semibold uppercase tracking-widest2 transition-colors"
                      style={{
                        background: a.isMain ? "rgba(200,16,46,0.15)" : "rgba(255,255,255,0.05)",
                        color: a.isMain ? "#E11D3C" : "#666",
                        borderLeft: a.isMain ? "2px solid #C8102E" : "2px solid transparent",
                      }}
                    >
                      {a.isMain ? "Sì" : "No"}
                    </button>
                  </td>
                  <td className="py-2 pr-2">
                    <button
                      onClick={() => toggleActive(a.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-cond font-semibold uppercase tracking-widest2 transition-colors"
                      style={{
                        background: a.active ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)",
                        color: a.active ? "#22c55e" : "#666",
                        borderLeft: a.active ? "2px solid #22c55e" : "2px solid transparent",
                      }}
                    >
                      {a.active ? "On" : "Off"}
                    </button>
                  </td>
                  <td className="py-2 pr-2">
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveUp(a)}
                        disabled={i === 0}
                        className="px-1.5 py-1 text-text-dim hover:text-white disabled:opacity-30"
                        title="Sposta su"
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        onClick={() => moveDown(a)}
                        disabled={i === actions.length - 1}
                        className="px-1.5 py-1 text-text-dim hover:text-white disabled:opacity-30"
                        title="Sposta giù"
                      >
                        <ChevronDown size={13} />
                      </button>
                    </div>
                  </td>
                  <td className="py-2 pr-2">
                    <button
                      onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                      className="px-1.5 py-1 text-text-dim hover:text-white"
                      title="Dettagli"
                    >
                      {expandedId === a.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </td>
                  <td className="py-2 pr-2">
                    <button
                      onClick={() => deleteAction(a.id)}
                      className="px-1.5 py-1 text-text-dim hover:text-danger"
                      title="Elimina azione"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
                {expandedId === a.id && (
                  <tr className="bg-bg-dark/40">
                    <td colSpan={9} className="px-4 py-4">
                      <div className="grid md:grid-cols-2 gap-5">
                        <div>
                          <div className="text-[11px] uppercase font-cond tracking-widest2 text-text-dark-dim mb-2">Colore</div>
                          <div className="flex gap-2 flex-wrap">
                            {ACTION_COLORS.map((c) => (
                              <button
                                key={c.value}
                                onClick={() => upsert({ ...a, color: c.value })}
                                className="w-6 h-6 rounded-full transition-all"
                                style={{
                                  background: c.hex,
                                  outline: a.color === c.value ? "2px solid white" : "2px solid transparent",
                                  outlineOffset: "2px",
                                }}
                                title={c.value}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={a.equalWeights ?? false}
                              onChange={(e) => upsert({ ...a, equalWeights: e.target.checked })}
                              className="accent-brand-red"
                            />
                            <span className="text-text-dark-dim text-xs uppercase font-cond tracking-widest2">Pesi uguali</span>
                          </label>
                          <div>
                            <div className="text-[11px] uppercase font-cond tracking-widest2 text-text-dark-dim mb-1">Placeholder "No"</div>
                            <input
                              value={a.noPlaceholder ?? ""}
                              onChange={(e) => upsert({ ...a, noPlaceholder: e.target.value })}
                              placeholder="Testo placeholder…"
                              className="px-2 py-1.5 bg-bg-light-2 border border-border-light text-sm text-text-dark focus:border-brand-blue-hi focus:outline-none w-full"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] uppercase font-cond tracking-widest2 text-text-dark-dim mb-2">Sub-opzioni "Sì"</div>
                          <TagInput
                            tags={a.subYes}
                            onChange={(tags) => upsert({ ...a, subYes: tags })}
                          />
                        </div>
                        <div>
                          <div className="text-[11px] uppercase font-cond tracking-widest2 text-text-dark-dim mb-2">Sub-opzioni "No"</div>
                          <TagInput
                            tags={a.subNo}
                            onChange={(tags) => upsert({ ...a, subNo: tags })}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        <div className="mt-4 pt-4 border-t border-border-light">
          <Button variant="ghost" icon={<Plus size={14} />} onClick={addAction}>
            Aggiungi azione
          </Button>
        </div>
      </Card>
    </>
  );
}
