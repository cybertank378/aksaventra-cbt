"use client";

import { Filter, Search } from "lucide-react";
import type { FC } from "react";
import Card from "@/shared-ui/component/Card";
import SelectField from "@/shared-ui/component/SelectField";
import TextField from "@/shared-ui/component/TextField";

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
    <Card className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4">
      <div className="flex-1 max-w-md">
        <TextField
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari kode soal, stem pertanyaan, materi..."
          leftIcon={Search}
          size="sm"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Filter:</span>
        </div>

        <SelectField
          value={selectedSubject}
          onChange={(e) => onSubjectChange(e.target.value)}
          size="sm"
        >
          <option value="ALL">Semua Mapel</option>
          <option value="Matematika">Matematika</option>
          <option value="Fisika">Fisika</option>
          <option value="Kimia">Kimia</option>
          <option value="Biologi">Biologi</option>
          <option value="Bahasa Indonesia">Bahasa Indonesia</option>
          <option value="Geografi">Geografi</option>
          <option value="Sosiologi">Sosiologi</option>
        </SelectField>

        <SelectField
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          size="sm"
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
        </SelectField>

        <SelectField
          value={selectedGrade}
          onChange={(e) => onGradeChange(e.target.value)}
          size="sm"
        >
          <option value="ALL">Semua Kelas</option>
          <option value="X">Kelas X</option>
          <option value="XI">Kelas XI</option>
          <option value="XII">Kelas XII</option>
        </SelectField>
      </div>
    </Card>
  );
};

export default QuestionFilterBar;
