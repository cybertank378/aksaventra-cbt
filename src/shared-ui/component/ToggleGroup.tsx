//Files: src/shared-ui/ToggleGroup.tsx

"use client";

import clsx from "clsx";
import { useState } from "react";

interface Props {
  options: { label: string; value: string }[];
  value?: string;
  onChange?: (val: string) => void;
}

export default function ToggleGroup({ options, value, onChange }: Props) {
  const [internal, setInternal] = useState(value);

  const current = value ?? internal;

  const handleSelect = (val: string) => {
    if (!value) setInternal(val);
    onChange?.(val);
  };

  return (
    <div role="group" className="inline-flex rounded-lg border overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => handleSelect(opt.value)}
          className={clsx(
            "px-4 py-2 text-sm transition-all",
            current === opt.value
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
