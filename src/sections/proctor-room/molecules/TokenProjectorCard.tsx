"use client";

import clsx from "clsx";
import { Maximize2, Minimize2, RefreshCw } from "lucide-react";
import { type FC, useState } from "react";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import LiveTokenDisplay from "../atoms/LiveTokenDisplay";

export interface TokenProjectorCardProps {
  examTitle: string;
  roomCode?: string | null;
  token: string;
  expiresAt?: string | null;
  onRotateToken: () => Promise<boolean>;
  isRotating?: boolean;
  className?: string;
}

export const TokenProjectorCard: FC<TokenProjectorCardProps> = ({
  examTitle,
  roomCode,
  token,
  expiresAt,
  onRotateToken,
  isRotating = false,
  className,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleConfirmRotate = async () => {
    setShowConfirmModal(false);
    await onRotateToken();
  };

  return (
    <>
      <div
        className={clsx(
          "flex flex-col rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm overflow-hidden relative",
          className,
        )}
      >
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pusat Proyektor Token Ruangan
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5 truncate max-w-md">
              {examTitle}
            </h2>
            {roomCode && (
              <p className="text-xs text-slate-500 font-medium">
                Ruang:{" "}
                <span className="text-[#0d2b5c] font-bold">{roomCode}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="sm"
              onClick={toggleFullscreen}
              leftIcon={isFullscreen ? Minimize2 : Maximize2}
            >
              {isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
            </Button>

            <Button
              type="button"
              variant="filled"
              color="primary"
              size="sm"
              loading={isRotating}
              onClick={() => setShowConfirmModal(true)}
              leftIcon={RefreshCw}
            >
              Rotasi Token
            </Button>
          </div>
        </div>

        {/* Big Projector Token Display */}
        <div className="py-6 flex flex-col items-center justify-center">
          <LiveTokenDisplay
            token={token}
            expiresAt={expiresAt}
            size="large"
            className="w-full max-w-xl py-6"
          />
          <p className="text-xs text-slate-400 mt-3 text-center">
            Tampilkan layar ini pada proyektor LCD ruangan agar seluruh peserta
            dapat memasukkan token ujian dengan jelas.
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Konfirmasi Rotasi Token"
        size="sm"
      >
        <div className="flex flex-col gap-4 text-center p-2">
          <p className="text-sm text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin memperbarui token ujian sekarang? Token lama
            akan langsung kedaluwarsa dan siswa baru harus menggunakan token
            baru ini untuk masuk.
          </p>
          <div className="flex items-center gap-2 justify-center pt-2">
            <Button
              type="button"
              variant="outline"
              color="secondary"
              onClick={() => setShowConfirmModal(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="filled"
              color="primary"
              onClick={handleConfirmRotate}
            >
              Ya, Rotasi Token
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TokenProjectorCard;
