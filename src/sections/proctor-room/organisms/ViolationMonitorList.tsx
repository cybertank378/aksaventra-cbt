"use client";

import { CheckCircle2, ShieldAlert, Unlock } from "lucide-react";
import { type FC, useMemo, useState } from "react";
import { useProctorApi } from "@/modules/proctor/presentation/useProctorApi";
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

export interface ViolationMonitorListProps {
  examId: string;
  roomCode?: string;
}

const VIOLATION_EVENT_LABELS: Record<string, string> = {
  TAB_BLUR: "Pindah Tab / Jendela",
  FULLSCREEN_EXIT: "Keluar Layar Penuh",
  DEVTOOLS_OPEN: "Shortcut DevTools / Salin-Tempel",
  DEVTOOLS_SHORTCUT: "Shortcut DevTools / Salin-Tempel",
};

const CHEATING_EVENT_TYPES = new Set([
  "TAB_BLUR",
  "FULLSCREEN_EXIT",
  "DEVTOOLS_OPEN",
  "DEVTOOLS_SHORTCUT",
]);

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export const ViolationMonitorList: FC<ViolationMonitorListProps> = ({
  examId,
  roomCode,
}) => {
  const { participants, executeAction } = useProctorApi(examId);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);

  const flaggedParticipants = useMemo(() => {
    return participants.filter((p) => {
      const hasCheatingLog = p.recentViolations.some((v) =>
        CHEATING_EVENT_TYPES.has(v.eventType),
      );
      return p.strikeCount > 0 || p.status === "LOCKED" || hasCheatingLog;
    });
  }, [participants]);

  const handleUnlockFalseAlarm = async (attemptId: string) => {
    setUnlockingId(attemptId);
    try {
      await executeAction(attemptId, "unlock", {
        reason: "False alarm diverifikasi oleh pengawas ruang",
      });
    } finally {
      setUnlockingId(null);
    }
  };

  return (
    <Card
      variant="elevated"
      className="border border-rose-200/80 bg-white overflow-hidden"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 bg-rose-50/60 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-900">
              Daftar Monitoring Kecurangan &amp; Intervensi False Alarm
            </h3>
            <p className="text-[11px] text-rose-700/80">
              {roomCode
                ? `Ruang Tugas: ${roomCode} · Batas toleransi sistem 3 kali pelanggaran`
                : "Seluruh ruang ujian · Batas toleransi sistem 3 kali pelanggaran"}
            </p>
          </div>
        </div>

        <Badge
          color={flaggedParticipants.length > 0 ? "error" : "success"}
          variant="soft"
          size="sm"
        >
          {flaggedParticipants.length > 0
            ? `${flaggedParticipants.length} Peserta Terdeteksi`
            : "Ruang Kondusif (0 Pelanggaran)"}
        </Badge>
      </div>

      {flaggedParticipants.length === 0 ? (
        <div className="flex items-center gap-3 px-5 py-6 text-xs text-emerald-700">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>
            Belum ada pelanggaran atau indikasi kecurangan yang terdeteksi
            sistem pada ruang ujian ini.
          </span>
        </div>
      ) : (
        <Table wrapperClassName="rounded-none border-0 shadow-none">
          <TableHead>
            <TableRow>
              <TableHeaderCell className="px-4 py-3">No. Meja</TableHeaderCell>
              <TableHeaderCell className="px-4 py-3">
                Nomor Ujian
              </TableHeaderCell>
              <TableHeaderCell className="px-4 py-3">
                Nama Peserta Ujian
              </TableHeaderCell>
              <TableHeaderCell className="px-4 py-3">
                Toleransi (3x)
              </TableHeaderCell>
              <TableHeaderCell className="px-4 py-3">
                Bukti Kecurangan Terdeteksi Sistem
              </TableHeaderCell>
              <TableHeaderCell className="px-4 py-3 text-right">
                Aksi Pengawas
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flaggedParticipants.map((p) => {
              const cheatingLogs = p.recentViolations.filter((v) =>
                CHEATING_EVENT_TYPES.has(v.eventType),
              );
              const maxStrikes = p.maxStrikes || 3;
              const isLocked =
                p.status === "LOCKED" || p.strikeCount >= maxStrikes;

              return (
                <TableRow
                  key={`violation-${p.attemptId}`}
                  className={isLocked ? "bg-rose-50/40" : undefined}
                >
                  <TableCell className="px-4 py-3 font-mono text-xs font-bold text-[#0d2b5c]">
                    {p.seatNumber || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-mono text-xs text-slate-700">
                    {p.username}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <p className="text-xs font-bold text-slate-900">
                      {p.fullName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {p.className || "-"}
                      {p.roomCode ? ` · ${p.roomCode}` : ""}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      color={isLocked ? "error" : "warning"}
                      variant="filled"
                      size="sm"
                    >
                      {p.strikeCount} / {maxStrikes}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {cheatingLogs.length === 0 ? (
                      <span className="text-xs text-slate-500">
                        Tercatat {p.strikeCount} pelanggaran integritas
                      </span>
                    ) : (
                      <ul className="space-y-1 text-xs text-rose-800">
                        {cheatingLogs.slice(0, 3).map((log, idx) => (
                          <li
                            key={log.id}
                            className="flex items-center gap-1.5"
                          >
                            <span className="font-mono text-[10px] font-bold text-rose-600">
                              #{idx + 1}
                            </span>
                            <span className="font-semibold">
                              {VIOLATION_EVENT_LABELS[log.eventType] ||
                                log.eventType}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">
                              ({formatTime(log.createdAt)})
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="filled"
                      color="success"
                      size="xs"
                      leftIcon={Unlock}
                      loading={unlockingId === p.attemptId}
                      disabled={unlockingId === p.attemptId}
                      onClick={() => void handleUnlockFalseAlarm(p.attemptId)}
                    >
                      Buka Akses (False Alarm)
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Card>
  );
};

export default ViolationMonitorList;
