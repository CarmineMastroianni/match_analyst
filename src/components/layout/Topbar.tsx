import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useAthletesStore } from "../../stores/useAthletesStore";
import { useMatchesStore } from "../../stores/useMatchesStore";
import { fmtDate } from "../../utils/format";

type SearchResult =
  | { kind: "athlete"; id: string; label: string }
  | { kind: "match"; id: string; label: string };

export function Topbar({ breadcrumbs, actions }: { breadcrumbs: ReactNode; actions?: ReactNode }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const getAthlete = useAthletesStore((s) => s.get);
  const athletes = useAthletesStore(useShallow((s) => s.list()));
  const matches = useMatchesStore(useShallow((s) => s.list()));

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const athleteResults: SearchResult[] = athletes
      .filter((a) => `${a.firstName} ${a.lastName}`.toLowerCase().includes(q))
      .slice(0, 5)
      .map((a) => ({
        kind: "athlete",
        id: a.id,
        label: `${a.lastName} ${a.firstName}`,
      }));

    const matchResults: SearchResult[] = matches
      .filter((m) => {
        const aA = getAthlete(m.athleteAId);
        const aB = getAthlete(m.athleteBId);
        const dateStr = fmtDate(m.date).toLowerCase();
        const nameA = aA ? `${aA.lastName} ${aA.firstName}`.toLowerCase() : "";
        const nameB = aB ? `${aB.lastName} ${aB.firstName}`.toLowerCase() : "";
        return dateStr.includes(q) || nameA.includes(q) || nameB.includes(q);
      })
      .slice(0, 5)
      .map((m) => {
        const aA = getAthlete(m.athleteAId);
        const aB = getAthlete(m.athleteBId);
        return {
          kind: "match",
          id: m.id,
          label: `${aA?.lastName ?? "?"} vs ${aB?.lastName ?? "?"} · ${fmtDate(m.date)}`,
        };
      });

    setResults([...athleteResults, ...matchResults]);
    setOpen(true);
  }, [query, athletes, matches, getAthlete]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  function handleSelect(r: SearchResult) {
    setOpen(false);
    setQuery("");
    if (r.kind === "athlete") navigate(`/athletes/${r.id}`);
    else navigate(`/match/${r.id}/recap`);
  }

  return (
    <div className="h-16 border-b border-border-light px-8 flex items-center justify-between bg-bg-light-2 sticky top-0 z-10">
      <div className="text-[13px] text-text-dark-dim">{breadcrumbs}</div>
      <div className="flex items-center gap-3">
        <div ref={containerRef} className="hidden md:block relative w-72">
          <div className="flex items-center gap-2 px-3 py-2 bg-bg-light border border-border-light text-[13px] text-text-dark-dim">
            <Search size={14} className="shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca atleta, match…"
              className="bg-transparent outline-none flex-1 text-text-dark placeholder:text-text-dark-dim"
            />
          </div>
          {open && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-bg-light-2 border border-border-light shadow-card z-50">
              {results.map((r) => (
                <button
                  key={r.id + r.kind}
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-bg-panel transition-colors flex items-center gap-2"
                >
                  <span className="text-[10px] font-cond uppercase tracking-widest2 text-text-dark-dim w-12 shrink-0">
                    {r.kind === "athlete" ? "Atleta" : "Match"}
                  </span>
                  <span className="truncate text-text-dark">{r.label}</span>
                </button>
              ))}
            </div>
          )}
          {open && results.length === 0 && query.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-bg-light-2 border border-border-light shadow-card z-50 px-4 py-3 text-sm text-text-dark-dim italic">
              Nessun risultato.
            </div>
          )}
        </div>
        {actions}
      </div>
    </div>
  );
}
