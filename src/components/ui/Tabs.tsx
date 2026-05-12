import type { ReactNode } from "react";
import { useState } from "react";
import clsx from "clsx";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export function Tabs({ items, initial }: { items: TabItem[]; initial?: string }) {
  const [active, setActive] = useState(initial ?? items[0]?.id ?? "");
  const cur = items.find((i) => i.id === active);
  return (
    <div>
      <div className="flex border-b border-border-light gap-1 mb-5">
        {items.map((it) => {
          const on = it.id === active;
          return (
            <button
              key={it.id}
              onClick={() => setActive(it.id)}
              className={clsx(
                "px-4 py-2.5 text-sm font-semibold font-cond uppercase tracking-wider2 border-b-2 -mb-px transition-colors",
                on
                  ? "border-brand-red text-text-dark"
                  : "border-transparent text-text-dark-dim hover:text-text-dark",
              )}
            >
              {it.label}
            </button>
          );
        })}
      </div>
      <div>{cur?.content}</div>
    </div>
  );
}
