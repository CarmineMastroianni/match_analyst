import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { useActionsConfigStore } from "../stores/useActionsConfigStore";
import { actionColor } from "../hooks/useStats";

export function ActionsConfigPage() {
  const actions = useActionsConfigStore((s) => s.byWeapon("foil"));
  const toggleActive = useActionsConfigStore((s) => s.toggleActive);
  const toggleMain = useActionsConfigStore((s) => s.toggleMain);
  const upsert = useActionsConfigStore((s) => s.upsert);

  const mainCount = actions.filter((a) => a.active && a.isMain).length;

  return (
    <>
      <h1 className="font-cond font-bold uppercase text-[40px] leading-none mb-2">
        Configurazione azioni
      </h1>
      <div className="text-sm text-text-dark-dim mb-6">
        Fioretto · {mainCount}/6 azioni principali attive
      </div>

      <Card accent="red">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-widest2 font-cond text-text-dark-dim">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Colore</th>
              <th className="py-2 pr-2">Label</th>
              <th className="py-2 pr-2">Codice</th>
              <th className="py-2 pr-2">Principale</th>
              <th className="py-2 pr-2">Attiva</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((a, i) => (
              <tr key={a.id} className="border-t border-border-light">
                <td className="py-2 pr-2 font-mono text-xs">{i + 1}</td>
                <td className="py-2 pr-2">
                  <span
                    className="inline-block w-4 h-4"
                    style={{ background: actionColor(a) }}
                  />
                </td>
                <td className="py-2 pr-2 min-w-[260px]">
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
                  <button onClick={() => toggleMain(a.id)}>
                    <Badge tone={a.isMain ? "red" : "neutral"}>{a.isMain ? "Sì" : "No"}</Badge>
                  </button>
                </td>
                <td className="py-2 pr-2">
                  <button onClick={() => toggleActive(a.id)}>
                    <Badge tone={a.active ? "green" : "neutral"}>{a.active ? "On" : "Off"}</Badge>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
