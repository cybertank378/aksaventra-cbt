//Files: src/shared-ui/component/Form/FormLabel.tsx
// src/shared-ui/component/Form/FormLabel.tsx

import clsx from "clsx";

interface Props {
  children: React.ReactNode;
  className?: string; // ✅ tambahkan ini
}

export default function FormLabel({ children, className }: Props) {
  return (
    <label
      className={clsx(
        "text-sm font-medium text-gray-900",
        className, // ✅ gabungkan
      )}
    >
      {children}
    </label>
  );
}
