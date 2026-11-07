"use client";

import clsx from "clsx";
import {
  type ClipboardEvent,
  type FC,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

export interface TokenPinInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  hasError?: boolean;
  className?: string;
  id?: string;
}

export const TokenPinInput: FC<TokenPinInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  hasError = false,
  className,
  id = "token-pin-input",
}) => {
  const [internalValue, setInternalValue] = useState<string[]>(() => {
    const initial = (value || "").slice(0, length).toUpperCase().split("");
    while (initial.length < length) {
      initial.push("");
    }
    return initial;
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Synchronize internal state with external value prop
  useEffect(() => {
    if (value !== undefined) {
      const sanitized = value.slice(0, length).toUpperCase().split("");
      while (sanitized.length < length) {
        sanitized.push("");
      }
      setInternalValue(sanitized);
    }
  }, [value, length]);

  // Autofocus first input on mount
  useEffect(() => {
    if (autoFocus && !disabled && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const updatePin = (newArray: string[]) => {
    setInternalValue(newArray);
    const joined = newArray.join("");
    onChange?.(joined);
    if (joined.length === length && !newArray.includes("")) {
      onComplete?.(joined);
    }
  };

  const handleInputChange = (index: number, char: string) => {
    if (disabled) return;

    // Sanitize to alphanumeric uppercase
    const clean = char.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (!clean) return;

    const nextChar = clean.slice(-1);
    const newValues = [...internalValue];
    newValues[index] = nextChar;
    updatePin(newValues);

    // Focus next box
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      const newValues = [...internalValue];
      if (newValues[index]) {
        newValues[index] = "";
        updatePin(newValues);
      } else if (index > 0) {
        newValues[index - 1] = "";
        updatePin(newValues);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text/plain")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();

    if (!pastedData) return;

    const newValues = [...internalValue];
    const pasteChars = pastedData.slice(0, length).split("");

    for (let i = 0; i < length; i++) {
      newValues[i] = pasteChars[i] || "";
    }

    updatePin(newValues);

    const nextEmptyIndex = newValues.findIndex((val) => !val);
    const focusTarget = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
    inputRefs.current[focusTarget]?.focus();
  };

  return (
    <fieldset
      id={id}
      aria-label="Input Token Ujian 6 Digit"
      className={clsx(
        "flex items-center justify-center gap-2 sm:gap-3 border-none p-0 m-0",
        className,
      )}
    >
      {internalValue.map((char, index) => {
        const isFilled = Boolean(char);
        const boxId = `${id}-slot-${index + 1}`;
        return (
          <input
            key={boxId}
            id={boxId}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck="false"
            maxLength={1}
            disabled={disabled}
            value={char}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={`Digit token ${index + 1} dari ${length}`}
            className={clsx(
              "h-12 w-10 sm:h-14 sm:w-12 rounded-xl text-center font-mono text-xl sm:text-2xl font-bold transition-all duration-150 outline-none select-none",
              // Borders & Colors
              hasError
                ? "border-2 border-rose-500 bg-rose-50/50 text-rose-700 focus:ring-4 focus:ring-rose-500/20"
                : isFilled
                  ? "border-2 border-[#0d2b5c] bg-white text-[#0d2b5c] shadow-xs"
                  : "border-2 border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300",
              // Focus state
              "focus:border-[#0097a7] focus:bg-white focus:ring-4 focus:ring-[#0097a7]/20 focus:scale-105",
              // Disabled state
              disabled &&
                "opacity-50 cursor-not-allowed pointer-events-none bg-slate-100",
            )}
          />
        );
      })}
    </fieldset>
  );
};

export default TokenPinInput;
