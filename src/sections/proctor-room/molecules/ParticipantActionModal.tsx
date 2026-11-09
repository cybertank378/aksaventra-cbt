"use client";

import type { FC } from "react";
import { useState } from "react";
import type {
  ParticipantMonitorDTO,
  ProctorActionType,
} from "@/modules/proctor/domain/dto/ProctorActionDTO";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import ParticipantStatusBadge from "../atoms/ParticipantStatusBadge";

export interface ParticipantActionModalProps {
  participant: ParticipantMonitorDTO | null;
  open: boolean;
  onClose: () => void;
  onExecuteAction: (
    attemptId: string,
    action: ProctorActionType,
    options?: { reason?: string; extendMinutes?: number },
  ) => Promise<boolean>;
}

export const ParticipantActionModal: FC<ParticipantActionModalProps> = ({
  participant,
  open,
  onClose,
  onExecuteAction,
}) => {
  const [selectedAction, setSelectedAction] =
    useState<ProctorActionType | null>(null);
  const [extendMinutes, setExtendMinutes] = useState<number>(10);
  const [reason, setReason] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!participant) return null;

  const handleAction = async (action: ProctorActionType) => {
    setSelectedAction(action);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const success = await onExecuteAction(participant.attemptId, action, {
        reason: reason.trim() || undefined,
        extendMinutes: action === "extend_time" ? extendMinutes : undefined,
      });

      if (success) {
        setReason("");
        setSelectedAction(null);
        onClose();
      } else {
        setErrorMessage("Gagal mengeksekusi tindakan. Silakan coba kembali.");
      }
    } catch {
      setErrorMessage("Terjadi gangguan jaringan saat menghubungi server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !isLoading && onClose()}
      title="Intervensi Peserta Ujian"
      size="lg"
    >
      <div className="flex flex-col gap-5 py-2">
        {/* Student Summary Card */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                {participant.fullName}
              </h3>
              <ParticipantStatusBadge
                status={participant.status}
                isOnline={participant.isOnline}
                strikeCount={participant.strikeCount}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              NISN/Username:{" "}
              <span className="font-semibold text-slate-700">
                {participant.username}
              </span>{" "}
              | IP:{" "}
              <span className="font-mono text-slate-700">
                {participant.ipAddress}
              </span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500">Progres Soal</span>
            <p className="text-sm font-bold text-[#0d2b5c]">
              {participant.answeredCount} / {participant.totalQuestions} (
              {participant.progressPercentage}%)
            </p>
          </div>
        </div>

        {/* Violations Warning if Any */}
        {participant.recentViolations &&
          participant.recentViolations.length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
              <p className="text-xs font-bold text-rose-800 mb-1.5">
                Riwayat Pelanggaran Terdeteksi:
              </p>
              <ul className="text-xs text-rose-700 space-y-1 pl-4 list-disc">
                {participant.recentViolations.map((v) => (
                  <li key={v.id}>
                    <span className="font-semibold">{v.eventType}</span> —{" "}
                    {new Date(v.createdAt).toLocaleTimeString()}
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* Extra Options for Extend Time */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="extend-minutes"
            className="text-xs font-semibold text-slate-700"
          >
            Durasi Perpanjangan Waktu (Menit):
          </label>
          <div className="flex items-center gap-2">
            {[5, 10, 15, 30].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setExtendMinutes(mins)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  extendMinutes === mins
                    ? "bg-[#0097a7] text-white border-[#0097a7]"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                +{mins} Menit
              </button>
            ))}
          </div>
        </div>

        {/* Optional Reason Input */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="proctor-reason"
            className="text-xs font-semibold text-slate-700"
          >
            Alasan / Catatan Intervensi Pengawas (Opsional):
          </label>
          <input
            id="proctor-reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contoh: Salah klik tab / mati lampu / gangguan jaringan"
            className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
          />
        </div>

        {errorMessage && (
          <p className="text-xs font-semibold text-rose-600">{errorMessage}</p>
        )}

        {/* Action Buttons Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="filled"
            color="primary"
            loading={isLoading && selectedAction === "unlock"}
            disabled={isLoading || participant.status !== "LOCKED"}
            onClick={() => handleAction("unlock")}
          >
            Buka Kunci (Unlock Strike)
          </Button>

          <Button
            type="button"
            variant="outline"
            color="danger"
            loading={isLoading && selectedAction === "lock"}
            disabled={
              isLoading ||
              participant.status === "LOCKED" ||
              participant.status === "SUBMITTED"
            }
            onClick={() => handleAction("lock")}
          >
            Kunci Ujian (Lock Attempt)
          </Button>

          <Button
            type="button"
            variant="outline"
            color="primary"
            loading={isLoading && selectedAction === "extend_time"}
            disabled={isLoading || participant.status === "SUBMITTED"}
            onClick={() => handleAction("extend_time")}
          >
            Tambah Waktu (+{extendMinutes} m)
          </Button>

          <Button
            type="button"
            variant="outline"
            color="secondary"
            loading={isLoading && selectedAction === "reset_device"}
            disabled={isLoading}
            onClick={() => handleAction("reset_device")}
          >
            Reset Perangkat (Device Binding)
          </Button>

          <Button
            type="button"
            variant="filled"
            color="danger"
            loading={isLoading && selectedAction === "force_submit"}
            disabled={isLoading || participant.status === "SUBMITTED"}
            onClick={() => handleAction("force_submit")}
          >
            Paksa Kumpulkan (Force Submit)
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ParticipantActionModal;

