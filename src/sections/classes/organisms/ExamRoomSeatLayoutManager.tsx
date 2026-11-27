"use client";

import {
  Building2,
  CheckCircle2,
  FileDown,
  Grid,
  Plus,
  Printer,
  RefreshCw,
  Shuffle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { type FC, useEffect, useMemo, useState } from "react";
import {
  generateDeskNumberStickersPdf,
  generateRoomLayoutPdf,
} from "@/libs/roomSeatPdfGenerator";
import type {
  ClassGroupDTO,
  StudentDTO,
} from "@/modules/classes/domain/dto/ClassGroupDTO";
import { useClassesApi } from "@/modules/classes/presentation/useClassesApi";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import Modal from "@/shared-ui/component/Modal";
import TextField from "@/shared-ui/component/TextField";
import { showSuccessToast } from "@/shared-ui/component/Toast";
import { extractStudentFullnameAndLastname } from "../molecules/CreateClassModal";

export interface ExamRoomConfig {
  code: string;
  name: string;
  rows: number;
  cols: number;
  seatPrefix: string;
}

const DEFAULT_ROOMS: ExamRoomConfig[] = [
  {
    code: "LAB-01",
    name: "Laboratorium Komputer 1",
    rows: 5,
    cols: 6,
    seatPrefix: "M",
  },
  {
    code: "LAB-02",
    name: "Laboratorium Komputer 2",
    rows: 5,
    cols: 6,
    seatPrefix: "M",
  },
  {
    code: "RUANG-01",
    name: "Ruang Ujian CBT 1",
    rows: 6,
    cols: 6,
    seatPrefix: "A",
  },
];

const ROOMS_STORAGE_KEY = "aksaventra_exam_rooms_config_v1";

export interface ExamRoomSeatLayoutManagerProps {
  classes?: ClassGroupDTO[];
  students?: StudentDTO[];
  isLoading?: boolean;
  examId?: string | null;
  onAssignRoomAndSeats?: (input: {
    assignments: Array<{
      studentId: string;
      roomCode: string;
      seatNumber: string;
    }>;
    examId?: string | null;
  }) => Promise<boolean>;
}

export const ExamRoomSeatLayoutManager: FC<ExamRoomSeatLayoutManagerProps> = ({
  classes: propClasses,
  students: propStudents,
  isLoading: propIsLoading,
  examId = null,
  onAssignRoomAndSeats: propOnAssign,
}) => {
  const {
    classes: hookClasses,
    students: hookStudents,
    isLoading: hookIsLoading,
    fetchClasses,
    fetchStudents,
    bulkAssignRoomAndSeats,
  } = useClassesApi();

  const classes = propClasses ?? hookClasses;
  const students = propStudents ?? hookStudents;
  const isLoading = propIsLoading ?? hookIsLoading;
  const onAssignRoomAndSeats = propOnAssign ?? bulkAssignRoomAndSeats;

  useEffect(() => {
    if (!propClasses) {
      void fetchClasses();
    }
    if (!propStudents) {
      void fetchStudents();
    }
  }, [propClasses, propStudents, fetchClasses, fetchStudents]);
  const [rooms, setRooms] = useState<ExamRoomConfig[]>(DEFAULT_ROOMS);
  const [activeRoomCode, setActiveRoomCode] = useState<string>("LAB-01");
  const [targetClassFilter, setTargetClassFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"NAME" | "USERNAME" | "RANDOM">(
    "NAME",
  );
  const [layoutPattern, setLayoutPattern] = useState<"ROW_MAJOR" | "ZIGZAG">(
    "ROW_MAJOR",
  );

  // Add Room Modal
  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [newRoomCode, setNewRoomCode] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomRows, setNewRoomRows] = useState(5);
  const [newRoomCols, setNewRoomCols] = useState(6);
  const [newRoomPrefix, setNewRoomPrefix] = useState("M");

  // Manual Desk Edit Modal
  const [selectedDeskSeat, setSelectedDeskSeat] = useState<string | null>(null);
  const [manualStudentId, setManualStudentId] = useState<string>("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ROOMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ExamRoomConfig[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRooms(parsed);
          setActiveRoomCode(parsed[0].code);
        }
      }
    } catch {
      // Fallback to default rooms
    }
  }, []);

  // Merge any custom roomCode already assigned to students in DB
  const mergedRooms = useMemo(() => {
    const map = new Map<string, ExamRoomConfig>();
    for (const r of rooms) {
      map.set(r.code, r);
    }
    for (const s of students) {
      const rCode = (s.roomCode || "LAB-01").trim();
      if (rCode && !map.has(rCode)) {
        map.set(rCode, {
          code: rCode,
          name: `Ruang ${rCode}`,
          rows: 6,
          cols: 6,
          seatPrefix: "M",
        });
      }
    }
    return Array.from(map.values());
  }, [rooms, students]);

  const activeRoom = useMemo(
    () =>
      mergedRooms.find((r) => r.code === activeRoomCode) ??
      mergedRooms[0] ??
      DEFAULT_ROOMS[0],
    [mergedRooms, activeRoomCode],
  );

  const persistRooms = (next: ExamRoomConfig[]) => {
    setRooms(next);
    try {
      localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage error
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const code = newRoomCode.trim().toUpperCase();
    if (!code) return;
    const roomConfig: ExamRoomConfig = {
      code,
      name: newRoomName.trim() || `Ruang ${code}`,
      rows: Math.max(1, Math.min(15, Number(newRoomRows) || 5)),
      cols: Math.max(1, Math.min(12, Number(newRoomCols) || 6)),
      seatPrefix: newRoomPrefix.trim().toUpperCase() || "M",
    };
    const next = [...mergedRooms.filter((r) => r.code !== code), roomConfig];
    persistRooms(next);
    setActiveRoomCode(code);
    setNewRoomCode("");
    setNewRoomName("");
    setAddRoomOpen(false);
  };

  const handleUpdateRoomGrid = (rows: number, cols: number, prefix: string) => {
    const updated: ExamRoomConfig = {
      ...activeRoom,
      rows: Math.max(1, Math.min(15, rows)),
      cols: Math.max(1, Math.min(12, cols)),
      seatPrefix: prefix.trim().toUpperCase() || "M",
    };
    const next = mergedRooms.map((r) =>
      r.code === activeRoom.code ? updated : r,
    );
    persistRooms(next);
  };

  const handleDeleteRoom = (code: string) => {
    if (mergedRooms.length <= 1) return;
    const next = mergedRooms.filter((r) => r.code !== code);
    persistRooms(next);
    if (activeRoom.code === code && next[0]) {
      setActiveRoomCode(next[0].code);
    }
  };

  // Build ordered desk slots for the active room grid (rows x cols)
  const deskSlots = useMemo(() => {
    const slots: Array<{
      row: number;
      col: number;
      seatIndex: number;
      seatNumber: string;
    }> = [];
    const totalRows = activeRoom.rows;
    const totalCols = activeRoom.cols;
    const prefix = activeRoom.seatPrefix || "M";

    for (let r = 0; r < totalRows; r++) {
      for (let c = 0; c < totalCols; c++) {
        const effectiveCol =
          layoutPattern === "ZIGZAG" && r % 2 === 1 ? totalCols - 1 - c : c;
        const seatIndex = r * totalCols + effectiveCol + 1;
        const padded = seatIndex < 10 ? `0${seatIndex}` : `${seatIndex}`;
        slots.push({
          row: r + 1,
          col: c + 1,
          seatIndex,
          seatNumber: `${prefix}-${padded}`,
        });
      }
    }
    return slots;
  }, [activeRoom, layoutPattern]);

  // Students currently assigned to activeRoom
  const roomStudents = useMemo(() => {
    return students.filter(
      (s) =>
        (s.roomCode || "LAB-01").toUpperCase() ===
        activeRoom.code.toUpperCase(),
    );
  }, [students, activeRoom]);

  // Map seatNumber -> StudentDTO for active room
  const seatStudentMap = useMemo(() => {
    const map = new Map<string, StudentDTO>();
    const unassignedToSpecificSeat: StudentDTO[] = [];

    for (const s of roomStudents) {
      if (s.seatNumber && !map.has(s.seatNumber.toUpperCase())) {
        map.set(s.seatNumber.toUpperCase(), s);
      } else {
        unassignedToSpecificSeat.push(s);
      }
    }

    // Place any student in the room without an explicit seatNumber into the next free slot for preview
    if (unassignedToSpecificSeat.length > 0) {
      let ptr = 0;
      const sortedSlots = [...deskSlots].sort(
        (a, b) => a.seatIndex - b.seatIndex,
      );
      for (const slot of sortedSlots) {
        if (ptr >= unassignedToSpecificSeat.length) break;
        const key = slot.seatNumber.toUpperCase();
        if (!map.has(key)) {
          map.set(key, unassignedToSpecificSeat[ptr]);
          ptr++;
        }
      }
    }

    return map;
  }, [roomStudents, deskSlots]);

  // Candidate students matching targetClassFilter for auto-generation
  const candidateStudents = useMemo(() => {
    return students.filter((s) => {
      if (targetClassFilter === "ALL") return true;
      if (targetClassFilter === "CURRENT_ROOM") {
        return (
          (s.roomCode || "LAB-01").toUpperCase() ===
          activeRoom.code.toUpperCase()
        );
      }
      const { lastname } = extractStudentFullnameAndLastname(s);
      return (
        s.classGroupId === targetClassFilter ||
        s.className === targetClassFilter ||
        lastname === targetClassFilter
      );
    });
  }, [students, targetClassFilter, activeRoom]);

  const handleGenerateAndSaveSeats = async () => {
    if (candidateStudents.length === 0) return;

    const sortedCandidates = [...candidateStudents];
    if (sortOrder === "NAME") {
      sortedCandidates.sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else if (sortOrder === "USERNAME") {
      sortedCandidates.sort((a, b) => a.username.localeCompare(b.username));
    } else {
      for (let i = sortedCandidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sortedCandidates[i], sortedCandidates[j]] = [
          sortedCandidates[j],
          sortedCandidates[i],
        ];
      }
    }

    const capacity = activeRoom.rows * activeRoom.cols;
    const prefix = activeRoom.seatPrefix || "M";
    const assignments = sortedCandidates.slice(0, capacity).map((s, idx) => {
      const num = idx + 1;
      const padded = num < 10 ? `0${num}` : `${num}`;
      return {
        studentId: s.id,
        roomCode: activeRoom.code,
        seatNumber: `${prefix}-${padded}`,
      };
    });

    await onAssignRoomAndSeats({
      assignments,
      examId,
    });
  };

  const handleAutoDistributeAllRooms = async () => {
    if (candidateStudents.length === 0 || mergedRooms.length === 0) return;

    const sortedCandidates = [...candidateStudents];
    if (sortOrder === "NAME") {
      sortedCandidates.sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else if (sortOrder === "USERNAME") {
      sortedCandidates.sort((a, b) => a.username.localeCompare(b.username));
    } else {
      for (let i = sortedCandidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sortedCandidates[i], sortedCandidates[j]] = [
          sortedCandidates[j],
          sortedCandidates[i],
        ];
      }
    }

    const assignments: Array<{
      studentId: string;
      roomCode: string;
      seatNumber: string;
    }> = [];
    let studentPtr = 0;

    for (const room of mergedRooms) {
      const cap = room.rows * room.cols;
      const prefix = room.seatPrefix || "M";
      for (let seatIdx = 1; seatIdx <= cap; seatIdx++) {
        if (studentPtr >= sortedCandidates.length) break;
        const padded = seatIdx < 10 ? `0${seatIdx}` : `${seatIdx}`;
        assignments.push({
          studentId: sortedCandidates[studentPtr].id,
          roomCode: room.code,
          seatNumber: `${prefix}-${padded}`,
        });
        studentPtr++;
      }
      if (studentPtr >= sortedCandidates.length) break;
    }

    if (assignments.length > 0) {
      await onAssignRoomAndSeats({
        assignments,
        examId,
      });
    }
  };

  const handleOpenManualDesk = (seatNumber: string) => {
    const occupant = seatStudentMap.get(seatNumber.toUpperCase());
    setSelectedDeskSeat(seatNumber);
    setManualStudentId(occupant?.id || "");
  };

  const handleSaveManualDesk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeskSeat || !manualStudentId) return;
    const ok = await onAssignRoomAndSeats({
      assignments: [
        {
          studentId: manualStudentId,
          roomCode: activeRoom.code,
          seatNumber: selectedDeskSeat,
        },
      ],
      examId,
    });
    if (ok) {
      setSelectedDeskSeat(null);
    }
  };

  const capacity = activeRoom.rows * activeRoom.cols;

  const buildPdfConfig = () => ({
    roomCode: activeRoom.code,
    roomName: activeRoom.name,
    rows: activeRoom.rows,
    cols: activeRoom.cols,
    desks: deskSlots.map((slot) => {
      const occupant = seatStudentMap.get(slot.seatNumber.toUpperCase());
      const parsed = occupant
        ? extractStudentFullnameAndLastname(occupant)
        : null;
      return {
        row: slot.row,
        col: slot.col,
        seatNumber: slot.seatNumber,
        studentName: occupant?.fullName ?? null,
        username: occupant?.username ?? null,
        className: occupant?.className || parsed?.lastname || null,
      };
    }),
  });

  const handleDownloadLayoutPdf = () => {
    generateRoomLayoutPdf(buildPdfConfig());
    showSuccessToast(
      `PDF Denah Tata Letak & Daftar Meja Ruang ${activeRoom.code} berhasil diunduh.`,
    );
  };

  const handleDownloadStickersPdf = () => {
    generateDeskNumberStickersPdf(buildPdfConfig());
    showSuccessToast(
      `PDF Stiker Nomor Meja Ruang ${activeRoom.code} berhasil diunduh.`,
    );
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 1. Room Selector Tabs & Add Room Button */}
      <Card className="p-4 sm:p-5 rounded-3xl border border-slate-200/90 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0097a7]" />
              Pengelolaan Ruang Ujian &amp; Tata Letak Meja
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Atur kapasitas ruang ujian, dimensi baris × kolom meja, dan
              generate nomor meja peserta ujian secara otomatis maupun manual
            </p>
          </div>

          <Button
            type="button"
            variant="filled"
            color="primary"
            size="sm"
            leftIcon={Plus}
            onClick={() => setAddRoomOpen(true)}
          >
            Tambah Ruang Ujian
          </Button>
        </div>

        {/* Room Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          {mergedRooms.map((room) => {
            const isActive = room.code === activeRoom.code;
            const count = students.filter(
              (s) =>
                (s.roomCode || "LAB-01").toUpperCase() ===
                room.code.toUpperCase(),
            ).length;
            const roomCap = room.rows * room.cols;

            return (
              <div
                key={room.code}
                className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2 transition cursor-pointer ${
                  isActive
                    ? "border-[#0097a7] bg-teal-50/70 text-[#0d2b5c] ring-1 ring-[#0097a7]"
                    : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Button
                  type="button"
                  variant="ghost"
                  color="secondary"
                  size="xs"
                  onClick={() => setActiveRoomCode(room.code)}
                  className="flex items-center gap-2 text-left p-0 hover:bg-transparent active:bg-transparent"
                >
                  <div>
                    <p className="text-xs font-extrabold text-inherit">
                      {room.code}
                    </p>
                    <p className="text-[10px] text-slate-500 font-normal">
                      {room.rows}×{room.cols} ({count}/{roomCap} meja)
                    </p>
                  </div>
                </Button>
                {mergedRooms.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    color="danger"
                    size="xs"
                    iconOnly
                    leftIcon={Trash2}
                    onClick={() => handleDeleteRoom(room.code)}
                    title={`Hapus ruang ${room.code}`}
                    aria-label={`Hapus ruang ${room.code}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 2. Seat Number Generator & Grid Dimensions Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Room Dimensions & Layout Pattern */}
        <Card className="p-5 rounded-3xl border border-slate-200/90 bg-white space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Grid className="w-4 h-4 text-[#0097a7]" />
              Dimensi Meja Ruang {activeRoom.code}
            </h4>
            <p className="text-[11px] text-slate-500">
              Kapasitas maksimal: <strong>{capacity}</strong> meja (
              {activeRoom.rows} baris × {activeRoom.cols} kolom)
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label
                htmlFor="room-rows-input"
                className="block text-[11px] font-semibold text-slate-600 mb-1"
              >
                Jumlah Baris
              </label>
              <input
                id="room-rows-input"
                type="number"
                min={1}
                max={15}
                value={activeRoom.rows}
                onChange={(e) =>
                  handleUpdateRoomGrid(
                    Number(e.target.value),
                    activeRoom.cols,
                    activeRoom.seatPrefix,
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label
                htmlFor="room-cols-input"
                className="block text-[11px] font-semibold text-slate-600 mb-1"
              >
                Jumlah Kolom
              </label>
              <input
                id="room-cols-input"
                type="number"
                min={1}
                max={12}
                value={activeRoom.cols}
                onChange={(e) =>
                  handleUpdateRoomGrid(
                    activeRoom.rows,
                    Number(e.target.value),
                    activeRoom.seatPrefix,
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label
                htmlFor="room-prefix-input"
                className="block text-[11px] font-semibold text-slate-600 mb-1"
              >
                Prefix Meja
              </label>
              <input
                id="room-prefix-input"
                type="text"
                maxLength={4}
                value={activeRoom.seatPrefix}
                onChange={(e) =>
                  handleUpdateRoomGrid(
                    activeRoom.rows,
                    activeRoom.cols,
                    e.target.value,
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 uppercase"
              />
            </div>
          </div>

          <div>
            <span className="block text-[11px] font-semibold text-slate-600 mb-1.5">
              Pola Alur Nomor Meja
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                size="sm"
                variant={layoutPattern === "ROW_MAJOR" ? "soft" : "outline"}
                color={layoutPattern === "ROW_MAJOR" ? "teal" : "secondary"}
                onClick={() => setLayoutPattern("ROW_MAJOR")}
                className="rounded-xl text-xs font-semibold"
              >
                Urut Baris (Kiri → Kanan)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={layoutPattern === "ZIGZAG" ? "soft" : "outline"}
                color={layoutPattern === "ZIGZAG" ? "teal" : "secondary"}
                onClick={() => setLayoutPattern("ZIGZAG")}
                className="rounded-xl text-xs font-semibold"
              >
                Zig-Zag / Ular (Seling)
              </Button>
            </div>
          </div>
        </Card>

        {/* Right (2 cols): Automatic Seat Generator */}
        <Card className="lg:col-span-2 p-5 rounded-3xl border border-slate-200/90 bg-white space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0097a7]" />
                Pembuatan Nomor Meja Ujian Otomatis
              </h4>
              <p className="text-[11px] text-slate-500">
                Pilih rombel kelas (`lastname`) dan urutan penempatan untuk
                mengisi nomor meja secara otomatis
              </p>
            </div>

            <Badge color="teal" size="sm" variant="soft">
              {candidateStudents.length} siswa kandidat
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="seat-gen-class-filter"
                className="block text-[11px] font-semibold text-slate-600 mb-1"
              >
                Sumber Siswa / Kelas (Lastname)
              </label>
              <select
                id="seat-gen-class-filter"
                value={targetClassFilter}
                onChange={(e) => setTargetClassFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0097a7] focus:outline-none"
              >
                <option value="CURRENT_ROOM">
                  Siswa di Ruang {activeRoom.code} ({roomStudents.length} siswa)
                </option>
                <option value="ALL">
                  Semua Siswa Terdaftar ({students.length} siswa)
                </option>
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    Kelas {c.name} ({c.studentCount || 0} siswa)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="seat-gen-sort-order"
                className="block text-[11px] font-semibold text-slate-600 mb-1"
              >
                Urutan Penomoran Meja
              </label>
              <select
                id="seat-gen-sort-order"
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value as "NAME" | "USERNAME" | "RANDOM")
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0097a7] focus:outline-none"
              >
                <option value="NAME">Urut Abjad Nama Siswa (A - Z)</option>
                <option value="USERNAME">Urut NIS / Username</option>
                <option value="RANDOM">Acak / Shuffle Posisi Meja</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="sm"
              leftIcon={Shuffle}
              loading={isLoading}
              disabled={candidateStudents.length === 0}
              onClick={() => void handleAutoDistributeAllRooms()}
              title="Sebarkan siswa secara berurutan ke seluruh ruang ujian berdasarkan kapasitas masing-masing ruang"
            >
              Sebarkan ke Semua Ruang ({mergedRooms.length} Ruang)
            </Button>

            <Button
              type="button"
              variant="filled"
              color="primary"
              size="sm"
              leftIcon={RefreshCw}
              loading={isLoading}
              disabled={candidateStudents.length === 0}
              onClick={() => void handleGenerateAndSaveSeats()}
            >
              Generate &amp; Simpan Nomor Meja di {activeRoom.code}
            </Button>
          </div>
        </Card>
      </div>

      {/* 3. Visual 2D Classroom Desk Map */}
      <Card className="p-5 sm:p-6 rounded-3xl border border-slate-200/90 bg-white space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Denah Tata Letak Meja Ujian: {activeRoom.code} ({activeRoom.name})
            </h4>
            <p className="text-xs text-slate-500">
              Klik pada kartu meja untuk menempatkan atau memindahkan siswa
              secara manual
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Terisi ({seatStudentMap.size})
            </span>
            <span className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              Kosong ({Math.max(0, capacity - seatStudentMap.size)})
            </span>

            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="sm"
              leftIcon={Printer}
              onClick={handleDownloadStickersPdf}
              title="Cetak PDF stiker nomor meja ukuran besar untuk ditempel di meja komputer"
            >
              PDF Stiker Nomor Meja
            </Button>

            <Button
              type="button"
              variant="filled"
              color="primary"
              size="sm"
              leftIcon={FileDown}
              onClick={handleDownloadLayoutPdf}
              title="Cetak PDF Denah Tata Letak Meja 2D + Daftar Hadir Ruang Ujian"
            >
              Cetak PDF Denah &amp; Meja
            </Button>
          </div>
        </div>

        {/* Proctor Desk / Front of Classroom Banner */}
        <div className="mx-auto w-full max-w-md rounded-2xl border-2 border-dashed border-[#0d2b5c]/30 bg-[#0d2b5c]/5 py-2.5 px-4 text-center">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#0d2b5c]">
            Meja Pengawas &amp; Papan Tulis (Depan Ruangan {activeRoom.code})
          </p>
        </div>

        {/* 2D Grid of Desks */}
        <div className="overflow-x-auto pb-2">
          <div
            className="grid gap-3 min-w-[640px]"
            style={{
              gridTemplateColumns: `repeat(${activeRoom.cols}, minmax(130px, 1fr))`,
            }}
          >
            {deskSlots.map((slot) => {
              const student = seatStudentMap.get(slot.seatNumber.toUpperCase());
              const parsed = student
                ? extractStudentFullnameAndLastname(student)
                : null;

              return (
                <Button
                  key={`${slot.row}-${slot.col}-${slot.seatNumber}`}
                  type="button"
                  variant="ghost"
                  color="secondary"
                  onClick={() => handleOpenManualDesk(slot.seatNumber)}
                  className={`group flex flex-col items-stretch justify-between rounded-2xl border p-3 text-left transition-all min-h-[104px] font-normal ${
                    student
                      ? "border-teal-200 bg-teal-50/40 hover:border-[#0097a7] hover:bg-teal-50/70 hover:shadow-sm"
                      : "border-dashed border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`inline-flex items-center rounded-lg px-2 py-0.5 font-mono text-[11px] font-black ${
                        student
                          ? "bg-[#0d2b5c] text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {slot.seatNumber}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      B{slot.row}•K{slot.col}
                    </span>
                  </div>

                  {student ? (
                    <div className="mt-2 space-y-0.5 min-w-0">
                      <p
                        className="truncate text-xs font-bold text-slate-900"
                        title={student.fullName}
                      >
                        {student.fullName}
                      </p>
                      <p className="truncate font-mono text-[10px] font-semibold text-slate-600">
                        {student.username}
                      </p>
                      {(student.className || parsed?.lastname) && (
                        <span className="inline-block rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#0097a7] border border-teal-200/80">
                          {student.className || parsed?.lastname}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center justify-center text-[11px] font-medium text-slate-400 group-hover:text-slate-600">
                      + Tempatkan Siswa
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Modal: Tambah Ruang Ujian Baru */}
      <Modal
        open={addRoomOpen}
        onClose={() => setAddRoomOpen(false)}
        title="Tambah Ruang Ujian Baru"
        size="md"
      >
        <form onSubmit={handleCreateRoom} className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              label="Kode Ruang (Wajib)"
              required
              value={newRoomCode}
              onChange={(e) => setNewRoomCode(e.target.value)}
              placeholder="Contoh: LAB-03 atau R-01"
              size="sm"
            />
            <TextField
              label="Prefix Nomor Meja"
              value={newRoomPrefix}
              onChange={(e) => setNewRoomPrefix(e.target.value)}
              placeholder="Contoh: M"
              size="sm"
            />
          </div>

          <TextField
            label="Nama / Keterangan Ruang"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Contoh: Laboratorium Komputer 3"
            size="sm"
          />

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Jumlah Baris Meja"
              type="number"
              value={String(newRoomRows)}
              onChange={(e) => setNewRoomRows(Number(e.target.value) || 5)}
              size="sm"
            />
            <TextField
              label="Jumlah Kolom Meja"
              type="number"
              value={String(newRoomCols)}
              onChange={(e) => setNewRoomCols(Number(e.target.value) || 6)}
              size="sm"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="sm"
              onClick={() => setAddRoomOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="filled" color="primary" size="sm">
              Simpan Ruang Ujian
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Penempatan Manual Siswa ke Nomor Meja */}
      <Modal
        open={Boolean(selectedDeskSeat)}
        onClose={() => setSelectedDeskSeat(null)}
        title={`Atur Siswa untuk Meja ${selectedDeskSeat} (${activeRoom.code})`}
        size="md"
      >
        <form
          onSubmit={handleSaveManualDesk}
          className="flex flex-col gap-4 py-2"
        >
          <div>
            <label
              htmlFor="manual-desk-student-select"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Pilih Siswa untuk Ditempatkan di Meja {selectedDeskSeat}
            </label>
            <select
              id="manual-desk-student-select"
              value={manualStudentId}
              onChange={(e) => setManualStudentId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#0097a7] focus:outline-none"
            >
              <option value="">-- Pilih Siswa --</option>
              {students.map((s) => {
                const { lastname } = extractStudentFullnameAndLastname(s);
                return (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.username}) - Kelas:{" "}
                    {s.className || lastname || "-"} [{s.roomCode || "LAB-01"}
                    {s.seatNumber ? ` • ${s.seatNumber}` : ""}]
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="sm"
              onClick={() => setSelectedDeskSeat(null)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="filled"
              color="primary"
              size="sm"
              leftIcon={CheckCircle2}
              loading={isLoading}
              disabled={!manualStudentId}
            >
              Simpan Posisi Meja
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExamRoomSeatLayoutManager;
