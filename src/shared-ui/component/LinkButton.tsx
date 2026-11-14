"use client";

import Link from "next/link";
import Button, {
  type Props as ButtonProps,
} from "@/shared-ui/component/Button";

type Props = {
  href: string;
  children: React.ReactNode;
} & Omit<ButtonProps, "onClick">;

function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

export default function LinkButton({ href, children, ...props }: Props) {
  /* ================= EXTERNAL ================= */
  if (isExternal(href)) {
    return (
      <Button asChild {...props}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2"
        >
          {children}
        </a>
      </Button>
    );
  }

  /* ================= INTERNAL ================= */
  return (
    <Button asChild {...props}>
      <Link href={href} className="inline-flex items-center gap-2">
        {children}
      </Link>
    </Button>
  );
}
