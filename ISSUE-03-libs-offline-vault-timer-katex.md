# ⚙️ ISSUE-03: Implementasi Pustaka Inti `src/libs/` & `src/shared/api/` (Dexie Vault, Monotonic Timer, KaTeX, Sync Mutex)

- **ID Issue:** `ISSUE-03`
- **Fase:** `1 - Database & Core Foundation`
- **Prioritas:** `P0 (Blocker)`
- **Bergantung Pada:** `ISSUE-02`
- **File Target (Sesuai Struktur Project):**
  - `src/libs/dexieVault.ts`
  - `src/libs/serverDeltaTimer.ts`
  - `src/libs/katexSanitizer.ts`
  - `src/libs/DateUtils.ts`
  - `src/libs/utils.ts`
  - `src/shared/constants/routes.ts`
  - `src/shared/api/apiQueue.ts`
  - `src/shared/api/apiRequest.ts`
  - `src/shared/api/unwrapApiResponse.ts`

## 1. Deskripsi Tugas
Mengimplementasikan empat mesin teknis terpenting di sisi klien:
1. **`src/libs/dexieVault.ts`:** Database IndexedDB lokal dengan tabel `answers` (`[attemptId+questionId]`) dan `attemptMeta` untuk mendukung fitur *Offline-First* (< 5ms write).
2. **`src/libs/serverDeltaTimer.ts`:** Kalkulator sisa waktu ujian berbasis jam monotonik (`performance.now()`) + `serverTimestamp` agar kebal terhadap manipulasi jam OS Windows/Android dan efek *laptop sleep*.
3. **`src/libs/katexSanitizer.ts`:** Pipeline *Render-Math-First (`$$...$$` & `\(...\)`) -> Sanitize-DOMPurify-Second* dengan *in-memory Map cache* agar simbol `<`, `>`, dan `&` pada matriks matematika tidak rusak.
4. **`src/shared/api/apiQueue.ts`:** *AsyncSyncMutex* dan generator *Random Jitter* (`20000ms + 0..4000ms`) untuk mencegah *Thundering Herd* dan *race condition* saat tombol Submit ditekan bersamaan dengan proses *auto-save*.

## 2. Kriteria Selesai (Definition of Done & TDD)
- [ ] `tests/unit/libs/serverDeltaTimer.test.ts`: Menguji akurasi waktu saat jam OS dimundurkan 1 jam dan saat proktor menambah waktu ekstra.
- [ ] `tests/unit/libs/katexSanitizer.test.ts`: Menguji perenderan persamaan kuadrat & matriks LaTeX serta blokir XSS `<script>`.
- [ ] `tests/unit/shared/apiQueue.test.ts`: Menguji eksekusi berurutan *AsyncSyncMutex* antara `sync` dan `submit`.
