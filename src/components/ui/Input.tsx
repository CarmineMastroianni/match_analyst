import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...rest },
  ref,
) {
  const inputId = id ?? `in_${rest.name ?? Math.random().toString(36).slice(2, 8)}`;
  return (
    <label htmlFor={inputId} className="flex flex-col gap-1 text-sm">
      {label && (
        <span className="font-cond uppercase tracking-widest2 text-[12px] text-text-dark-dim font-semibold">
          {label}
        </span>
      )}
      <input
        ref={ref}
        id={inputId}
        {...rest}
        className={clsx(
          "px-3 py-2.5 bg-bg-light-2 border border-border-light text-sm text-text-dark",
          "focus:border-brand-blue-hi focus:outline-none",
          error && "border-danger",
          className,
        )}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className, id, children, ...rest },
  ref,
) {
  const selectId = id ?? `sel_${rest.name ?? Math.random().toString(36).slice(2, 8)}`;
  return (
    <label htmlFor={selectId} className="flex flex-col gap-1 text-sm">
      {label && (
        <span className="font-cond uppercase tracking-widest2 text-[12px] text-text-dark-dim font-semibold">
          {label}
        </span>
      )}
      <select
        ref={ref}
        id={selectId}
        {...rest}
        className={clsx(
          "px-3 py-2.5 bg-bg-light-2 border border-border-light text-sm text-text-dark",
          "focus:border-brand-blue-hi focus:outline-none",
          error && "border-danger",
          className,
        )}
      >
        {children}
      </select>
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
});
