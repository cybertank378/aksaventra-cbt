"use client";

import { CheckCircle2, Download, HardDrive } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import Button from "@/shared-ui/component/Button";

export interface OfflineReceiptModalProps {
  isOpen: boolean;
  attemptId: string;
  examTitle?: string;
  studentName?: string;
  answersCount: number;
  answersPayload: Record<number, unknown>;
  onClose?: () => void;
}

// Computes a deterministic SHA-256 hash in browser or fallback
async function computeSha256(text: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return `SEAL-${Date.now().toString(16).toUpperCase()}`;
}

export const OfflineReceiptModal: FC<OfflineReceiptModalProps> = ({
  isOpen,
  attemptId,
  examTitle = "Ujian CBT Aksaventra",
  studentName = "Siswa",
  answersCount,
  answersPayload,
  onClose,
}) => {
  const [sealHash, setSealHash] = useState<string>("MENGIKUTKAN_SEGEL...");
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const rawContent = `${attemptId}:${studentName}:${JSON.stringify(answersPayload)}`;

    computeSha256(rawContent).then((hash) => {
      if (isMounted) setSealHash(hash.toUpperCase());
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, attemptId, studentName, answersPayload]);

  if (!isOpen) return null;

  const handleDownloadReceipt = () => {
    const receiptData = {
      receiptVersion: "1.0",
      system: "Aksaventra CBT Offline Vault",
      attemptId,
      examTitle,
      studentName,
      submittedAt: new Date().toISOString(),
      answersCount,
      cryptographicSeal: sealHash,
      answers: answersPayload,
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${attemptId}-${Date.now()}.aksaventra-receipt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloaded(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="offline-receipt-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
    >
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4">
          <HardDrive size={30} />
        </div>

        <h2
          id="offline-receipt-title"
          className="text-xl sm:text-2xl font-black tracking-tight text-[#0d2b5c]"
        >
          BUKTI PENYERAHAN OFFLINE
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Waktu ujian telah berakhir dan jawaban Anda tersimpan aman di
          perangkat
        </p>

        {/* Receipt Box */}
        <div className="my-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-2.5">
            <span className="text-xs text-slate-500 font-medium">Ujian:</span>
            <span className="text-xs font-bold text-slate-900 truncate max-w-[240px]">
              {examTitle}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-2.5">
            <span className="text-xs text-slate-500 font-medium">Peserta:</span>
            <span className="text-xs font-bold text-slate-900">
              {studentName}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-2.5">
            <span className="text-xs text-slate-500 font-medium">
              Total Jawaban Tersimpan:
            </span>
            <span className="text-xs font-black text-emerald-700">
              {answersCount} Butir
            </span>
          </div>

          <div className="flex flex-col gap-1 pt-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Segel Kriptografis (SHA-256):
            </span>
            <div className="rounded-lg bg-white border border-slate-200 p-2 text-[11px] font-mono break-all font-bold text-slate-700 select-all">
              {sealHash}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="filled"
            color="primary"
            size="lg"
            fullWidth
            onClick={handleDownloadReceipt}
            leftIcon={downloaded ? CheckCircle2 : Download}
            className="shadow-md font-bold"
          >
            {downloaded
              ? "Bukti Terunduh (.aksaventra-receipt)"
              : "Unduh Bukti Ujian (.aksaventra-receipt)"}
          </Button>

          <p className="text-[11px] text-slate-500 leading-tight">
            Simpan berkas ini untuk ditunjukkan kepada pengawas jika diperlukan
            sinkronisasi nilai manual.
          </p>

          {onClose && (
            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="sm"
              onClick={onClose}
              className="mt-1"
            >
              Tutup & Selesai
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineReceiptModal;
