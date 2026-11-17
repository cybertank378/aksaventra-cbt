"use client";

import { Edit3, Users } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import type {
  ClassGroupDTO,
  StudentDTO,
} from "@/modules/classes/domain/dto/ClassGroupDTO";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import ClassBadge from "../atoms/ClassBadge";

export interface ViewClassModalProps {
  open: boolean;
  classGroup: ClassGroupDTO | null;
  onClose: () => void;
  onLoadDetails: (
    id: string,
  ) => Promise<(ClassGroupDTO & { students: StudentDTO[] }) | null>;
  onEdit?: (cls: ClassGroupDTO) => void;
}

export const ViewClassModal: FC<ViewClassModalProps> = ({
  open,
  classGroup,
  onClose,
  onLoadDetails,
  onEdit,
}) => {
  const [members, setMembers] = useState<StudentDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (open && classGroup) {
      setLoading(true);
      void onLoadDetails(classGroup.id).then((detail) => {
        if (!cancelled) {
          setMembers(detail?.students ?? []);
          setLoading(false);
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [open, classGroup, onLoadDetails]);

  if (!classGroup) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Detail Rombel: ${classGroup.name}`}
      subtitle={classGroup.code ? `Kode: ${classGroup.code}` : undefined}
      size="lg"
    >
      <div className="flex flex-col gap-4 py-1">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="space-y-1">
            <ClassBadge name={classGroup.name} />
            <p className="text-xs text-slate-600 mt-1">
              {classGroup.description || "Tidak ada deskripsi tambahan."}
            </p>
          </div>
          <Badge color="teal" size="sm">
            <Users className="w-3.5 h-3.5 mr-1 inline" />
            {loading ? "..." : `${members.length} Siswa`}
          </Badge>
        </div>

        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
            Anggota Siswa di Kelas Ini
          </div>
          {loading ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Memuat anggota rombel...
            </div>
          ) : members.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Belum ada siswa yang tergabung di kelas ini.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between px-4 py-2.5 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-800">{m.fullName}</p>
                    <p className="font-mono text-[11px] text-slate-500">
                      {m.username}
                    </p>
                  </div>
                  <Badge color={m.isActive ? "success" : "neutral"} size="sm">
                    {m.roomCode || "LAB-01"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
          {onEdit && (
            <Button
              type="button"
              variant="filled"
              color="primary"
              size="sm"
              leftIcon={Edit3}
              onClick={() => {
                onClose();
                onEdit(classGroup);
              }}
            >
              Edit Kelas
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewClassModal;
