//Files: src/shared-ui/component/Form/FormLayout.tsx
"use client";

import clsx from "clsx";
import type React from "react";

type Props = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

const FormLayout: React.FC<Props> = ({
  title,
  subtitle,
  children,
  className,
}) => {
  return (
    <div className={clsx("w-full bg-transparent p-10 shadow-lg", className)}>
      {/* HEADER */}
      {title && (
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}

      {/* CONTENT */}
      <div className="space-y-6">{children}</div>
    </div>
  );
};

export default FormLayout;
