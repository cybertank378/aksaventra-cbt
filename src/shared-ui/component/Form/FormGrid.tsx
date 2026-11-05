//Files: src/shared-ui/component/Form/FormGrid.tsx

"use client";

import clsx from "clsx";
import type React from "react";

type Props = {
  children: React.ReactNode;
  cols?: 1 | 2;
  className?: string;
};

const FormGrid: React.FC<Props> = ({ children, cols = 2, className }) => {
  return (
    <div
      className={clsx(
        "grid gap-x-5 gap-y-6",
        cols === 2 ? "grid-cols-2" : "grid-cols-1",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default FormGrid;
