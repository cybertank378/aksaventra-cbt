//Files: src/shared-ui/component/CheckboxGroup.tsx

import clsx from "clsx";
import Checkbox from "@/shared-ui/component/Checkbox";

type Direction = "vertical" | "horizontal";

interface Option<T extends string> {
  label: string;
  value: T;
}

interface Props<T extends string> {
  options: Option<T>[];
  value?: T[];
  onChange?: (value: T[]) => void;
  direction?: Direction;
  className?: string;
}

export default function CheckboxGroup<T extends string>({
  options,
  value = [],
  onChange,
  direction = "vertical",
  className,
}: Props<T>) {
  const handleChange = (val: T) => {
    if (!onChange) return;

    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div
      className={clsx(
        direction === "vertical"
          ? "flex flex-col gap-2"
          : "flex flex-wrap gap-4",
        className,
      )}
    >
      {options.map((opt) => (
        <Checkbox
          key={opt.value}
          label={opt.label}
          checked={value.includes(opt.value)}
          onChange={() => handleChange(opt.value)}
        />
      ))}
    </div>
  );
}
