import clsx from "clsx";
import type { LabelHTMLAttributes, ReactNode } from "react";

interface Props extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  className?: string;
}

export default function FormLabel({
  children,
  className,
  htmlFor,
  ...props
}: Props) {
  return (
    <label
      htmlFor={htmlFor}
      className={clsx("text-sm font-medium text-gray-900", className)}
      {...props}
    >
      {children}
    </label>
  );
}
