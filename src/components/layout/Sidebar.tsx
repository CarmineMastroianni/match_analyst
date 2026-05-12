import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Upload,
  Plus,
  LogOut,
} from "lucide-react";
import clsx from "clsx";
import { useAuthStore } from "../../stores/useAuthStore";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/athletes", label: "Atleti", icon: Users },
  { to: "/teams", label: "Squadre", icon: Shield },
  { to: "/match/new", label: "Nuovo match", icon: Plus },
];

const configItems = [
  { to: "/settings/actions", label: "Azioni", icon: Settings },
  { to: "/import", label: "Import Excel", icon: Upload },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium border-l-2 transition-colors",
      isActive
        ? "text-white bg-bg-panel border-brand-red"
        : "text-text-dim border-transparent hover:text-white hover:bg-bg-panel",
    );

  return (
    <aside className="w-[240px] bg-bg-dark text-white flex flex-col sticky top-0 h-screen border-r border-border">
      <div className="px-6 pb-6 pt-6 flex items-center gap-3 border-b border-border">
        <div
          className="w-9 h-9 clip-mark flex items-center justify-center font-cond font-extrabold text-white text-xl"
          style={{ background: "linear-gradient(135deg,#C8102E 0%,#E11D3C 100%)" }}
        >
          S
        </div>
        <div className="font-cond font-bold text-xl uppercase tracking-wider2">
          SCHERMA<span className="text-brand-red-hot">·</span>MA
        </div>
      </div>
      <nav className="flex-1 flex flex-col gap-0.5 px-3 mt-4 overflow-y-auto">
        {navItems.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === "/"} className={linkCls}>
            <n.icon size={16} />
            {n.label}
          </NavLink>
        ))}
        <div className="px-3.5 mt-4 mb-1 text-[11px] uppercase tracking-widest2 text-text-dim font-semibold">
          Configurazione
        </div>
        {configItems.map((n) => (
          <NavLink key={n.to} to={n.to} className={linkCls}>
            <n.icon size={16} />
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-border flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm"
          style={{ background: "linear-gradient(135deg,#1E3A8A,#3B5FD9)" }}
        >
          {(user?.name ?? "M A").slice(0, 1)}
        </div>
        <div className="text-sm flex-1 min-w-0">
          <div className="font-semibold truncate">{user?.name ?? "—"}</div>
          <div className="text-text-dim text-[11px] truncate">{user?.email ?? ""}</div>
        </div>
        <button
          onClick={logout}
          aria-label="Logout"
          className="text-text-dim hover:text-white"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
