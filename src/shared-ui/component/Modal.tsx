"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import type { FC, MouseEvent, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import Button, { type ButtonColor } from "@/shared-ui/component/Button";

interface ModalProps {
  title?: string;
  subtitle?: string;
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  children: ReactNode;

  className?: string;
  titleClassName?: string;
  submitButtonClassName?: string;
  cancelButtonClassName?: string;

  size?: "sm" | "md" | "lg" | "xl";

  submitColor?: ButtonColor;
  cancelColor?: ButtonColor;

  submitDisabled?: boolean;
  submitLoading?: boolean;
}

const sizeMap: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export const Modal: FC<ModalProps> = ({
  title,
  subtitle,
  open,
  onClose,
  onSubmit,
  submitText = "Save",
  cancelText = "Cancel",
  children,
  className,
  titleClassName,
  submitButtonClassName,
  cancelButtonClassName,
  size = "md",
  submitColor = "primary",
  cancelColor = "secondary",
  submitDisabled = false,
  submitLoading = false,
}) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previousFocus?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 outline-none"
      onClick={handleOverlayClick}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className={clsx(
          "relative w-full rounded-2xl bg-white p-6 sm:p-8",
          "border border-gray-100",
          "shadow-2xl",
          "max-h-[90vh] overflow-y-auto scrollbar-modern",
          sizeMap[size],
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup dialog"
          className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0097a7]"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {title && (
          <div className="mb-6 pr-10 text-center">
            <h2
              id={titleId}
              className={clsx(
                "text-xl font-semibold text-gray-900",
                titleClassName,
              )}
            >
              {title}
            </h2>

            {subtitle && (
              <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        )}

        <div>{children}</div>

        {onSubmit && (
          <div className="mt-8 flex justify-center gap-4">
            <Button
              variant="outline"
              color={cancelColor}
              className={clsx("min-w-[110px]", cancelButtonClassName)}
              onClick={onClose}
              disabled={submitLoading}
            >
              {cancelText}
            </Button>

            <Button
              variant="filled"
              color={submitColor}
              className={clsx("min-w-[110px]", submitButtonClassName)}
              onClick={onSubmit}
              disabled={submitDisabled || submitLoading}
              loading={submitLoading}
            >
              {submitText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
