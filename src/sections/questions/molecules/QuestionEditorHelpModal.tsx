"use client";

import {
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileCode,
  FileText,
  HelpCircle,
  LineChart,
  Sparkles,
  X,
} from "lucide-react";
import { type FC, useState } from "react";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import MathRenderer from "@/shared-ui/component/MathRenderer";
import Modal from "@/shared-ui/component/Modal";

interface QuestionEditorHelpModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "math" | "diagram" | "word" | "types";
}

export const QuestionEditorHelpModal: FC<QuestionEditorHelpModalProps> = ({
  open,
  onClose,
  defaultTab = "math",
}) => {
  const [activeTab, setActiveTab] = useState<"math" | "diagram" | "word" | "types">(defaultTab);
  const [copiedWord, setCopiedWord] = useState(false);

  const sampleWordText = `1. Diketahui fungsi kuadrat $f(x) = x^2 - 4x + 3$. Koordinat titik puncak kurva parabola tersebut adalah...
A. $(2, -1)$
B. $(-2, 1)$
C. $(1, 3)$
D. $(2, 1)$
E. $(-2, -1)$
KUNCI: A
BOBOT: 2.5
PEMBAHASAN: Titik puncak $x_p = -\\frac{b}{2a} = -\\frac{-4}{2(1)} = 2$. Nilai $y_p = 2^2 - 4(2) + 3 = -1$. Jadi koordinat puncak $(2, -1)$.

2. Manakah di antara bilangan berikut yang merupakan bilangan prima ganjil? (Pilih semua yang benar)
A. 2
B. 3
C. 5
D. 7
E. 9
KUNCI: B, C, D
TIPE: MCMA
BOBOT: 3.0
PEMBAHASAN: 3, 5, dan 7 adalah bilangan prima ganjil. 2 adalah prima genap, sedangkan 9 bukan prima.

3. Pernyataan: Gradien garis yang sejajar dengan garis $y = 3x - 5$ adalah 3.
A. Benar
B. Salah
KUNCI: A
TIPE: Benar / Salah
BOBOT: 2.0

4. Jelaskan perbedaan antara besaran skalar dan besaran vektor serta berikan masing-masing 2 contoh!
KUNCI: Besaran skalar hanya memiliki nilai/besar (contoh: massa, waktu), sedangkan besaran vektor memiliki nilai dan arah (contoh: kecepatan, gaya).
BOBOT: 5.0
TIPE: ESAI`;

  const handleCopyWordTemplate = async () => {
    try {
      await navigator.clipboard.writeText(sampleWordText);
      setCopiedWord(true);
      setTimeout(() => setCopiedWord(false), 2000);
    } catch (_err) {
      // fallback
    }
  };

  const handleDownloadWordDoc = () => {
    const htmlDoc = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>Template Bank Soal Word - Aksaventra CBT</title></head>
<body>
<h2>Template Bank Soal Word (.docx) - Aksaventra CBT</h2>
<p>Berikut adalah format baku penyusunan butir soal dalam Microsoft Word yang siap diimpor langsung ke sistem Aksaventra CBT.</p>
<hr/>
<pre style="font-family: Arial; font-size: 11pt; line-height: 1.5;">${sampleWordText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
</body></html>`;

    const blob = new Blob([htmlDoc], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_bank_soal_aksaventra.doc";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bantuan Editor & Panduan Penyusunan Soal"
      subtitle="Panduan komprehensif rumus matematika KaTeX, diagram kurva vektor, dan impor soal Microsoft Word (.docx)"
      size="xl"
    >
      <div className="flex flex-col gap-5 py-2">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("math")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "math"
                ? "bg-white text-[#0d2b5c] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0097a7]" />
            Formula KaTeX Matematika
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("diagram")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "diagram"
                ? "bg-white text-[#0d2b5c] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LineChart className="w-3.5 h-3.5 text-[#0097a7]" />
            Kurva & Diagram Vektor
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("word")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "word"
                ? "bg-white text-[#0d2b5c] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            Impor Soal Word (.docx)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("types")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "types"
                ? "bg-white text-[#0d2b5c] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            8 Tipe Pertanyaan CBT
          </button>
        </div>

        {/* TAB 1: FORMULA KATEX */}
        {activeTab === "math" && (
          <div className="flex flex-col gap-4 text-xs leading-relaxed text-slate-700">
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200">
              <h4 className="font-extrabold text-[#0d2b5c] text-sm mb-1">
                Aturan Penulisan KaTeX LaTeX
              </h4>
              <p className="text-slate-600">
                Aksaventra CBT mendukung notasi matematika standar LaTeX berkecepatan tinggi.
                Gunakan pembungkus <code className="px-1.5 py-0.5 rounded bg-white text-teal-800 font-bold border border-teal-200">$...$</code> untuk rumus sejajar teks (*inline math*) atau <code className="px-1.5 py-0.5 rounded bg-white text-teal-800 font-bold border border-teal-200">$$...$$</code> untuk rumus satu baris terpusat (*display math*).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-2">
                <span className="font-bold text-[#0d2b5c]">1. Pecahan & Akar</span>
                <code className="p-2 rounded-xl bg-slate-50 text-[11px] text-slate-800 font-mono">
                  {"$\\frac{a + b}{c - d}$ dan $\\sqrt{b^2 - 4ac}$"}
                </code>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Tampilan Siswa:</span>
                  <MathRenderer content={"Hasil: $\\frac{a + b}{c - d}$ dan $\\sqrt{b^2 - 4ac}$"} />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-2">
                <span className="font-bold text-[#0d2b5c]">2. Pangkat, Indeks & Limit</span>
                <code className="p-2 rounded-xl bg-slate-50 text-[11px] text-slate-800 font-mono">
                  {"$f(x) = 3x^4 - 5x^2 + 7$ dan $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$"}
                </code>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Tampilan Siswa:</span>
                  <MathRenderer content={"Hasil: $f(x) = 3x^4 - 5x^2 + 7$ dan $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$"} />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-2">
                <span className="font-bold text-[#0d2b5c]">3. Integral & Notasi Sigma</span>
                <code className="p-2 rounded-xl bg-slate-50 text-[11px] text-slate-800 font-mono">
                  {"$\\int_{0}^{\\pi} \\sin(x)\\,dx$ dan $\\sum_{i=1}^{n} x_i$"}
                </code>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Tampilan Siswa:</span>
                  <MathRenderer content={"Hasil: $\\int_{0}^{\\pi} \\sin(x)\\,dx$ dan $\\sum_{i=1}^{n} x_i$"} />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col gap-2">
                <span className="font-bold text-[#0d2b5c]">4. Matriks & Sistem Persamaan</span>
                <code className="p-2 rounded-xl bg-slate-50 text-[11px] text-slate-800 font-mono">
                  {"$A = \\begin{pmatrix} 2 & -1 \\\\ 3 & 4 \\end{pmatrix}$"}
                </code>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Tampilan Siswa:</span>
                  <MathRenderer content={"Hasil: $A = \\begin{pmatrix} 2 & -1 \\\\ 3 & 4 \\end{pmatrix}$"} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KURVA & DIAGRAM */}
        {activeTab === "diagram" && (
          <div className="flex flex-col gap-4 text-xs leading-relaxed text-slate-700">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
              <h4 className="font-extrabold text-[#0d2b5c] text-sm mb-1">
                Penyusunan Kurva & Diagram Matematika
              </h4>
              <p className="text-slate-600">
                Aksaventra CBT mendukung dua metode penambahan visual matematika:
                menggunakan <strong>Generator Kurva Vektor bawaan</strong> atau mengunggah <strong>gambar/diagram mandiri</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-[#0097a7]" />
                  <span className="font-bold text-[#0d2b5c] text-xs">
                    Metode 1: Generator Kurva Vektor (Rekomendasi)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Klik tombol <strong>&quot;Buat Kurva / Diagram&quot;</strong> pada editor.
                  Anda dapat menentukan koefisien $a, b, c$ untuk kurva kuadrat, gradien $m$ untuk garis linear,
                  geometri segitiga, atau diagram Venn. Sistem akan menghasilkan SVG resolusi tinggi yang tajam di semua ukuran layar siswa.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-[#0d2b5c] text-xs">
                    Metode 2: Unggah Berkas Gambar / SVG
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Guru dapat mengunggah diagram dari GeoGebra, Desmos, atau hasil tangkapan layar Word (.png, .jpg, .svg, .webp)
                  melalui area <strong>&quot;Lampiran Gambar / Diagram Soal&quot;</strong>.
                  Selain itu, Anda juga dapat menyisipkan kode SVG langsung ke dalam teks soal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: IMPOR WORD (.DOCX) */}
        {activeTab === "word" && (
          <div className="flex flex-col gap-4 text-xs leading-relaxed text-slate-700">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
              <div>
                <h4 className="font-extrabold text-[#0d2b5c] text-sm">
                  Format Penulisan Dokumen Word (.docx)
                </h4>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Sistem otomatis memparsing butir soal bernomor, pilihan A-E, kunci jawaban, bobot skor, formula matematika, dan gambar yang tertanam di Word.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  color="secondary"
                  size="xs"
                  leftIcon={copiedWord ? Check : Copy}
                  onClick={handleCopyWordTemplate}
                >
                  {copiedWord ? "Tersalin!" : "Salin Contoh"}
                </Button>
                <Button
                  type="button"
                  variant="filled"
                  color="primary"
                  size="xs"
                  leftIcon={Download}
                  onClick={handleDownloadWordDoc}
                >
                  Unduh Format .doc
                </Button>
              </div>
            </div>

            {/* Structure Rules */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <Badge color="primary" size="sm" className="font-bold mb-2">
                  Nomor & Stem
                </Badge>
                <p className="text-[11px] text-slate-600">
                  Diawali dengan angka dan titik, kurung, atau titik dua (contoh: <code className="font-mono font-bold">1. </code> atau <code className="font-mono font-bold">1) </code>).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <Badge color="secondary" size="sm" className="font-bold mb-2">
                  Opsi Jawaban
                </Badge>
                <p className="text-[11px] text-slate-600">
                  Diawali huruf A s/d E (contoh: <code className="font-mono font-bold">A. </code>, <code className="font-mono font-bold">B. </code>).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <Badge color="teal" size="sm" className="font-bold mb-2">
                  Kunci & Metadata
                </Badge>
                <p className="text-[11px] text-slate-600">
                  Gunakan label <code className="font-mono font-bold">KUNCI: A</code>, <code className="font-mono font-bold">BOBOT: 2.5</code>, dan <code className="font-mono font-bold">PEMBAHASAN: ...</code>.
                </p>
              </div>
            </div>

            {/* Code Sample Box */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-600">
                Contoh Dokumen Word yang Valid:
              </span>
              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800">
                {sampleWordText}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 4: 8 TIPE SOAL CBT */}
        {activeTab === "types" && (
          <div className="flex flex-col gap-3 text-xs leading-relaxed text-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-[#0d2b5c]">1. Pilihan Ganda Tunggal (multichoice)</span>
                  <Badge color="teal" size="sm">1 Kunci</Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  Siswa memilih tepat satu opsi paling benar dari A s/d E. Kunci: <code className="font-mono font-bold">KUNCI: C</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-[#0d2b5c]">2. PG Kompleks / MCMA (multichoice_multi)</span>
                  <Badge color="primary" size="sm">Banyak Kunci</Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  Siswa dapat mencentang lebih dari satu pilihan benar. Kunci: <code className="font-mono font-bold">KUNCI: A, C, D</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-[#0d2b5c]">3. Benar / Salah (truefalse)</span>
                  <Badge color="secondary" size="sm">Dikotomis</Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  Evaluasi pernyataan benar atau salah. Kunci: <code className="font-mono font-bold">KUNCI: Benar</code> atau <code className="font-mono font-bold">KUNCI: A</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-[#0d2b5c]">4. Numerik & Batas Toleransi (numerical)</span>
                  <Badge color="gold" size="sm">Angka ± Toleransi</Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  Jawaban berupa angka desimal/bulat dengan toleransi nilai (contoh: 3.14 dengan toleransi ±0.02).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-[#0d2b5c]">5. Isian Singkat (shortanswer)</span>
                  <Badge color="neutral" size="sm">Teks Singkat</Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  Siswa mengetik kata kunci atau istilah tepat (pencocokan kata/frasa).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-[#0d2b5c]">6. Uraian Bebas / Esai (essay)</span>
                  <Badge color="warning" size="sm">Koreksi Manual</Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  Siswa mengetik argumen atau penjelasan panjang. Dilengkapi rubrik pembahasan untuk penilai.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-[#0d2b5c]">7. Menjodohkan (match)</span>
                  <Badge color="neutral" size="sm">Pasangan</Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  Menghubungkan item premis di sisi kiri dengan item respon yang sesuai di sisi kanan.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-[#0d2b5c]">8. Teks Rumpang (gapselect / cloze)</span>
                  <Badge color="teal" size="sm">Drop-down Kata</Badge>
                </div>
                <p className="text-[11px] text-slate-500">
                  Melengkapi kalimat rumpang menggunakan kode penanda seperti <code className="font-mono font-bold">[[1]]</code> dan <code className="font-mono font-bold">[[2]]</code>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="filled"
            color="primary"
            size="sm"
            onClick={onClose}
          >
            Mengerti & Tutup Panduan
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default QuestionEditorHelpModal;
