import clsx from "clsx";
import { gradientFor, initials } from "../../utils/format";

interface Props {
  firstName: string;
  lastName: string;
  size?: number;
  className?: string;
  seed?: string;
}

export function Avatar({ firstName, lastName, size = 36, className, seed }: Props) {
  const [from, to] = gradientFor(seed ?? `${firstName} ${lastName}`);
  return (
    <div
      className={clsx(
        "flex items-center justify-center text-white font-cond font-bold uppercase clip-mark select-none",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        fontSize: Math.round(size * 0.42),
        letterSpacing: "0.04em",
      }}
      aria-hidden
    >
      {initials(firstName, lastName)}
    </div>
  );
}
