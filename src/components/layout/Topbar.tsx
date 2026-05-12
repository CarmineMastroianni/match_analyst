import { Search } from "lucide-react";
import type { ReactNode } from "react";

export function Topbar({ breadcrumbs, actions }: { breadcrumbs: ReactNode; actions?: ReactNode }) {
  return (
    <div className="h-16 border-b border-border-light px-8 flex items-center justify-between bg-bg-light-2 sticky top-0 z-10">
      <div className="text-[13px] text-text-dark-dim">{breadcrumbs}</div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-bg-light border border-border-light text-[13px] text-text-dark-dim w-72">
          <Search size={14} />
          <span>Cerca atleta, squadra, match…</span>
        </div>
        {actions}
      </div>
    </div>
  );
}
