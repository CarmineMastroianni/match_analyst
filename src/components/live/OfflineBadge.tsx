import { WifiOff } from "lucide-react";
import { useLiveMatchStore } from "../../stores/useLiveMatchStore";

export function OfflineBadge() {
  const offline = useLiveMatchStore((s) => s.offline);
  const toggle = useLiveMatchStore((s) => s.toggleOffline);
  return (
    <button
      onClick={toggle}
      className={
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest2 transition-colors " +
        (offline
          ? "bg-warn text-bg-dark"
          : "bg-ok/20 text-ok border border-ok/40")
      }
      title="Toggle simulazione offline"
    >
      <WifiOff size={12} />
      {offline ? "Offline" : "Online"}
    </button>
  );
}
