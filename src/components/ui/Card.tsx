import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  accent?: "red" | "blue" | "none";
  title?: ReactNode;
  dense?: boolean;
}

export function Card({ accent = "red", title, dense, className, children, ...rest }: Props) {
  return (
    <div
      {...rest}
      className={clsx(
        "relative bg-bg-light-2 border border-border-light",
        dense ? "p-4" : "p-5",
        className,
      )}
    >
      {accent !== "none" && (
        <span
          className={clsx(
            "absolute top-0 left-0 h-[3px] w-10",
            accent === "red" ? "bg-brand-red" : "bg-brand-blue-hi",
          )}
        />
      )}
      {title && (
        <h3 className="font-cond uppercase text-[13px] font-semibold tracking-widest2 text-text-dark-dim mb-2.5">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
