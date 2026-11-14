"use client";

import { Search } from "lucide-react";
import { type FC, useEffect } from "react";
import { useClassesApi } from "@/modules/classes/presentation/useClassesApi";
import { useQuestionsApi } from "@/modules/questions/presentation/useQuestionsApi";
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
  const { subjects, fetchSubjects } = useQuestionsApi();
  const { classes, fetchClasses } = useClassesApi();

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, [fetchSubjects, fetchClasses]);

  return (
    <Card className="shadow-xs" bodyClassName="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search Field (5 cols on lg) */}
        <div className="sm:col-span-2 lg:col-span-5">
          <TextField
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari kode soal, stem pertanyaan, materi..."
            leftIcon={Search}
            size="sm"
          />
        </div>

        {/* Mata Pelajaran (3 cols on lg) */}
        <div className="lg:col-span-3">
          <SelectField
            value={selectedSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            size="sm"
          >
            <option value="ALL">Semua Mata Pelajaran</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </SelectField>
        </div>

        {/* Tipe Soal (2 cols on lg) */}
        <div className="lg:col-span-2">
          <SelectField
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            size="sm"
          >
            <option value="ALL">Semua Tipe Soal</option>
            <option value="multichoice">Pilihan Ganda</option>
            <option value="mcma">PG Kompleks</option>
            <option value="truefalse">Benar / Salah</option>
            <option value="shortanswer">Isian Singkat</option>
            <option value="numerical">Numerik</option>
            <option value="matching">Menjodohkan</option>
            <option value="cloze">Teks Rumpang</option>
            <option value="essay">Uraian / Esai</option>
          </SelectField>
        </div>

        {/* Kelas / Tingkat (2 cols on lg) */}
        <div className="lg:col-span-2">
          <SelectField
            value={selectedGrade}
            onChange={(e) => onGradeChange(e.target.value)}
            size="sm"
          >
            <option value="ALL">Semua Kelas</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.name}>
                {cls.name}
              </option>
            ))}
          </SelectField>
        </div>
      </div>
    </Card>
  );
};

export default QuestionFilterBar;
