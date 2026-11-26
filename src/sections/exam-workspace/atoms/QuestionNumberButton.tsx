"use client";

import clsx from "clsx";
import type { FC } from "react";
import Button, {
  type ButtonColor,
  type ButtonVariant,
} from "@/shared-ui/component/Button";

export interface QuestionNumberButtonProps {
  number: number;
  isActive?: boolean;
  isAnswered?: boolean;
  isFlagged?: boolean;
  onClick: () => void;
  className?: string;
}

export const QuestionNumberButton: FC<QuestionNumberButtonProps> = ({
  number,
  isActive = false,
  isAnswered = false,
  isFlagged = false,
  onClick,
  className,
}) => {
  const variant: ButtonVariant = isActive
    ? "filled"
    : isFlagged
      ? "filled"
      : isAnswered
        ? "soft"
        : "outline";

  const color: ButtonColor = isActive
    ? "primary"
    : isFlagged
      ? "gold"
      : isAnswered
        ? "primary"
        : "secondary";

  return (
    <Button
      type="button"
      variant={variant}
      color={color}
      size="sm"
      iconOnly
      onClick={onClick}
      aria-current={isActive ? "step" : undefined}
      aria-label={`Nomor Soal ${number}${isActive ? " (Aktif)" : ""}${isAnswered ? " (Sudah Dijawab)" : ""}${isFlagged ? " (Ragu-ragu)" : ""}`}
      className={clsx(
        "relative h-10 w-10 sm:h-11 sm:w-11 rounded-xl text-xs sm:text-sm font-bold p-0",
        !isActive && !isFlagged && !isAnswered && "bg-white",
        isActive && "ring-2 ring-[#0097a7] ring-offset-2 scale-105 z-10",
        className,
      )}
    >
      <span>{number}</span>

      {isFlagged && (isActive || isAnswered) && (
        <span
          title="Ragu-ragu"
          className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 border-2 border-white ring-1 ring-amber-500"
        />
      )}
    </Button>
  );
};

export default QuestionNumberButton;
