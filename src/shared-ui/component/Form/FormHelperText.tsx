//Files: src/shared-ui/component/Form/FormHelperText.tsx
"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  error?: boolean;
  success?: boolean;
}

export default function FormHelperText({ children, error, success }: Props) {
  return (
    <p
      className={clsx(
        "text-xs mt-1",
        error && "text-red-600",
        success && "text-green-600",
        !error && !success && "text-gray-500",
      )}
    >
      {children}
    </p>
  );
}
