"use client";

import type { LucideIcon } from "lucide-react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/shared-ui/component/Button";
import { DropdownItem } from "@/shared-ui/component/DropdownItem";

export interface AvatarDropdownItem {
  label: string;
  icon?: LucideIcon;
  path?: string;
  onClick?: () => void;
}

export interface AvatarDropdownProps {
  items?: AvatarDropdownItem[];
  onLogout?: () => void | Promise<void>;
  loading?: boolean;
}

export default function AvatarDropdown({
  items = [],
  onLogout,
  loading = false,
}: AvatarDropdownProps) {
  const router = useRouter();

  return (
    <div className="w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
      {items.length > 0 && (
        <div className="py-1">
          {items.map((item) => (
            <DropdownItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else if (item.path) {
                  router.push(item.path);
                }
              }}
            />
          ))}
        </div>
      )}

      {onLogout && (
        <>
          {items.length > 0 && <div className="border-t border-slate-100" />}
          <div className="p-2">
            <Button
              type="button"
              variant="filled"
              color="danger"
              size="sm"
              fullWidth
              leftIcon={LogOut}
              loading={loading}
              onClick={onLogout}
            >
              {loading ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
