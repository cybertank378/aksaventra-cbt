import clsx from "clsx";
import type React from "react";

interface Props {
  children: React.ReactNode;

  className?: string;
}

export default function Card({ children, className }: Props) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-slate-100 bg-white p-6 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
