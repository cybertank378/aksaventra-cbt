//Files: src/shared-ui/component/DropdownItem.tsx
import clsx from "clsx";

import type { LucideIcon } from "lucide-react";

//////////////////////////////////////////////////////////////
// PROPS
//////////////////////////////////////////////////////////////

interface Props {
  icon?: LucideIcon;

  label: string;

  badge?: string;

  onClick?: () => void;
}

//////////////////////////////////////////////////////////////
// COMPONENT
//////////////////////////////////////////////////////////////

export function DropdownItem({
  icon: Icon,

  label,

  badge,

  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex w-full items-center justify-between",
        "px-4 py-2.5 text-sm text-gray-700",
        "transition-colors hover:bg-gray-100",
      )}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon size={18} className="text-gray-500" />}

        <span className="text-left">{label}</span>
      </div>

      {badge && (
        <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
          {badge}
        </span>
      )}
    </button>
  );
}
