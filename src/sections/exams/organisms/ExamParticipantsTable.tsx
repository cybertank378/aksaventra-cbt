"use client";

import { Edit3, Search } from "lucide-react";
import type { FC } from "react";
import type { ExamParticipantDTO } from "@/modules/exams/domain/dto/ExamRosterDTO";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";
import TextField from "@/shared-ui/component/TextField";

interface ExamParticipantsTableProps {
  participants: ExamParticipantDTO[];
  totalParticipants: number;
  search: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onEditParticipant: (participant: ExamParticipantDTO) => void;
}

export const ExamParticipantsTable: FC<ExamParticipantsTableProps> = ({
  participants,
  totalParticipants,
  search,
  isLoading,
  onSearchChange,
  onEditParticipant,
}) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex-1 max-w-md">
          <TextField
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari berdasarkan nama, NIS, atau nomor meja..."
            leftIcon={Search}
            size="sm"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Total: <strong>{participants.length}</strong> Peserta Terdaftar
        </span>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden" bodyClassName="p-0">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell className="px-5 py-3.5">
                Nomor Meja
              </TableHeaderCell>
              <TableHeaderCell className="px-5 py-3.5">Ruang</TableHeaderCell>
              <TableHeaderCell className="px-5 py-3.5">
                Nama Siswa
              </TableHeaderCell>
              <TableHeaderCell className="px-5 py-3.5">
                NIS / Username
              </TableHeaderCell>
              <TableHeaderCell className="px-5 py-3.5">Kelas</TableHeaderCell>
              <TableHeaderCell className="px-5 py-3.5 text-right">
                Aksi
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && totalParticipants === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-5 py-12 text-center">
                  <div className="h-6 w-6 mx-auto animate-spin rounded-full border-2 border-slate-300 border-t-[#0097a7]" />
                </TableCell>
              </TableRow>
            ) : participants.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-5 py-8 text-center text-slate-400"
                >
                  Belum ada siswa yang ditugaskan ke ujian ini.
                </TableCell>
              </TableRow>
            ) : (
              participants.map((p) => (
                <TableRow
                  key={p.studentId}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <TableCell className="px-5 py-3.5 whitespace-nowrap">
                    <Badge
                      color="primary"
                      variant="filled"
                      size="sm"
                      className="font-mono font-black text-xs"
                    >
                      {p.seatNumber}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-3.5 whitespace-nowrap font-bold text-[#0097a7]">
                    {p.roomCode}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 font-bold text-slate-900">
                    {p.fullName}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 font-mono text-slate-600">
                    {p.username}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                    {p.className || "-"}
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-right whitespace-nowrap">
                    <Button
                      type="button"
                      variant="outline"
                      color="secondary"
                      size="sm"
                      leftIcon={Edit3}
                      onClick={() => onEditParticipant(p)}
                    >
                      Ubah Meja
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ExamParticipantsTable;
