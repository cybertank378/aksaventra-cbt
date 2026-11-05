"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";

export const DEFAULT_QUOTES: string[] = [
  "Integritas binary adalah fondasi utama keamanan sistem.",
  "Verifikasi SHA-256 memastikan keaslian engine yang dieksekusi.",
  "Keamanan dan audit berkala melindungi infrastruktur dari ancaman.",
];

export interface RotatingQuoteProps {
  quotes?: string[];
  intervalMs?: number;
}

export default function RotatingQuote({
  quotes = DEFAULT_QUOTES,
  intervalMs = 4000,
}: RotatingQuoteProps) {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (quotes.length <= 1) return;

    const interval = setInterval(() => {
      setAnimate(false);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % quotes.length);
        setAnimate(true);
      }, 200);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [quotes, intervalMs]);

  return (
    <div className="h-[56px] flex items-center justify-center text-center">
      <p
        className={clsx(
          "text-sm text-white transition-all duration-500",
          animate ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
        )}
      >
        “{quotes[index]}”
      </p>
    </div>
  );
}
