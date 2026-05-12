import type { ReactNode } from "react";
import clsx from "clsx";

type Tone = "red" | "blue" | "green" | "warn" | "neutral" | "dark";

const tones: Record<Tone, string> = {
  red: "bg-brand-red text-white",
  blue: "bg-brand-blue-hi text-white",
  green: "bg-ok text-white",
  warn: "bg-warn text-bg-dark",
  neutral: "bg-border-light text-text-dark",
  dark: "bg-bg-panel text-white",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest2",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
