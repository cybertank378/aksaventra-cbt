"use client";

import { Check, Plus, Save, Trash2, X } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import { useClassesApi } from "@/modules/classes/presentation/useClassesApi";
import type {
  CBTQuestionType,
  CreateQuestionInputDTO,
  QuestionDTO,
  QuestionOptionDTO,
} from "@/modules/questions/domain/dto/QuestionDTO";
import { useQuestionsApi } from "@/modules/questions/presentation/useQuestionsApi";
import Button from "@/shared-ui/component/Button";
import ImageUploader from "@/shared-ui/component/ImageUploader";
import Modal from "@/shared-ui/component/Modal";
import SelectField from "@/shared-ui/component/SelectField";
import TextAreaField from "@/shared-ui/component/TextAreaField";
import TextField from "@/shared-ui/component/TextField";
import MathDiagramModal from "./MathDiagramModal";
import MathFormulaToolbar from "./MathFormulaToolbar";

interface EditQuestionModalProps {
  open: boolean;
  question: QuestionDTO | null;
  onClose: () => void;
  onSave: (id: string, data: Partial<CreateQuestionInputDTO>) => Promise<boolean>;
}

export const EditQuestionModal: FC<EditQuestionModalProps> = ({
  open,
  question,
  onClose,
  onSave,
}) => {
  const { subjects, fetchSubjects } = useQuestionsApi();
  const { classes, fetchClasses } = useClassesApi();

  const [subject, setSubject] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");

  useEffect(() => {
    if (open) {
      fetchSubjects();
      fetchClasses();
    }
  }, [open, fetchSubjects, fetchClasses]);
  const [type, setType] = useState<CBTQuestionType>("multichoice");
  const [stem, setStem] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [points, setPoints] = useState<number>(2.5);
  const [tolerance, setTolerance] = useState<number | undefined>(undefined);
  const [options, setOptions] = useState<QuestionOptionDTO[]>([]);
  const [explanation, setExplanation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [diagramModalOpen, setDiagramModalOpen] = useState(false);

  useEffect(() => {
    if (question) {
      setSubject(question.subject);
      setGradeLevel(question.gradeLevel);
      setType(question.type);
      setStem(question.stem);
      setImageUrl(question.imageUrl);
      setPoints(question.points);
      setTolerance(question.tolerance);
      setOptions(question.options || []);
      setExplanation(question.explanation || "");
      setErrorMessage(null);
    }
  }, [question]);

  if (!question) return null;

  const handleAddOption = () => {
    const labels = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const label = labels[options.length] || `${options.length + 1}`;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!stem.trim()) {
      setErrorMessage("Teks soal (stem) wajib diisi.");
      return;
    }

    if (type === "multichoice" && options.filter((o) => o.isCorrect).length !== 1) {
      setErrorMessage("Soal Pilihan Ganda biasa wajib memiliki tepat 1 kunci jawaban.");
      return;
    }

    if (type === "mcma" && options.filter((o) => o.isCorrect).length < 1) {
      setErrorMessage("Soal Pilihan Ganda Kompleks wajib memiliki minimal 1 kunci jawaban.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSave(question.id, {
        subject,
        gradeLevel,
        type,
        stem,
        imageUrl,
        points: Number(points) || 1,
        tolerance: type === "numerical" ? tolerance : undefined,
        options: type === "essay" ? [] : options,
        explanation: explanation.trim() || undefined,
      });

      if (success) {
        onClose();
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Gagal menyimpan perubahan soal.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit Butir Soal: ${question.code}`}
      subtitle="Perbarui parameter soal, teks stem pertanyaan, dan konfigurasi kunci jawaban"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-2">
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        {/* Basic Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SelectField
            label="Mata Pelajaran"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            size="sm"
          >
            {Array.from(new Set([subject, ...subjects].filter(Boolean))).map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Kelas / Tingkat"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            size="sm"
          >
            {Array.from(
              new Set([gradeLevel, ...classes.map((c) => c.name)].filter(Boolean)),
            ).map((clsName) => (
              <option key={clsName} value={clsName}>
                {clsName}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Tipe Soal"
            value={type}
            onChange={(e) => setType(e.target.value as CBTQuestionType)}
            size="sm"
          >
            <option value="multichoice">Pilihan Ganda Biasa</option>
            <option value="mcma">Pilihan Ganda Kompleks</option>
            <option value="truefalse">Benar / Salah</option>
            <option value="shortanswer">Isian Singkat</option>
            <option value="numerical">Numerik</option>
            <option value="matching">Menjodohkan</option>
            <option value="cloze">Teks Rumpang</option>
            <option value="essay">Uraian / Esai</option>
          </SelectField>

          <TextField
            label="Bobot Poin"
            type="number"
            step="0.5"
            min="0.5"
            max="100"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            size="sm"
          />
        </div>

        {/* Numerical Tolerance if applicable */}
        {type === "numerical" && (
          <div className="max-w-xs">
            <TextField
              label="Toleransi Nilai (±)"
              type="number"
              step="0.01"
              min="0"
              placeholder="Contoh: 0.05"
              value={tolerance ?? ""}
              onChange={(e) =>
                setTolerance(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              size="sm"
            />
          </div>
        )}

        {/* Stem Pertanyaan */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800">
              Stem Pertanyaan / Teks Soal
            </label>
            <span className="text-[11px] text-slate-400">
              Mendukung KaTeX $...$, Kurva & Diagram SVG
            </span>
          </div>

          <MathFormulaToolbar
            onInsertMath={(snip) => setStem((prev) => (prev ? `${prev} ${snip}` : snip))}
            onOpenDiagramGenerator={() => setDiagramModalOpen(true)}
          />

          <TextAreaField
            rows={4}
            value={stem}
            onChange={(e) => setStem(e.target.value)}
            placeholder="Tuliskan stem pertanyaan soal... (Mendukung rumus LaTeX math seperti $E=mc^2$ atau kurva SVG)"
          />

          <ImageUploader
            value={imageUrl}
            onChange={setImageUrl}
            label="Lampiran Gambar / Diagram / Kurva Soal (Opsional)"
          />
        </div>

        {/* Math Diagram Modal */}
        <MathDiagramModal
          open={diagramModalOpen}
          onClose={() => setDiagramModalOpen(false)}
          onInsertSvg={(svg) => setStem((prev) => (prev ? `${prev}\n\n${svg}\n\n` : `${svg}\n\n`))}
          onSetAsImageUrl={(url) => setImageUrl(url)}
        />

        {/* Options Editor */}
        {type !== "essay" && (
          <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Opsi Jawaban & Kunci
                </p>
                <p className="text-[11px] text-slate-500">
                  {type === "multichoice" || type === "truefalse"
                    ? "Pilih satu opsi sebagai kunci jawaban benar."
                    : "Tandai opsi yang merupakan jawaban benar."}
                </p>
              </div>

              {type !== "truefalse" && (
                <Button
                  type="button"
                  variant="outline"
                  color="secondary"
                  size="sm"
                  leftIcon={Plus}
                  onClick={handleAddOption}
                >
                  Tambah Opsi
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              {options.map((opt, index) => (
                <div
                  key={opt.id}
                  className={`flex items-center gap-2 p-3 rounded-2xl border transition-colors ${
                    opt.isCorrect
                      ? "bg-emerald-50/70 border-emerald-300"
                      : "bg-slate-50/60 border-slate-200"
                  }`}
                >
                  <Button
                    type="button"
                    variant={opt.isCorrect ? "filled" : "outline"}
                    color={opt.isCorrect ? "success" : "secondary"}
                    size="sm"
                    onClick={() => handleToggleCorrect(index)}
                    title={
                      opt.isCorrect
                        ? "Kunci Jawaban Benar"
                        : "Klik untuk jadikan Kunci Jawaban"
                    }
                    className="w-8 h-8 rounded-xl shrink-0 font-bold"
                  >
                    {opt.isCorrect ? <Check className="w-4 h-4" /> : opt.label}
                  </Button>

                  <div className="flex-1">
                    <TextField
                      value={opt.text}
                      onChange={(e) =>
                        handleOptionTextChange(index, e.target.value)
                      }
                      placeholder={`Teks pilihan jawaban ${opt.label}...`}
                      size="sm"
                    />
                  </div>

                  {options.length > 2 && type !== "truefalse" && (
                    <Button
                      type="button"
                      variant="ghost"
                      color="error"
                      size="sm"
                      leftIcon={Trash2}
                      onClick={() => handleRemoveOption(index)}
                      title="Hapus opsi ini"
                      className="shrink-0"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explanation */}
        <div>
          <TextAreaField
            label="Pembahasan / Catatan Kunci (Opsional)"
            rows={2}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Tuliskan pembahasan atau langkah penyelesaian soal..."
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="ghost"
            color="secondary"
            size="sm"
            leftIcon={X}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="filled"
            color="primary"
            size="sm"
            leftIcon={Save}
            loading={isSubmitting}
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditQuestionModal;
