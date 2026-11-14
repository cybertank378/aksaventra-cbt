"use client";

import { Plus, RefreshCw, Search } from "lucide-react";
import type { FC } from "react";
import Button from "@/shared-ui/component/Button";
import TextField from "@/shared-ui/component/TextField";

interface ExamFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: string;
  onFilterChange: (value: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
  onCreateExam: () => void;
}

const FILTER_TABS = [
  { id: "ALL", label: "Semua" },
  { id: "ACTIVE", label: "Sedang Aktif" },
  { id: "SCHEDULED", label: "Terjadwal" },
  { id: "COMPLETED", label: "Selesai" },
];

export const ExamFilterBar: FC<ExamFilterBarProps> = ({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  isLoading,
  onRefresh,
  onCreateExam,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
      <div className="w-full sm:w-96">
        <TextField
          placeholder="Cari naskah ujian atau mata pelajaran..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={Search}
          size="sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
        <Button
          type="button"
          variant="outline"
          color="secondary"
          size="sm"
          leftIcon={RefreshCw}
          onClick={onRefresh}
          disabled={isLoading}
        >
          {isLoading ? "Memuat..." : "Refresh"}
        </Button>

        <Button
          type="button"
          variant="filled"
          color="primary"
          size="sm"
          leftIcon={Plus}
          onClick={onCreateExam}
        >
          Buat Ujian Baru
        </Button>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
          {FILTER_TABS.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              size="sm"
              variant={filter === tab.id ? "filled" : "ghost"}
              color={filter === tab.id ? "primary" : "secondary"}
              onClick={() => onFilterChange(tab.id)}
              className="rounded-lg text-xs"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamFilterBar;
