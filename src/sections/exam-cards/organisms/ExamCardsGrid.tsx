"use client";

import { CreditCard, Filter, Printer } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import { useClassesApi } from "@/modules/classes/presentation/useClassesApi";
import { useExamCardsApi } from "@/modules/exam-cards/presentation/useExamCardsApi";
import Button from "@/shared-ui/component/Button";
import ExamCardItem from "../molecules/ExamCardItem";

export const ExamCardsGrid: FC = () => {
  const { cards, isLoading, error, fetchCards } = useExamCardsApi();
  const { classes, fetchClasses } = useClassesApi();

  const [selectedClassId, setSelectedClassId] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    fetchCards({ classGroupId: selectedClassId });
  }, [fetchCards, selectedClassId]);

  const handlePrint = () => {
    window.print();
  };

  const filteredCards = cards.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.nisn.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Control Header (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-base font-extrabold text-[#0d2b5c]">
            Cetak Kartu Peserta Ujian
          </h2>
          <p className="text-xs text-slate-500">
            Pratinjau dan pencetakan massal kartu peserta ujian per rombel/kelas
          </p>
        </div>

        <Button
          type="button"
          variant="filled"
          color="primary"
          leftIcon={Printer}
          onClick={handlePrint}
          disabled={filteredCards.length === 0}
        >
          Cetak Kartu Ujian (Print)
        </Button>
      </div>

      {/* Filter Bar (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs print:hidden">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari siswa atau NISN..."
            className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">
            Pilih Kelas:
          </span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
          >
            <option value="ALL">Semua Kelas</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700 print:hidden">
          {error}
        </div>
      )}

      {/* Grid of Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-44 rounded-3xl bg-slate-100 animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white print:hidden">
          <CreditCard className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-700">
            Tidak ada data kartu peserta ujian
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Pastikan siswa telah ditambahkan ke data siswa dan rombel
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4">
          {filteredCards.map((card) => (
            <ExamCardItem key={card.studentId} card={card} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamCardsGrid;
