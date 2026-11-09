"use client";

import { ArrowLeft, ListFilter, Plus } from "lucide-react";
import Link from "next/link";
import { Suspense, use, useState } from "react";
import Button from "@/shared-ui/component/Button";
import Modal from "@/shared-ui/component/Modal";
import AppLayout from "@/shared-ui/layout/AppLayout";

interface QuestionItem {
  id: string;
  slot: number;
  type:
    | "multichoice"
    | "mcma"
    | "truefalse"
    | "shortanswer"
    | "numerical"
    | "matching"
    | "cloze"
    | "essay";
  stem: string;
  points: number;
  optionsSummary?: string;
}

const QUESTION_TYPE_LABELS: Record<
  QuestionItem["type"],
  { name: string; color: string }
> = {
  multichoice: {
    name: "Pilihan Ganda Biasa",
    color: "bg-blue-50 text-blue-700",
  },
  mcma: {
    name: "Pilihan Ganda Kompleks (MCMA)",
    color: "bg-indigo-50 text-indigo-700",
  },
  truefalse: { name: "Benar / Salah", color: "bg-teal-50 text-teal-700" },
  shortanswer: { name: "Isian Singkat", color: "bg-amber-50 text-amber-700" },
  numerical: {
    name: "Numerik & Toleransi",
    color: "bg-emerald-50 text-emerald-700",
  },
  matching: { name: "Menjodohkan", color: "bg-purple-50 text-purple-700" },
  cloze: { name: "Teks Rumpang (Cloze)", color: "bg-rose-50 text-rose-700" },
  essay: { name: "Uraian / Esai Bebas", color: "bg-slate-100 text-slate-700" },
};

const mockQuestions: QuestionItem[] = [
  {
    id: "q-1",
    slot: 1,
    type: "multichoice",
    stem: "Jika persamaan kuadrat $x^2 - 5x + 6 = 0$ memiliki akar-akar $x_1$ dan $x_2$, berapakah nilai $x_1 + x_2$?",
    points: 2.5,
    optionsSummary: "5 Pilihan (A-E), Kunci: B (5)",
  },
  {
    id: "q-2",
    slot: 2,
    type: "mcma",
    stem: "Pilihlah semua pernyataan yang benar mengenai hukum Termodinamika I dan II!",
    points: 3.0,
    optionsSummary: "Multi-select: 3 opsi benar dari 5 opsi",
  },
  {
    id: "q-3",
    slot: 3,
    type: "truefalse",
    stem: "Pada proses isokhorik, kerja sistem bernilai nol ($W = 0$).",
    points: 2.0,
    optionsSummary: "Kunci: Benar (True)",
  },
  {
    id: "q-4",
    slot: 4,
    type: "shortanswer",
    stem: "Sebutkan nama organel sel yang berfungsi sebagai pusat pembangkit energi utama!",
    points: 2.5,
    optionsSummary: "Kunci teks: Mitokondria / Mitochondrion",
  },
  {
    id: "q-5",
    slot: 5,
    type: "numerical",
    stem: "Hitunglah percepatan gravitasi rata-rata di permukaan bumi dalam satuan $m/s^2$ (toleransi 0.05)!",
    points: 2.5,
    optionsSummary: "Target: 9.80 ± 0.05",
  },
  {
    id: "q-6",
    slot: 6,
    type: "matching",
    stem: "Jodohkan nama besaran pokok berikut dengan satuan standar internasionalnya!",
    points: 3.5,
    optionsSummary:
      "4 Pasangan cocok (Panjang -> Meter, Massa -> Kilogram, dll)",
  },
  {
    id: "q-7",
    slot: 7,
    type: "cloze",
    stem: "Fotosintesis terjadi pada {1:kloroplas} dengan memanfaatkan energi {2:cahaya matahari}.",
    points: 3.0,
    optionsSummary: "2 Teks Rumpang Isian",
  },
  {
    id: "q-8",
    slot: 8,
    type: "essay",
    stem: "Jelaskan secara komprehensif dampak pemanasan global terhadap ekosistem terumbu karang!",
    points: 10.0,
    optionsSummary: "Koreksi Manual Guru / Rubrik Penilaian",
  },
];

interface ExamQuestionsPageProps {
  params: Promise<{ id: string }>;
}

