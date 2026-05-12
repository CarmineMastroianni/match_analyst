import { hash32 } from "./ids";

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtMatchTime(elapsedSeconds: number): string {
  const m = Math.floor(elapsedSeconds / 60);
  const s = elapsedSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

const GRADIENT_PAIRS: readonly [string, string][] = [
  ["#C8102E", "#E11D3C"],
  ["#1E3A8A", "#3B5FD9"],
  ["#16A34A", "#22C55E"],
  ["#F59E0B", "#EF4444"],
  ["#1F2330", "#5A6070"],
  ["#3B5FD9", "#C8102E"],
  ["#10B981", "#1E3A8A"],
  ["#E11D3C", "#1F2330"],
];

export function gradientFor(seed: string): [string, string] {
  const h = hash32(seed);
  const pick = GRADIENT_PAIRS[h % GRADIENT_PAIRS.length];
  return pick ?? ["#1E3A8A", "#3B5FD9"];
}

export function pct(num: number, den: number): number {
  if (den === 0) return 0;
  return Math.round((num / den) * 100);
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
