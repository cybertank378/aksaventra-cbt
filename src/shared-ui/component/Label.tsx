// Files: src/shared-ui/component/Label.tsx
"use client";
import clsx from "clsx";
import type React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({
  className,
  children,
  ...props
}) => (
  <label
    {...props}
    className={clsx("text-sm font-medium text-gray-700", className)}
  >
    {children}
  </label>
);
