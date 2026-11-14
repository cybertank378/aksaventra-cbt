"use client";

import type { FC } from "react";
import type { ExamParticipantDTO } from "@/modules/exams/domain/dto/ExamRosterDTO";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import TextField from "@/shared-ui/component/TextField";

interface EditSeatModalProps {
  participant: ExamParticipantDTO | null;
  customRoom: string;
  customSeat: string;
  isUpdating: boolean;
  onRoomChange: (value: string) => void;
  onSeatChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export const EditSeatModal: FC<EditSeatModalProps> = ({
  participant,
  customRoom,
  customSeat,
  isUpdating,
  onRoomChange,
  onSeatChange,
  onClose,
  onSave,
}) => {
  return (
    <Modal
      open={Boolean(participant)}
      onClose={onClose}
      title="Ubah Penempatan Ruang & Nomor Meja"
      size="sm"
    >
      {participant && (
        <div className="flex flex-col gap-4 py-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-bold text-slate-900">
              {participant.fullName}
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              NIS: {participant.username} | Kelas: {participant.className}
            </p>
          </div>

          <TextField
            id="custom-room-input"
            label="Ruang Ujian"
            value={customRoom}
            onChange={(e) => onRoomChange(e.target.value)}
            size="sm"
          />

          <TextField
            id="custom-seat-input"
            label="Nomor Meja"
            value={customSeat}
            onChange={(e) => onSeatChange(e.target.value)}
            size="sm"
            className="font-mono font-bold text-[#0d2b5c]"
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              color="secondary"
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="filled"
              color="primary"
              loading={isUpdating}
              onClick={onSave}
            >
              Simpan Perubahan
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default EditSeatModal;
