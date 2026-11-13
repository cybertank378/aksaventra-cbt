"use client";

import { CreditCard, FileDown, Loader2, Search, Settings } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import { generateExamCardsPdf } from "@/libs/examCardPdfGenerator";
import { useClassesApi } from "@/modules/classes/presentation/useClassesApi";
import type { ExamCardSettings } from "@/modules/exam-cards/domain/dto/ExamCardDTO";
import { DEFAULT_EXAM_CARD_SETTINGS } from "@/modules/exam-cards/domain/dto/ExamCardDTO";
import { useExamCardsApi } from "@/modules/exam-cards/presentation/useExamCardsApi";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import SelectField from "@/shared-ui/component/SelectField";
import TextField from "@/shared-ui/component/TextField";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";
import ExamCardItem from "../molecules/ExamCardItem";
import ExamCardSettingsModal from "../molecules/ExamCardSettingsModal";

const SETTINGS_STORAGE_KEY = "aksaventra_exam_card_settings";

export const ExamCardsGrid: FC = () => {
  const { cards, isLoading, error, fetchCards } = useExamCardsApi();
  const { classes, fetchClasses } = useClassesApi();

  const [selectedClassId, setSelectedClassId] = useState("ALL");
  const [search, setSearch] = useState("");
  const [settings, setSettings] = useState<ExamCardSettings>(DEFAULT_EXAM_CARD_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    fetchCards({ classGroupId: selectedClassId });
  }, [fetchCards, selectedClassId]);

  const filteredCards = cards.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.nisn.toLowerCase().includes(search.toLowerCase()),
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
      showSuccessToast(`Berhasil mengunduh PDF untuk ${filteredCards.length} kartu peserta ujian.`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      showErrorToast("Gagal membuat berkas PDF kartu ujian. Silakan coba lagi.");
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

        <div className="flex items-center gap-2">
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

      {/* Filter Bar - Strict 1 Row 2 Columns CSS Grid */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center w-full">
          <div className="w-full">
            <TextField
              leftIcon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Grid of Cards - 3 Columns Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => (
            <ExamCardItem
              key={card.studentId}
              card={card}
              settings={settings}
            />
          ))}
        </div>
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
