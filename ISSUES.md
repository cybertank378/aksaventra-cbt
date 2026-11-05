# ⚠️ Comprehensive Frontend & Modular Architecture Issues (`aksaventra-cbt`)

## 1. SECURITY & ANTI-CHEAT (`src/security/` & `src/modules/attempts/`)
- **`ISSUE-SEC-01` (False-Positive OS Notification Blur):** Ditangani oleh `src/modules/attempts/domain/rules/StrikeEvaluationRule.ts` dan `<BlurGraceWarningBanner />`. Pindah tab (`document.hidden === true`) langsung dihitung 1 *Strike* (0ms), sedangkan `window.onblur` saat dokumen masih terlihat diberikan *Grace Period* `2500ms`.
- **`ISSUE-SEC-02` (Fullscreen User Gesture Expiration):** Pada `src/sections/student-lobby/molecules/TokenVerificationCard.tsx`, `requestFullscreen()` dipanggil secara sinkron pada baris pertama klik tombol sebelum `await verifyToken()`.
- **`ISSUE-SEC-03` (Keyboard Shortcut Collision pada Soal Isian Singkat):** Pada `src/sections/exam-workspace/organisms/QuestionCanvas.tsx`, pintasan `A-E`, `R`, dan Panah diabaikan bila `event.target` adalah `HTMLInputElement`, `HTMLTextAreaElement`, atau `isContentEditable`.
- **`ISSUE-SEC-04` (SEB Header Spoofing):** Divalidasi di sisi server pada `src/proxy.ts` dan `src/security/sebHeaderValidator.ts` menggunakan perbandingan *hash* `X-SafeExamBrowser-ConfigKeyHash`.

## 2. OFFLINE-FIRST, INDEXEDDB & CONCURRENCY (`src/libs/dexieVault.ts` & `src/shared/api/apiQueue.ts`)
- **`ISSUE-NET-01` (Thundering Herd & Sync-vs-Submit Race Condition):** `useAttemptSyncHook.ts` menambahkan *random jitter* `0-4000ms` pada interval *auto-save* 20 detik, serta menggunakan *Promise Mutex Lock* di `apiQueue.ts` agar klik tombol "Kumpulkan Ujian" menunggu sinkronisasi yang sedang berjalan selesai terlebih dahulu.
- **`ISSUE-NET-02` (Deterministic Rehydration saat Refresh/F5):** `AnswerRehydrationRule.ts` membandingkan `updatedAt` antara state server dan `DexieAttemptVault` per `questionId`, memenangkan entri terbaru, dan menjadwalkan ulang sinkronisasi bila `synced === false`.
- **`ISSUE-NET-03` (Waktu Habis Saat Offline Total):** Jika `remainingSeconds === 0` saat jaringan terputus, `<OfflineReceiptModal />` mengunci input jawaban, menjalankan *exponential backoff retry*, dan menampilkan bukti jawaban terenkripsi (QR/File Receipt).

## 3. PERFORMANCE & TIMER INTEGRITY (`src/libs/serverDeltaTimer.ts` & `src/libs/katexSanitizer.ts`)
- **`ISSUE-PERF-01` (Zero Re-render Cascade pada Timer):** `useExamWorkspaceStore.ts` hanya menyimpan `serverTimeOffsetMs` dan `deadlineServerMs`. Detik hitung mundur diisolasi di dalam `<ServerTimerBadge />`.
- **`ISSUE-PERF-02` (KaTeX vs DOMPurify Pipeline):** `src/libs/katexSanitizer.ts` merender ekspresi LaTeX (`$$...$$`) ke HTML/MathML terlebih dahulu sebelum menjalankan `DOMPurify.sanitize()`, lalu menyimpan hasilnya di *in-memory Map* per `questionId`.
- **`ISSUE-SYNC-01` (Anti-Manipulasi Jam OS):** `src/libs/serverDeltaTimer.ts` menggunakan `performance.now()` (jam monotonik) yang disinkronkan dengan `serverTimestamp` dari API.
