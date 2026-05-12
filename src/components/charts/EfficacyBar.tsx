interface Row {
  label: string;
  yes: number;
  total: number;
  color: string;
}

export function EfficacyBar({ rows }: { rows: Row[] }) {
  return (
    <div className="flex flex-col gap-3">
      {rows.map((r) => {
        const pct = r.total === 0 ? 0 : Math.round((r.yes / r.total) * 100);
        return (
          <div key={r.label}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-cond font-semibold uppercase tracking-wider2 text-[13px]">
                {r.label}
              </span>
              <span className="font-cond font-bold text-sm">
                {pct}% <span className="text-text-dark-dim text-xs">· {r.yes}/{r.total}</span>
              </span>
            </div>
            <div className="h-2 bg-border-light overflow-hidden">
              <div
                className="h-full"
                style={{ width: `${pct}%`, background: r.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
