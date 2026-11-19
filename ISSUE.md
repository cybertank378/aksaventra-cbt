# ISSUE-13: Penyelarasan Mesin Penilaian (`SubmitAttemptUseCase`) & Pemetaan Tipe Soal dengan Aturan Baku Moodle 5

- **Status:** Open
- **Prioritas:** High (Core Grading & LMS Parity)
- **Terkait:** `cybertank378/moodle_portable` (`mod_cbt`), Moodle 5.x Question Engine
- **File Terdampak:**
  - `src/modules/attempts/application/usecases/SubmitAttemptUseCase.ts`
  - `src/modules/questions/domain/dto/QuestionDTO.ts`
  - `src/modules/questions/domain/rules/QuestionBusinessRules.ts`
  - `src/modules/sync/infrastructure/SyncRepository.ts`
  - `prisma/schema.prisma`

---

## 1. Latar Belakang & Akar Masalah

Saat ini, mesin kalkulasi skor di `SubmitAttemptUseCase.ts` masih menggunakan **perbandingan string biner seragam** (`formattedExpected === formattedStudent`) dan bobot soal sama rata (`correctCount / totalQuestions * 100`). Implementasi ini menyimpang dari aturan baku penilaian Moodle 5 (`score_calculator.php` di `mod_cbt` maupun `question_engine` Moodle 5):

1. **Bobot Butir Soal (`Question.points` / `defaultmark`) Diabaikan:**
   Setiap butir soal di Bank Soal sudah memiliki kolom `points` (yang dipetakan dari `mdl_question.defaultmark`), namun `SubmitAttemptUseCase` menghitung `finalScore` berdasarkan jumlah soal benar dibagi total soal, bukan $\frac{\sum (\text{fraction}_i \times \text{points}_i)}{\sum \text{points}_i} \times 100$.
2. **Tidak Ada Penilaian Parsial & Penalti pada Pilihan Ganda Kompleks (`mcma`):**
   Di Moodle 5, soal *Multiple Choice (Multiple Answers)* menggunakan kalkulasi fraksi proporsional dikurangi penalti pilihan salah:
   $$\text{Fraction} = \max\left(0.0, \min\left(1.0, \frac{\text{Benar Dipilih}}{\text{Total Kunci Benar}} - \frac{\text{Salah Dipilih}}{\text{Total Kunci Benar}}\right)\right)$$
   Saat ini `SubmitAttemptUseCase` memberi skor `0` total jika siswa hanya benar sebagian.
3. **Tidak Ada Penilaian Parsial untuk `matching` & `cloze`:**
   Pada tipe `matching` dan `cloze` (*Embedded Answers*), Moodle 5 menghitung fraksi berdasarkan rasio sub-pasangan / sub-celah yang benar ($\frac{\text{Sub-benar}}{\text{Total sub-soal}}$), bukan *all-or-nothing*.
4. **Toleransi Angka (`numerical`) Tidak Dievaluasi:**
   Kolom `Question.tolerance` sudah ada di `prisma/schema.prisma`, namun saat submit jawaban numerik dievaluasi dengan kecocokan string eksak alih-alih $|x_{\text{siswa}} - x_{\text{kunci}}| \le \text{tolerance}$.
5. **Status Penilaian Manual untuk `essay`:**
   Soal bertipe `essay` otomatis dinilai `0` tanpa menandai status `requiresManualGrading` pada rekapitulasi hasil ujian.
6. **Ketidakcocokan Nama Tipe Soal saat Sinkronisasi Moodle:**
   `SyncRepository.ts` memetakan tipe soal menjadi `matching`, sementara Moodle 5 menggunakan `match` (dan `multichoice` dengan `single = 0` untuk `mcma`), menyebabkan soal *matching* dari Moodle jatuh ke *fallback* `multichoice`.

---

## 2. Spesifikasi Perubahan Teknis (`aksaventra-cbt`)

### A. Buat Domain Service `ScoreCalculatorRule.ts`
Lokasi: `src/modules/attempts/domain/rules/ScoreCalculatorRule.ts`

Implementasikan fungsi `calculateFraction(type, expectedKey, studentAnswer, options?)` yang selaras 100% dengan `mod_cbt\domain\service\score_calculator` di Moodle 5:
- **`multichoice` & `truefalse`:** Skor `1.0` jika cocok persis (case-insensitive), `0.0` jika salah.
- **`mcma`:**
  $$\text{fraction} = \max\left(0.0, \min\left(1.0, \frac{|A_{\text{siswa}} \cap A_{\text{kunci}}|}{|A_{\text{kunci}}|} - \frac{|A_{\text{siswa}} \setminus A_{\text{kunci}}|}{|A_{\text{kunci}}|}\right)\right)$$
- **`shortanswer`:** Mendukung array alternatif kunci jawaban *(case-insensitive trim)* -> `1.0` jika cocok salah satu.
- **`numerical`:** Evaluasi numerik $|v_{\text{siswa}} - v_{\text{kunci}}| \le |\text{tolerance}|$ -> `1.0` atau `0.0`.
- **`matching` & `cloze`:** Proporsional $\frac{\text{jumlah pasangan/gap benar}}{\text{total pasangan/gap}}$.
- **`essay`:** Mengembalikan fraksi `0.0` dan menandai flag `requiresManualGrading = true`.

### B. Perbarui `SubmitAttemptUseCase.ts`
- Ambil metadata bobot (`points` / `weight`), tipe soal (`type`), dan `tolerance` dari `Exam.questionsJson` / `Exam.answerKeysJson`.
- Hitung skor akhir tertimbang:
  $$\text{finalScore} = \text{round}\left(\frac{\sum (\text{fraction}_i \times \text{weight}_i)}{\sum \text{weight}_i} \times 100, 2\right)$$

### C. Perbarui Normalisasi Tipe Soal di `SyncRepository.ts`
- Petakan `match` dari Moodle ke `matching` di Next.js.
- Deteksi `multichoice` dengan lebih dari satu opsi bernilai `fraction > 0` sebagai tipe `mcma`.
- Petakan `gapselect` dan `ddwtos` dari Moodle ke `cloze` di Next.js.

---

## 3. Acceptance Criteria
- [ ] Unit test Vitest (`tests/unit/score-calculator.test.ts`) mencakup semua 8 tipe soal (`multichoice`, `mcma`, `truefalse`, `shortanswer`, `numerical`, `matching`, `cloze`, `essay`) dengan bobot berbeda-beda.
- [ ] Hasil perhitungan skor di Next.js identik hingga 2 desimal dengan `score_calculator::calculate()` di Moodle `mod_cbt`.
- [ ] Sinkronisasi soal bertipe `match` dan `multichoice` multi-kunci dari Moodle 5 terklasifikasi akurat sebagai `matching` dan `mcma` di database Prisma.