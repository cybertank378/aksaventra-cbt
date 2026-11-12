"use client";

import { ArrowLeft, Check, CheckSquare, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import type { UserRole } from "@/libs/enums";
import { useClassesApi } from "@/modules/classes/presentation/useClassesApi";
import { useExamManagementApi } from "@/modules/exams/presentation/useExamManagementApi";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import TextField from "@/shared-ui/component/TextField";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";

export interface AssignGroupsSectionProps {
  examId: string;
  userRole?: UserRole;
}

export const AssignGroupsSection: FC<AssignGroupsSectionProps> = ({
  examId,
  userRole: _userRole,
}) => {
  const router = useRouter();
  const { classes, fetchClasses } = useClassesApi();
  const { participants, isLoading, error, assignGroups, fetchParticipants } =
    useExamManagementApi(examId);

  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [roomCode, setRoomCode] = useState("");
  const [seatPrefix, setSeatPrefix] = useState("");
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchParticipants(examId);
  }, [fetchClasses, fetchParticipants, examId]);

  const toggleClassSelect = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId],
    );
  };

  const handleAssign = async () => {
    if (selectedClassIds.length === 0) return;
    const success = await assignGroups({
      classGroupIds: selectedClassIds,
      roomCode,
      seatPrefix,
      targetExamId: examId,
    });
    if (success) {
      setAssignedSuccess(true);
      fetchParticipants(examId);
    }
  };

  const handleBackToExams = () => {
    router.replace("/dashboard/exams");
  };

  const handleViewParticipants = () => {
    router.replace(`/dashboard/exams/${examId}/participants`);
  };

  const handleOpenClasses = () => {
    router.replace("/dashboard/classes");
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          color="secondary"
          size="sm"
          leftIcon={ArrowLeft}
          onClick={handleBackToExams}
        >
          Kembali ke Daftar Ujian
        </Button>

        <Button
          type="button"
          variant="outline"
          color="primary"
          size="sm"
          leftIcon={Users}
          onClick={handleViewParticipants}
        >
          Lihat Daftar Peserta &amp; Meja
        </Button>
      </div>

      {/* Form Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Class Selection */}
        <div className="lg:col-span-2 flex flex-col gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pilih Rombongan Belajar (Kelas / Cohort)
            </h2>
            <p className="text-xs text-slate-500">
              Pilih satu atau beberapa kelas yang wajib mengikuti asesmen ini
            </p>
          </div>

          {classes.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
              <span>
                Tidak ada data kelas. Tambahkan kelas di menu Kelas &amp; Rombel
                terlebih dahulu.
              </span>
              <Button
                type="button"
                variant="outline"
                color="teal"
                size="sm"
                onClick={handleOpenClasses}
              >
                Buka Kelas &amp; Rombel
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {classes.map((cls) => {
                const isSelected = selectedClassIds.includes(cls.id);
                return (
                  <Card
                    key={cls.id}
                    onClick={() => toggleClassSelect(cls.id)}
                    className={`flex items-start justify-between p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-teal-50/60 border-[#0097a7] ring-1 ring-[#0097a7]"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900">
                        {cls.name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {cls.studentCount || 0} Siswa Terdaftar
                      </p>
                    </div>

                    <div
                      className={`p-1 rounded-lg border ${
                        isSelected
                          ? "bg-[#0097a7] text-white border-[#0097a7]"
                          : "bg-slate-100 text-transparent border-slate-200"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Room & Seat Configuration */}
        <div className="flex flex-col gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs h-fit">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Alokasi Ruang &amp; Meja
            </h2>
            <p className="text-xs text-slate-500">
              Konfigurasi penempatan nomor meja otomatis
            </p>
          </div>

          <TextField
            id="room-code-input"
            label="Nama / Kode Ruang Ujian"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="LAB-01"
            size="sm"
          />

          <TextField
            id="seat-prefix-input"
            label="Prefix Nomor Meja"
            value={seatPrefix}
            onChange={(e) => setSeatPrefix(e.target.value)}
            placeholder="Contoh: M (menghasilkan M-01, M-02, dst)"
            size="sm"
          />

          {error && (
            <p className="text-xs font-semibold text-rose-600">{error}</p>
          )}
          {assignedSuccess && (
            <p className="text-xs font-semibold text-emerald-600">
              Rombel berhasil ditugaskan &amp; nomor meja digenerate!
            </p>
          )}

          <Button
            type="button"
            variant="filled"
            color="primary"
            size="md"
            loading={isLoading}
            disabled={selectedClassIds.length === 0}
            onClick={handleAssign}
            leftIcon={CheckSquare}
          >
            Tugaskan &amp; Generate Meja
          </Button>
        </div>
      </div>

      {/* Preview of Assigned Participants and Seat Numbers */}
      {participants.length > 0 && (
        <Card className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Peserta &amp; Alokasi Nomor Meja ({participants.length}{" "}
                Siswa)
              </h3>
              <p className="text-xs text-slate-500">
                Nomor meja diurutkan otomatis berdasarkan urutan absen kelas
              </p>
            </div>
          </div>

          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="px-4 py-3">Nomor Meja</TableHeaderCell>
                <TableHeaderCell className="px-4 py-3">Ruang Ujian</TableHeaderCell>
                <TableHeaderCell className="px-4 py-3">Nama Siswa</TableHeaderCell>
                <TableHeaderCell className="px-4 py-3">NIS / Username</TableHeaderCell>
                <TableHeaderCell className="px-4 py-3">Kelas</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {participants.map((p) => (
                <TableRow key={p.studentId} className="hover:bg-slate-50/80">
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <Badge color="primary" variant="filled" size="sm" className="font-mono font-black text-xs">
                      {p.seatNumber}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap font-bold text-[#0097a7]">
                    {p.roomCode}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-semibold text-slate-900">
                    {p.fullName}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-mono text-slate-500">
                    {p.username}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {p.className || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default AssignGroupsSection;
