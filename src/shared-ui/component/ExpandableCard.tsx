// Files: src/shared-ui/component/ExpandableCard.tsx

"use client";

import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type React from "react";
import { useEffect, useId, useRef, useState } from "react";

//////////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////////

interface Props {
  title: string;

  subtitle?: string;

  children: React.ReactNode;

  ////////////////////////////////////////////////////////////
  // CONTROLLED
  ////////////////////////////////////////////////////////////

  isOpen: boolean;

  onToggle: () => void;

  ////////////////////////////////////////////////////////////
  // OPTIONAL
  ////////////////////////////////////////////////////////////

  icon?: LucideIcon;

  className?: string;

  ////////////////////////////////////////////////////////////
  // ACCESSIBILITY
  ////////////////////////////////////////////////////////////

  index?: number;

  total?: number;

  onRequestFocusIndex?: (index: number) => void;
}

//////////////////////////////////////////////////////////////
// COMPONENT
//////////////////////////////////////////////////////////////

export default function ExpandableCard({
  title,
  subtitle,
  children,

  isOpen,
  onToggle,

  icon: Icon,
  className,

  index,
  total,
  onRequestFocusIndex,
}: Props) {
  //////////////////////////////////////////////////////////////
  // IDS
  //////////////////////////////////////////////////////////////

  const headerId = useId();

  const panelId = `${headerId}-panel`;

  //////////////////////////////////////////////////////////////
  // REFS
  //////////////////////////////////////////////////////////////

  const contentRef = useRef<HTMLDivElement>(null);

  //////////////////////////////////////////////////////////////
  // STATE
  //////////////////////////////////////////////////////////////

  const [height, setHeight] = useState(0);

  //////////////////////////////////////////////////////////////
  // AUTO HEIGHT
  //////////////////////////////////////////////////////////////

  useEffect(() => {
    const element = contentRef.current;

    if (!element) {
      return;
    }

    const updateHeight = () => {
      requestAnimationFrame(() => {
        setHeight(isOpen ? element.scrollHeight : 0);
      });
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      if (isOpen) {
        updateHeight();
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isOpen]);

  //////////////////////////////////////////////////////////////
  // KEYBOARD SUPPORT
  //////////////////////////////////////////////////////////////

  const onKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();

        if (
          onRequestFocusIndex &&
          typeof index === "number" &&
          typeof total === "number"
        ) {
          onRequestFocusIndex((index + 1) % total);
        }

        break;

      case "ArrowUp":
        event.preventDefault();

        if (
          onRequestFocusIndex &&
          typeof index === "number" &&
          typeof total === "number"
        ) {
          onRequestFocusIndex((index - 1 + total) % total);
        }

        break;

      case "Home":
        event.preventDefault();

        onRequestFocusIndex?.(0);

        break;

      case "End":
        event.preventDefault();

        if (typeof total === "number") {
          onRequestFocusIndex?.(total - 1);
        }

        break;
    }
  };

  //////////////////////////////////////////////////////////////
  // VIEW
  //////////////////////////////////////////////////////////////

  return (
    <div
      className={clsx(
        "overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm",
        className,
      )}
    >
      {/* ==================== HEADER ==================== */}
      <button
        id={headerId}
        type="button"
        aria-controls={panelId}
        aria-expanded={isOpen}
        data-expandable-trigger
        onClick={onToggle}
        onKeyDown={onKeyDown}
        className="flex min-h-18 w-full items-center justify-between border-b bg-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <div className="flex items-start gap-3">
          {Icon && <Icon size={18} className="mt-1 shrink-0 text-gray-600" />}

          <div className="space-y-1">
            <p className="text-sm font-semibold leading-snug text-gray-900">
              {title}
            </p>

            {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
          </div>
        </div>

        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600"
        >
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {/* ==================== BODY ==================== */}
      <section
        id={panelId}
        aria-labelledby={headerId}
        style={{
          height,
        }}
        className="overflow-hidden transition-[height] duration-300 ease-in-out will-change-[height]"
      >
        <div ref={contentRef} className="p-3">
          {children}
        </div>
      </section>
    </div>
  );
}
