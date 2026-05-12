import type { ReactNode } from "react";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, children, width = 520 }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-dark/70 p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-light-2 border border-border-light shadow-card relative w-full"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="absolute top-0 left-0 h-[3px] w-12 bg-brand-red" />
        {title && (
          <div className="px-5 py-4 border-b border-border-light font-cond uppercase tracking-widest2 text-sm font-semibold">
            {title}
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
