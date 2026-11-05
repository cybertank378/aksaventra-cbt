# ⚡ ISSUE-PERF-02: Korupsi Sintaks LaTeX/KaTeX Akibat Sanitasi `DOMPurify` & *Main-Thread Blocking* Saat Ganti Soal

- **ID Issue:** `ISSUE-PERF-02`
- **Prioritas:** `P1 (High)`
- **Modul & File Terdampak:**
  - `src/libs/katexSanitizer.ts`
  - `src/sections/exam-workspace/molecules/QuestionStemRenderer.tsx`

## 1. Akar Masalah (Root Cause)
Soal dari Moodle mengandung campuran HTML (`<p>`, `<table>`, `<img>`) dan rumus LaTeX (`$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$` atau matriks `\begin{pmatrix} a & b \\ c & d \end{pmatrix}`).
1. Jika HTML disanitasi terlebih dahulu menggunakan `DOMPurify.sanitize()` *sebelum* KaTeX dijalankan, simbol matematika seperti `<`, `>`, atau `&` pada matriks LaTeX akan diubah menjadi `&lt;`, `&gt;`, `&amp;`, yang menyebabkan `katex.renderToString()` gagal (*parse error*).
2. Jika `DOMPurify` dan `katex.renderToString()` dijalankan berulang kali di setiap *render cycle*, perpindahan antar nomor soal akan terasa lambat (> 50ms).

## 2. Strategi Mitigasi Teknis (Render-Math-Then-Sanitize Pipeline + Memoized Cache)
1. **Urutan Pipeline Wajib:**
   - **Langkah 1:** Ekstrak blok `$$...$$` (display math) dan `\(...\)` (inline math) dari string HTML, lalu konversi menjadi markup KaTeX menggunakan `katex.renderToString(tex, { throwOnError: false, output: 'htmlAndMathml' })`.
   - **Langkah 2:** Jalankan `DOMPurify.sanitize()` pada hasil akhir dengan mengizinkan tag MathML/KaTeX (`ADD_TAGS: ['math', 'semantics', 'mrow', 'mi', 'mn', 'mo', 'mfrac', 'msup', 'msqrt', 'annotation']`).
2. **In-Memory Memoization Map:** Simpan hasil transformasi HTML di dalam `Map<string, string>` sehingga ketika siswa kembali ke soal yang pernah dibuka, waktu pemrosesan adalah **0ms**.

## 3. Implementasi Kode (`src/libs/katexSanitizer.ts`)
```typescript
import DOMPurify from 'dompurify';
import katex from 'katex';

const renderedCache = new Map<string, string>();

export function renderMathAndSanitizeHtml(rawHtml: string): string {
  const cached = renderedCache.get(rawHtml);
  if (cached !== undefined) {
    return cached;
  }

  // 1. Render Display Math $$...$$
  let processed = rawHtml.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex: string) =>
    katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false })
  );

  // 2. Render Inline Math \(...\)
  processed = processed.replace(/\\\(([\s\S]+?)\\\)/g, (_, tex: string) =>
    katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false })
  );

  // 3. Sanitize final HTML + MathML
  const cleanHtml = DOMPurify.sanitize(processed, {
    ADD_TAGS: ['math', 'semantics', 'mrow', 'mi', 'mn', 'mo', 'mfrac', 'msup', 'msqrt', 'annotation', 'svg', 'path'],
    ADD_ATTR: ['xmlns', 'encoding', 'display', 'viewBox', 'd', 'preserveAspectRatio'],
  });

  renderedCache.set(rawHtml, cleanHtml);
  return cleanHtml;
}
```

## 4. Cakupan Unit Test Wajib (`tests/unit/libs/KatexSanitizer.test.ts`)
- `it('merender matriks LaTeX dengan karakter & dan tanda pertidaksamaan < > tanpa korupsi entitas HTML')`
- `it('menghapus tag <script> berbahaya sambil mempertahankan markup KaTeX')`
