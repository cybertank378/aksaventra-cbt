// Files: src/shared-ui/component/Modal.tsx
"use client";

import clsx from "clsx";
import type { FC, MouseEvent, ReactNode } from "react";
import { useEffect } from "react";
import Button from "@/shared-ui/component/Button";

interface ModalProps {
  title?: string; // ✅ FIX: sekarang optional
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

  submitColor?:
    | "primary"
    | "secondary"
    | "error"
    | "warning"
    | "info"
    | "success";
  cancelColor?:
    | "primary"
    | "secondary"
    | "error"
    | "warning"
    | "info"
    | "success";

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
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={handleOverlayClick}
    >
      <div
        className={clsx(
          "w-full rounded-2xl bg-white p-8",
          "border border-gray-100", // ✅ tambah ini
          "shadow-2xl", // ✅ lebih kuat
          "max-h-[90vh] overflow-y-auto scrollbar-modern",
          sizeMap[size],
          className,
        )}
      >
        {/* ✅ HEADER (conditional) */}
        {title && (
          <div className="mb-6 text-center">
            <h2
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

        {/* CONTENT */}
        <div>{children}</div>

        {/* FOOTER */}
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
