import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export type ButtonVariant = "primary" | "ghost" | "danger" | "dark";
export type ButtonSize = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

const variantCls: Record<ButtonVariant, string> = {
  primary: "bg-brand-red text-white hover:bg-brand-red-hot clip-btn px-5",
  ghost:
    "bg-transparent text-text-dark border border-border-light hover:bg-bg-light",
  danger: "bg-danger text-white hover:opacity-90 clip-btn px-5",
  dark: "bg-bg-panel text-white hover:bg-bg-panel-2 border border-border",
};

const sizeCls: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", className, icon, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      {...rest}
      className={clsx(
        "inline-flex items-center gap-2 font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
        variantCls[variant],
        sizeCls[size],
        className,
      )}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </button>
  );
});
