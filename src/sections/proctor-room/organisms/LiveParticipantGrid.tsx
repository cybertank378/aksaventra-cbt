"use client";

import type { AttemptStatus } from "@prisma/client";
import clsx from "clsx";
import { Clock, RefreshCw, Search, ShieldAlert } from "lucide-react";
import { type FC, useMemo, useState } from "react";
import type { ParticipantMonitorDTO } from "@/modules/proctor/domain/dto/ProctorActionDTO";
import { useProctorApi } from "@/modules/proctor/presentation/useProctorApi";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";
import TextField from "@/shared-ui/component/TextField";
import ParticipantStatusBadge from "../atoms/ParticipantStatusBadge";
import { LiveAlertBanner } from "../molecules/LiveAlertBanner";
import ParticipantActionModal from "../molecules/ParticipantActionModal";

export interface LiveParticipantGridProps {
  examId: string;
  activeFilter?: string;
  onFilterChange?: (filterKey: string) => void;
  className?: string;
}

export const LiveParticipantGrid: FC<LiveParticipantGridProps> = ({
  examId,
  activeFilter = "ALL",
  className,
}) => {
  const {
    participants,
    selectedParticipant,
    setSelectedParticipant,
    searchQuery,
    setSearchQuery,
    executeAction,
    refresh,
    isPolling,
    setIsPolling,
  } = useProctorApi(examId);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Manual refresh trigger
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  // Filter & Search computations
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      // 1. Text Search Filter (name or username/nisn)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.fullName.toLowerCase().includes(query);
        const matchesUsername = p.username.toLowerCase().includes(query);
        if (!matchesName && !matchesUsername) return false;
      }

      // 2. Status Category Filter
      if (activeFilter === "ALL") return true;
      if (activeFilter === "IN_PROGRESS") {
        return p.status === "IN_PROGRESS" && p.isOnline && p.strikeCount < 3;
      }
      if (activeFilter === "LOCKED") {
        return p.status === "LOCKED" || p.strikeCount >= 3;
      }
      if (activeFilter === "OFFLINE") {
        return p.status === "IN_PROGRESS" && !p.isOnline;
      }
      if (activeFilter === "SUBMITTED") {
        return p.status === "SUBMITTED";
      }

      return p.status === (activeFilter as AttemptStatus);
    });
  }, [participants, searchQuery, activeFilter]);

  const handleOpenActionModal = (p: ParticipantMonitorDTO) => {
    setSelectedParticipant(p);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedParticipant(null);
  };

  const formatRemainingMinutes = (seconds: number) => {
    if (seconds <= 0) return "0m";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  const lockedParticipants = useMemo(() => {
    return participants.filter(
      (p) => p.status === "LOCKED" || p.strikeCount >= (p.maxStrikes || 3),
    );
  }, [participants]);

  return (
    <div
      className={clsx(
        "flex flex-col gap-4 rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-6 shadow-xs",
        className,
      )}
    >
      {/* Real-time Violation Alert Banner */}
      {lockedParticipants.length > 0 && (
        <LiveAlertBanner
          lockedParticipants={lockedParticipants}
          onUnlockQuickly={(attemptId) => executeAction(attemptId, "unlock")}
        />
      )}
      {/* Control Header: Search, Polling Toggle, Manual Refresh */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex-1 max-w-md">
          <TextField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari siswa berdasarkan nama atau NISN..."
            leftIcon={Search}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Polling Heartbeat Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 font-medium">
            <span
              className={clsx(
                "h-2 w-2 rounded-full",
                isPolling ? "bg-emerald-500 animate-pulse" : "bg-slate-300",
              )}
            />
            {isPolling ? "Live Polling 5s" : "Polling Jeda"}
          </div>

          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            onClick={() => setIsPolling(!isPolling)}
          >
            {isPolling ? "Jeda" : "Mulai"}
          </Button>

          <Button
            type="button"
            variant="filled"
            color="primary"
            size="sm"
            loading={isRefreshing}
            onClick={handleManualRefresh}
            leftIcon={RefreshCw}
          >
            Segarkan
          </Button>
        </div>
      </div>

      {/* Participants Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell className="px-4 py-3">No. Meja</TableHeaderCell>
            <TableHeaderCell className="px-4 py-3">Peserta</TableHeaderCell>
            <TableHeaderCell className="px-4 py-3">Status</TableHeaderCell>
            <TableHeaderCell className="px-4 py-3">
              Progres Jawaban
            </TableHeaderCell>
            <TableHeaderCell className="px-4 py-3">Sisa Waktu</TableHeaderCell>
            <TableHeaderCell className="px-4 py-3">Pelanggaran</TableHeaderCell>
            <TableHeaderCell className="px-4 py-3 text-right">
              Aksi
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredParticipants.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="px-4 py-8 text-center text-slate-400"
              >
                Tidak ada peserta ujian yang cocok dengan kriteria filter saat
                ini.
              </TableCell>
            </TableRow>
          ) : (
            filteredParticipants.map((p) => {
              const isWarning = p.strikeCount > 0 || p.status === "LOCKED";

              return (
                <TableRow
                  key={p.attemptId}
                  className={clsx(
                    "hover:bg-slate-50/80 transition-colors",
                    isWarning && "bg-rose-50/20",
                  )}
                >
                  {/* Seat Number */}
                  <TableCell className="px-4 py-3.5 whitespace-nowrap">
                    <Badge
                      color="primary"
                      variant="filled"
                      size="sm"
                      className="font-mono font-bold text-xs"
                    >
                      {p.seatNumber || "-"}
                    </Badge>
                  </TableCell>

                  {/* Student Info */}
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#0d2b5c] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {p.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p
                          className="font-bold text-slate-900 truncate max-w-[180px]"
                          title={p.fullName}
                        >
                          {p.fullName}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-mono">{p.username}</span>
                          {p.className && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-slate-600">
                                {p.className}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="px-4 py-3.5 whitespace-nowrap">
                    <ParticipantStatusBadge
                      status={p.status}
                      isOnline={p.isOnline}
                      strikeCount={p.strikeCount}
                    />
                  </TableCell>

                  {/* Progress Bar */}
                  <TableCell className="px-4 py-3.5 min-w-[140px]">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-800">
                          {p.answeredCount} / {p.totalQuestions}
                        </span>
                        <span className="text-slate-400 font-medium">
                          {p.progressPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0097a7] h-full rounded-full transition-all duration-300"
                          style={{ width: `${p.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>

                  {/* Remaining Time */}
                  <TableCell className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-700 font-mono font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatRemainingMinutes(p.remainingSeconds)}</span>
                      {p.extraTimeSeconds > 0 && (
                        <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded">
                          +{Math.round(p.extraTimeSeconds / 60)}m
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Strikes / Violations */}
                  <TableCell className="px-4 py-3.5 whitespace-nowrap">
                    {p.strikeCount > 0 ? (
                      <div className="flex items-center gap-1 text-rose-700 font-bold">
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        <span>{p.strikeCount} Strike</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">Bersih (0)</span>
                    )}
                  </TableCell>

                  {/* Action Button */}
                  <TableCell className="px-4 py-3.5 text-right whitespace-nowrap">
                    <Button
                      type="button"
                      variant={p.status === "LOCKED" ? "filled" : "outline"}
                      color={p.status === "LOCKED" ? "danger" : "primary"}
                      size="sm"
                      onClick={() => handleOpenActionModal(p)}
                    >
                      Intervensi
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Participant Action Modal Dialog */}
      <ParticipantActionModal
        participant={selectedParticipant}
        open={modalOpen}
        onClose={handleCloseModal}
        onExecuteAction={executeAction}
      />
    </div>
  );
};

export default LiveParticipantGrid;
