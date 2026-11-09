"use client";

import { Filter, Search } from "lucide-react";
import type { FC } from "react";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  selectedSubject: string;
  onSubjectChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedGrade: string;
  onGradeChange: (value: string) => void;
}

export const QuestionFilterBar: FC<Props> = ({
  search,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
  selectedType,
  onTypeChange,
  selectedGrade,
  onGradeChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari kode soal, stem pertanyaan, materi..."
          className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Filter:</span>
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
        >
          <option value="ALL">Semua Mapel</option>
          <option value="Matematika">Matematika</option>
          <option value="Fisika">Fisika</option>
          <option value="Kimia">Kimia</option>
          <option value="Biologi">Biologi</option>
          <option value="Bahasa Indonesia">Bahasa Indonesia</option>
          <option value="Geografi">Geografi</option>
          <option value="Sosiologi">Sosiologi</option>
        </select>

        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
        >
          <option value="ALL">Semua Tipe Soal</option>
          <option value="multichoice">Pilihan Ganda Biasa</option>
          <option value="mcma">Pilihan Ganda Kompleks</option>
          <option value="truefalse">Benar / Salah</option>
          <option value="shortanswer">Isian Singkat</option>
          <option value="numerical">Numerik</option>
          <option value="matching">Menjodohkan</option>
          <option value="cloze">Teks Rumpang</option>
          <option value="essay">Uraian / Esai</option>
        </select>

        <select
          value={selectedGrade}
          onChange={(e) => onGradeChange(e.target.value)}
          className="text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
        >
          <option value="ALL">Semua Kelas</option>
          <option value="X">Kelas X</option>
          <option value="XI">Kelas XI</option>
          <option value="XII">Kelas XII</option>
        </select>
      </div>
    </div>
  );
};

export default QuestionFilterBar;
