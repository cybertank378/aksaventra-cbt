"use client";

import clsx from "clsx";
import {
  CreditCard,
  FileDown,
  LayoutGrid,
  List,
  Loader2,
  Search,
  Settings,
} from "lucide-react";
import { type FC, useEffect, useState } from "react";
import { generateExamCardsPdf } from "@/libs/examCardPdfGenerator";
import { useClassesApi } from "@/modules/classes/presentation/useClassesApi";
import type { ExamCardSettings } from "@/modules/exam-cards/domain/dto/ExamCardDTO";
import { DEFAULT_EXAM_CARD_SETTINGS } from "@/modules/exam-cards/domain/dto/ExamCardDTO";
import { useExamCardsApi } from "@/modules/exam-cards/presentation/useExamCardsApi";
import ExamRoomSeatLayoutManager from "@/sections/classes/organisms/ExamRoomSeatLayoutManager";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import Pagination from "@/shared-ui/component/Pagination";
import SelectField from "@/shared-ui/component/SelectField";
import TextField from "@/shared-ui/component/TextField";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";
import ExamCardItem from "../molecules/ExamCardItem";
import ExamCardSettingsModal from "../molecules/ExamCardSettingsModal";

const SETTINGS_STORAGE_KEY = "aksaventra_exam_card_settings";
const ITEMS_PER_PAGE = 9;

export const ExamCardsGrid: FC = () => {
  const { cards, isLoading, error, fetchCards } = useExamCardsApi();
  const {
    classes,
    students,
    isLoading: isClassesLoading,
    fetchClasses,
    fetchStudents,
    bulkAssignRoomAndSeats,
  } = useClassesApi();

  const [activeSectionTab, setActiveSectionTab] = useState<
    "CARDS" | "ROOMS_SEATS"
  >("CARDS");
  const [selectedClassId, setSelectedClassId] = useState("ALL");
  const [search, setSearch] = useState("");
  const [settings, setSettings] = useState<ExamCardSettings>(
    DEFAULT_EXAM_CARD_SETTINGS,
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // View mode and pagination state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  // Load custom settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Fallback to default
    }
  }, []);

  const handleSaveSettings = (updated: ExamCardSettings) => {
    setSettings(updated);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage unavailable
    }
  };

  useEffect(() => {
    void fetchClasses();
    void fetchStudents();
  }, [fetchClasses, fetchStudents]);

  useEffect(() => {
    fetchCards({ classGroupId: selectedClassId });
    setCurrentPage(1);
  }, [fetchCards, selectedClassId]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const filteredCards = cards.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.nisn.toLowerCase().includes(search.toLowerCase()),
  );

  const totalItems = filteredCards.length;
  const paginatedCards = filteredCards.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleDownloadPdf = async () => {
    if (filteredCards.length === 0) return;
    setIsGeneratingPdf(true);
    try {
      const selectedClass = classes.find((c) => c.id === selectedClassId);
      const classSuffix = selectedClass
        ? `_${selectedClass.name.replace(/\s+/g, "_")}`
        : "_Semua_Kelas";
      const filename = `Kartu_Ujian${classSuffix}_${new Date().toISOString().slice(0, 10)}.pdf`;

      await generateExamCardsPdf(filteredCards, settings, { filename });
      showSuccessToast(
        `Berhasil mengunduh PDF untuk ${filteredCards.length} kartu peserta ujian.`,
      );
    } catch (err) {
      console.error("PDF generation failed:", err);
      showErrorToast(
        "Gagal membuat berkas PDF kartu ujian. Silakan coba lagi.",
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Control Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-[#0d2b5c]">
            Cetak Kartu Peserta Ujian
          </h2>
          <p className="text-xs text-slate-500">
            Kustomisasi kop lembaga dan unduh PDF kartu tanda peserta ujian
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-2xl bg-slate-100 p-1 mr-1">
            <button
              type="button"
              onClick={() => setActiveSectionTab("CARDS")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeSectionTab === "CARDS"
                  ? "bg-[#0d2b5c] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Kartu Peserta ({filteredCards.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSectionTab("ROOMS_SEATS")}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                activeSectionTab === "ROOMS_SEATS"
                  ? "bg-[#0097a7] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Ruang &amp; Tata Letak Meja
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            color="secondary"
            leftIcon={Settings}
            onClick={() => setIsSettingsOpen(true)}
          >
            Pengaturan Kartu
          </Button>

          <Button
            type="button"
            variant="filled"
            color="primary"
            leftIcon={isGeneratingPdf ? Loader2 : FileDown}
            onClick={handleDownloadPdf}
            disabled={filteredCards.length === 0 || isGeneratingPdf}
          >
            {isGeneratingPdf ? "Menyiapkan PDF..." : "Unduh PDF Kartu Ujian"}
          </Button>
        </div>
      </div>

      {activeSectionTab === "ROOMS_SEATS" ? (
        <ExamRoomSeatLayoutManager
          classes={classes}
          students={students}
          isLoading={isClassesLoading}
          onAssignRoomAndSeats={async (input) => {
            const ok = await bulkAssignRoomAndSeats(input);
            if (ok) {
              await fetchCards({ classGroupId: selectedClassId });
            }
            return ok;
          }}
        />
      ) : (
        <>
          {/* Filter Bar - Strict 1 Row 2 Columns CSS Grid */}
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center w-full">
              <div className="w-full">
                <TextField
                  leftIcon={Search}
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Cari siswa atau NISN..."
                  size="sm"
                />
              </div>

              <div className="w-full">
                <SelectField
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  size="sm"
                >
                  <option value="ALL">Semua Kelas</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </SelectField>
              </div>
            </div>
          </Card>

          {/* Sub-bar: Item Stats & View Mode Switcher */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-slate-500">
              Menampilkan{" "}
              <strong className="text-slate-700">
                {totalItems === 0
                  ? 0
                  : `${(currentPage - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      totalItems,
                    )}`}
              </strong>{" "}
              dari <strong className="text-slate-700">{totalItems}</strong>{" "}
              kartu peserta
            </span>

            {/* View Switcher Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={clsx(
                  "p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer",
                  viewMode === "grid"
                    ? "bg-white text-[#0d2b5c] shadow-xs"
                    : "text-slate-500 hover:text-slate-900",
                )}
                title="Grid View (3 Kolom)"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={clsx(
                  "p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer",
                  viewMode === "list"
                    ? "bg-white text-[#0d2b5c] shadow-xs"
                    : "text-slate-500 hover:text-slate-900",
                )}
                title="List View"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">List</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Display Cards based on View Mode */}
          {isLoading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "flex flex-col gap-3"
              }
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={clsx(
                    "rounded-2xl bg-slate-100 animate-pulse border border-slate-200",
                    viewMode === "grid" ? "h-44" : "h-24",
                  )}
                />
              ))}
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white">
              <CreditCard className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-700">
                Tidak ada data kartu peserta ujian
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Pastikan siswa telah ditambahkan ke data siswa dan rombel
              </p>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedCards.map((card) => (
                    <ExamCardItem
                      key={card.studentId}
                      card={card}
                      settings={settings}
                      viewMode="grid"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {paginatedCards.map((card) => (
                    <ExamCardItem
                      key={card.studentId}
                      card={card}
                      settings={settings}
                      viewMode="list"
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalItems > ITEMS_PER_PAGE && (
                <div className="mt-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChangeAction={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Modal Pengaturan Kartu Ujian */}
      <ExamCardSettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
};

export default ExamCardsGrid;
