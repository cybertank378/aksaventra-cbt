import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getDefaultRedirectForRole } from "@/security/rbacConfig";

/**
 * Merges CSS class names with clsx and resolves Tailwind CSS collisions using tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Redirects user to their role-specific landing page.
 */
export function redirectByRole(role?: string | null): string {
  return getDefaultRedirectForRole(role);
}
