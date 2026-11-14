//Files: src/shared-ui/component/Avatar.tsx
"use client";

import Image from "next/image";
import type { FC } from "react";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  readonly name: string;
  readonly image?: string | null;
  readonly size?: AvatarSize;
  readonly className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
};

function getInitials(name: string): string {
  const words = name
    .trim()
    .split(" ")
    .filter((word) => word.length > 0);

  if (words.length === 0) {
    return "";
  }

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  const firstInitial = words[0].charAt(0);
  const lastInitial = words[words.length - 1].charAt(0);

  return `${firstInitial}${lastInitial}`.toUpperCase();
}

const Avatar: FC<AvatarProps> = ({
  name,
  image,
  size = "md",
  className = "",
}) => {
  const initials = getInitials(name);
  const hasImage = typeof image === "string" && image.length > 0;

  return (
    <div
      className={[
        "relative inline-flex items-center justify-center",
        "overflow-hidden rounded-full",
        hasImage ? "bg-transparent" : "bg-blue-600",
        "font-semibold text-white select-none",
        sizeClasses[size],
        className,
      ].join(" ")}
    >
      {hasImage ? (
        <Image
          src={image}
          alt={name}
          fill
          sizes="100%"
          className="object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
