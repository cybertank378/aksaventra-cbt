// Files: src/shared-ui/component/SearchField.tsx

"use client";

import clsx from "clsx";
import { Search, X } from "lucide-react";
import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Button from "@/shared-ui/component/Button";

//////////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////////

type Size = "sm" | "md" | "lg";

//////////////////////////////////////////////////////////////
// PROPS
//////////////////////////////////////////////////////////////

interface Props {
  value: string;

  onChange: (value: string) => void;

  placeholder?: string;

  size?: Size;

  debounce?: number;

  autoFocus?: boolean;

  className?: string;
}

//////////////////////////////////////////////////////////////
// SIZE MAP
//////////////////////////////////////////////////////////////

const sizeMap: Record<Size, string> = {
  sm: "h-9 text-sm",

  md: "h-11 text-sm",

  lg: "h-12 text-base",
};

//////////////////////////////////////////////////////////////
// COMPONENT
//////////////////////////////////////////////////////////////

export default function SearchField({
  value,
  onChange,
  placeholder = "Search...",
  size = "md",
  debounce = 0,
  autoFocus = false,
  className,
}: Props) {
  ////////////////////////////////////////////////////////////
  // STATE
  ////////////////////////////////////////////////////////////

  const [internalValue, setInternalValue] = useState(value);

  ////////////////////////////////////////////////////////////
  // REFS
  ////////////////////////////////////////////////////////////

  const inputRef = useRef<HTMLInputElement>(null);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  ////////////////////////////////////////////////////////////
  // SYNC EXTERNAL VALUE
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  ////////////////////////////////////////////////////////////
  // AUTO FOCUS
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  ////////////////////////////////////////////////////////////
  // CLEANUP
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  ////////////////////////////////////////////////////////////
  // CHANGE
  ////////////////////////////////////////////////////////////

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    setInternalValue(newValue);

    if (!debounce) {
      onChange(newValue);

      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      onChange(newValue);
    }, debounce);
  };

  ////////////////////////////////////////////////////////////
  // ESCAPE
  ////////////////////////////////////////////////////////////

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Escape") {
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setInternalValue("");

    onChange("");

    inputRef.current?.blur();
  };

  ////////////////////////////////////////////////////////////
  // CLEAR
  ////////////////////////////////////////////////////////////

  const handleClear = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setInternalValue("");

    onChange("");

    inputRef.current?.focus();
  };

  ////////////////////////////////////////////////////////////
  // COMPUTED
  ////////////////////////////////////////////////////////////

  const hasValue = internalValue.trim().length > 0;

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <div
      className={clsx(
        "flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4",
        "transition-colors duration-200",
        "focus-within:border-indigo-500",
        "focus-within:outline-none",
        sizeMap[size],
        className,
      )}
    >
      <Search size={18} className="shrink-0 text-gray-500" />

      <input
        ref={inputRef}
        type="text"
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={clsx(
          "flex-1 border-0 bg-transparent outline-none ring-0",
          "text-sm text-gray-800",
          "placeholder:text-gray-400",
        )}
      />

      {hasValue && (
        <Button
          type="button"
          variant="text"
          color="secondary"
          iconOnly
          onClick={handleClear}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </Button>
      )}
    </div>
  );
}
