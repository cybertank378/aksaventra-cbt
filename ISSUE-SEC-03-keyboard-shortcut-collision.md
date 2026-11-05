# 🛡️ ISSUE-SEC-03: Konflik Pintasan Keyboard (`A/B/C/D/E`, `R`, Panah) Saat Mengetik Jawaban `shortanswer`

- **ID Issue:** `ISSUE-SEC-03`
- **Prioritas:** `P1 (High)`
- **Modul & File Terdampak:**
  - `src/sections/exam-workspace/organisms/QuestionCanvas.tsx`
  - `src/sections/exam-workspace/pages/ExamWorkspaceSection.tsx`

## 1. Akar Masalah (Root Cause)
Ruang ujian mendukung pintasan *keyboard* penuh: tombol `A/B/C/D/E` untuk memilih opsi, `R` untuk menandai **Ragu-ragu**, dan Panah Kiri/Kanan untuk berpindah nomor soal. Namun ketika siswa mengerjakan soal bertipe `shortanswer` (isian singkat) dan mengetik kata yang mengandung huruf `"a"`, `"b"`, atau `"r"` di dalam `<input>` atau `<textarea>`, *global keydown listener* akan ikut terpicu dan secara tidak sengaja menandai soal sebagai **Ragu-ragu** atau berpindah soal.

## 2. Strategi Mitigasi Teknis
Di dalam *global keyboard handler*, periksa apakah `event.target` merupakan elemen input yang dapat diedit sebelum mengeksekusi pintasan navigasi atau pemilihan opsi.

## 3. Implementasi Kode Guard (`QuestionCanvas.tsx`)
```typescript
export function shouldIgnoreExamShortcut(event: KeyboardEvent): boolean {
  if (event.ctrlKey || event.altKey || event.metaKey) {
    return true;
  }

  const target = event.target as HTMLElement | null;
  if (!target) {
    return false;
  }

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable === true
  );
}
```

## 4. Cakupan Unit Test Wajib (`tests/unit/components/KeyboardShortcuts.test.tsx`)
- `it('mengabaikan penekanan tombol R dan A-E saat fokus berada di dalam HTMLInputElement')`
- `it('menjalankan pemilihan opsi dan toggle ragu-ragu saat fokus berada di body dokumen')`