function ExamQuestionsContent({ params }: ExamQuestionsPageProps) {
  const { id: _examId } = use(params);
  const [questions, setQuestions] = useState<QuestionItem[]>(mockQuestions);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");

  const [newType, setNewType] = useState<QuestionItem["type"]>("multichoice");
  const [newStem, setNewStem] = useState("");
  const [newPoints, setNewPoints] = useState(2.5);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStem.trim()) return;

    const newQ: QuestionItem = {
      id: `q-${Date.now()}`,
      slot: questions.length + 1,
      type: newType,
      stem: newStem.trim(),
      points: newPoints,
      optionsSummary: "Terkonfigurasi",
    };

    setQuestions((prev) => [...prev, newQ]);
    setNewStem("");
    setModalOpen(false);
  };

  const filtered = questions.filter((q) => {
    if (filterType !== "ALL" && q.type !== filterType) return false;
    return true;
  });

  return (
    // biome-ignore lint/a11y/useValidAriaRole: AppLayout role is a custom component prop
    <AppLayout
      role="TEACHER"
      user={{
        id: "teacher-1",
        name: "Guru Mata Pelajaran",
        email: "guru@aksaventra.sch.id",
        role: "TEACHER",
      }}
      title="Bank Soal & Butir Pertanyaan CBT"
      subtitle="Mendukung 8 varian model soal Moodle mod_cbt dengan snapshot beku MUC"
    >
      <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Top Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard/exams">
            <Button
              type="button"
              variant="outline"
              color="secondary"
              size="sm"
              leftIcon={ArrowLeft}
            >
              Kembali ke Daftar Ujian
            </Button>
          </Link>

          <Button
            type="button"
            variant="filled"
            color="primary"
            size="sm"
            leftIcon={Plus}
            onClick={() => setModalOpen(true)}
          >
            Tambah Butir Soal Baru
          </Button>
        </div>

        {/* Filter Badges for 8 Question Types */}
        <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
            <ListFilter className="w-3.5 h-3.5" /> Filter Tipe:
          </span>
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              filterType === "ALL"
                ? "bg-[#0d2b5c] text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua ({questions.length})
          </button>
          {Object.entries(QUESTION_TYPE_LABELS).map(([k, label]) => {
            const count = questions.filter((q) => q.type === k).length;
            if (count === 0) return null;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setFilterType(k)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterType === k
                    ? "bg-[#0097a7] text-white shadow-2xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                }`}
              >
                {label.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Questions List */}
        <div className="flex flex-col gap-3">
          {filtered.map((q) => {
            const typeInfo = QUESTION_TYPE_LABELS[q.type];

            return (
              <div
                key={q.id}
                className="flex flex-col gap-2 p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs hover:border-[#0097a7]/50 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-[#0d2b5c] text-white font-bold text-xs flex items-center justify-center">
                      {q.slot}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${typeInfo.color}`}
                    >
                      {typeInfo.name}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-slate-500">
                    Bobot: <strong>{q.points} Poin</strong>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed mt-1">
                  {q.stem}
                </p>

                {q.optionsSummary && (
                  <p className="text-[11px] text-slate-400 font-mono mt-1 border-t border-slate-100 pt-2">
                    Keterangan: {q.optionsSummary}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Create Modal */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Tambah Butir Soal Baru"
          size="lg"
        >
          <form
            onSubmit={handleAddQuestion}
            className="flex flex-col gap-4 py-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="question-type-select"
                  className="text-xs font-semibold text-slate-700"
                >
                  Model / Jenis Pertanyaan (8 Tipe)
                </label>
                <select
                  id="question-type-select"
                  value={newType}
                  onChange={(e) =>
                    setNewType(e.target.value as QuestionItem["type"])
                  }
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
                >
                  {Object.entries(QUESTION_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="question-points-input"
                  className="text-xs font-semibold text-slate-700"
                >
                  Bobot Nilai (Poin)
                </label>
                <input
                  id="question-points-input"
                  type="number"
                  step="0.5"
                  value={newPoints}
                  onChange={(e) => setNewPoints(Number(e.target.value))}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="question-stem-textarea"
                className="text-xs font-semibold text-slate-700"
              >
                Teks Narasi Soal (Mendukung KaTeX LaTeX $...$ dan HTML)
              </label>
              <textarea
                id="question-stem-textarea"
                required
                rows={4}
                value={newStem}
                onChange={(e) => setNewStem(e.target.value)}
                placeholder="Tuliskan butir soal di sini. Contoh: Diketahui rumus gaya $F = m \cdot a$..."
                className="w-full text-xs rounded-xl border border-slate-200 p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                color="secondary"
                onClick={() => setModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" variant="filled" color="primary">
                Simpan Butir Soal
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

export default function ExamQuestionsPage({ params }: ExamQuestionsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#0097a7]" />
        </div>
      }
    >
      <ExamQuestionsContent params={params} />
    </Suspense>
  );
}
