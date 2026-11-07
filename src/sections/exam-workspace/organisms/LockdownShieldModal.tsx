"use client";

import { Lock, RefreshCw, ShieldAlert } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import Button from "@/shared-ui/component/Button";

export interface LockdownShieldModalProps {
  isLocked: boolean;
  attemptId: string;
  strikeCount?: number;
  maxStrikes?: number;
  onUnlocked: () => void;
}

export const LockdownShieldModal: FC<LockdownShieldModalProps> = ({
  isLocked,
  attemptId,
  strikeCount = 3,
  maxStrikes = 3,
  onUnlocked,
}) => {
  const [isPolling, setIsPolling] = useState(false);

  // Heartbeat polling every 5 seconds to detect when Proctor triggers Unlock Strike
  useEffect(() => {
    if (!isLocked || !attemptId) return;

    let isMounted = true;

    async function checkProctorUnlock() {
      try {
        setIsPolling(true);
        // Ping attempt sync endpoint to receive updated status
        const res = await fetch(`/api/attempts/${attemptId}/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId,
            answers: [],
            syncVersion: 0,
          }),
        });

        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          const currentStatus = data.data?.status || data.status;
          if (currentStatus === "IN_PROGRESS") {
            onUnlocked();
          }
        }
      } catch (_err) {
        // Continue polling silently
      } finally {
        if (isMounted) setIsPolling(false);
      }
    }

    checkProctorUnlock();
    const interval = setInterval(checkProctorUnlock, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isLocked, attemptId, onUnlocked]);

  if (!isLocked) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Layar Pengunci Sesi Ujian"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in"
    >
      <div className="w-full max-w-lg rounded-3xl border-2 border-rose-500/80 bg-white p-6 sm:p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4 animate-pulse">
          <ShieldAlert size={36} />
        </div>

        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#0d2b5c]">
          SESI UJIAN DIBEKUKAN
        </h2>
        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-rose-600">
          Toleransi Pelanggaran Tercapai ({strikeCount} / {maxStrikes})
        </p>

        <div className="my-6 rounded-2xl border border-rose-100 bg-rose-50/70 p-4 text-xs text-rose-900 leading-relaxed text-left">
          <p className="font-bold mb-1">Pemberitahuan kepada Peserta:</p>
          <p>
            Sistem mendeteksi aktivitas di luar jendela ujian (tab blur / keluar
            layar penuh) secara berulang. Seluruh interaksi ujian dinonaktifkan
            sementara.
          </p>
          <p className="mt-2 font-semibold">
            Silakan lapor kepada Pengawas Ujian di ruangan Anda untuk meminta
            pembukaan akses (*Unlock Strike*).
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <RefreshCw
              size={14}
              className={`text-[#0097a7] ${isPolling ? "animate-spin" : ""}`}
            />
            <span>Menunggu persetujuan buka kunci dari pengawas...</span>
          </div>

          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            onClick={onUnlocked}
            leftIcon={Lock}
            className="text-xs text-slate-400 border-dashed"
          >
            Pemeriksaan Otomatis Aktif (5s)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LockdownShieldModal;
