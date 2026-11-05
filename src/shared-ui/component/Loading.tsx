"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface Props {
  variant?: "global" | "inline";
}

const MotionImage = motion.create(Image);

export default function Loading({ variant = "inline" }: Props) {
  /* ================= GLOBAL LOADING ================= */
  if (variant === "global") {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-50/60 via-white/40 to-cyan-50/60 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="relative px-10 py-12 rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.08)] flex flex-col items-center gap-8"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-cyan-400/10 to-purple-500/10 blur-2xl -z-10" />

          <div className="relative w-24 h-24 flex items-center justify-center">
            <MotionImage
              src="/assets/images/logo/logo_dark.png"
              alt="logo"
              width={72}
              height={72}
              className="object-contain"
              priority
              animate={{ scale: [1, 1.05, 1] }}
              transition={{
                repeat: Infinity,
                duration: 1.6,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="absolute inset-0 rounded-full border-[3px] border-transparent"
              style={{
                background:
                  "conic-gradient(from 0deg, #6366f1, #06b6d4, #a855f7, #6366f1)",
                WebkitMask:
                  "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))",
              }}
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "linear",
              }}
            />
          </div>

          <motion.div
            className="text-xs tracking-[0.3em] font-semibold uppercase text-gray-700"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{
              repeat: Infinity,
              duration: 2.2,
              ease: "easeInOut",
            }}
          >
            Loading
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  /* ================= INLINE LOADING ================= */
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: "linear",
        }}
      />
    </div>
  );
}
