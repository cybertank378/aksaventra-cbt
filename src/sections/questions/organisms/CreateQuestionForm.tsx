"use client";

import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  HelpCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useState } from "react";
import type {
  CBTQuestionType,
  QuestionOptionDTO,
} from "@/modules/questions/domain/dto/QuestionDTO";
import { useQuestionsApi } from "@/modules/questions/presentation/useQuestionsApi";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import ImageUploader from "@/shared-ui/component/ImageUploader";
import MathRenderer from "@/shared-ui/component/MathRenderer";
import SelectField from "@/shared-ui/component/SelectField";
import TextField from "@/shared-ui/component/TextField";
import MathDiagramModal from "../molecules/MathDiagramModal";
import MathFormulaToolbar from "../molecules/MathFormulaToolbar";
import QuestionEditorHelpModal from "../molecules/QuestionEditorHelpModal";

export const CreateQuestionForm: FC = () => {
  const router = useRouter();
  const { createQuestion, isLoading, error } = useQuestionsApi();

  const [subject, setSubject] = useState("Matematika");
  const [gradeLevel, setGradeLevel] = useState("XII");
  const [type, setType] = useState<CBTQuestionType>("multichoice");
  const [stem, setStem] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [points, setPoints] = useState(2.5);
  const [tolerance, setTolerance] = useState<number | undefined>(undefined);
  const [explanation, setExplanation] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [diagramModalOpen, setDiagramModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const [options, setOptions] = useState<QuestionOptionDTO[]>([
    { id: "opt-1", label: "A", text: "", isCorrect: true },
    { id: "opt-2", label: "B", text: "", isCorrect: false },
    { id: "opt-3", label: "C", text: "", isCorrect: false },
    { id: "opt-4", label: "D", text: "", isCorrect: false },
  ]);

  const handleAddOption = () => {
    const nextIndex = options.length + 1;
    const labels = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const label = labels[options.length] || `${nextIndex}`;
    setOptions((prev) => [
      ...prev,
      { id: `opt-${Date.now()}`, label, text: "", isCorrect: false },
    ]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOptionTextChange = (index: number, text: string) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, text } : opt)),
    );
  };

  const handleToggleCorrect = (index: number) => {
    if (type === "multichoice" || type === "truefalse") {
      setOptions((prev) =>
        prev.map((opt, i) => ({ ...opt, isCorrect: i === index })),
      );
    } else {
      setOptions((prev) =>
        prev.map((opt, i) =>
          i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt,
        ),
      );
    }
  };

  const handleInsertMath = (snippet: string) => {
    setStem((prev) => (prev ? `${prev} ${snippet}` : snippet));
  };

  const handleInsertSvg = (svgCode: string) => {
    setStem((prev) => (prev ? `${prev}\n\n${svgCode}\n\n` : `${svgCode}\n\n`));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stem.trim()) return;

    const result = await createQuestion({
      subject,
      gradeLevel,
      type,
      stem,
      imageUrl,
      points,
      tolerance: type === "numerical" ? tolerance : undefined,
      options: type === "essay" ? [] : options,
      explanation: explanation.trim() || undefined,
    });

    if (result) {
      router.replace("/dashboard/questions");
    }
  };

  const handleBack = () => {
    router.replace("/dashboard/questions");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={ArrowLeft}
            onClick={handleBack}
          >
            Kembali
          </Button>
          <div>
            <h2 className="text-base font-extrabold text-[#0d2b5c]">
              Buat Butir Soal Baru
            </h2>
            <p className="text-xs text-slate-500">
              Formulir pembuatan butir soal CBT standar Moodle mod_cbt
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={HelpCircle}
            onClick={() => setHelpModalOpen(true)}
          >
            Bantuan Editor
          </Button>
          <Button
            type="submit"
            variant="filled"
            color="primary"
            loading={isLoading}
          >
            Simpan ke Bank Soal
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Main Metadata Card */}
      <Card className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
        <SelectField
          id="subject-select"
          label="Mata Pelajaran:"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          size="sm"
        >
          <option value="Matematika">Matematika</option>
          <option value="Fisika">Fisika</option>
          <option value="Kimia">Kimia</option>
          <option value="Biologi">Biologi</option>
          <option value="Bahasa Indonesia">Bahasa Indonesia</option>
          <option value="Geografi">Geografi</option>
          <option value="Sosiologi">Sosiologi</option>
        </SelectField>

        <SelectField
          id="grade-select"
          label="Tingkat Kelas:"
          value={gradeLevel}
          onChange={(e) => setGradeLevel(e.target.value)}
          size="sm"
        >
          <option value="X">Kelas X</option>
          <option value="XI">Kelas XI</option>
          <option value="XII">Kelas XII</option>
        </SelectField>

        <SelectField
          id="type-select"
          label="Tipe Pertanyaan CBT:"
          value={type}
          onChange={(e) => setType(e.target.value as CBTQuestionType)}
          size="sm"
          className="font-bold text-[#0d2b5c]"
        >
          <option value="multichoice">Pilihan Ganda Biasa</option>
          <option value="mcma">Pilihan Ganda Kompleks (MCMA)</option>
          <option value="truefalse">Benar / Salah</option>
          <option value="shortanswer">Isian Singkat</option>
          <option value="numerical">Numerik & Toleransi</option>
          <option value="matching">Menjodohkan</option>
          <option value="cloze">Teks Rumpang (Cloze)</option>
          <option value="essay">Uraian / Esai Bebas</option>
        </SelectField>
      </Card>

      {/* Stem, Diagram & Image Upload Card */}
      <Card className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="stem-textarea"
            className="block text-xs font-bold text-slate-700"
          >
            Teks Pertanyaan / Soal (Mendukung KaTeX $...$, Diagram & Kurva Vektor SVG):
          </label>
          <Button
            type="button"
            variant="ghost"
            color="primary"
            size="xs"
            leftIcon={previewMode ? EyeOff : Eye}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? "Tutup Pratinjau" : "Lihat Pratinjau KaTeX / Kurva"}
          </Button>
        </div>

        {/* Math Quick Toolbar */}
        <MathFormulaToolbar
          onInsertMath={handleInsertMath}
          onOpenDiagramGenerator={() => setDiagramModalOpen(true)}
        />

        {previewMode ? (
          <div className="p-4 rounded-xl border border-[#0097a7]/30 bg-white min-h-[120px]">
            <span className="text-[10px] font-bold text-[#0097a7] uppercase tracking-wider block mb-2">
              Pratinjau Tampilan Siswa:
            </span>
            <MathRenderer
              content={stem || "(Teks pertanyaan masih kosong)"}
              className="text-xs leading-relaxed text-slate-800"
            />
          </div>
        ) : (
          <textarea
            id="stem-textarea"
            rows={5}
            value={stem}
            onChange={(e) => setStem(e.target.value)}
            placeholder="Tuliskan pertanyaan soal di sini. Contoh: Nilai dari $\lim_{x \to 0} \frac{\sin x}{x}$ adalah... atau sisipkan kurva grafik dan formula matematika."
            className="w-full text-xs rounded-xl border border-slate-200 p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0097a7] font-mono"
            required
          />
        )}

        {/* Image / Diagram / Curve Uploader */}
        <div className="pt-2 border-t border-slate-100">
          <ImageUploader
            value={imageUrl}
            onChange={setImageUrl}
            label="Unggah Gambar / Diagram / Kurva Soal (PNG, JPG, SVG, WebP):"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <TextField
            id="points-input"
            label="Bobot Skor Poin:"
            type="number"
            step="0.5"
            min="0.5"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            size="sm"
          />

          {type === "numerical" && (
            <TextField
              id="tolerance-input"
              label="Batas Toleransi Nilai (±):"
              type="number"
              step="0.01"
              min="0"
              value={tolerance || 0}
              onChange={(e) => setTolerance(Number(e.target.value))}
              size="sm"
            />
          )}
        </div>
      </Card>

      {/* Math Diagram Modal Generator */}
      <MathDiagramModal
        open={diagramModalOpen}
        onClose={() => setDiagramModalOpen(false)}
        onInsertSvg={handleInsertSvg}
        onSetAsImageUrl={(url) => setImageUrl(url)}
      />

      {/* Options Matrix (if not essay) */}
      {type !== "essay" && (
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#0d2b5c]">
                Pilihan Jawaban & Kunci
              </h3>
              <p className="text-[11px] text-slate-400">
                Centang opsi yang merupakan kunci jawaban benar
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              color="primary"
              size="sm"
              leftIcon={Plus}
              onClick={handleAddOption}
            >
              Tambah Opsi
            </Button>
          </div>

          <div className="space-y-3">
            {options.map((opt, idx) => (
              <div
                key={opt.id}
                className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/50"
              >
                <Button
                  type="button"
                  size="sm"
                  variant={opt.isCorrect ? "filled" : "outline"}
                  color={opt.isCorrect ? "primary" : "secondary"}
                  onClick={() => handleToggleCorrect(idx)}
                  className="h-8 w-8 rounded-xl p-0 flex items-center justify-center font-bold text-xs shrink-0"
                  title={
                    opt.isCorrect
                      ? "Kunci Benar"
                      : "Klik untuk jadikan kunci benar"
                  }
                >
                  {opt.isCorrect ? <Check className="w-4 h-4" /> : opt.label}
                </Button>

                <div className="flex-1">
                  <TextField
                    type="text"
                    value={opt.text}
                    onChange={(e) =>
                      handleOptionTextChange(idx, e.target.value)
                    }
                    placeholder={`Isi teks pilihan jawaban ${opt.label}...`}
                    size="sm"
                    className="bg-white"
                    required
                  />
                </div>

                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    color="error"
                    size="sm"
                    leftIcon={Trash2}
                    onClick={() => handleRemoveOption(idx)}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Explanation Card */}
      <div className="flex flex-col gap-2 rounded-3xl bg-white border border-slate-200/90 p-5 shadow-xs">
        <label
          htmlFor="explanation-textarea"
          className="block text-xs font-bold text-slate-700"
        >
          Pembahasan / Penjelasan Soal (Opsional):
        </label>
        <textarea
          id="explanation-textarea"
          rows={3}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Catatan pembahasan atau rubrik penilaian untuk guru..."
          className="w-full text-xs rounded-xl border border-slate-200 p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0097a7]"
        />
      </div>

      {/* Editor Guide Modal */}
      <QuestionEditorHelpModal
        open={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
    </form>
  );
};

export default CreateQuestionForm;
